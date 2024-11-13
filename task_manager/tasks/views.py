from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from .models import Project, Task
from django import forms
from django.views.generic import RedirectView
from django.urls import reverse_lazy

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
    success_url = '/'

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
    success_url = '/'  # Redirect URL after successful creation

class TaskUpdateView(UpdateView):
    model = Task
    fields = ['title', 'description', 'project', 'assigned_to', 'due_date', 'is_completed']
    template_name = 'tasks/task_form.html'
    success_url = '/'

class TaskDeleteView(DeleteView):
    model = Task
    template_name = 'tasks/task_confirm_delete.html'
    success_url = '/'

