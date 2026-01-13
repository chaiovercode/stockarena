"""
Lightweight agent wrapper for pure LangGraph implementation.

This replaces CrewAI's Agent/Task pattern with direct OpenAI calls via LangChain.
"""

import json
import logging
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage


logger = logging.getLogger(__name__)


class SimpleAgent:
    """
    Lightweight agent that wraps LLM calls with role/goal/backstory.

    Instead of CrewAI's complex Agent/Task abstraction, we directly call OpenAI
    with system and user messages. This is:
    - Simpler: ~70 lines instead of CrewAI's hundreds
    - More transparent: You see exactly what prompt is sent
    - Truly async: Native async/await instead of blocking calls
    - Easier to debug: Single point where LLM is called

    LangGraph Teaching Point:
    ========================
    In LangGraph, nodes call agents asynchronously. This SimpleAgent enables that:
    - Nodes call agent.execute() which is async
    - No blocking calls that slow down WebSocket streaming
    - Real-time updates flow immediately through stream_updates
    """

    def __init__(
        self,
        role: str,
        goal: str,
        backstory: str,
        model: str = "gpt-4o-mini",
        temperature: float = 0.7,
    ):
        """
        Initialize the agent with personality and LLM configuration.

        Args:
            role: Agent's role (e.g., "Bull Market Analyst")
                  This becomes part of the system prompt
            goal: What the agent should achieve
                  Gives the agent direction and purpose
            backstory: Agent's personality and motivation
                       Makes the agent act in character
            model: OpenAI model to use (default: gpt-4o-mini)
            temperature: Sampling temperature (0.0-1.0)
                         Lower = deterministic, Higher = creative
        """
        self.role = role
        self.goal = goal
        self.backstory = backstory
        self.llm = ChatOpenAI(model=model, temperature=temperature)

        logger.info(f"Initialized {role} agent with model={model}, temp={temperature}")

    def _build_system_prompt(self) -> str:
        """
        Build system prompt with role, goal, and backstory.

        LangGraph Teaching Point:
        ========================
        System messages define the agent's behavior. By including role/goal/backstory,
        we're essentially "jailbreaking" the LLM into acting as our specific character.

        For example, a Bull agent gets this system prompt:
        "You are an Aggressive Bull Market Analyst.
         Your goal: Prove why this stock is a screaming BUY.
         Your backstory: You are an infamous bull analyst..."

        This makes GPT behave consistently with the character.
        """
        return f"""You are a {self.role}.

Your goal: {self.goal}

Your backstory: {self.backstory}

Always respond in valid JSON format as specified in the task."""

    async def execute(self, task_description: str) -> str:
        """
        Execute a task with the agent asynchronously.

        LangGraph Teaching Point:
        ========================
        This is where LangGraph integrates with LLMs. When a node calls execute():

        1. Node is in middle of graph execution
        2. Calls agent.execute(task_description) - this is async
        3. async/await allows other nodes or WebSocket updates to happen concurrently
        4. Once LLM responds, node continues and returns stream_updates
        5. WebSocket handler catches stream_updates and sends to client
        6. Client sees real-time updates without waiting for entire graph

        This is why async is critical for WebSocket streaming.

        Args:
            task_description: The task prompt with context and JSON schema

        Returns:
            Raw LLM response as string
        """
        # Construct messages for OpenAI
        messages = [
            SystemMessage(content=self._build_system_prompt()),
            HumanMessage(content=task_description),
        ]

        # Log the request
        logger.info(f"[{self.role}] Sending prompt to OpenAI (model={self.llm.model_name})")
        logger.debug(f"[{self.role}] System prompt: {self._build_system_prompt()[:200]}...")
        logger.debug(f"[{self.role}] Task: {task_description[:300]}...")

        # Call OpenAI asynchronously (this is the key difference from CrewAI)
        response = await self.llm.ainvoke(messages)

        # Log the response
        logger.info(f"[{self.role}] Received response from OpenAI")
        logger.debug(f"[{self.role}] Response: {response.content[:300]}...")

        return response.content

    @staticmethod
    def parse_json_response(response: str) -> dict:
        """
        Extract and parse JSON from LLM response.

        LangGraph Teaching Point:
        ========================
        LLMs are probabilistic and sometimes don't follow instructions perfectly.
        They might wrap JSON in extra text like:
        "Based on the analysis: {json_here}"

        This method robustly extracts the JSON regardless of surrounding text.

        Args:
            response: Raw LLM response string

        Returns:
            Parsed JSON dict

        Raises:
            ValueError: If no valid JSON found
        """
        # Find JSON in response
        start_idx = response.find("{")
        end_idx = response.rfind("}") + 1

        if start_idx == -1 or end_idx <= start_idx:
            raise ValueError(f"No JSON found in response: {response[:200]}")

        json_str = response[start_idx:end_idx]

        try:
            return json.loads(json_str)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON: {json_str[:200]}...")
            raise ValueError(f"Invalid JSON in response: {str(e)}")
