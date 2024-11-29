from django.db import models
from django.contrib.auth.models import User
import datetime

# class ChatRoom(models.Model):
#     name = models.CharField(max_length=255, unique=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     description = models.TextField(default=None)

#     def __str__(self):
#         return self.name

class ChatRoom(models.Model):
    name = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    description = models.TextField(default=None)
    admin = models.ForeignKey(User, related_name='admin_rooms', on_delete=models.CASCADE, default=1)
    participants = models.ManyToManyField(User, related_name='chat_rooms')

    def __str__(self):
        return self.name

    def add_participant(self, user, admin_user):
        if admin_user != self.admin:
            raise PermissionError("Only admins can add participants.")
        if user not in admin_user.profile.friends.all():  # For Profile model
            raise PermissionError("Only friends can be added to the chat room.")
        self.participants.add(user)
        self.save()

    def remove_participant(self, user, admin_user):
        if admin_user == self.admin:
            if user == self.admin:
                raise ValueError("Admin cannot be removed from the chat room.")
            self.participants.remove(user)
            self.save()
        else:
            raise PermissionError("Only admins can remove participants.")

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
