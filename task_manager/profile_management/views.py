from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.utils.timezone import now
from .models import UserProfile
from datetime import timedelta
from task_manager.utils import is_user_logged_out

# Create your views here.
@login_required
def UserProfile(request):
    return render(request, 'profile_management/user_profile_page.html')

@login_required
def update_activity(request, timediff):
    if request.user.is_authenticated:
        user_profile = request.user.userprofile
        if not is_user_logged_out(request.user):
            if timediff==2:
                user_profile.last_activity = now()
                user_profile.current_status = 'Active'
            elif timediff==10:
                user_profile.current_status = 'Idle'
            elif timediff==20:
                user_profile.current_status = 'Inactive'
        else:
            user_profile.current_status = 'Offline'
        user_profile.save()
        
        return JsonResponse({'status': 'success', 'current_status': request.user.userprofile.current_status})
    return JsonResponse({'status': 'unauthorized'}, status=401)