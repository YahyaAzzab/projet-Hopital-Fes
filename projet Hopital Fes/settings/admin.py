from django.contrib import admin
from .models import SystemSettings, SettingsLog

@admin.register(SystemSettings)
class SystemSettingsAdmin(admin.ModelAdmin):
    list_display = [
        'hospital_name', 
        'maintenance_mode', 
        'default_language', 
        'theme',
        'updated_at',
        'updated_by'
    ]
    list_filter = ['maintenance_mode', 'default_language', 'theme']
    search_fields = ['hospital_name', 'hospital_email']
    
    fieldsets = (
        ('Informations générales', {
            'fields': (
                'hospital_name', 
                'hospital_address', 
                'hospital_phone', 
                'hospital_email'
            )
        }),
        ('Configuration de l\'application', {
            'fields': (
                'maintenance_mode',
                'max_file_size',
                'allowed_file_types',
            )
        }),
        ('Sécurité', {
            'fields': (
                'session_timeout',
                'max_login_attempts',
                'password_min_length',
            )
        }),
        ('Notifications', {
            'fields': (
                'email_notifications',
                'sms_notifications',
                'notification_sound',
            )
        }),
        ('Interface', {
            'fields': (
                'default_language',
                'theme',
            )
        }),
        ('Base de données', {
            'fields': (
                'backup_frequency',
                'backup_retention_days',
            )
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']
    
    def has_add_permission(self, request):
        # Ne permettre qu'une seule instance
        return not SystemSettings.objects.exists()
    
    def has_delete_permission(self, request, obj=None):
        # Empêcher la suppression
        return False

@admin.register(SettingsLog)
class SettingsLogAdmin(admin.ModelAdmin):
    list_display = [
        'timestamp', 
        'user', 
        'action', 
        'severity', 
        'message_short',
        'ip_address'
    ]
    list_filter = [
        'severity', 
        'action', 
        'timestamp',
        'user'
    ]
    search_fields = [
        'message', 
        'user__username', 
        'user__first_name', 
        'user__last_name',
        'ip_address'
    ]
    readonly_fields = [
        'timestamp', 
        'user', 
        'action', 
        'severity', 
        'message', 
        'details',
        'ip_address',
        'user_agent'
    ]
    
    def message_short(self, obj):
        return obj.message[:50] + "..." if len(obj.message) > 50 else obj.message
    message_short.short_description = "Message"
    
    def has_add_permission(self, request):
        # Empêcher l'ajout manuel de logs
        return False
    
    def has_change_permission(self, request, obj=None):
        # Empêcher la modification des logs
        return False
    
    def has_delete_permission(self, request, obj=None):
        # Seuls les superusers peuvent supprimer les logs
        return request.user.is_superuser