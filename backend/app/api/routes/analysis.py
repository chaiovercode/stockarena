"""Analysis API endpoints."""

import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
import json

from app.api.schemas.request import AnalyzeRequest
from app.api.schemas.response import (
    DebateResponse,
    AgentAnalysisResponse,
    AgentArgumentResponse,
    StockDataResponse,
    HistoricalPriceResponse,
    NewsItemResponse,
)
from app.core.graph.builder import debate_graph
from app.core.graph.state import create_initial_state
from app.services.stock_service import format_ticker

router = APIRouter(prefix="/api/v1", tags=["analysis"])


@router.post("/analyze", response_model=DebateResponse)
async def analyze_stock(request: AnalyzeRequest) -> DebateResponse:
    """
    Initiate stock analysis debate (non-streaming).

    Returns complete debate after all agents have finished.
    """
    # Format ticker
    ticker = format_ticker(request.ticker, request.exchange)

    # Create initial state
    initial_state = create_initial_state(
        ticker=ticker,
        max_rounds=request.max_rounds,
        user_query=request.user_query,
        time_horizon=request.time_horizon,
    )

    try:
        # Run the complete graph
        final_state = await debate_graph.ainvoke(initial_state)

        if final_state.get("error"):
            raise HTTPException(status_code=500, detail=final_state["error"])

        if not final_state.get("moderator_analysis"):
            raise HTTPException(status_code=500, detail="Debate did not complete")

        # Build response
        stock_data = final_state["stock_data"]
        bull = final_state["bull_analysis"]
        bear = final_state["bear_analysis"]
        moderator = final_state["moderator_analysis"]

        return DebateResponse(
            session_id=str(uuid.uuid4()),
            ticker=ticker,
            stock_data=StockDataResponse(
                ticker=stock_data.ticker,
                company_name=stock_data.company_name,
                current_price=stock_data.current_price,
                price_change_percent=stock_data.price_change_percent,
                volume=stock_data.volume,
                market_cap=stock_data.market_cap,
                pe_ratio=stock_data.pe_ratio,
                fifty_two_week_high=stock_data.fifty_two_week_high,
                fifty_two_week_low=stock_data.fifty_two_week_low,
                sector=stock_data.sector,
                industry=stock_data.industry,
                historical_prices=[
                    HistoricalPriceResponse(**p) for p in stock_data.historical_prices
                ],
            ),
            news_items=[
                NewsItemResponse(
                    title=n.title,
                    snippet=n.snippet,
                    source=n.source,
                    url=n.url,
                    date=n.date,
                )
                for n in final_state["news_items"]
            ],
            bull_analysis=AgentAnalysisResponse(
                agent_type="bull",
                summary=bull.summary,
                arguments=[
                    AgentArgumentResponse(
                        point=a.point, evidence=a.evidence, confidence=a.confidence
                    )
                    for a in bull.arguments
                ],
                confidence_score=bull.confidence_score,
                timestamp=bull.timestamp,
            ),
            bear_analysis=AgentAnalysisResponse(
                agent_type="bear",
                summary=bear.summary,
                arguments=[
                    AgentArgumentResponse(
                        point=a.point, evidence=a.evidence, confidence=a.confidence
                    )
                    for a in bear.arguments
                ],
                confidence_score=bear.confidence_score,
                timestamp=bear.timestamp,
            ),
            moderator_analysis=AgentAnalysisResponse(
                agent_type="moderator",
                summary=moderator.summary,
                arguments=[
                    AgentArgumentResponse(
                        point=a.point, evidence=a.evidence, confidence=a.confidence
                    )
                    for a in moderator.arguments
                ],
                recommendation=moderator.recommendation,
                confidence_score=moderator.confidence_score,
                timestamp=moderator.timestamp,
            ),
            verdict=moderator.recommendation or "HOLD",
            total_rounds=final_state.get("current_round", 1),
            completed_at=datetime.utcnow(),
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze/stream")
async def analyze_stock_stream(request: AnalyzeRequest):
    """
    Stream stock analysis debate in real-time via SSE.

    Returns updates as agents complete their analysis.
    """
    ticker = format_ticker(request.ticker, request.exchange)

    initial_state = create_initial_state(
        ticker=ticker,
        max_rounds=request.max_rounds,
        user_query=request.user_query,
        time_horizon=request.time_horizon,
    )

    async def event_generator():
        """Generate SSE events from graph execution."""
        try:
            # Send start event
            yield f"data: {json.dumps({'type': 'started', 'ticker': ticker})}\n\n"

            # Stream graph execution
            async for event in debate_graph.astream_events(initial_state, version="v2"):
                event_kind = event.get("event")

                if event_kind == "on_chain_end":
                    output = event.get("data", {}).get("output", {})
                    stream_updates = output.get("stream_updates", [])

                    for update in stream_updates:
                        if hasattr(update, "model_dump"):
                            update_dict = update.model_dump()
                        else:
                            update_dict = update

                        yield f"data: {json.dumps(update_dict)}\n\n"

            # Send complete event
            yield f"data: {json.dumps({'type': 'complete'})}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'error': str(e)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/stock/{ticker}")
async def get_stock_info(ticker: str, exchange: str = "NSE"):
    """
    Quick endpoint to get stock data without debate.
    """
    from app.services.stock_service import get_stock_data

    formatted_ticker = format_ticker(ticker, exchange)

    try:
        data = await get_stock_data(formatted_ticker)
        if data is None:
            raise HTTPException(status_code=404, detail=f"Stock not found: {ticker}")

        return StockDataResponse(
            ticker=data.ticker,
            company_name=data.company_name,
            current_price=data.current_price,
            price_change_percent=data.price_change_percent,
            volume=data.volume,
            market_cap=data.market_cap,
            pe_ratio=data.pe_ratio,
            fifty_two_week_high=data.fifty_two_week_high,
            fifty_two_week_low=data.fifty_two_week_low,
            sector=data.sector,
            industry=data.industry,
            historical_prices=[
                HistoricalPriceResponse(**p) for p in data.historical_prices
            ],
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/market/ticker-tape")
async def get_ticker_tape_data():
    """
    Get ticker tape data for major indices/stocks.
    Uses cached data (5-min TTL) to avoid Yahoo Finance rate limits.
    """
    from app.services.cache_service import ticker_tape_cache

    return await ticker_tape_cache.get_ticker_tape_data()
