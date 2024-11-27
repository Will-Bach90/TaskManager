# from django.apps import AppConfig
# import logging
# logger = logging.getLogger(__name__)

# class ChatappConfig(AppConfig):
#     name = 'chatapp'

#     def ready(self):
#         logger.info("Importing chat signals")
#         import chatapp.signals 

from django.apps import AppConfig
import logging

logger = logging.getLogger(__name__)

class ChatappConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'  # Recommended for modern Django apps
    name = 'chatapp'

    def ready(self):
        logger.info("Importing chat signals")
        try:
            import chatapp.signals
        except ImportError as e:
            logger.error(f"Failed to import chatapp signals: {e}")

