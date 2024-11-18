# tasks/signals.py

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Task, Project, Message
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import json

@receiver(post_save, sender=Task)
def announce_task_save(sender, instance, created, **kwargs):
    print("Signal triggered for addition of task", instance.title)
    channel_layer = get_channel_layer()
    message = {
        'id': instance.id, 
        'title': instance.title, 
        'action': 'created'
    }
    async_to_sync(channel_layer.group_send)(
        "general_project_group",
        {
            "type": "send_task_message",
            "message": json.dumps(message),
        }
    )

@receiver(post_delete, sender=Task)
def announce_task_deletion(sender, instance, **kwargs):
    print("Signal triggered for deletion of task", instance.title)
    channel_layer = get_channel_layer()
    message = {'id': instance.id, 'action': 'deleted'}
    async_to_sync(channel_layer.group_send)(
        "general_project_group",
        {
            "type": "send_task_message",
            "message": json.dumps(message),
        }
    )

@receiver(post_save, sender=Project)
def announce_project_save(sender, instance, created, **kwargs):
    print("Signal triggered for addition of project", instance.name)
    channel_layer = get_channel_layer()
    message = {
        'id': instance.id, 
        'name': instance.name, 
        'description': instance.description,
        'action': 'created'
    }
    async_to_sync(channel_layer.group_send)(
        "projects_group",
        {
            "type": "send_project_message",
            "message": json.dumps(message),
        }
    )

@receiver(post_delete, sender=Project)
def announce_project_deletion(sender, instance, **kwargs):
    print("Signal triggered for deletion of project", instance.name)
    channel_layer = get_channel_layer()
    message = {'id': instance.id, 'action': 'deleted'}
    async_to_sync(channel_layer.group_send)(
        "projects_group",
        {
            "type": "send_project_message",
            "message": json.dumps(message),
        }
    )

@receiver(post_save, sender=Message)
def announce_new_message(sender, instance, created, **kwargs):
    if created:
        print("Signal handler entered")
        print("New message created:", instance.content)
        group_name = f'chat_{instance.room.name}'  # Use room name dynamically
        print("Group name:", group_name)
        channel_layer = get_channel_layer()
        prepared_message = {
            'author': instance.author.username,
            'content': instance.content,
            'timestamp': instance.timestamp.strftime('%Y-%m-%d %H:%M:%S')
        }
        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                'type': 'chat_message',
                'message': json.dumps(prepared_message)
            }
        )