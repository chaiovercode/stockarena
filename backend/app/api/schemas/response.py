"""Response schemas for InsightFlow API."""

from datetime import datetime
from typing import Literal
from pydantic import BaseModel, Field


class AgentArgumentResponse(BaseModel):
    """Single argument from an agent."""

    point: str = Field(..., description="Key argument point")
    evidence: str = Field(..., description="Supporting evidence")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score")


class SourceResponse(BaseModel):
    """Data source used in analysis."""

    type: str = Field(..., description="Source type (e.g., 'stock_data', 'news')")
    name: str = Field(..., description="Source name or title")
    url: str | None = Field(None, description="URL to the source")


class AgentAnalysisResponse(BaseModel):
    """Complete analysis from an agent."""

    agent_type: Literal["bull", "bear", "moderator"]
    summary: str = Field(..., description="Brief summary of the analysis")
    arguments: list[AgentArgumentResponse] = Field(default_factory=list)
    recommendation: str | None = Field(
        default=None,
        description="Final recommendation (only for moderator)",
    )
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    sources: list[SourceResponse] = Field(default_factory=list, description="Data sources used in analysis")
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class HistoricalPriceResponse(BaseModel):
    """Historical price data point."""

    date: str
    open: float
    high: float
    low: float
    close: float
    volume: int


class StockDataResponse(BaseModel):
    """Stock market data."""

    ticker: str
    company_name: str | None = None
    current_price: float
    price_change_percent: float
    volume: int
    market_cap: float | None = None
    pe_ratio: float | None = None
    fifty_two_week_high: float
    fifty_two_week_low: float
    sector: str | None = None
    industry: str | None = None
    historical_prices: list[HistoricalPriceResponse] = Field(default_factory=list)


class NewsItemResponse(BaseModel):
    """News article."""

    title: str
    snippet: str
    source: str
    url: str
    date: str


class MarketIndexResponse(BaseModel):
    """Market index data."""

    name: str = Field(..., description="Index name (e.g., SENSEX, NIFTY 50)")
    symbol: str = Field(..., description="Index symbol")
    value: float = Field(..., description="Current index value")
    change: float = Field(..., description="Change in points")
    change_percent: float = Field(..., description="Percentage change")
    trend: str = Field(..., description="Trend direction: up, down, or flat")


class TopHeadlineResponse(BaseModel):
    """Top headline for summary."""

    title: str = Field(..., description="Headline text")
    source: str = Field(..., description="News source")
    url: str = Field(..., description="Article URL")


class SummaryAnalysisResponse(BaseModel):
    """AI-generated market + stock summary."""

    market_overview: str = Field(..., description="2-3 sentence market overview")
    stock_context: str = Field(..., description="2-3 sentence stock context")
    key_catalysts: list[str] = Field(default_factory=list, description="Key events affecting stock")
    top_headlines: list[TopHeadlineResponse] = Field(default_factory=list, description="Top 3 headlines")
    market_sentiment: Literal["bullish", "bearish", "neutral"] = Field(default="neutral")
    confidence_score: float = Field(..., ge=0.0, le=1.0, description="Summary confidence")


class DebateResponse(BaseModel):
    """Complete debate response."""

    session_id: str
    ticker: str
    stock_data: StockDataResponse
    news_items: list[NewsItemResponse] = Field(default_factory=list)
    market_data: list[MarketIndexResponse] | None = Field(default=None, description="Market indices data")
    summary_analysis: SummaryAnalysisResponse | None = Field(default=None, description="Market + stock summary")
    bull_analysis: AgentAnalysisResponse
    bear_analysis: AgentAnalysisResponse
    moderator_analysis: AgentAnalysisResponse
    verdict: str = Field(..., description="Final investment verdict")
    total_rounds: int
    completed_at: datetime


class StreamUpdateResponse(BaseModel):
    """Real-time stream update."""

    type: Literal[
        "started",
        "data_fetched",
        "agent_start",
        "agent_response",
        "token",
        "round_complete",
        "error",
        "complete",
    ]
    agent: str | None = None
    content: str | None = None
    analysis: AgentAnalysisResponse | None = None
    stock_data: StockDataResponse | None = None
    news_items: list[NewsItemResponse] | None = None
    error: str | None = None
    round_number: int | None = None
    message: str | None = None


class HealthResponse(BaseModel):
    """Health check response."""

    status: str = "healthy"
    version: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
