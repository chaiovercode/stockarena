"""Stock data service."""

import asyncio
from concurrent.futures import ThreadPoolExecutor
from app.tools.yfinance_tool import fetch_stock_data_sync, parse_stock_data
from app.core.graph.state import StockData

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
