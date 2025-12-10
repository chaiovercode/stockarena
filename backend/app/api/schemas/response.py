"""Response schemas for InsightFlow API."""

from datetime import datetime
from typing import Literal
from pydantic import BaseModel, Field


class AgentArgumentResponse(BaseModel):
    """Single argument from an agent."""

    point: str = Field(..., description="Key argument point")
    evidence: str = Field(..., description="Supporting evidence")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score")


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


class DebateResponse(BaseModel):
    """Complete debate response."""

    session_id: str
    ticker: str
    stock_data: StockDataResponse
    news_items: list[NewsItemResponse] = Field(default_factory=list)
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
