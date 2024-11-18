import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Message, ChatRoom
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'task_manager.settings') 

class TaskConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.project_group_name = 'general_project_group'

        await self.channel_layer.group_add(
            self.project_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.project_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']

        await self.channel_layer.group_send(
            self.project_group_name,
            {
                'type': 'send_task_message',
                'message': message
            }
        )

    async def send_task_message(self, event):
        message = event['message']
        await self.send(text_data=json.dumps({
            'message': message
        }))

    async def delete_task(self, task_id):
        await self.channel_layer.group_send(
            self.project_group_name,
            {
                'type': 'send_task_message',
                'message': json.dumps({"action": "delete", "task_id": task_id})
            }
        )
    
    async def add_task(self, task_id):
        await self.channel_layer.group_send(
            self.project_group_name,
            {
                'type': 'send_task_message',
                'message': json.dumps({"action": "create", "task_id": task_id})
            }
        )

class ProjectConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.project_group_name = 'projects_group'

        await self.channel_layer.group_add(
            self.project_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.project_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']

        await self.channel_layer.group_send(
            self.project_group_name,
            {
                'type': 'send_project_message',
                'message': message
            }
        )

    async def send_project_message(self, event):
        message = event['message']
        await self.send(text_data=json.dumps({
            'message': message
        }))

    async def delete_task(self, project_id):
        await self.channel_layer.group_send(
            self.project_group_name,
            {
                'type': 'send_project_message',
                'message': json.dumps({"action": "delete", "project_id": project_id})
            }
        )
    
    async def add_project(self, project_id):
        await self.channel_layer.group_send(
            self.project_group_name,
            {
                'type': 'send_project_message',
                'message': json.dumps({"action": "create", "project_id": project_id})
            }
        )


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message_content = text_data_json.get('message')

        # Wrap ORM operations
        room = await database_sync_to_async(ChatRoom.objects.get_or_create)(
            name=self.room_name
        )
        room = room[0]  # Extract the room object from get_or_create

        # Save the message to the database
        user = self.scope['user']
        await database_sync_to_async(Message.objects.create)(
            room=room,
            author=user,
            content=message_content
        )

    async def chat_message(self, event):
        message_content = event.get('message', None)
        if message_content:
            await self.send(text_data=json.dumps({
                'author': 'User',  # Placeholder until real logic is added
                'message': message_content,
                'timestamp': 'Timestamp',  # Placeholder
            }))
