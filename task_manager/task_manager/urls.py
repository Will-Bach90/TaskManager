from django.contrib import admin
from django.urls import path, include
from django.contrib.auth import views as auth_views
from tasks import views
from profile_management import views

app_name = 'base_app'

urlpatterns = [
    path('admin/', admin.site.urls),
    path('tasks', include('tasks.urls')),
    path('profile/', include('profile_management.urls')),
    path('accounts/', include('django.contrib.auth.urls')),
    path('login/', auth_views.LoginView.as_view(template_name='registration/login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(next_page='/'), name='logout'), 
]
