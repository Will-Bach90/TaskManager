from django.db import models
from django.contrib.auth.models import User
from django.db.models import Manager
from django.utils.timezone import now
from django.core.exceptions import PermissionDenied
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
import datetime

class ChatRoomManager(models.Manager):
    def _broadcast_participant_change(self, chat_room, event, user):
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"chat_{chat_room.id}",
            {
                "type": "participant_update",
                "event": event,  # "add", "remove", or "leave"
                "user_id": user.id,
                "username": user.username,
            },
        )

    def add_participant(self, chat_room, user, admin_user):
        if admin_user != chat_room.admin:
            raise PermissionDenied("Only admins can add participants.")
        if user not in admin_user.profile.friends.all():
            raise PermissionDenied("Only friends can be added to the chat room.")
        chat_room.participants.add(user)
        chat_room.save()
        self._broadcast_participant_change(chat_room, "add", user)
        return chat_room

    def remove_participant(self, chat_room, user, admin_user):
        if admin_user != chat_room.admin:
            raise PermissionDenied("Only admins can remove participants.")
        if user == chat_room.admin:
            raise ValueError("The admin cannot be removed from the chat room.")
        chat_room.participants.remove(user)
        chat_room.save()
        self._broadcast_participant_change(chat_room, "remove", user)
        return chat_room

    def leave_room(self, chat_room, user):
        if user in chat_room.participants.all():
            chat_room.participants.remove(user)
            chat_room.save()
            self._broadcast_participant_change(chat_room, "leave", user)
            return chat_room
        raise PermissionDenied("User is not a participant in this chat room.")

class ChatRoom(models.Model):
    name = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    description = models.TextField(default=None)
    admin = models.ForeignKey(User, related_name='admin_rooms', on_delete=models.CASCADE, default=1)
    participants = models.ManyToManyField(User, related_name='chat_rooms')

    objects = ChatRoomManager() 

    def __str__(self):
        return self.name

class Message(models.Model):
    room = models.ForeignKey(ChatRoom, related_name='messages', on_delete=models.CASCADE)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_edited = models.BooleanField(default=False)
    editTimestamp = models.DateTimeField(null=True, blank=True)

    def edit_message(self, new_content):
        if self.content != new_content: 
            self.content = new_content
            self.is_edited = True
            self.editTimestamp = datetime.datetime.now()
            self.save()
