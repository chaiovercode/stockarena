"""DuckDuckGo search tool for fetching news."""

import json
from crewai.tools import BaseTool
from pydantic import BaseModel, Field
from duckduckgo_search import DDGS


class SearchInput(BaseModel):
    """Input schema for search tool."""

    query: str = Field(..., description="Search query for news")
    max_results: int = Field(default=10, description="Maximum number of results")


class SearchTool(BaseTool):
    """CrewAI tool for DuckDuckGo news search."""

    name: str = "News Search"
    description: str = """
    Searches for recent news articles about stocks, companies, or markets.
    Returns news headlines, snippets, sources, and publication dates.
    Use for gathering sentiment and recent developments about a stock.
    """
    args_schema: type[BaseModel] = SearchInput

    def _run(self, query: str, max_results: int = 10) -> str:
        """Search for news synchronously."""
        return search_news_sync(query, max_results)


def search_news_sync(query: str, max_results: int = 10) -> str:
    """
    Search for news using DuckDuckGo.

    Args:
        query: Search query
        max_results: Maximum number of results

    Returns:
        JSON string with news items
    """
    try:
        with DDGS() as ddgs:
            # Note: DuckDuckGo supports: d (day), w (week), m (month)
            # Limit to last 2 months (60 days) for recent news only
            results = list(
                ddgs.news(
                    query,
                    region="in-en",  # India English
                    safesearch="moderate",
                    timelimit="m",  # Last month - will be further filtered to 60 days
                    max_results=max_results,
                )
            )

        news_items = [
            {
                "title": item.get("title", ""),
                "snippet": item.get("body", ""),
                "source": item.get("source", ""),
                "url": item.get("url", ""),
                "date": item.get("date", ""),
            }
            for item in results
        ]

        return json.dumps(news_items, indent=2)

    except Exception as e:
        return json.dumps({"error": str(e), "query": query})


def parse_news_data(json_str: str) -> list[dict]:
    """Parse news data JSON string to list of dictionaries."""
    try:
        data = json.loads(json_str)
        if isinstance(data, dict) and "error" in data:
            return []
        return data if isinstance(data, list) else []
    except json.JSONDecodeError:
        return []
