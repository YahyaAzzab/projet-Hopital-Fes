from django.urls import path
from . import views
from . import admin_views

urlpatterns = [
    path('', views.home_view, name='home'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('logout/confirm/', views.logout_confirm, name='logout_confirm'),
    path('logout/clear/', views.clear_session_view, name='clear_session'),
    path('dashboard/', views.dashboard_view, name='dashboard'),
    path('api/dashboard/', views.dashboard_api, name='dashboard_api'),
    path('api/notifications/', views.notifications_api, name='notifications_api'),
    
    # URLs Administrateur
    path('administration/dashboard/', admin_views.admin_dashboard, name='admin_dashboard'),
    path('administration/deleted-items/', admin_views.deleted_items, name='deleted_items'),
    path('administration/restore/<str:deletion_code>/', admin_views.restore_item, name='restore_item'),
    path('administration/permanent-delete/<str:deletion_code>/', admin_views.permanent_delete, name='permanent_delete'),
    path('api/administration/', admin_views.admin_api, name='admin_api'),
    
    # Patients
    path('patients/', views.patients, name='patients'),
    path('patients/<int:patient_id>/', views.view_patient, name='view_patient'),
    path('patients/<int:patient_id>/edit/', views.edit_patient, name='edit_patient'),
    path('patients/<int:patient_id>/delete/', views.delete_patient, name='delete_patient'),
    
    # Documents
    path('documents/', views.documents, name='documents'),
    path('documents/<int:document_id>/', views.view_document, name='view_document'),
    path('documents/<int:document_id>/edit/', views.edit_document, name='edit_document'),
    path('documents/<int:document_id>/delete/', views.delete_document, name='delete_document'),
    
    # Reports
    path('reports/', views.reports, name='reports'),
    
    # Users
    path('users/', views.users, name='users'),
    path('users/<int:user_id>/', views.view_user, name='view_user'),
    path('users/<int:user_id>/edit/', views.edit_user, name='edit_user'),
    path('users/<int:user_id>/delete/', views.delete_user, name='delete_user'),
    
    # Settings & Scanner
    path('settings/', views.settings_view, name='settings'),
    path('scanner/', views.scanner, name='scanner'),
    path('scanner/result/', views.scan_result, name='scan_result'),
    
    # Technicien - Sections spécialisées
    path('system/logs/', views.system_logs_view, name='system_logs'),
    path('system/monitor/', views.system_monitor_view, name='system_monitor'),
    path('system/backup/', views.backup_restore_view, name='backup_restore'),
    path('maintenance/', views.maintenance_view, name='maintenance'),
    
    # Activités pour infirmiers
    path('activities/', views.activities_view, name='activities'),
    
    # Profile
    path('profile/', views.profile, name='profile'),
]
