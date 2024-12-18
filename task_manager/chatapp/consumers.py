import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync, sync_to_async
from channels.db import database_sync_to_async
from task_manager.utils import is_user_logged_out
from django.utils.timezone import now
from datetime import timedelta
from task_manager.consumers import BaseWebSocketConsumer

class ChatConsumer(BaseWebSocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        action = text_data_json.get('action')
        user = self.scope["user"]
        if action == "send":
            await self.handle_send_message(text_data, user)
        elif action == "edit":
            await self.handle_edit_message(text_data, user)
        elif action == "delete":
            await self.handle_delete_message(text_data, user)

    async def handle_send_message(self, text_data, user):
        from .models import ChatRoom, Message
        data = json.loads(text_data)
        message_content = data.get('message')
        # print(message_content)
        room, _ = await database_sync_to_async(ChatRoom.objects.get_or_create)(
            name=self.room_name
        )
        message = await database_sync_to_async(Message.objects.create)(
            room=room,
            author=user,
            content=message_content
        )

    async def handle_edit_message(self, data, user):
        from .models import ChatRoom, Message
        message_id = data.get("message_id")
        new_content = data.get("new_content")

        try:
            message = await database_sync_to_async(Message.objects.get)(id=message_id, author=user)
            message.content = new_content
            await database_sync_to_async(message.save)()
        except Message.DoesNotExist:
            await self.send(text_data=json.dumps({"error": "Message not found or not editable by this user"}))

    async def handle_delete_message(self, data, user):
        from .models import ChatRoom, Message
        message_id = data.get("message_id")

        try:
            message = await database_sync_to_async(Message.objects.get)(id=message_id, author=user)
            await database_sync_to_async(message.delete)()
        except Message.DoesNotExist:
            await self.send(text_data=json.dumps({"error": "Message not found or not deletable by this user"}))

    async def chat_message(self, event):
        try:
            action = event.get("action")
            message = event.get("message")

            if isinstance(message, str):
                message = json.loads(message)

            if not message:
                print("No message content received")
                return

            await self.send(text_data=json.dumps({
                "action": action,
                "message": message,
            }))
        except Exception as e:
            print(f"Error in chat_message: {e}")

class ActivityConsumer(BaseWebSocketConsumer):
    async def connect(self):
        self.project_group_name = "activity_updates"

        await self.channel_layer.group_add(
            self.project_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        from django.contrib.auth.models import User
        from profile_management.models import UserProfile

        user = self.scope.get('user', None)
        if user and user.is_authenticated:
            user_profile = await sync_to_async(lambda: UserProfile.objects.get(user=user))()
            print(f"User {user_profile.current_status} disconnected.")
            user_profile.current_status = "Inactive"
            await sync_to_async(user_profile.save)()
            print(f"User {user_profile.current_status} disconnected.")

            last_activity = await sync_to_async(lambda: user_profile.last_activity)()

            channel_layer = get_channel_layer()
            await channel_layer.group_send(
                "activity_updates",
                {
                    "type": "broadcast_status",
                    "user_id": user.id,
                    "status": "Inactive",
                    "last_activity": last_activity.isoformat(),
                },
            )

            await self.channel_layer.group_discard(self.project_group_name, self.channel_name)

        print(f"WebSocket disconnected: {close_code}")
        # await self.channel_layer.group_discard(
        #     self.project_group_name,
        #     self.channel_name
        # )

    async def receive(self, text_data):
        data = json.loads(text_data)
        user_id = data.get('user_id')

        status, last_activity = await self.get_user_status(user_id)
        print(status)
        print(last_activity)
        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "broadcast_status",
                "user_id": user_id,
                "status": status,
                "last_activity": last_activity.isoformat(),
            }
        )

    async def broadcast_status(self, event):
        await self.send(text_data=json.dumps({
            "user_id": event["user_id"],
            "status": event["status"],
            "last_activity": event["last_activity"],
        }))

    @database_sync_to_async
    def get_user_status(self, user_id):
        from django.contrib.auth.models import User
        user = User.objects.get(id=user_id)
        return [user.userprofile.current_status, user.userprofile.last_activity]
        # return is_user_active(user)


##=================================================================================
class ChatUserConsumer(BaseWebSocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f"chat_{self.room_name}"

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def participant_update(self, event):
        await self.send(text_data=json.dumps({
            "type": "participant_update",
            "event": event["event"],
            "user_id": event["user_id"],
            "username": event["username"],
        }))