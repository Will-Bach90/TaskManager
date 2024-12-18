from django.db.models.signals import post_save, post_delete
from django.contrib.auth.signals import user_logged_in, user_logged_out
from django.dispatch import receiver
from .models import Message, ChatRoom
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import json
from task_manager.utils import is_user_logged_out
from profile_management.models import UserProfile
from django.utils.timezone import now
from datetime import timedelta

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
            'author_id': instance.author.id,
            'content': instance.content,
            'msg_id': instance.id,
            'timestamp': instance.timestamp.strftime('%Y-%m-%d %H:%M:%S')
        }
        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                'type': 'chat_message',
                'action': 'send',
                'message': json.dumps(prepared_message)
            }
        )

@receiver(post_delete, sender=Message)
def announce_deleted_message(sender, instance, **kwargs):
    print("Signal handler for deletion entered")
    group_name = f'chat_{instance.room.name}'  # Dynamically get the room name
    print("Group name for deletion:", group_name)
    channel_layer = get_channel_layer()

    # Prepare deletion message
    prepared_message = {
        "msg_id": instance.id,
        "author_id": instance.author.id,
        "room_name": instance.room.name
    }

    # Send the deletion event to the WebSocket group
    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            "type": "chat_message",
            "action": "delete",
            "message": json.dumps(prepared_message)
        }
    )

@receiver(post_save, sender=Message)
def announce_edited_message(sender, instance, **kwargs):
    print("Signal handler for edit entered")
    group_name = f'chat_{instance.room.name}'  # Dynamically get the room name
    print("Group name for edit:", group_name)
    channel_layer = get_channel_layer()

    # Prepare deletion message
    prepared_message = {
        'author': instance.author.username,
        'author_id': instance.author.id,
        'content': instance.content,
        'msg_id': instance.id,
        'timestamp': instance.timestamp.strftime('%Y-%m-%d %H:%M:%S')
    }

    # Send the deletion event to the WebSocket group
    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            "type": "chat_message",
            "action": "edit",
            "message": json.dumps(prepared_message)
        }
    )

def broadcast_user_status(user):
    channel_layer = get_channel_layer()
    # status = is_user_active(user)
    status = user.userprofile.current_status
    last_activity = user.userprofile.last_activity.isoformat()
    async_to_sync(channel_layer.group_send)(
        "activity_updates",
        {
            "type": "broadcast_status",
            "user_id": user.id,
            "status": status,
            "last_activity": last_activity,
        }
    )

@receiver(user_logged_in)
def handle_user_login(sender, request, user, **kwargs):
    user.userprofile.current_status = 'Inactive'
    user.userprofile.save()
    broadcast_user_status(user)


# Signal for user logout
@receiver(user_logged_out)
def handle_user_logout(sender, request, user, **kwargs):
    user.userprofile.current_status = 'Offline'
    user.userprofile.save()
    broadcast_user_status(user) 


# Signal for saving profile (updates last_activity)
@receiver(post_save, sender=UserProfile)
def handle_profile_update(sender, instance, **kwargs):
    broadcast_user_status(instance.user)
