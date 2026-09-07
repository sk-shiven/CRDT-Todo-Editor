from typing import List
from fastapi import WebSocket

class ConnectionManager:
    """
    Manages active WebSocket client connections and relays CRDT operations.
    """
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        # TODO: Accept websocket connection and append to active_connections list
        raise NotImplementedError()

    def disconnect(self, websocket: WebSocket):
        # TODO: Remove websocket from active_connections list on disconnect
        raise NotImplementedError()

    async def broadcast(self, message: dict, sender: WebSocket = None):
        # TODO: Send message JSON to all active_connections except the optional sender websocket
        raise NotImplementedError()

manager = ConnectionManager()
