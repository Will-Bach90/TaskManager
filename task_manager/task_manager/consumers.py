import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer

class BaseWebSocketConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

        # Start the heartbeat task
        self.keep_alive = True
        asyncio.create_task(self.send_heartbeat())

    async def disconnect(self, close_code):
        # Stop the heartbeat task
        self.keep_alive = False

    async def send_heartbeat(self):
        while self.keep_alive:
            try:
                await self.send("ping")
                await asyncio.sleep(30)
            except Exception as e:
                print(f"Heartbeat error: {e}")
                break
