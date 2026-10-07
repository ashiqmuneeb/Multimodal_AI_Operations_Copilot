from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.websocket_service import get_websocket_service
from app.observability.logging import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/ws", tags=["Real-Time WebSockets"])


@router.websocket("/live/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    """
    Real-time WebSocket endpoint for industrial inspection telemetry.
    Streams video keyframe progress, blur filtering results, and agent multi-tool reasoning traces.
    """
    ws_service = get_websocket_service()
    await ws_service.connect(websocket, client_id)
    try:
        while True:
            # Keep connection alive & listen for client ping/message
            data = await websocket.receive_text()
            # Echo heartbeat or client ping
            await ws_service.send_personal_message(
                {"event": "pong", "client_id": client_id, "received": data},
                websocket
            )
    except WebSocketDisconnect:
        ws_service.disconnect(websocket, client_id)
        logger.info(f"Client {client_id} disconnected from WebSocket.")
    except Exception as e:
        logger.warning(f"WebSocket error for {client_id}: {e}")
        ws_service.disconnect(websocket, client_id)
