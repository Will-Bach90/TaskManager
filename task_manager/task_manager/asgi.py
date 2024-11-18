import os
from django.core.asgi import get_asgi_application
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
import tasks.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'task_manager.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": SessionMiddlewareStack(
        AuthMiddlewareStack(
            URLRouter(
                tasks.routing.websocket_urlpatterns
            )
        )
    ),
})

