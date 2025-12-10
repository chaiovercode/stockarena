"""LangGraph nodes for the debate flow."""

import asyncio
from app.core.graph.state import (
    DebateState,
    StockData,
    NewsItem,
    StreamUpdate,
)
from app.services.stock_service import get_stock_data
from app.services.news_service import search_news, build_news_query
from app.core.agents.bull_agent import BullAgent
from app.core.agents.bear_agent import BearAgent
from app.core.agents.moderator_agent import ModeratorAgent


async def fetch_data_node(state: DebateState) -> dict:
    """
    Node 1: Fetch stock data and news concurrently.

    Args:
        state: Current debate state

    Returns:
        Updated state fields
    """
    ticker = state["ticker"]

    # First fetch stock data to get company name
    stock_data = await get_stock_data(ticker)

    if stock_data is None:
        return {
            "phase": "error",
            "error": f"Failed to fetch data for ticker: {ticker}",
            "stream_updates": [
                StreamUpdate(
                    type="error",
                    error=f"Failed to fetch data for ticker: {ticker}",
                )
            ],
        }

    # Now search news with company name for better filtering
    company_name = stock_data.company_name
    news_query = build_news_query(ticker, company_name)
    news_items = await search_news(
        news_query,
        max_results=10,
        ticker=ticker,
        company_name=company_name,
    )

    return {
        "stock_data": stock_data,
        "news_items": news_items,
        "phase": "bull_analyzing",
        "stream_updates": [
            StreamUpdate(
                type="data_fetched",
                stock_data=stock_data.model_dump(),
                news_items=[item.model_dump() for item in news_items],
                message=f"Fetched data for {stock_data.company_name or ticker}",
            )
        ],
    }


async def bull_analysis_node(state: DebateState) -> dict:
    """
    Node 2: Bull agent analyzes the positive investment case.

    Args:
        state: Current debate state

    Returns:
        Updated state fields with bull analysis
    """
    bull_agent = BullAgent()

    # Get bear's previous analysis for multi-round debates
    bear_rebuttal = None
    if state["current_round"] > 1 and state.get("bear_analysis"):
        bear_rebuttal = state["bear_analysis"]

    # Notify that bull is starting
    stream_updates = [
        StreamUpdate(
            type="agent_start",
            agent="bull",
            round_number=state["current_round"],
            message="Bull agent analyzing...",
        )
    ]

    analysis = await bull_agent.analyze(
        stock_data=state["stock_data"],
        news_items=state["news_items"],
        time_horizon=state["time_horizon"],
        bear_rebuttal=bear_rebuttal,
        round_number=state["current_round"],
    )

    # Add analysis to debate history
    debate_entry = {
        "role": "bull",
        "round": state["current_round"],
        "content": analysis.to_dict(),
    }

    stream_updates.append(
        StreamUpdate(
            type="agent_response",
            agent="bull",
            analysis=analysis.to_dict(),
            round_number=state["current_round"],
        )
    )

    return {
        "bull_analysis": analysis,
        "debate_history": [debate_entry],
        "phase": "bear_analyzing",
        "stream_updates": stream_updates,
    }


async def bear_analysis_node(state: DebateState) -> dict:
    """
    Node 3: Bear agent analyzes risks and counters bull arguments.

    Args:
        state: Current debate state

    Returns:
        Updated state fields with bear analysis
    """
    bear_agent = BearAgent()

    # Get bull's analysis to counter
    bull_claims = state.get("bull_analysis")

    stream_updates = [
        StreamUpdate(
            type="agent_start",
            agent="bear",
            round_number=state["current_round"],
            message="Bear agent analyzing...",
        )
    ]

    analysis = await bear_agent.analyze(
        stock_data=state["stock_data"],
        news_items=state["news_items"],
        time_horizon=state["time_horizon"],
        bull_claims=bull_claims,
        round_number=state["current_round"],
    )

    debate_entry = {
        "role": "bear",
        "round": state["current_round"],
        "content": analysis.to_dict(),
    }

    stream_updates.append(
        StreamUpdate(
            type="agent_response",
            agent="bear",
            analysis=analysis.to_dict(),
            round_number=state["current_round"],
        )
    )

    # Check if we need more rounds
    current_round = state["current_round"]
    max_rounds = state["max_rounds"]
    next_phase = "moderating" if current_round >= max_rounds else "bull_analyzing"

    # If continuing to next round, increment counter
    updates = {
        "bear_analysis": analysis,
        "debate_history": [debate_entry],
        "phase": next_phase,
        "stream_updates": stream_updates,
    }

    if next_phase == "bull_analyzing":
        updates["current_round"] = current_round + 1
        updates["stream_updates"].append(
            StreamUpdate(
                type="round_complete",
                round_number=current_round,
                message=f"Round {current_round} complete. Starting round {current_round + 1}...",
            )
        )

    return updates


async def moderator_node(state: DebateState) -> dict:
    """
    Node 4: Moderator synthesizes both perspectives and provides verdict.

    Args:
        state: Current debate state

    Returns:
        Updated state fields with moderator verdict
    """
    moderator_agent = ModeratorAgent()

    stream_updates = [
        StreamUpdate(
            type="agent_start",
            agent="moderator",
            message="Moderator synthesizing verdict...",
        )
    ]

    analysis = await moderator_agent.synthesize(
        stock_data=state["stock_data"],
        bull_analysis=state["bull_analysis"],
        bear_analysis=state["bear_analysis"],
        time_horizon=state["time_horizon"],
        debate_history=state.get("debate_history"),
    )

    debate_entry = {
        "role": "moderator",
        "round": "final",
        "content": analysis.to_dict(),
    }

    stream_updates.append(
        StreamUpdate(
            type="agent_response",
            agent="moderator",
            analysis=analysis.to_dict(),
            message=f"Verdict: {analysis.recommendation}",
        )
    )

    stream_updates.append(
        StreamUpdate(
            type="complete",
            message="Debate complete",
        )
    )

    return {
        "moderator_analysis": analysis,
        "debate_history": [debate_entry],
        "phase": "complete",
        "stream_updates": stream_updates,
    }


def error_handler_node(state: DebateState) -> dict:
    """
    Error handling node.

    Args:
        state: Current debate state

    Returns:
        Updated state with error info
    """
    return {
        "phase": "error",
        "stream_updates": [
            StreamUpdate(
                type="error",
                error=state.get("error", "Unknown error occurred"),
            )
        ],
    }
