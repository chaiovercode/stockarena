"""LangGraph state schema for the debate flow."""

from datetime import datetime
from typing import Literal, Annotated
from typing_extensions import TypedDict
from pydantic import BaseModel, Field
import operator

from app.api.schemas.request import TimeHorizon


class StockData(BaseModel):
    """Stock market data structure."""

    ticker: str
    company_name: str | None = None
    current_price: float
    price_change_percent: float = 0.0
    volume: int = 0
    market_cap: float | None = None
    pe_ratio: float | None = None
    fifty_two_week_high: float = 0.0
    fifty_two_week_low: float = 0.0
    sector: str | None = None
    industry: str | None = None
    historical_prices: list[dict] = Field(default_factory=list)

    # Shareholding pattern
    promoter_holding: float | None = None
    fii_holding: float | None = None
    dii_holding: float | None = None
    public_holding: float | None = None

    # Key statistics
    beta: float | None = None
    dividend_yield: float | None = None
    book_value: float | None = None
    eps: float | None = None
    pb_ratio: float | None = None
    debt_to_equity: float | None = None
    roe: float | None = None

    # Analyst recommendations
    analyst_buy: int = 0
    analyst_hold: int = 0
    analyst_sell: int = 0
    target_price: float | None = None

    # Quarterly financials (latest)
    quarterly_revenue: float | None = None
    quarterly_profit: float | None = None
    revenue_growth: float | None = None
    profit_growth: float | None = None


class NewsItem(BaseModel):
    """News article structure."""

    title: str
    snippet: str
    source: str
    url: str
    date: str


class Source(BaseModel):
    """Data source reference."""

    type: str  # "stock_data", "news", "yfinance", "web_search"
    name: str  # Source name (e.g., "Yahoo Finance", news outlet name)
    url: str | None = None


class AgentArgument(BaseModel):
    """Single argument from an agent."""

    point: str
    evidence: str
    confidence: float = Field(ge=0.0, le=1.0)


class AgentAnalysis(BaseModel):
    """Complete analysis from an agent."""

    agent_type: Literal["bull", "bear", "moderator"]
    summary: str
    arguments: list[AgentArgument] = Field(default_factory=list)
    recommendation: str | None = None
    confidence_score: float = Field(ge=0.0, le=1.0)
    sources: list[Source] = Field(default_factory=list)
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization."""
        return {
            "agent_type": self.agent_type,
            "summary": self.summary,
            "arguments": [
                {
                    "point": arg.point,
                    "evidence": arg.evidence,
                    "confidence": arg.confidence,
                }
                for arg in self.arguments
            ],
            "recommendation": self.recommendation,
            "confidence_score": self.confidence_score,
            "sources": [
                {"type": src.type, "name": src.name, "url": src.url}
                for src in self.sources
            ],
            "timestamp": self.timestamp.isoformat(),
        }


class StreamUpdate(BaseModel):
    """Stream update for WebSocket."""

    type: str
    agent: str | None = None
    content: str | None = None
    analysis: dict | None = None
    stock_data: dict | None = None
    news_items: list[dict] | None = None
    error: str | None = None
    round_number: int | None = None
    message: str | None = None


class DebateState(TypedDict):
    """Main LangGraph state schema for the debate flow."""

    # Input
    ticker: str
    user_query: str | None
    time_horizon: TimeHorizon

    # Fetched Data
    stock_data: StockData | None
    news_items: list[NewsItem]

    # Debate Flow Control
    current_round: int
    max_rounds: int

    # Agent Analyses
    bull_analysis: AgentAnalysis | None
    bear_analysis: AgentAnalysis | None
    moderator_analysis: AgentAnalysis | None

    # Debate History (accumulates across rounds)
    debate_history: Annotated[list[dict], operator.add]

    # Control Flow
    phase: Literal[
        "initialized",
        "fetching",
        "bull_analyzing",
        "bear_analyzing",
        "moderating",
        "complete",
        "error",
    ]
    error: str | None

    # Streaming updates queue
    stream_updates: list[StreamUpdate]


def create_initial_state(
    ticker: str,
    max_rounds: int = 1,
    user_query: str | None = None,
    time_horizon: TimeHorizon = TimeHorizon.MEDIUM_TERM,
) -> DebateState:
    """Create initial debate state."""
    return DebateState(
        ticker=ticker,
        user_query=user_query,
        time_horizon=time_horizon,
        stock_data=None,
        news_items=[],
        current_round=1,
        max_rounds=max_rounds,
        bull_analysis=None,
        bear_analysis=None,
        moderator_analysis=None,
        debate_history=[],
        phase="initialized",
        error=None,
        stream_updates=[],
    )
