from django.urls import path
from . import views

urlpatterns = [
    path('', views.ActivityListCreateView.as_view(), name='activity_list_create'),
    path('<int:pk>/', views.ActivityDetailView.as_view(), name='activity_detail'),
    path('logs/', views.SystemLogListView.as_view(), name='system_log_list'),
    path('stats/', views.activity_stats_view, name='activity_stats'),
    path('recent/', views.recent_activities_view, name='recent_activities'),
]
