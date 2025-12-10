"""Bull Agent - argues the positive investment case."""

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


class BullAgent:
    """Bull agent that argues the positive investment case."""

    def __init__(self):
        self.llm = get_llm()
        self.agent = self._create_agent()

    def _create_agent(self) -> Agent:
        """Create the CrewAI agent."""
        return Agent(
            role="Aggressive Bull Market Analyst & Bear Destroyer",
            goal="""DEMOLISH bearish arguments and prove why this stock is a screaming BUY.
                   Expose the bear's fear-mongering, highlight their cherry-picked data,
                   and show why pessimists will miss the boat. Be ruthless in your rebuttals.""",
            backstory="""You are an infamous bull analyst known for your savage takedowns of
                        bearish arguments. You've made fortunes calling bottoms when bears were
                        screaming doom. You DESPISE fear-mongering and lazy bear analysis.
                        When a bear makes a weak argument, you don't just counter it - you
                        HUMILIATE it with facts. You've been right on Infosys, HDFC Bank,
                        Reliance when everyone else was scared. Bears hate you because you
                        expose their intellectual laziness. You're not just bullish - you're
                        a bear's worst nightmare. Indian market specialist (NSE/BSE).""",
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
        bear_rebuttal: AgentAnalysis | None = None,
        round_number: int = 1,
    ) -> AgentAnalysis:
        """
        Generate bullish analysis for the stock.

        Args:
            stock_data: Stock market data
            news_items: Recent news articles
            time_horizon: Investment time horizon for the analysis
            bear_rebuttal: Bear's previous analysis (for multi-round debates)
            round_number: Current debate round

        Returns:
            AgentAnalysis with bullish arguments
        """
        sources = self._build_sources(stock_data, news_items)
        news_summary = self._format_news(news_items)

        horizon_label = TIME_HORIZON_LABELS.get(time_horizon, "Medium-term (1-3 months)")
        horizon_focus = TIME_HORIZON_FOCUS.get(time_horizon, "overall investment merit")

        rebuttal_context = ""

        if bear_rebuttal:
            rebuttal_context = f"""

            🎯 BEAR'S ARGUMENTS TO COUNTER (Round {round_number}):
            Their thesis: {bear_rebuttal.summary}
            Their points: {[arg.point for arg in bear_rebuttal.arguments]}

            Counter these points with strong evidence. Show why the bullish case is stronger for the {horizon_label} timeframe.
            """

        task = Task(
            description=f"""
            Analyze {stock_data.ticker} and build a strong BULLISH case for a {horizon_label} outlook.

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
            {rebuttal_context}

            Provide your analysis in the following JSON format ONLY (no other text):
            {{
                "summary": "2-3 sentence bullish thesis focused on the {horizon_label} outlook. Be confident but substantive.",
                "arguments": [
                    {{"point": "Strong bullish argument for {horizon_label}", "evidence": "Data supporting this view", "confidence": <0.6-0.95 based on evidence strength>}},
                    {{"point": "Another compelling point", "evidence": "Supporting facts", "confidence": <0.6-0.95>}},
                    {{"point": "Key catalyst or strength", "evidence": "Why this matters for {horizon_label}", "confidence": <0.6-0.95>}}
                ],
                "confidence_score": <YOUR HONEST ASSESSMENT 0.5-0.95 for the {horizon_label} outlook>
            }}

            CONFIDENCE GUIDELINES for {horizon_label}:
            - 0.85+: Very strong bullish case for this timeframe
            - 0.70-0.84: Good bullish case, some uncertainties
            - 0.55-0.69: Moderately bullish, notable risks exist
            - Below 0.55: Weak bullish case for this timeframe

            Focus on factors most relevant to the {horizon_label} investment horizon.
            """,
            agent=self.agent,
            expected_output="JSON formatted bullish analysis",
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
            # Try to extract JSON from the result
            result_str = str(result)

            # Find JSON in the result
            start_idx = result_str.find("{")
            end_idx = result_str.rfind("}") + 1

            if start_idx != -1 and end_idx > start_idx:
                json_str = result_str[start_idx:end_idx]
                data = json.loads(json_str)

                return AgentAnalysis(
                    agent_type="bull",
                    summary=data.get("summary", "Bullish analysis completed."),
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

        # Fallback parsing
        return AgentAnalysis(
            agent_type="bull",
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
