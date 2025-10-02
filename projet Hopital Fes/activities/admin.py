from django.contrib import admin
from django.utils.html import format_html
from .models import Activity, SystemLog


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    """
    Administration des activités
    """
    list_display = [
        'user', 'action', 'get_action_display_color', 'severity',
        'ip_address', 'created_at'
    ]
    
    list_filter = [
        'action', 'severity', 'created_at'
    ]
    
    search_fields = [
        'user__username', 'user__first_name', 'user__last_name',
        'description', 'ip_address'
    ]
    
    ordering = ['-created_at']
    
    fieldsets = (
        ('Informations de base', {
            'fields': ('user', 'action', 'description', 'severity')
        }),
        ('Objet concerné', {
            'fields': ('content_type', 'object_id', 'content_object'),
            'classes': ('collapse',)
        }),
        ('Détails supplémentaires', {
            'fields': ('details',),
            'classes': ('collapse',)
        }),
        ('Métadonnées', {
            'fields': (
                'ip_address', 'user_agent', 'session_key', 'created_at'
            ),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at']
    
    autocomplete_fields = ['user']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'content_type')
    
    def get_action_display_color(self, obj):
        colors = {
            'login': 'success',
            'logout': 'secondary',
            'patient_created': 'success',
            'patient_updated': 'primary',
            'patient_deleted': 'danger',
            'document_uploaded': 'success',
            'document_processed': 'info',
            'report_created': 'success',
            'report_approved': 'success',
            'report_rejected': 'danger',
            'error_occurred': 'danger',
            'security_alert': 'warning',
        }
        color = colors.get(obj.action, 'primary')
        return format_html(
            '<span class="badge bg-{}">{}</span>',
            color, obj.get_action_display()
        )
    get_action_display_color.short_description = 'Action'
    
    def get_severity_display(self, obj):
        colors = {
            'info': 'primary',
            'warning': 'warning',
            'error': 'danger',
            'critical': 'dark',
        }
        color = colors.get(obj.severity, 'primary')
        return format_html(
            '<span class="badge bg-{}">{}</span>',
            color, obj.get_severity_display()
        )
    get_severity_display.short_description = 'Sévérité'


@admin.register(SystemLog)
class SystemLogAdmin(admin.ModelAdmin):
    """
    Administration des logs système
    """
    list_display = [
        'level', 'get_level_display_color', 'message_short',
        'module', 'function', 'user', 'created_at'
    ]
    
    list_filter = [
        'level', 'module', 'created_at'
    ]
    
    search_fields = [
        'message', 'module', 'function', 'user__username',
        'user__first_name', 'user__last_name', 'ip_address'
    ]
    
    ordering = ['-created_at']
    
    fieldsets = (
        ('Informations de base', {
            'fields': ('level', 'message', 'module', 'function', 'line_number')
        }),
        ('Traceback', {
            'fields': ('traceback',),
            'classes': ('collapse',)
        }),
        ('Contexte', {
            'fields': ('user', 'ip_address', 'created_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at']
    
    autocomplete_fields = ['user']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')
    
    def get_level_display_color(self, obj):
        colors = {
            'DEBUG': 'secondary',
            'INFO': 'primary',
            'WARNING': 'warning',
            'ERROR': 'danger',
            'CRITICAL': 'dark',
        }
        color = colors.get(obj.level, 'primary')
        return format_html(
            '<span class="badge bg-{}">{}</span>',
            color, obj.level
        )
    get_level_display_color.short_description = 'Niveau'
    
    def message_short(self, obj):
        return obj.message[:100] + '...' if len(obj.message) > 100 else obj.message
    message_short.short_description = 'Message'