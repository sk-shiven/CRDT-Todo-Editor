import unittest
from unittest.mock import AsyncMock
# pyrefly: ignore [missing-import]
from app.relay import ConnectionManager


class TestConnectionManager(unittest.IsolatedAsyncioTestCase):
    async def test_connect(self):
        manager = ConnectionManager()
        mock_ws = AsyncMock()

        await manager.connect(mock_ws)

        mock_ws.accept.assert_awaited_once()
        self.assertIn(mock_ws, manager.active_connections)
        self.assertEqual(len(manager.active_connections), 1)

    async def test_disconnect(self):
        manager = ConnectionManager()
        mock_ws = AsyncMock()

        await manager.connect(mock_ws)
        self.assertEqual(len(manager.active_connections), 1)

        manager.disconnect(mock_ws)
        self.assertNotIn(mock_ws, manager.active_connections)
        self.assertEqual(len(manager.active_connections), 0)

    async def test_broadcast_excluding_sender(self):
        manager = ConnectionManager()
        sender_ws = AsyncMock()
        client1_ws = AsyncMock()
        client2_ws = AsyncMock()

        await manager.connect(sender_ws)
        await manager.connect(client1_ws)
        await manager.connect(client2_ws)

        payload = {"type": "INSERT_ITEM", "itemId": "123"}
        await manager.broadcast(payload, sender=sender_ws)

        sender_ws.send_json.assert_not_awaited()
        client1_ws.send_json.assert_awaited_once_with(payload)
        client2_ws.send_json.assert_awaited_once_with(payload)

    async def test_broadcast_all_when_no_sender(self):
        manager = ConnectionManager()
        client1_ws = AsyncMock()
        client2_ws = AsyncMock()

        await manager.connect(client1_ws)
        await manager.connect(client2_ws)

        payload = {"type": "SYNC_OPS", "ops": []}
        await manager.broadcast(payload)

        client1_ws.send_json.assert_awaited_once_with(payload)
        client2_ws.send_json.assert_awaited_once_with(payload)

    async def test_broadcast_cleans_up_broken_connections(self):
        manager = ConnectionManager()
        good_ws = AsyncMock()
        broken_ws = AsyncMock()
        broken_ws.send_json.side_effect = RuntimeError("Socket disconnected")

        await manager.connect(broken_ws)
        await manager.connect(good_ws)
        self.assertEqual(len(manager.active_connections), 2)

        payload = {"type": "PING"}
        await manager.broadcast(payload)

        good_ws.send_json.assert_awaited_once_with(payload)
        self.assertNotIn(broken_ws, manager.active_connections)
        self.assertIn(good_ws, manager.active_connections)
        self.assertEqual(len(manager.active_connections), 1)


if __name__ == "__main__":
    unittest.main()
