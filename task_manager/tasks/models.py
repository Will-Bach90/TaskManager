from django.db import models
from django.contrib.auth.models import User
import datetime

class Project(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()

class Task(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    project = models.ForeignKey(Project, related_name='tasks', on_delete=models.CASCADE)
    assigned_to = models.ForeignKey(User, related_name='tasks', on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    due_date = models.DateTimeField(default=datetime.datetime.now)
    is_completed = models.BooleanField(default=False)
