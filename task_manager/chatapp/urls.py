from django.urls import path
from django.conf import settings
from django.contrib.auth import views as auth_views
from . import views

app_name = 'chatapp'

urlpatterns = [
    path('', views.ChatroomListView.as_view(), name='chat_list'),
    path('chat/new/', views.ChatroomCreateView.as_view(), name='chat_create'),
    path('<str:room_name>/', views.chat, name='chat'),
    path('chat/delete/<int:pk>/', views.ChatRoomDeleteView.as_view(), name='chat_delete'),


    path('message/<int:message_id>/delete/', views.delete_message, name='delete_message'),
    path('message/<int:message_id>/edit/', views.edit_message, name='edit_message'),
]