from django import forms
from django.urls import reverse, reverse_lazy
from django.contrib.auth.models import User
from django.shortcuts import render, get_object_or_404
from django.views.generic import (CreateView, DeleteView, DetailView, ListView,
                                  RedirectView, UpdateView)

from .models import Message, ChatRoom
from profile_management.models import UserProfile
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.template.response import TemplateResponse
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.messages.views import SuccessMessageMixin
from django.http import HttpResponseForbidden
from django.utils.timezone import now
from datetime import timedelta
from task_manager.utils import is_user_logged_out

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
#     from django.contrib.sessions.models import Session
#     sessions = Session.objects.filter(expire_date__gte=now())
#     for session in sessions:
#         data = session.get_decoded()
#         if user.id == int(data.get('_auth_user_id', 0)):
#             return False
#     return True 

class ChatroomListView(ListView):
    model = ChatRoom
    template_name = 'chatapp/chat_home.html'

    def get_queryset(self):
        return ChatRoom.objects.filter(participants=self.request.user)

class ChatroomCreateView(LoginRequiredMixin, CreateView):
    model = ChatRoom
    fields = ['name', 'description', 'participants']
    template_name = 'chatapp/chat_form.html'
    success_url = reverse_lazy('chatapp:chat_list')

    def get_form(self, *args, **kwargs):
        form = super().get_form(*args, **kwargs)

        try:
            friends_queryset = self.request.user.userprofile.friends.all()
            form.fields['participants'].queryset = User.objects.filter(
                id__in=friends_queryset.values_list('user_id', flat=True)
            )
        except UserProfile.DoesNotExist:
            form.fields['participants'].queryset = User.objects.none()

        form.fields['participants'].label = "Participants"
        form.fields['participants'].help_text = "Choose friends to add to this chat."
        form.fields['participants'].widget.attrs.update({
            'class': 'form-control select-multiple',
            'placeholder': 'Select participants...',
        })

        return form

    def form_valid(self, form):
        # print(form.cleaned_data)

        form.instance.admin = self.request.user

        response = super().form_valid(form)

        selected_participants = form.cleaned_data.get('participants', [])
        # print("Selected Participants:", selected_participants)
        self.object.participants.set(selected_participants)
        self.object.participants.add(self.request.user)

        return response

class ChatRoomDeleteView(DeleteView):
    model = ChatRoom
    template_name = 'chatapp/chatroom_confirm_delete.html'
    success_url = reverse_lazy('chatapp:chat_list')  # Redirect to chat list after deletion

    def dispatch(self, request, *args, **kwargs):
        # Restrict access to the admin of the chatroom
        room = self.get_object()
        if request.user != room.admin:
            return HttpResponseForbidden("You do not have permission to delete this chatroom.")
        return super().dispatch(request, *args, **kwargs)


# class ChatroomCreateView(CreateView):
#     model = ChatRoom
#     fields = ['name', 'description']
#     template_name = 'chatapp/chat_form.html'
#     success_url = '/rooms'


# def chat(request, room_name):
#     room = get_object_or_404(ChatRoom, name=room_name) 
#     messages = list(Message.objects.filter(room=room).order_by("timestamp"))  

#     response = TemplateResponse(request, 'chatapp/chat_page.html', {
#         'room_name_json': json.dumps(room_name),
#         'messages': messages,
#         'current_user': request.user,
#         'current_user_id': request.user.id,
#     })
#     response.render()
#     return response

def chat(request, room_name):
    room = get_object_or_404(ChatRoom, name=room_name)

    # Restrict access to participants only
    if request.user not in room.participants.all():
        return HttpResponseForbidden("You do not have access to this chatroom.")

    messages = list(Message.objects.filter(room=room).order_by("timestamp"))

    chatrooms = ChatRoom.objects.filter(participants=request.user).order_by("name")

    participants = room.participants.all()

    friends = request.user.userprofile.friends.all()
    friends_list = []
    for fr in friends:
        print(fr.user)
        friends_list.append(fr.user)
    print(friends_list)

    active_users = {}
    for user in participants:
        active_users[user.id] = user.userprofile.current_status

    response = TemplateResponse(request, 'chatapp/chat_page.html', {
        'room_name_json': json.dumps(room_name),
        'messages': messages,
        'chatrooms': chatrooms,
        'room_name_json': json.dumps(room_name),
        'current_user': request.user,
        'current_user_id': request.user.id,
        'friends': friends_list,
        'participants': participants,
        'active_users': active_users,
    })
    response.render()
    return response

@csrf_exempt
def delete_message(request, message_id):
    # if request.user not in room.participants.all():
    #     return HttpResponseForbidden("You do not have access to this chatroom.")
    if request.method == 'DELETE':
        try:
            message = Message.objects.get(id=message_id, author=request.user)
            message.delete()
            return JsonResponse({'status': 'success'})
        except Message.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Message not found'}, status=404)
    return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)

@csrf_exempt
def edit_message(request, message_id):
    if request.method == 'PUT':
        try:
            data = json.loads(request.body)
            message = Message.objects.get(id=message_id, author=request.user)
            sent_content = data.get('content', message.content)
            message.edit_message(new_content=sent_content)
            return JsonResponse({'status': 'success', 'edit_time': message.editTimestamp})
        except Message.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Message not found'}, status=404)
    return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)