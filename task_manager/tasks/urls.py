from django.urls import path
from django.contrib.auth import views as auth_views
from . import views

urlpatterns = [
    # URL for listing all projects
    path('', views.HomeView.as_view(), name='home'),

    # URL for viewing details of a specific project

    path('projects/', views.ProjectListView.as_view(), name='project_list'),
    path('projects/new/', views.ProjectCreateView.as_view(), name='project_create'),
    path('projects/<int:pk>/', views.ProjectDetailView.as_view(), name='project_detail'),
    path('projects/<int:pk>/edit/', views.ProjectUpdateView.as_view(), name='project_edit'),
    path('projects/<int:pk>/delete/', views.ProjectDeleteView.as_view(), name='project_delete'),

    # URL for viewing details of a specific task
    path('tasks/<int:pk>/', views.TaskDetailView.as_view(), name='task_detail'),

    # URL for creating a new task within a project
    path('projects/<int:pk>/tasks/new/', views.TaskCreateView.as_view(), name='task_create'),

    # URL for editing a task
    path('tasks/<int:pk>/edit/', views.TaskUpdateView.as_view(), name='task_edit'),

    # URL for deleting a task
    path('tasks/<int:pk>/delete/', views.TaskDeleteView.as_view(), name='task_delete'),
]
