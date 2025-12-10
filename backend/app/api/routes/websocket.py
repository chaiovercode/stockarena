"""WebSocket endpoint for real-time debate streaming."""

import json
import uuid
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.api.schemas.request import TimeHorizon
from app.core.graph.builder import debate_graph
from app.core.graph.state import create_initial_state
from app.services.stock_service import format_ticker

router = APIRouter()


class ConnectionManager:
    """Manages WebSocket connections."""

    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, session_id: str):
        """Accept and store connection."""
        await websocket.accept()
        self.active_connections[session_id] = websocket

    def disconnect(self, session_id: str):
        """Remove connection."""
        if session_id in self.active_connections:
            del self.active_connections[session_id]

    async def send_update(self, session_id: str, data: dict):
        """Send update to specific client."""
        if session_id in self.active_connections:
            try:
                await self.active_connections[session_id].send_json(data)
            except Exception:
                self.disconnect(session_id)


manager = ConnectionManager()


@router.websocket("/ws/debate/{session_id}")
async def websocket_debate(websocket: WebSocket, session_id: str):
    """
    WebSocket endpoint for real-time debate streaming.

    Client sends: {"type": "start", "ticker": "TATASTEEL", "exchange": "NSE", "max_rounds": 1}
    Server sends: Stream of debate updates
    """
    await manager.connect(websocket, session_id)

    try:
        while True:
            # Receive message from client
            data = await websocket.receive_json()

            if data.get("type") == "start":
                ticker = data.get("ticker", "")
                if not ticker:
                    await manager.send_update(
                        session_id,
                        {"type": "error", "error": "Ticker is required"},
                    )
                    continue

                exchange = data.get("exchange", "NSE")
                max_rounds = min(max(data.get("max_rounds", 1), 1), 3)
                formatted_ticker = format_ticker(ticker, exchange)

                # Parse time horizon
                time_horizon_str = data.get("time_horizon", "medium_term")
                try:
                    time_horizon = TimeHorizon(time_horizon_str)
                except ValueError:
                    time_horizon = TimeHorizon.MEDIUM_TERM

                # Send acknowledgment
                await manager.send_update(
                    session_id,
                    {
                        "type": "started",
                        "ticker": formatted_ticker,
                        "max_rounds": max_rounds,
                        "time_horizon": time_horizon.value,
                        "message": "Analysis started",
                    },
                )

                # Initialize state
                initial_state = create_initial_state(
                    ticker=formatted_ticker,
                    max_rounds=max_rounds,
                    user_query=data.get("user_query"),
                    time_horizon=time_horizon,
                )

                # Stream graph execution
                try:
                    async for event in debate_graph.astream_events(
                        initial_state, version="v2"
                    ):
                        event_kind = event.get("event")

                        if event_kind == "on_chain_start":
                            node_name = event.get("name", "")
                            if node_name and not node_name.startswith("__"):
                                await manager.send_update(
                                    session_id,
                                    {"type": "node_start", "node": node_name},
                                )

                        elif event_kind == "on_chain_end":
                            output = event.get("data", {}).get("output", {})
                            # Skip if output is not a dict (e.g., routing functions return strings)
                            if not isinstance(output, dict):
                                continue
                            stream_updates = output.get("stream_updates", [])

                            for update in stream_updates:
                                if hasattr(update, "model_dump"):
                                    update_dict = update.model_dump()
                                else:
                                    update_dict = update
                                await manager.send_update(session_id, update_dict)

                    # Send completion
                    await manager.send_update(
                        session_id, {"type": "complete", "message": "Debate complete"}
                    )

                except Exception as e:
                    await manager.send_update(
                        session_id, {"type": "error", "error": str(e)}
                    )

            elif data.get("type") == "ping":
                await manager.send_update(session_id, {"type": "pong"})

            elif data.get("type") == "stop":
                await manager.send_update(
                    session_id, {"type": "stopped", "message": "Analysis stopped"}
                )
                break

    except WebSocketDisconnect:
        manager.disconnect(session_id)
    except Exception as e:
        try:
            await manager.send_update(session_id, {"type": "error", "error": str(e)})
        except Exception:
            pass
        manager.disconnect(session_id)


@router.websocket("/ws/debate")
async def websocket_debate_auto(websocket: WebSocket):
    """
    WebSocket endpoint with auto-generated session ID.
    """
    session_id = str(uuid.uuid4())
    await websocket_debate(websocket, session_id)
