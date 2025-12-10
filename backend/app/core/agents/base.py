"""Base agent configuration."""

import os
from functools import lru_cache
from crewai import LLM


@lru_cache
def get_llm() -> LLM:
    """Get configured OpenAI LLM instance for CrewAI."""
    return LLM(
        model="gpt-4o-mini",
        temperature=0.7,
    )


def get_creative_llm() -> LLM:
    """Get LLM with higher temperature for creative responses."""
    return LLM(
        model="gpt-4o-mini",
        temperature=0.9,
    )
