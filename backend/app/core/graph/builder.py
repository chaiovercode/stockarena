"""LangGraph builder for the debate flow."""

from langgraph.graph import StateGraph, START, END
from app.core.graph.state import DebateState
from app.core.graph.nodes import (
    fetch_data_node,
    summary_node,
    bull_analysis_node,
    bear_analysis_node,
    moderator_node,
    error_handler_node,
)
from app.core.graph.edges import route_after_fetch, route_after_bear


def build_debate_graph() -> StateGraph:
    """
    Build the LangGraph debate flow.

    Flow:
    START -> fetch_data -> summary -> [bull_analysis OR error_handler]
                                            |
                                            v
                                      bull_analysis
                                            |
                                            v
                                      bear_analysis
                                            |
                                [if more rounds] -> bull_analysis (loop)
                                [if done] -> moderator
                                            |
                                            v
                                          END

    Returns:
        Compiled StateGraph
    """
    # Initialize graph with state schema
    builder = StateGraph(DebateState)

    # Add nodes
    builder.add_node("fetch_data", fetch_data_node)
    builder.add_node("summary", summary_node)
    builder.add_node("bull_analysis", bull_analysis_node)
    builder.add_node("bear_analysis", bear_analysis_node)
    builder.add_node("moderator", moderator_node)
    builder.add_node("error_handler", error_handler_node)

    # Define edges

    # START -> fetch_data
    builder.add_edge(START, "fetch_data")

    # fetch_data -> summary OR error_handler
    builder.add_conditional_edges(
        "fetch_data",
        route_after_fetch,
        {
            "summary": "summary",
            "error_handler": "error_handler",
        },
    )

    # summary -> bull_analysis
    builder.add_edge("summary", "bull_analysis")

    # bull_analysis -> bear_analysis
    builder.add_edge("bull_analysis", "bear_analysis")

    # bear_analysis -> moderator OR back to bull_analysis (multi-round)
    builder.add_conditional_edges(
        "bear_analysis",
        route_after_bear,
        {
            "moderator": "moderator",
            "bull_analysis": "bull_analysis",
        },
    )

    # moderator -> END
    builder.add_edge("moderator", END)

    # error_handler -> END
    builder.add_edge("error_handler", END)

    # Compile the graph
    return builder.compile()


# Singleton instance
debate_graph = build_debate_graph()
