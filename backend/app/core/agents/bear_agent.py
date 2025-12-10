"""Bear Agent - argues the negative/risk case."""

import json
from datetime import datetime
from crewai import Agent, Task
from app.core.agents.base import get_llm
from app.core.graph.state import (
    StockData,
    NewsItem,
    AgentAnalysis,
    AgentArgument,
    Source,
)
from app.api.schemas.request import TimeHorizon
from app.tools.yfinance_tool import YFinanceTool
from app.tools.search_tool import SearchTool


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


class BearAgent:
    """Bear agent that argues the risk/negative case."""

    def __init__(self):
        self.llm = get_llm()
        self.agent = self._create_agent()

    def _create_agent(self) -> Agent:
        """Create the CrewAI agent."""
        return Agent(
            role="Ruthless Bear Analyst & Bull Slayer",
            goal="""EVISCERATE bullish arguments and expose why this stock is a TRAP.
                   Tear apart the bull's hopium-fueled delusions with cold hard facts.
                   Show why the optimists are bagholders-in-waiting.""",
            backstory="""You are the most feared bear analyst on Dalal Street. Bulls HATE you
                        because you've saved countless investors from catastrophic losses while
                        they were busy pumping garbage. You called the top on Yes Bank, DHFL,
                        and countless other "growth stories" that turned into nightmares.
                        When bulls make rosy projections, you expose the accounting tricks,
                        the hidden debt, the insider selling they conveniently ignore.
                        You don't just disagree with bulls - you DEMOLISH their fantasy with
                        forensic analysis. Your motto: "Every bull case has holes, find them."
                        Indian market specialist (NSE/BSE) who has seen every pump and dump.""",
            tools=[YFinanceTool(), SearchTool()],
            llm=self.llm,
            verbose=True,
            allow_delegation=False,
            max_iter=1,
        )

    def _build_sources(
        self, stock_data: StockData, news_items: list[NewsItem]
    ) -> list[Source]:
        """Build list of sources used in analysis."""
        sources = [
            Source(
                type="stock_data",
                name="Yahoo Finance",
                url=f"https://finance.yahoo.com/quote/{stock_data.ticker}",
            )
        ]

        # Only add news sources that have valid URLs and titles
        seen_sources = set()
        for item in news_items[:3]:
            if item.url and item.source and item.source not in seen_sources:
                # Create a meaningful source name from the article
                source_name = item.source
                if item.title:
                    # Truncate title if too long
                    title_preview = item.title[:60] + "..." if len(item.title) > 60 else item.title
                    source_name = f"{item.source}: {title_preview}"

                sources.append(
                    Source(
                        type="news",
                        name=source_name,
                        url=item.url,
                    )
                )
                seen_sources.add(item.source)
        return sources

    async def analyze(
        self,
        stock_data: StockData,
        news_items: list[NewsItem],
        time_horizon: TimeHorizon = TimeHorizon.MEDIUM_TERM,
        bull_claims: AgentAnalysis | None = None,
        round_number: int = 1,
    ) -> AgentAnalysis:
        """
        Generate bearish analysis and counter bull arguments.

        Args:
            stock_data: Stock market data
            news_items: Recent news articles
            time_horizon: Investment time horizon for the analysis
            bull_claims: Bull's previous analysis to counter
            round_number: Current debate round

        Returns:
            AgentAnalysis with bearish arguments
        """
        sources = self._build_sources(stock_data, news_items)
        news_summary = self._format_news(news_items)

        horizon_label = TIME_HORIZON_LABELS.get(time_horizon, "Medium-term (1-3 months)")
        horizon_focus = TIME_HORIZON_FOCUS.get(time_horizon, "overall investment merit")

        counter_context = ""

        if bull_claims:
            counter_context = f"""

            🎯 BULL'S ARGUMENTS TO COUNTER (Round {round_number}):
            Their thesis: {bull_claims.summary}
            Their points: {[arg.point for arg in bull_claims.arguments]}

            Counter these points with evidence. Show the risks and concerns for the {horizon_label} timeframe.
            """

        task = Task(
            description=f"""
            Analyze {stock_data.ticker} and build a strong BEARISH/CAUTIONARY case for a {horizon_label} outlook.

            TIME HORIZON: {horizon_label}
            Focus your arguments on: {horizon_focus}

            CURRENT STOCK DATA:
            - Company: {stock_data.company_name or stock_data.ticker}
            - Current Price: Rs. {stock_data.current_price}
            - Price Change: {stock_data.price_change_percent:.2f}%
            - P/E Ratio: {stock_data.pe_ratio or 'N/A'}
            - P/B Ratio: {stock_data.pb_ratio or 'N/A'}
            - Market Cap: Rs. {stock_data.market_cap or 'N/A'}
            - 52-Week Range: Rs. {stock_data.fifty_two_week_low} - Rs. {stock_data.fifty_two_week_high}
            - Sector: {stock_data.sector or 'N/A'}
            - Industry: {stock_data.industry or 'N/A'}

            FUNDAMENTALS:
            - EPS: Rs. {stock_data.eps or 'N/A'}
            - Book Value: Rs. {stock_data.book_value or 'N/A'}
            - Beta: {stock_data.beta or 'N/A'}
            - Dividend Yield: {stock_data.dividend_yield or 'N/A'}%
            - ROE: {stock_data.roe or 'N/A'}%
            - Debt/Equity: {stock_data.debt_to_equity or 'N/A'}

            SHAREHOLDING:
            - Promoter Holding: {stock_data.promoter_holding or 'N/A'}%
            - Institutional Holding: {stock_data.fii_holding or 'N/A'}%

            ANALYST CONSENSUS:
            - Buy: {stock_data.analyst_buy}, Hold: {stock_data.analyst_hold}, Sell: {stock_data.analyst_sell}
            - Target Price: Rs. {stock_data.target_price or 'N/A'}

            QUARTERLY PERFORMANCE:
            - Revenue: Rs. {stock_data.quarterly_revenue or 'N/A'}
            - Profit: Rs. {stock_data.quarterly_profit or 'N/A'}
            - Revenue Growth: {stock_data.revenue_growth or 'N/A'}%
            - Profit Growth: {stock_data.profit_growth or 'N/A'}%

            RECENT NEWS:
            {news_summary}
            {counter_context}

            Provide your analysis in the following JSON format ONLY (no other text):
            {{
                "summary": "2-3 sentence bearish/cautionary thesis focused on the {horizon_label} outlook. Highlight key risks.",
                "arguments": [
                    {{"point": "Key risk for {horizon_label}", "evidence": "Data supporting this concern", "confidence": <0.6-0.95 based on evidence strength>}},
                    {{"point": "Another concern to consider", "evidence": "Supporting facts", "confidence": <0.6-0.95>}},
                    {{"point": "Potential headwind or challenge", "evidence": "Why this matters for {horizon_label}", "confidence": <0.6-0.95>}}
                ],
                "confidence_score": <YOUR HONEST ASSESSMENT 0.5-0.95 for the bearish case in {horizon_label}>
            }}

            CONFIDENCE GUIDELINES for {horizon_label}:
            - 0.85+: Very strong bearish case for this timeframe
            - 0.70-0.84: Good bearish case, some positives exist
            - 0.55-0.69: Moderately bearish, bulls have valid points
            - Below 0.55: Weak bearish case for this timeframe

            Focus on risks and concerns most relevant to the {horizon_label} investment horizon.
            """,
            agent=self.agent,
            expected_output="JSON formatted bearish analysis",
        )

        result = task.execute_sync()
        return self._parse_result(result, sources)

    def _format_news(self, news_items: list[NewsItem]) -> str:
        """Format news items for prompt."""
        if not news_items:
            return "No recent news available."
        return "\n".join(
            [f"- {item.title} ({item.source})" for item in news_items[:3]]
        )

    def _parse_result(self, result: str, sources: list[Source]) -> AgentAnalysis:
        """Parse agent result to AgentAnalysis."""
        try:
            result_str = str(result)

            start_idx = result_str.find("{")
            end_idx = result_str.rfind("}") + 1

            if start_idx != -1 and end_idx > start_idx:
                json_str = result_str[start_idx:end_idx]
                data = json.loads(json_str)

                return AgentAnalysis(
                    agent_type="bear",
                    summary=data.get("summary", "Bearish analysis completed."),
                    arguments=[
                        AgentArgument(
                            point=arg.get("point", ""),
                            evidence=arg.get("evidence", ""),
                            confidence=float(arg.get("confidence", 0.7)),
                        )
                        for arg in data.get("arguments", [])
                    ],
                    confidence_score=float(data.get("confidence_score", 0.7)),
                    sources=sources,
                    timestamp=datetime.utcnow(),
                )

        except (json.JSONDecodeError, ValueError, KeyError):
            pass

        return AgentAnalysis(
            agent_type="bear",
            summary=str(result)[:500] if result else "Analysis completed.",
            arguments=[
                AgentArgument(
                    point="See detailed analysis",
                    evidence=str(result)[:300] if result else "",
                    confidence=0.6,
                )
            ],
            confidence_score=0.6,
            sources=sources,
            timestamp=datetime.utcnow(),
        )
