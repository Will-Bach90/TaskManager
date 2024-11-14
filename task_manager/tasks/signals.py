# tasks/signals.py

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Task
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import json

@receiver(post_save, sender=Task)
def announce_task_save(sender, instance, created, **kwargs):
    channel_layer = get_channel_layer()
    message = {
        'id': instance.id, 
        'title': instance.title, 
        'action': 'created' if created else 'updated'
    }
    async_to_sync(channel_layer.group_send)(
        "task_updates",
        {
            "type": "task_message",
            "message": json.dumps(message),
        }
    )

@receiver(post_delete, sender=Task)
def announce_task_deletion(sender, instance, **kwargs):
    print("Signal triggered for deletion of task", instance.title)

    channel_layer = get_channel_layer()
    message = {'id': instance.id, 'action': 'deleted'}
    async_to_sync(channel_layer.group_send)(
        "task_updates",
        {
            "type": "task_message",
            "message": json.dumps(message),
        }
    )
