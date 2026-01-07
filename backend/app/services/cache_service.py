"""Cache service for reducing API calls."""

import asyncio
from datetime import datetime, timedelta
from typing import Any
from concurrent.futures import ThreadPoolExecutor
import yfinance as yf


class TickerTapeCache:
    """In-memory cache for ticker tape data with TTL."""

    def __init__(self, ttl_minutes: int = 5):
        self._cache: dict[str, Any] | None = None
        self._last_updated: datetime | None = None
        self._ttl = timedelta(minutes=ttl_minutes)
        self._lock = asyncio.Lock()
        self._executor = ThreadPoolExecutor(max_workers=10)

    def _is_valid(self) -> bool:
        """Check if cache is still valid."""
        if self._cache is None or self._last_updated is None:
            return False
        return datetime.utcnow() - self._last_updated < self._ttl

    def _fetch_stock_data(self, symbol: str) -> dict | None:
        """Fetch single stock data synchronously."""
        try:
            ticker = yf.Ticker(f"{symbol}.NS")
            info = ticker.info
            hist = ticker.history(period="2d")

            if hist.empty or len(hist) < 1:
                return None

            current_price = hist['Close'].iloc[-1]
            if len(hist) >= 2:
                prev_close = hist['Close'].iloc[-2]
                change_pct = ((current_price - prev_close) / prev_close) * 100
            else:
                change_pct = info.get('regularMarketChangePercent', 0)

            return {
                "symbol": symbol,
                "price": round(current_price, 2),
                "change": round(change_pct, 2),
                "name": info.get('shortName', symbol),
            }
        except Exception:
            return None

    async def get_ticker_tape_data(self) -> dict[str, Any]:
        """Get ticker tape data, using cache if valid."""
        async with self._lock:
            if self._is_valid():
                return self._cache

            # Nifty 50 constituents
            nifty_50_symbols = [
                "RELIANCE", "TCS", "HDFCBANK", "INFY", "ICICIBANK",
                "HINDUNILVR", "SBIN", "BHARTIARTL", "KOTAKBANK", "ITC",
                "LT", "AXISBANK", "ASIANPAINT", "MARUTI", "TATASTEEL",
                "BAJFINANCE", "HCLTECH", "WIPRO", "SUNPHARMA", "TITAN",
                "ULTRACEMCO", "NESTLEIND", "POWERGRID", "NTPC", "TECHM",
                "ONGC", "JSWSTEEL", "TATAMOTORS", "M&M", "ADANIENT",
                "COALINDIA", "BAJAJFINSV", "GRASIM", "DIVISLAB", "DRREDDY",
                "BRITANNIA", "CIPLA", "EICHERMOT", "APOLLOHOSP", "TATACONSUM",
                "HINDALCO", "HEROMOTOCO", "BPCL", "INDUSINDBK", "SBILIFE",
                "UPL", "ADANIPORTS", "HDFCLIFE", "BAJAJ-AUTO", "SHREECEM"
            ]

            loop = asyncio.get_event_loop()
            tasks = [
                loop.run_in_executor(self._executor, self._fetch_stock_data, symbol)
                for symbol in nifty_50_symbols
            ]
            results = await asyncio.gather(*tasks)

            ticker_data = [r for r in results if r is not None]

            self._cache = {
                "tickers": ticker_data,
                "count": len(ticker_data),
                "cached_at": datetime.utcnow().isoformat(),
            }
            self._last_updated = datetime.utcnow()

            return self._cache

    def invalidate(self) -> None:
        """Force cache invalidation."""
        self._cache = None
        self._last_updated = None


# Global singleton instance (5-minute TTL)
ticker_tape_cache = TickerTapeCache(ttl_minutes=5)
