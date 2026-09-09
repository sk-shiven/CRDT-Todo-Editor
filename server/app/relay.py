from typing import List, Optional
from fastapi import WebSocket

class ConnectionManager:
    """
    Manages active WebSocket client connections and relays CRDT operations.
    """
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        # Accept websocket connection and append to active_connections list
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        # Remove websocket from active_connections list on disconnect
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict, sender: Optional[WebSocket] = None):
        # Send message JSON to all active_connections except the optional sender websocket
        disconnected = []
        for connection in list(self.active_connections):
            if connection != sender:
                try:
                    await connection.send_json(message)
                except Exception:
                    disconnected.append(connection)

        for dead_conn in disconnected:
            if dead_conn in self.active_connections:
                self.active_connections.remove(dead_conn)

manager = ConnectionManager()
