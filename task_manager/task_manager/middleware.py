from django.conf import settings
from django.shortcuts import redirect
from django.urls import reverse

class LoginRequiredMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if not request.user.is_authenticated:
            # List of URLs that do not require authentication
            if not request.path in [reverse('login')]: # , reverse('signup')]:
                return redirect(settings.LOGIN_URL)
        response = self.get_response(request)
        return response