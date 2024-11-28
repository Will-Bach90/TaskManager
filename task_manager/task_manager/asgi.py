import os
from django.core.asgi import get_asgi_application
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
import tasks.routing
import chatapp.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'task_manager.settings')
print("DJANGO_SETTINGS_MODULE:", os.environ.get('DJANGO_SETTINGS_MODULE'))

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            tasks.routing.websocket_urlpatterns + chatapp.routing.websocket_urlpatterns
        )
    ),
})
# import os
# from django.core.asgi import get_asgi_application
# from channels.auth import AuthMiddlewareStack
# from channels.routing import ProtocolTypeRouter, URLRouter
# import chatapp.routing

# os.environ.setdefault("DJANGO_SETTINGS_MODULE", "task_manager.settings")

# application = ProtocolTypeRouter({
#     "http": get_asgi_application(),
#     "websocket": AuthMiddlewareStack(
#         URLRouter(chatapp.routing.websocket_urlpatterns)
#     ),
# })
