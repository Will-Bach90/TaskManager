from django.urls import re_path
from .consumers import TaskConsumer, ProjectConsumer

websocket_urlpatterns = [
    # re_path(r'ws/tasks/(?P<project_id>\d+)/$', TaskConsumer.as_asgi()),
    re_path(r'^ws/tasks/$', TaskConsumer.as_asgi()),
    re_path(r'^ws/projects/$', ProjectConsumer.as_asgi()),
    # re_path(r'^ws/chat/(?P<room_name>\w+)/$', ChatConsumer.as_asgi()),
]
