from celery import shared_task
from django.utils.timezone import now
from datetime import timedelta
from .models import UserProfile
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from task_manager.utils import is_user_logged_out


@shared_task
def check_user_activity():
    channel_layer = get_channel_layer()
    idle_threshold = timedelta(seconds=10)
    inactive_threshold = timedelta(seconds=20)

    for profile in UserProfile.objects.all():
        if is_user_logged_out(profile.user):
            new_status='Offline'
        else:
            time_diff = now() - profile.last_activity
            if time_diff < idle_threshold:
                new_status = "Active"
            elif time_diff < inactive_threshold:
                new_status = "Idle"
            else:
                new_status = "Inactive"
        profile.current_status = new_status
        profile.save()

        last_activity = profile.last_activity.isoformat()
        print(last_activity)
        async_to_sync(channel_layer.group_send)(
            "activity_updates",
            {
                "type": "broadcast_status",
                "user_id": profile.user.id,
                "status": new_status,
                "last_activity": last_activity,
            }
        )
