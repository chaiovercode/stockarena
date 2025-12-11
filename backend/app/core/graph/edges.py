"""LangGraph edge routing functions."""

from typing import Literal
from app.core.graph.state import DebateState


def route_after_fetch(
    state: DebateState,
) -> Literal["summary", "error_handler"]:
    """
    Route after data fetching.

    Args:
        state: Current debate state

    Returns:
        Next node name
    """
    if state.get("error") or state.get("stock_data") is None:
        return "error_handler"
    return "summary"


def route_after_bear(
    state: DebateState,
) -> Literal["moderator", "bull_analysis"]:
    """
    Route after bear analysis.

    For multi-round debates, loops back to bull for rebuttal.
    Otherwise proceeds to moderator for final verdict.

    Args:
        state: Current debate state

    Returns:
        Next node name
    """
    current_round = state.get("current_round", 1)
    max_rounds = state.get("max_rounds", 1)

    if current_round < max_rounds:
        return "bull_analysis"
    return "moderator"
