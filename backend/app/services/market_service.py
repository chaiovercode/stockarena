"""Market data service for fetching Indian market indices."""

import yfinance as yf
from datetime import datetime
from typing import Dict, List, Any


async def fetch_market_indices() -> Dict[str, Any]:
    """
    Fetch current Indian market indices data.

    Returns:
        Dictionary containing indices data with current values and changes.
    """
    indices = {
        'SENSEX': '^BSESN',
        'NIFTY 50': '^NSEI',
        'NIFTY BANK': '^NSEBANK',
        'NIFTY IT': '^CNXIT',
    }

    results = []

    for name, symbol in indices.items():
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            hist = ticker.history(period='1d')

            # Get current price from history if available
            current_price = None
            if not hist.empty:
                current_price = hist['Close'].iloc[-1]

            # Fallback to info if history is empty
            if current_price is None:
                current_price = info.get('regularMarketPrice') or info.get('previousClose', 0)

            # Calculate change
            previous_close = info.get('previousClose', current_price)
            change = current_price - previous_close if previous_close else 0
            change_percent = (change / previous_close * 100) if previous_close else 0

            # Determine trend
            trend = 'up' if change > 0 else 'down' if change < 0 else 'flat'

            results.append({
                'name': name,
                'symbol': symbol,
                'value': round(current_price, 2) if current_price else 0,
                'change': round(change, 2),
                'change_percent': round(change_percent, 2),
                'trend': trend,
            })
        except Exception as e:
            print(f"[MARKET SERVICE] Error fetching {name}: {e}")
            # Return placeholder data on error
            results.append({
                'name': name,
                'symbol': symbol,
                'value': 0,
                'change': 0,
                'change_percent': 0,
                'trend': 'flat',
            })

    return {
        'indices': results,
        'timestamp': datetime.utcnow().isoformat(),
    }


async def get_sector_index_for_stock(sector: str | None) -> Dict[str, Any] | None:
    """
    Get relevant sector index based on stock sector.

    Args:
        sector: Stock sector name

    Returns:
        Sector index data or None if not found
    """
    if not sector:
        return None

    sector_lower = sector.lower()
    sector_indices = {
        'bank': '^NSEBANK',
        'finance': '^NSEBANK',
        'financial': '^NSEBANK',
        'it': '^CNXIT',
        'technology': '^CNXIT',
        'information technology': '^CNXIT',
        'auto': '^CNXAUTO',
        'automobile': '^CNXAUTO',
    }

    symbol = None
    sector_name = None

    for key, idx_symbol in sector_indices.items():
        if key in sector_lower:
            symbol = idx_symbol
            sector_name = key.upper()
            break

    if not symbol:
        return None

    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info
        hist = ticker.history(period='1d')

        current_price = hist['Close'].iloc[-1] if not hist.empty else info.get('regularMarketPrice', 0)
        previous_close = info.get('previousClose', current_price)
        change = current_price - previous_close if previous_close else 0
        change_percent = (change / previous_close * 100) if previous_close else 0
        trend = 'up' if change > 0 else 'down' if change < 0 else 'flat'

        return {
            'name': f'NIFTY {sector_name}',
            'symbol': symbol,
            'value': round(current_price, 2),
            'change': round(change, 2),
            'change_percent': round(change_percent, 2),
            'trend': trend,
        }
    except Exception as e:
        print(f"[MARKET SERVICE] Error fetching sector index: {e}")
        return None
