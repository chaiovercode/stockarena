"""Base agent configuration for LangGraph + LangChain."""

from functools import lru_cache
from langchain_openai import ChatOpenAI


@lru_cache(maxsize=1)
def get_llm(temperature: float = 0.7) -> ChatOpenAI:
    """
    Get cached ChatOpenAI instance for agents.

    Uses caching to reuse the same LLM instance across multiple calls,
    improving performance and reducing API overhead.

    Args:
        temperature: Sampling temperature (0.0-1.0).
                     Lower = deterministic, Higher = creative

    Returns:
        ChatOpenAI instance for gpt-4o-mini
    """
    return ChatOpenAI(
        model="gpt-4o-mini",
        temperature=temperature,
    )


@lru_cache(maxsize=1)
def get_creative_llm() -> ChatOpenAI:
    """
    Get cached ChatOpenAI instance with higher temperature for creative responses.

    Returns:
        ChatOpenAI instance for gpt-4o-mini with temperature=0.9
    """
    return ChatOpenAI(
        model="gpt-4o-mini",
        temperature=0.9,
    )
