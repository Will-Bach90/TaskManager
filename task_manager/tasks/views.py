from django import forms
from django.urls import reverse, reverse_lazy
from django.shortcuts import render, get_object_or_404
from django.views.generic import (CreateView, DeleteView, DetailView, ListView,
                                  RedirectView, UpdateView)

from .models import Project, Task, Message, ChatRoom
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required

class HomeView(RedirectView):
    url = reverse_lazy('tasks_app:project_list')

class ProjectListView(ListView):
    model = Project
    template_name = 'tasks/project_list.html'

class ProjectDetailView(DetailView):
    model = Project
    template_name = 'tasks/project_detail.html'

class ProjectCreateView(CreateView):
    model = Project
    fields = ['name', 'description']
    template_name = 'tasks/project_form.html'
    success_url = '/'

class ProjectUpdateView(UpdateView):
    model = Project
    fields = ['name', 'description']
    template_name = 'tasks/project_form.html'
    def get_success_url(self):
        return reverse('project_detail', kwargs={'pk': self.object.id})

class ProjectDeleteView(DeleteView):
    model = Project
    template_name = 'tasks/project_confirm_delete.html'
    success_url = '/'

class TaskDetailView(DetailView):
    model = Task
    template_name = 'tasks/task_detail.html'
#====================================================

class TaskForm(forms.ModelForm):
    class Meta:
        model = Task
        fields = ['title', 'description', 'project', 'assigned_to', 'due_date', 'is_completed']
        widgets = {
            'due_date': forms.DateTimeInput(attrs={'type': 'text', 'class': 'form-control datetimepicker'}, format='%Y-%m-%d %H:%M')
        }

class TaskCreateView(CreateView):
    model = Task
    form_class = TaskForm
    template_name = 'tasks/task_form.html'
    def get_success_url(self):
        return reverse('tasks_app:project_detail', kwargs={'pk': self.object.project.id})

class TaskUpdateView(UpdateView):
    model = Task
    fields = ['title', 'description', 'project', 'assigned_to', 'due_date', 'is_completed']
    template_name = 'tasks/task_form.html'
    def get_success_url(self):
        return reverse('tasks_app:project_detail', kwargs={'pk': self.object.project.id})

class TaskDeleteView(DeleteView):
    model = Task
    fields = ['title', 'project']
    template_name = 'tasks/task_confirm_delete.html'
    def get_success_url(self):
        return reverse('tasks_app:project_detail', kwargs={'pk': self.object.project.id})


##################################################################################################################

##################################################################################################################

# def chat(request, room_name):
#     return render(request, 'tasks/chat_page.html', {
#         'room_name_json': json.dumps(room_name)
#     })
def chat(request, room_name):
    room = get_object_or_404(ChatRoom, name=room_name) 
    messages = Message.objects.filter(room=room).order_by("timestamp")  

    return render(request, 'tasks/chat_page.html', {
        'room_name_json': json.dumps(room_name),  
        'messages': messages,  
        'current_user': request.user,
        'current_user_id': request.user.id,
    })

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