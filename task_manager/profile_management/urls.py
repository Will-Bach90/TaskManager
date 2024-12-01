from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from . import views

app_name = 'user_profile_app'

urlpatterns = [
    path('', views.UserProfile, name='profile'),
    path('api/update-activity/<int:timediff>', views.update_activity, name='update_activity'),
]

#  + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)