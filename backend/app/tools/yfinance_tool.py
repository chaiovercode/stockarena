"""YFinance tool for fetching stock data."""

import ssl
import json
from typing import Any
import yfinance as yf
from crewai.tools import BaseTool
from pydantic import BaseModel, Field

# Bypass SSL verification (per user preference)
ssl._create_default_https_context = ssl._create_unverified_context


class YFinanceInput(BaseModel):
    """Input schema for YFinance tool."""

    ticker: str = Field(
        ...,
        description="Stock ticker symbol (add .NS for NSE, .BO for BSE)",
    )
    period: str = Field(
        default="2y",
        description="Data period: 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, max",
    )


class YFinanceTool(BaseTool):
    """CrewAI tool for fetching stock data via yfinance."""

    name: str = "Stock Data Fetcher"
    description: str = """
    Fetches comprehensive stock data including:
    - Current price and price change
    - Key fundamentals (P/E, Market Cap, etc.)
    - Historical price data
    - Volume information
    Use for NSE India stocks by appending .NS (e.g., TATASTEEL.NS, RELIANCE.NS)
    Use for BSE India stocks by appending .BO (e.g., TATASTEEL.BO)
    """
    args_schema: type[BaseModel] = YFinanceInput

    def _run(self, ticker: str, period: str = "2y") -> str:
        """Fetch stock data synchronously."""
        return fetch_stock_data_sync(ticker, period)


def fetch_stock_data_sync(ticker: str, period: str = "2y") -> str:
    """
    Fetch stock data from yfinance.

    Args:
        ticker: Stock ticker with exchange suffix (.NS or .BO)
        period: Historical data period

    Returns:
        JSON string with stock data
    """
    try:
        stock = yf.Ticker(ticker)
        info = stock.info
        hist = stock.history(period=period)

        if hist.empty:
            return json.dumps({"error": f"No data found for ticker: {ticker}"})

        # Basic data
        result = {
            "ticker": ticker,
            "company_name": info.get("longName") or info.get("shortName"),
            "current_price": info.get("currentPrice") or info.get("regularMarketPrice"),
            "previous_close": info.get("previousClose"),
            "price_change_percent": info.get("regularMarketChangePercent", 0),
            "volume": info.get("volume", 0),
            "market_cap": info.get("marketCap"),
            "pe_ratio": info.get("trailingPE"),
            "forward_pe": info.get("forwardPE"),
            "dividend_yield": info.get("dividendYield"),
            "fifty_two_week_high": info.get("fiftyTwoWeekHigh"),
            "fifty_two_week_low": info.get("fiftyTwoWeekLow"),
            "fifty_day_average": info.get("fiftyDayAverage"),
            "two_hundred_day_average": info.get("twoHundredDayAverage"),
            "sector": info.get("sector"),
            "industry": info.get("industry"),
            "historical_prices": [
                {
                    "date": str(date.date()),
                    "open": round(row["Open"], 2),
                    "high": round(row["High"], 2),
                    "low": round(row["Low"], 2),
                    "close": round(row["Close"], 2),
                    "volume": int(row["Volume"]),
                }
                for date, row in hist.iterrows()
            ],
        }

        # Key statistics
        result["beta"] = info.get("beta")
        result["book_value"] = info.get("bookValue")
        result["eps"] = info.get("trailingEps")
        result["pb_ratio"] = info.get("priceToBook")
        result["debt_to_equity"] = info.get("debtToEquity")
        result["roe"] = info.get("returnOnEquity")
        if result["roe"]:
            result["roe"] = result["roe"] * 100  # Convert to percentage

        # Shareholding pattern (from major holders)
        try:
            holders = stock.major_holders
            if holders is not None and not holders.empty:
                # New yfinance format: index is breakdown name, 'Value' column has the value
                for idx in holders.index:
                    idx_lower = str(idx).lower()
                    value = holders.loc[idx, 'Value'] if 'Value' in holders.columns else holders.loc[idx].iloc[0]
                    if isinstance(value, (int, float)):
                        value = float(value) * 100  # Convert to percentage
                        if 'insider' in idx_lower:
                            result["promoter_holding"] = round(value, 2)
                        elif 'institutionspercent' in idx_lower.replace(' ', '') and 'float' not in idx_lower:
                            result["fii_holding"] = round(value, 2)
        except Exception:
            pass

        # Analyst recommendations
        try:
            recs = stock.recommendations
            if recs is not None and not recs.empty:
                # New yfinance format: columns are strongBuy, buy, hold, sell, strongSell
                latest = recs.iloc[0] if len(recs) > 0 else None
                if latest is not None:
                    buy_count = int(latest.get('strongBuy', 0) or 0) + int(latest.get('buy', 0) or 0)
                    hold_count = int(latest.get('hold', 0) or 0)
                    sell_count = int(latest.get('strongSell', 0) or 0) + int(latest.get('sell', 0) or 0)
                    result["analyst_buy"] = buy_count
                    result["analyst_hold"] = hold_count
                    result["analyst_sell"] = sell_count
        except Exception:
            pass

        # Target price
        result["target_price"] = info.get("targetMeanPrice")

        # Quarterly financials
        try:
            financials = stock.quarterly_financials
            if financials is not None and not financials.empty:
                # Get latest quarter revenue
                if 'Total Revenue' in financials.index:
                    revenues = financials.loc['Total Revenue'].dropna()
                    if len(revenues) >= 1:
                        result["quarterly_revenue"] = float(revenues.iloc[0])
                    if len(revenues) >= 2:
                        prev_rev = float(revenues.iloc[1])
                        if prev_rev > 0:
                            result["revenue_growth"] = ((result["quarterly_revenue"] - prev_rev) / prev_rev) * 100

                # Get latest quarter profit
                if 'Net Income' in financials.index:
                    profits = financials.loc['Net Income'].dropna()
                    if len(profits) >= 1:
                        result["quarterly_profit"] = float(profits.iloc[0])
                    if len(profits) >= 2:
                        prev_profit = float(profits.iloc[1])
                        if prev_profit != 0:
                            result["profit_growth"] = ((result["quarterly_profit"] - prev_profit) / abs(prev_profit)) * 100
        except Exception:
            pass

        return json.dumps(result, indent=2)

    except Exception as e:
        return json.dumps({"error": str(e), "ticker": ticker})


def parse_stock_data(json_str: str) -> dict[str, Any]:
    """Parse stock data JSON string to dictionary."""
    try:
        return json.loads(json_str)
    except json.JSONDecodeError:
        return {"error": "Failed to parse stock data"}
