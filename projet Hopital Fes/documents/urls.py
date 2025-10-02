from django.urls import path
from . import views

urlpatterns = [
    path('', views.DocumentListCreateView.as_view(), name='document_list_create'),
    path('<int:pk>/', views.DocumentDetailView.as_view(), name='document_detail'),
    path('stats/', views.document_stats_view, name='document_stats'),
    path('search/', views.document_search_view, name='document_search'),
]
