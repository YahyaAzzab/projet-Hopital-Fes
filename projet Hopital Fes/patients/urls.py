from django.urls import path
from . import views

urlpatterns = [
    path('', views.PatientListCreateView.as_view(), name='patient_list_create'),
    path('<int:pk>/', views.PatientDetailView.as_view(), name='patient_detail'),
    path('stats/', views.patient_stats_view, name='patient_stats'),
    path('search/', views.patient_search_view, name='patient_search'),
]
