from django.utils.timezone import now
from datetime import timedelta

# def is_user_active(user):
    # if is_user_logged_out(user):
    #     return "Offline"
    # return u
    # active_threshold = timedelta(minutes=2) 
    # idle_threshold = timedelta(minutes=10)

    # active_threshold = timedelta(seconds=10) 
    # idle_threshold = timedelta(seconds=20)
    # time_elapsed = now() - user.userprofile.last_activity

    # if time_elapsed <= active_threshold:
    #     return "Active"
    # elif time_elapsed > active_threshold and time_elapsed <= idle_threshold:
    #     return "Idle"
    # elif time_elapsed > idle_threshold:
    #     return "Inactive"

def is_user_logged_out(user):
    if not user.is_authenticated:
        return True
    from django.contrib.sessions.models import Session
    sessions = Session.objects.filter(expire_date__gte=now())
    for session in sessions:
        data = session.get_decoded()
        if user.id == int(data.get('_auth_user_id', 0)):
            return False
    return True 

# from django.utils.timezone import now
# from datetime import timedelta
# from profile_management.models import UserProfile
# from django.contrib.sessions.models import Session

# def is_user_active(user):
#     if is_user_logged_out(user):
#         return "Offline"

#     active_threshold = timedelta(minutes=2) 
#     idle_threshold = timedelta(minutes=10)
#     time_elapsed = now() - user.userprofile.last_activity

#     if time_elapsed <= active_threshold:
#         return "Active"
#     elif time_elapsed > active_threshold and time_elapsed <= idle_threshold:
#         return "Idle"
#     elif time_elapsed > idle_threshold:
#         return "Inactive"

# def is_user_logged_out(user):
#     if not user.is_authenticated:
#         return True

#     sessions = Session.objects.filter(expire_date__gte=now())
#     for session in sessions:
#         data = session.get_decoded()
#         if user.id == int(data.get('_auth_user_id', 0)):
#             return False
#     return True 