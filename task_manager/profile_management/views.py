from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.utils.timezone import now
from .models import UserProfile
from datetime import timedelta
from task_manager.utils import is_user_logged_out
from datetime import datetime

# Create your views here.
@login_required
def UserProfile(request):
    return render(request, 'profile_management/user_profile_page.html')

@login_required
def update_activity(request, timediff):
    if request.user.is_authenticated:
        user_profile = request.user.userprofile
        if not is_user_logged_out(request.user):
            if timediff <= 2000:
                user_profile.current_status = 'Active'
                user_profile.last_activity = now()
            elif timediff <= 10000:
                user_profile.current_status = 'Idle'
            elif timediff <= 20000:
                user_profile.current_status = 'Inactive'
        else:
            user_profile.current_status = 'Offline'
        user_profile.save()
        
        return JsonResponse({'status': 'success', 'current_status': request.user.userprofile.current_status})
    return JsonResponse({'status': 'unauthorized'}, status=401)