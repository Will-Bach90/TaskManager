# from django.conf import settings
# from django.shortcuts import redirect
# from django.urls import reverse

# class LoginRequiredMiddleware:
#     def __init__(self, get_response):
#         self.get_response = get_response

#     def __call__(self, request):
#         if not request.user.is_authenticated:
#             # List of URLs that do not require authentication
#             if not request.path in [reverse('login')]: # , reverse('signup')]:
#                 return redirect(settings.LOGIN_URL)
#         response = self.get_response(request)
#         return response

from django.conf import settings
from django.shortcuts import redirect
from django.urls import reverse
from asgiref.sync import sync_to_async

class LoginRequiredMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if not request.user.is_authenticated:
            if request.path not in [reverse('login')]: 
                return redirect(settings.LOGIN_URL)

        response = self.get_response(request)
        return response
