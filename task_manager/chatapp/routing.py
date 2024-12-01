from django.urls import re_path
from .consumers import ChatConsumer, ActivityConsumer

websocket_urlpatterns = [
    re_path(r'^ws/rooms/(?P<room_name>\w+)/$', ChatConsumer.as_asgi()),
    re_path(r'^ws/activity/', ActivityConsumer.as_asgi()),
]