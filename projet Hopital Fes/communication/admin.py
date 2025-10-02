from django.contrib import admin
from .models import Message, MessageThread, Notification


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['title', 'sender', 'recipient', 'priority', 'category', 'status', 'created_at']
    list_filter = ['priority', 'category', 'status', 'created_at']
    search_fields = ['title', 'content', 'sender__first_name', 'sender__last_name', 'recipient__first_name', 'recipient__last_name']
    readonly_fields = ['created_at', 'read_at']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Informations générales', {
            'fields': ('title', 'content', 'sender', 'recipient')
        }),
        ('Classification', {
            'fields': ('priority', 'category', 'status')
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'read_at', 'attachment')
        }),
    )


@admin.register(MessageThread)
class MessageThreadAdmin(admin.ModelAdmin):
    list_display = ['title', 'created_by', 'participants_count', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['title', 'created_by__first_name', 'created_by__last_name']
    readonly_fields = ['created_at', 'updated_at']
    filter_horizontal = ['participants']
    
    def participants_count(self, obj):
        return obj.participants.count()
    participants_count.short_description = 'Nombre de participants'


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'notification_type', 'is_read', 'created_at']
    list_filter = ['notification_type', 'is_read', 'created_at']
    search_fields = ['title', 'message', 'user__first_name', 'user__last_name']
    readonly_fields = ['created_at']
    ordering = ['-created_at']
