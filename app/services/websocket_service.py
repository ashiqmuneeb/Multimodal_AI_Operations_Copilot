import json
from typing import Dict, List, Any, Optional
from fastapi import WebSocket
from app.observability.logging import get_logger

logger = get_logger(__name__)


class WebSocketService:
    """
    Real-Time WebSocket Connection & Event Dispatch Manager.
    Broadcasts live inspection telemetry, video frame processing progress,
    and agent tool execution steps to connected frontend clients.
    """

    def __init__(self):
        # Map of client_id -> list of active WebSockets
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, client_id: str):
        """Accepts and registers a client WebSocket connection."""
        await websocket.accept()
        if client_id not in self.active_connections:
            self.active_connections[client_id] = []
        self.active_connections[client_id].append(websocket)
        logger.info(f"WebSocket client connected: {client_id} (Total: {len(self.active_connections[client_id])})")

    def disconnect(self, websocket: WebSocket, client_id: str):
        """Unregisters a disconnected WebSocket."""
        if client_id in self.active_connections:
            if websocket in self.active_connections[client_id]:
                self.active_connections[client_id].remove(websocket)
            if not self.active_connections[client_id]:
                del self.active_connections[client_id]
        logger.info(f"WebSocket client disconnected: {client_id}")

    async def send_personal_message(self, message: Dict[str, Any], websocket: WebSocket):
        """Sends a JSON message to a specific socket."""
        try:
            await websocket.send_text(json.dumps(message))
        except Exception as e:
            logger.warning(f"Failed to send personal WS message: {e}")

    async def broadcast_to_client(self, client_id: str, event_type: str, data: Dict[str, Any]):
        """
        Sends an event payload to all active sockets for a specific client_id.
        """
        if client_id not in self.active_connections:
            return

        payload = {
            "event": event_type,
            "data": data
        }
        text_payload = json.dumps(payload)

        stale_sockets = []
        for connection in self.active_connections[client_id]:
            try:
                await connection.send_text(text_payload)
            except Exception as e:
                logger.warning(f"Error broadcasting to client {client_id}: {e}")
                stale_sockets.append(connection)

        for stale in stale_sockets:
            self.disconnect(stale, client_id)

    async def broadcast_all(self, event_type: str, data: Dict[str, Any]):
        """Broadcasts an event to all connected clients."""
        payload = json.dumps({"event": event_type, "data": data})
        for client_id, connections in list(self.active_connections.items()):
            for conn in connections:
                try:
                    await conn.send_text(payload)
                except Exception:
                    pass


# Singleton instance
_ws_service: Optional[WebSocketService] = None


def get_websocket_service() -> WebSocketService:
    global _ws_service
    if _ws_service is None:
        _ws_service = WebSocketService()
    return _ws_service
