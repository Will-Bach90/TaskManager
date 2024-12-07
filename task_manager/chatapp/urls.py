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
    path('chat/add-users/', views.add_users, name='add_users'), #'/rooms/chat/add-users/'
    path('api/<int:chat_id>/<int:user_id>/remove/', views.remove_user, name='remove_users'),
    path('api/<int:chat_id>/<int:user_id>/leave/', views.leave_room, name='leave_room'),

    path('message/<int:message_id>/delete/', views.delete_message, name='delete_message'),
    path('message/<int:message_id>/edit/', views.edit_message, name='edit_message'),
]