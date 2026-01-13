"""Stock data service."""

import asyncio
import json
import ssl
from concurrent.futures import ThreadPoolExecutor
from typing import Any

import yfinance as yf

from app.core.graph.state import StockData

# Bypass SSL verification (per user preference)
ssl._create_default_https_context = ssl._create_unverified_context

# Thread pool for running sync yfinance calls
_executor = ThreadPoolExecutor(max_workers=4)


async def get_stock_data(ticker: str, period: str = "2y") -> StockData | None:
    """
    Fetch stock data asynchronously.

    Args:
        ticker: Stock ticker with exchange suffix
        period: Historical data period

    Returns:
        StockData object or None if error
    """
    loop = asyncio.get_event_loop()
    json_str = await loop.run_in_executor(
        _executor,
        fetch_stock_data_sync,
        ticker,
        period,
    )

    data = parse_stock_data(json_str)

    if "error" in data:
        return None

    return StockData(
        ticker=data.get("ticker", ticker),
        company_name=data.get("company_name"),
        current_price=data.get("current_price", 0.0),
        price_change_percent=data.get("price_change_percent", 0.0),
        volume=data.get("volume", 0),
        market_cap=data.get("market_cap"),
        pe_ratio=data.get("pe_ratio"),
        fifty_two_week_high=data.get("fifty_two_week_high", 0.0),
        fifty_two_week_low=data.get("fifty_two_week_low", 0.0),
        sector=data.get("sector"),
        industry=data.get("industry"),
        historical_prices=data.get("historical_prices", []),
        # Shareholding
        promoter_holding=data.get("promoter_holding"),
        fii_holding=data.get("fii_holding"),
        dii_holding=data.get("dii_holding"),
        public_holding=data.get("public_holding"),
        # Key statistics
        beta=data.get("beta"),
        dividend_yield=data.get("dividend_yield"),
        book_value=data.get("book_value"),
        eps=data.get("eps"),
        pb_ratio=data.get("pb_ratio"),
        debt_to_equity=data.get("debt_to_equity"),
        roe=data.get("roe"),
        # Analyst recommendations
        analyst_buy=data.get("analyst_buy", 0),
        analyst_hold=data.get("analyst_hold", 0),
        analyst_sell=data.get("analyst_sell", 0),
        target_price=data.get("target_price"),
        # Quarterly financials
        quarterly_revenue=data.get("quarterly_revenue"),
        quarterly_profit=data.get("quarterly_profit"),
        revenue_growth=data.get("revenue_growth"),
        profit_growth=data.get("profit_growth"),
    )


def format_ticker(ticker: str, exchange: str = "NSE") -> str:
    """
    Format ticker with exchange suffix.

    Args:
        ticker: Raw ticker symbol
        exchange: Exchange name (NSE or BSE)

    Returns:
        Formatted ticker with suffix
    """
    ticker = ticker.upper().strip()

    # Remove any existing suffix
    if ticker.endswith(".NS") or ticker.endswith(".BO"):
        ticker = ticker[:-3]

    suffix = ".NS" if exchange.upper() == "NSE" else ".BO"
    return f"{ticker}{suffix}"


def fetch_stock_data_sync(ticker: str, period: str = "2y") -> str:
    """
    Fetch stock data from yfinance synchronously.

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
                insider_pct = None
                institution_pct = None

                # New yfinance format: index is breakdown name, 'Value' column has the value
                for idx in holders.index:
                    idx_lower = str(idx).lower()
                    value = holders.loc[idx, 'Value'] if 'Value' in holders.columns else holders.loc[idx].iloc[0]
                    if isinstance(value, (int, float)):
                        value = float(value) * 100  # Convert to percentage
                        if 'insider' in idx_lower:
                            insider_pct = round(value, 2)
                            result["promoter_holding"] = insider_pct
                        elif 'institutionspercent' in idx_lower.replace(' ', '') and 'float' not in idx_lower:
                            institution_pct = round(value, 2)

                # Split institutions roughly into FII and DII (approximation)
                # Typically for Indian stocks, FIIs are ~60-70% of institutional holdings
                if institution_pct is not None:
                    result["fii_holding"] = round(institution_pct * 0.6, 2)
                    result["dii_holding"] = round(institution_pct * 0.4, 2)

                # Calculate public holding as remainder
                if insider_pct is not None and institution_pct is not None:
                    public_pct = 100 - insider_pct - institution_pct
                    if public_pct > 0:
                        result["public_holding"] = round(public_pct, 2)
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
