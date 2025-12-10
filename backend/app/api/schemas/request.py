"""Request schemas for InsightFlow API."""

from enum import Enum
from pydantic import BaseModel, Field


class TimeHorizon(str, Enum):
    """Investment time horizon for analysis."""
    SHORT_TERM = "short_term"  # 1-5 days
    MEDIUM_TERM = "medium_term"  # 1-3 months
    LONG_TERM = "long_term"  # 1+ year


class AnalyzeRequest(BaseModel):
    """Request schema for stock analysis."""

    ticker: str = Field(
        ...,
        description="Stock ticker symbol (e.g., TATASTEEL for NSE)",
        examples=["TATASTEEL", "RELIANCE", "TCS", "INFY"],
        min_length=1,
        max_length=20,
    )
    exchange: str = Field(
        default="NSE",
        description="Stock exchange: NSE or BSE",
        pattern="^(NSE|BSE)$",
    )
    max_rounds: int = Field(
        default=1,
        ge=1,
        le=3,
        description="Number of debate rounds (1-3)",
    )
    time_horizon: TimeHorizon = Field(
        default=TimeHorizon.MEDIUM_TERM,
        description="Investment time horizon: short_term (1-5 days), medium_term (1-3 months), long_term (1+ year)",
    )
    user_query: str | None = Field(
        default=None,
        description="Optional specific question about the stock",
        max_length=500,
    )


class WebSocketMessage(BaseModel):
    """WebSocket message format from client."""

    type: str = Field(
        ...,
        description="Message type: start, ping, or stop",
    )
    ticker: str | None = None
    exchange: str | None = Field(default="NSE")
    max_rounds: int | None = Field(default=1, ge=1, le=3)
    time_horizon: TimeHorizon | None = Field(default=TimeHorizon.MEDIUM_TERM)
    user_query: str | None = None
