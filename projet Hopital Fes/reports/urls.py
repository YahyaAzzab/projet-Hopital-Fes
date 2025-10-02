from django.urls import path
from . import views

urlpatterns = [
    path('', views.ReportListCreateView.as_view(), name='report_list_create'),
    path('<int:pk>/', views.ReportDetailView.as_view(), name='report_detail'),
    path('stats/', views.report_stats_view, name='report_stats'),
    path('search/', views.report_search_view, name='report_search'),
    # URL frontend pour ajouter un rapport
    path('report/add/', views.report_add_view, name='report_add'),
]
