from django.urls import path
from . import views

urlpatterns = [
    # Removed login/logout - handled by medical app
    path('current-user/', views.current_user_view, name='current_user'),
    path('permissions/', views.user_permissions_view, name='user_permissions'),
    path('', views.UserListCreateView.as_view(), name='user_list_create'),
    path('<int:pk>/', views.UserDetailView.as_view(), name='user_detail'),
    # URL frontend pour ajouter un utilisateur
    path('user/add/', views.user_add_view, name='user_add'),
    # URLs pour les actions des utilisateurs
    path('user/<int:pk>/', views.user_detail_view, name='view_user'),
    path('user/<int:pk>/edit/', views.user_edit_view, name='edit_user'),
    path('user/<int:pk>/delete/', views.user_delete_view, name='delete_user'),
]
