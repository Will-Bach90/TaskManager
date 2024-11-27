from django.shortcuts import render
from django.contrib.auth.decorators import login_required

# Create your views here.
@login_required
def UserProfile(request):
    return render(request, 'profile_management/user_profile_page.html')