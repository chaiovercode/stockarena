"""Moderator Agent - synthesizes debate and provides verdict."""

import logging
from datetime import datetime
from app.core.agents.simple_agent import SimpleAgent
from app.core.graph.state import (
    StockData,
    AgentAnalysis,
    AgentArgument,
    Source,
)
from app.api.schemas.request import TimeHorizon


logger = logging.getLogger(__name__)


TIME_HORIZON_LABELS = {
    TimeHorizon.SHORT_TERM: "Short-term (1-5 days)",
    TimeHorizon.MEDIUM_TERM: "Medium-term (1-3 months)",
    TimeHorizon.LONG_TERM: "Long-term (1+ year)",
}

TIME_HORIZON_FOCUS = {
    TimeHorizon.SHORT_TERM: "momentum, recent news sentiment, technical patterns, and immediate catalysts",
    TimeHorizon.MEDIUM_TERM: "quarterly results outlook, sector trends, technical support/resistance, and upcoming events",
    TimeHorizon.LONG_TERM: "fundamental valuation, competitive moat, management quality, and long-term growth story",
}


class ModeratorAgent:
    """Moderator agent that synthesizes both perspectives and provides verdict."""

    def __init__(self):
        self.agent = SimpleAgent(
            role="Decisive Investment Analyst & Debate Judge",
            goal="""Analyze bull and bear arguments objectively and determine which case is STRONGER
                   for the given time horizon. Provide a clear verdict - don't fence-sit unless
                   truly uncertain. Your role is to weigh evidence and make a reasoned call.""",
            backstory="""You are a respected investment analyst known for making clear, well-reasoned
                        calls on stocks. You've judged hundreds of bull vs bear debates on Dalal Street.
                        While you're balanced, you're NOT indecisive - when the evidence points one way,
                        you say so. You understand that investors need clarity, not wishy-washy "it could
                        go either way" analysis. You evaluate confidence levels, compare argument strength,
                        and make a call. You only say MIXED SIGNALS when both cases are genuinely equal -
                        which is rare. Your track record speaks for itself: you called the IT sector recovery,
                        warned on overvalued IPOs, and spotted value in beaten-down financials. You don't
                        guess - you analyze deeply and commit to a view. Indian market specialist (NSE/BSE)
                        with 15+ years calling stocks correctly.""",
            model="gpt-4o-mini",
            temperature=0.7,
        )

    def _combine_sources(
        self,
        stock_data: StockData,
        bull_analysis: AgentAnalysis,
        bear_analysis: AgentAnalysis,
    ) -> list[Source]:
        """Combine sources from both analyses, deduplicating."""
        sources = [
            Source(
                type="stock_data",
                name="Yahoo Finance",
                url=f"https://finance.yahoo.com/quote/{stock_data.ticker}",
            )
        ]
        seen_urls = {sources[0].url}
        for src in bull_analysis.sources + bear_analysis.sources:
            if src.url and src.url not in seen_urls:
                sources.append(src)
                seen_urls.add(src.url)
            elif not src.url and src.name not in [s.name for s in sources]:
                sources.append(src)
        return sources

    async def synthesize(
        self,
        stock_data: StockData,
        bull_analysis: AgentAnalysis,
        bear_analysis: AgentAnalysis,
        time_horizon: TimeHorizon = TimeHorizon.MEDIUM_TERM,
        debate_history: list[dict] | None = None,
    ) -> AgentAnalysis:
        """
        Synthesize bull and bear arguments into final verdict.

        Args:
            stock_data: Stock market data
            bull_analysis: Bull's final analysis
            bear_analysis: Bear's final analysis
            time_horizon: Investment time horizon for the analysis
            debate_history: Full debate history (for multi-round debates)

        Returns:
            AgentAnalysis with final verdict
        """
        sources = self._combine_sources(stock_data, bull_analysis, bear_analysis)
        bull_args = self._format_arguments(bull_analysis.arguments)
        bear_args = self._format_arguments(bear_analysis.arguments)

        horizon_label = TIME_HORIZON_LABELS.get(time_horizon, "Medium-term (1-3 months)")
        horizon_focus = TIME_HORIZON_FOCUS.get(time_horizon, "overall investment merit")

        history_context = ""
        if debate_history and len(debate_history) > 2:
            history_context = f"""

            DEBATE HISTORY:
            This was a {len(debate_history) // 2}-round debate with multiple exchanges.
            Consider the evolution of arguments across rounds.
            """

        task_description = f"""
            Synthesize the bull and bear debate on {stock_data.ticker} for a {horizon_label} outlook.

            IMPORTANT: This is SUGGESTIVE analysis only, NOT financial advice. Help the investor think through the trade-offs.

            TIME HORIZON: {horizon_label}
            For this timeframe, focus on: {horizon_focus}

            STOCK OVERVIEW:
            - Company: {stock_data.company_name or stock_data.ticker}
            - Current Price: Rs. {stock_data.current_price}
            - Price Change: {stock_data.price_change_percent:.2f}%
            - P/E: {stock_data.pe_ratio or 'N/A'} | P/B: {stock_data.pb_ratio or 'N/A'} | Beta: {stock_data.beta or 'N/A'}
            - ROE: {stock_data.roe or 'N/A'}% | D/E: {stock_data.debt_to_equity or 'N/A'}
            - Analyst: {stock_data.analyst_buy} Buy / {stock_data.analyst_hold} Hold / {stock_data.analyst_sell} Sell | Target: Rs. {stock_data.target_price or 'N/A'}
            - Q Growth: Revenue {stock_data.revenue_growth or 'N/A'}% | Profit {stock_data.profit_growth or 'N/A'}%
            - Sector: {stock_data.sector or 'N/A'}

            ===== BULL CASE (Confidence: {bull_analysis.confidence_score:.0%}) =====
            {bull_analysis.summary}

            Key points:
            {bull_args}

            ===== BEAR CASE (Confidence: {bear_analysis.confidence_score:.0%}) =====
            {bear_analysis.summary}

            Key points:
            {bear_args}
            {history_context}

            Analyze which case is STRONGER for the {horizon_label} timeframe and provide your verdict in JSON format ONLY:
            {{
                "summary": "3-4 sentences synthesizing both perspectives. Clearly state which case appears stronger for {horizon_label} and why.",
                "arguments": [
                    {{"point": "Key factor favoring bulls", "evidence": "How relevant is this for {horizon_label}?", "confidence": <0.5-0.95>}},
                    {{"point": "Key factor favoring bears", "evidence": "How relevant is this for {horizon_label}?", "confidence": <0.5-0.95>}},
                    {{"point": "Critical deciding factor", "evidence": "What tips the scales one way or the other?", "confidence": <0.5-0.95>}}
                ],
                "recommendation": "<PICK ONE: LOOKS BULLISH | LEANS BULLISH | MIXED SIGNALS | LEANS BEARISH | LOOKS BEARISH>",
                "confidence_score": <0.5-0.95 based on clarity of the outlook>
            }}

            VERDICT GUIDELINES for {horizon_label}:
            Use this decision framework based on confidence scores and argument strength:

            - LOOKS BULLISH: Choose when bull confidence >= 75% and bull case clearly dominates. Strong positive catalysts with limited downside risks.
            - LEANS BULLISH: Choose when bull confidence is 60-74% OR bull case is moderately stronger. More positives than negatives.
            - MIXED SIGNALS: ONLY choose when both sides are genuinely equal strength (both 50-60% confidence) OR legitimate uncertainty exists. Don't default to this!
            - LEANS BEARISH: Choose when bear confidence is 60-74% OR bear case is moderately stronger. More concerns than positives.
            - LOOKS BEARISH: Choose when bear confidence >= 75% and bear case clearly dominates. Significant risks outweigh potential upside.

            DECISION LOGIC:
            1. Compare bull confidence ({bull_analysis.confidence_score:.0%}) vs bear confidence ({bear_analysis.confidence_score:.0%})
            2. Evaluate which arguments are more relevant to {horizon_label}
            3. Consider stock fundamentals and analyst consensus
            4. MAKE A CLEAR CALL - avoid defaulting to MIXED SIGNALS unless truly warranted
            5. If one side is clearly stronger, say so confidently

            NOTE: This is investment analysis - take a position based on the evidence. Only use MIXED SIGNALS when genuinely uncertain.
            """

        response = await self.agent.execute(task_description)
        return self._parse_result(response, sources)

    def _format_arguments(self, arguments: list[AgentArgument]) -> str:
        """Format arguments for prompt."""
        return "\n".join(
            [
                f"  - {arg.point} (Evidence: {arg.evidence}, Confidence: {arg.confidence:.0%})"
                for arg in arguments
            ]
        )

    def _parse_result(self, result: str, sources: list[Source]) -> AgentAnalysis:
        """Parse agent result to AgentAnalysis."""
        try:
            data = SimpleAgent.parse_json_response(result)

            recommendation = data.get("recommendation", "MIXED SIGNALS")
            # Validate recommendation - new suggestive format
            valid_recommendations = [
                "LOOKS BULLISH",
                "LEANS BULLISH",
                "MIXED SIGNALS",
                "LEANS BEARISH",
                "LOOKS BEARISH",
            ]

            logger.info(f"[MODERATOR] Raw recommendation from LLM: {recommendation}")

            if recommendation not in valid_recommendations:
                logger.warning(f"[MODERATOR] Invalid recommendation '{recommendation}', defaulting to MIXED SIGNALS")
                recommendation = "MIXED SIGNALS"
            else:
                logger.info(f"[MODERATOR] Valid recommendation: {recommendation}")

            return AgentAnalysis(
                agent_type="moderator",
                summary=data.get("summary", "Analysis completed."),
                arguments=[
                    AgentArgument(
                        point=arg.get("point", ""),
                        evidence=arg.get("evidence", ""),
                        confidence=float(arg.get("confidence", 0.7)),
                    )
                    for arg in data.get("arguments", [])
                ],
                recommendation=recommendation,
                confidence_score=float(data.get("confidence_score", 0.7)),
                sources=sources,
                timestamp=datetime.utcnow(),
            )

        except (ValueError, KeyError) as e:
            logger.error(f"[MODERATOR] Error parsing result: {e}")
            logger.error(f"[MODERATOR] Result snippet: {result[:200] if result else 'None'}")

        logger.info("[MODERATOR] Fallback to MIXED SIGNALS due to parsing error")
        return AgentAnalysis(
            agent_type="moderator",
            summary=str(result)[:500] if result else "Analysis completed.",
            arguments=[],
            recommendation="MIXED SIGNALS",
            confidence_score=0.5,
            sources=sources,
            timestamp=datetime.utcnow(),
        )
