"""News search service."""

import asyncio
import re
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor
from app.tools.search_tool import search_news_sync, parse_news_data
from app.core.graph.state import NewsItem

# Thread pool for running sync DuckDuckGo calls
_executor = ThreadPoolExecutor(max_workers=4)

# Maximum age of news articles in days
MAX_NEWS_AGE_DAYS = 60


def _is_recent_news(date_str: str) -> bool:
    """
    Check if a news item is within the last 60 days.

    Args:
        date_str: Date string from news item (ISO format expected)

    Returns:
        True if the news is within MAX_NEWS_AGE_DAYS, False otherwise
    """
    if not date_str:
        return False

    try:
        # Parse the date string - DuckDuckGo returns ISO format
        news_date = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
        # Get current time (UTC)
        now = datetime.now(news_date.tzinfo) if news_date.tzinfo else datetime.utcnow()
        # Check if within 60 days
        age = now - news_date
        return age.days <= MAX_NEWS_AGE_DAYS
    except (ValueError, AttributeError):
        # If date parsing fails, exclude the item to be safe
        return False


def _is_relevant_news(
    item: dict,
    ticker: str,
    company_name: str | None = None,
) -> bool:
    """
    Check if a news item is relevant to the specific stock.

    Args:
        item: News item dict with title, snippet, url
        ticker: Stock ticker (without exchange suffix)
        company_name: Optional company name

    Returns:
        True if the news item is relevant to the stock
    """
    title = item.get("title", "").lower()
    snippet = item.get("snippet", "").lower()
    url = item.get("url", "").lower()
    combined_text = f"{title} {snippet} {url}"

    # Clean ticker (remove exchange suffix)
    clean_ticker = ticker.replace(".NS", "").replace(".BO", "").lower()

    # Check for ticker match
    if clean_ticker in combined_text:
        return True

    # Check for company name match (if provided)
    if company_name:
        # Split company name for better matching
        # e.g., "Tata Steel Limited" -> check for "tata steel"
        company_lower = company_name.lower()
        # Remove common suffixes
        for suffix in ["limited", "ltd", "ltd.", "inc", "inc.", "corporation", "corp", "corp."]:
            company_lower = company_lower.replace(suffix, "").strip()

        # Check if main company name appears
        if company_lower and company_lower in combined_text:
            return True

        # Check for first significant word (e.g., "Tata" for "Tata Steel")
        words = company_lower.split()
        if words:
            first_word = words[0]
            # Only check first word if it's significant (>3 chars) and not generic
            generic_words = {"the", "new", "india", "indian"}
            if len(first_word) > 3 and first_word not in generic_words:
                # Need to check with word boundaries for first word
                if re.search(rf'\b{re.escape(first_word)}\b', combined_text):
                    return True

    return False


async def search_news(
    query: str,
    max_results: int = 10,
    ticker: str | None = None,
    company_name: str | None = None,
) -> list[NewsItem]:
    """
    Search for news asynchronously with relevance filtering.

    Args:
        query: Search query
        max_results: Maximum number of results to fetch (will filter down)
        ticker: Stock ticker for relevance filtering
        company_name: Company name for relevance filtering

    Returns:
        List of NewsItem objects (filtered for relevance)
    """
    loop = asyncio.get_event_loop()
    # Fetch more results to allow for filtering
    fetch_count = max_results * 2
    json_str = await loop.run_in_executor(
        _executor,
        search_news_sync,
        query,
        fetch_count,
    )

    data = parse_news_data(json_str)

    # Filter for date (last 60 days only)
    data = [
        item for item in data
        if _is_recent_news(item.get("date", ""))
    ]

    # Filter for relevance if ticker is provided
    if ticker:
        data = [
            item for item in data
            if _is_relevant_news(item, ticker, company_name)
        ]

    # Limit to requested count
    data = data[:max_results]

    return [
        NewsItem(
            title=item.get("title", ""),
            snippet=item.get("snippet", ""),
            source=item.get("source", ""),
            url=item.get("url", ""),
            date=item.get("date", ""),
        )
        for item in data
    ]


def build_news_query(ticker: str, company_name: str | None = None) -> str:
    """
    Build a news search query for a stock.

    Args:
        ticker: Stock ticker
        company_name: Optional company name

    Returns:
        Search query string
    """
    # Remove exchange suffix for cleaner search
    clean_ticker = ticker.replace(".NS", "").replace(".BO", "")

    if company_name:
        # Use quoted company name for exact match and ticker
        return f'"{company_name}" OR "{clean_ticker}" stock news India'
    return f'"{clean_ticker}" stock news India NSE'
