from django.apps import AppConfig
import logging
logger = logging.getLogger(__name__)

class TasksConfig(AppConfig):
    name = 'tasks'

    def ready(self):
        logger.info("Importing task signals")
        import tasks.signals 