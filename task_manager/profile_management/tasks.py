from celery import shared_task
from django.utils.timezone import now
from datetime import timedelta
from your_app.models import Profile
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer


@shared_task
def check_user_activity():
    channel_layer = get_channel_layer()
    idle_threshold = timedelta(minutes=2)
    inactive_threshold = timedelta(minutes=10)

    for profile in Profile.objects.all():
        time_diff = now() - profile.last_activity
        if time_diff < idle_threshold:
            new_status = "Active"
        elif time_diff < inactive_threshold:
            new_status = "Idle"
        else:
            new_status = "Inactive"

        # Broadcast status if changed
        async_to_sync(channel_layer.group_send)(
            "activity_updates",
            {
                "type": "broadcast_status",
                "user_id": profile.user.id,
                "status": new_status,
            }
        )
