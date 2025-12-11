"""Summary Agent - generates market + stock context overview."""

import json
from datetime import datetime
from crewai import Agent, Task
from app.core.agents.base import get_llm
from app.core.graph.state import StockData, NewsItem


class SummaryAgent:
    """Summary agent that provides market + stock context."""

    def __init__(self):
        self.llm = get_llm()
        self.agent = self._create_agent()

    def _create_agent(self) -> Agent:
        """Create the CrewAI agent."""
        return Agent(
            role="Market Intelligence Analyst & Context Provider",
            goal="""Provide clear, concise summary of both the specific stock's situation
                   and broader market context. Help investors understand if the stock's
                   movement is stock-specific or market-driven.""",
            backstory="""You are an experienced market analyst who excels at connecting
                        dots between individual stocks and market trends. You provide
                        executive summaries that busy investors can scan in 30 seconds.
                        You're known for identifying key catalysts and cutting through noise
                        to highlight what really matters for investment decisions.""",
            tools=[],
            llm=self.llm,
            verbose=True,
            allow_delegation=False,
            max_iter=1,
        )

    async def generate_summary(
        self,
        stock_data: StockData,
        news_items: list[NewsItem],
        market_data: dict,
    ) -> dict:
        """
        Generate market + stock summary.

        Args:
            stock_data: Stock market data
            news_items: News articles
            market_data: Market indices data

        Returns:
            dict with summary analysis
        """
        # Format market indices
        indices_text = self._format_market_indices(market_data.get('indices', []))

        # Format top news
        news_text = self._format_news(news_items[:10])

        # Build prompt
        task = Task(
            description=f"""
            Analyze the market and stock situation for Indian markets:

            MARKET INDICES TODAY:
            {indices_text}

            STOCK: {stock_data.ticker} - {stock_data.company_name or 'Company'}
            Current Price: Rs. {stock_data.current_price:.2f} ({stock_data.price_change_percent:+.2f}%)
            Sector: {stock_data.sector or 'N/A'}
            P/E Ratio: {stock_data.pe_ratio or 'N/A'}
            Market Cap: Rs. {stock_data.market_cap or 'N/A'}

            RECENT NEWS (Top 10):
            {news_text}

            TASK:
            Provide a concise executive summary in JSON format with these fields:

            1. "market_overview": 2-3 sentences about overall market sentiment today. What's driving Indian markets?

            2. "stock_context": 2-3 sentences about how this specific stock is positioned in current market conditions.
               Is it moving with the market or independent? Any stock-specific factors?

            3. "key_catalysts": Array of 3 major events/factors affecting this stock right now.
               Focus on actionable insights.

            4. "top_headlines": Array of 3 most important news items. Each item should have:
               - "title": The headline
               - "source": News source name
               - "url": Article URL

            5. "market_sentiment": Overall sentiment - choose one:
               - "bullish": Positive momentum, favorable conditions
               - "bearish": Negative momentum, risk factors dominate
               - "neutral": Mixed signals, unclear direction

            6. "confidence_score": Number between 0.5-0.95 based on:
               - Data quality and freshness
               - Clarity of market signals
               - Consistency across news sources

            Focus on connecting stock performance to broader market trends. Be direct and actionable.
            Return ONLY valid JSON, no additional text.
            """,
            agent=self.agent,
            expected_output="JSON formatted market + stock summary",
        )

        result = task.execute_sync()
        return self._parse_result(result, stock_data.ticker)

    def _format_market_indices(self, indices: list[dict]) -> str:
        """Format market indices for prompt."""
        if not indices:
            return "Market data unavailable"

        lines = []
        for idx in indices:
            sign = '+' if idx['change'] >= 0 else ''
            lines.append(
                f"- {idx['name']}: {idx['value']:.2f} ({sign}{idx['change_percent']:.2f}%)"
            )
        return '\n'.join(lines)

    def _format_news(self, news_items: list[NewsItem]) -> str:
        """Format news items for prompt."""
        if not news_items:
            return "No recent news available"

        lines = []
        for i, item in enumerate(news_items, 1):
            lines.append(f"{i}. {item.title} ({item.source})")
            if item.snippet:
                lines.append(f"   {item.snippet[:150]}...")
        return '\n'.join(lines)

    def _parse_result(self, result: str, ticker: str) -> dict:
        """Parse agent result to structured dict."""
        try:
            result_str = str(result)

            # Extract JSON from result
            start_idx = result_str.find('{')
            end_idx = result_str.rfind('}') + 1

            if start_idx != -1 and end_idx > start_idx:
                json_str = result_str[start_idx:end_idx]
                data = json.loads(json_str)

                # Validate sentiment
                valid_sentiments = ['bullish', 'bearish', 'neutral']
                sentiment = data.get('market_sentiment', 'neutral').lower()
                if sentiment not in valid_sentiments:
                    sentiment = 'neutral'

                # Ensure top_headlines is list of dicts
                top_headlines = data.get('top_headlines', [])
                if not isinstance(top_headlines, list):
                    top_headlines = []

                # Ensure key_catalysts is list
                key_catalysts = data.get('key_catalysts', [])
                if not isinstance(key_catalysts, list):
                    key_catalysts = []

                return {
                    'market_overview': data.get('market_overview', 'Market analysis in progress.'),
                    'stock_context': data.get('stock_context', f'Analyzing {ticker} performance.'),
                    'key_catalysts': key_catalysts[:3],  # Limit to 3
                    'top_headlines': top_headlines[:3],  # Limit to 3
                    'market_sentiment': sentiment,
                    'confidence_score': float(data.get('confidence_score', 0.7)),
                }

        except (json.JSONDecodeError, ValueError, KeyError) as e:
            print(f"[SUMMARY AGENT] Error parsing result: {e}")
            print(f"[SUMMARY AGENT] Result snippet: {result[:200] if result else 'None'}")

        # Fallback response
        print("[SUMMARY AGENT] Using fallback response")
        return {
            'market_overview': 'Market analysis completed. Reviewing current conditions.',
            'stock_context': f'Analyzing {ticker} in current market context.',
            'key_catalysts': [],
            'top_headlines': [],
            'market_sentiment': 'neutral',
            'confidence_score': 0.5,
        }
