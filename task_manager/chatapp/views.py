from django import forms
from django.urls import reverse, reverse_lazy
from django.shortcuts import render, get_object_or_404
from django.views.generic import (CreateView, DeleteView, DetailView, ListView,
                                  RedirectView, UpdateView)

from .models import Message, ChatRoom
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.template.response import TemplateResponse

class ChatroomListView(ListView):
    model = ChatRoom
    template_name = 'chatapp/chat_home.html'

class ChatroomCreateView(CreateView):
    model = ChatRoom
    fields = ['name', 'description']
    template_name = 'chatapp/chat_form.html'
    success_url = '/rooms'

def chat(request, room_name):
    room = get_object_or_404(ChatRoom, name=room_name) 
    messages = list(Message.objects.filter(room=room).order_by("timestamp"))  

    response = TemplateResponse(request, 'chatapp/chat_page.html', {
        'room_name_json': json.dumps(room_name),
        'messages': messages,
        'current_user': request.user,
        'current_user_id': request.user.id,
    })
    response.render()  # Ensure the template is fully rendered synchronously
    return response

@csrf_exempt
def delete_message(request, message_id):
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
            message.content = data.get('content', message.content)
            message.save()
            return JsonResponse({'status': 'success'})
        except Message.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Message not found'}, status=404)
    return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)