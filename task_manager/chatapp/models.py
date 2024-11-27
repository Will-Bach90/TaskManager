from django.db import models
from django.contrib.auth.models import User

class ChatRoom(models.Model):
    name = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    description = models.TextField(default=None)

    def __str__(self):
        return self.name

class Message(models.Model):
    room = models.ForeignKey(ChatRoom, related_name='messages', on_delete=models.CASCADE)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    # is_edited = models.BooleanField(default=False)
    # editTimestamp = models.DateTimeField(null=True, blank=True)
    # def edit_message(self, new_content):
    #     if self.content != new_content: 
    #         self.content = new_content
    #         self.is_edited = True
    #         self.edit_timestamp = datetime.datetime.now()
    #         self.save()
