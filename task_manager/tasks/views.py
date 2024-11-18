from django import forms
from django.urls import reverse, reverse_lazy
from django.shortcuts import render
from django.views.generic import (CreateView, DeleteView, DetailView, ListView,
                                  RedirectView, UpdateView)

from .models import Project, Task
import json


class HomeView(RedirectView):
    url = reverse_lazy('project_list')

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
        return reverse('project_detail', kwargs={'pk': self.object.project.id})

class TaskUpdateView(UpdateView):
    model = Task
    fields = ['title', 'description', 'project', 'assigned_to', 'due_date', 'is_completed']
    template_name = 'tasks/task_form.html'
    def get_success_url(self):
        return reverse('project_detail', kwargs={'pk': self.object.project.id})

class TaskDeleteView(DeleteView):
    model = Task
    fields = ['title', 'project']
    template_name = 'tasks/task_confirm_delete.html'
    def get_success_url(self):
        return reverse('project_detail', kwargs={'pk': self.object.project.id})


##################################################################################################################
##################################################################################################################
##################################################################################################################
##################################################################################################################

def chat(request, room_name):
    return render(request, 'tasks/chat_page.html', {
        'room_name_json': json.dumps(room_name)
    })
