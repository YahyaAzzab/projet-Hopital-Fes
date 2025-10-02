from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, UserProfile
from .forms import UserForm


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Administration des utilisateurs avec formulaire personnalisé
    """
    form = UserForm
    
    list_display = ['username', 'email', 'first_name', 'last_name', 'role', 'department', 'is_active']
    list_filter = ['role', 'department', 'is_active', 'is_staff', 'date_joined']
    search_fields = ['username', 'email', 'first_name', 'last_name', 'department']
    ordering = ['-date_joined']
    
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Informations personnelles', {
            'fields': ('first_name', 'last_name', 'email', 'phone')
        }),
        ('Rôle et permissions', {
            'fields': ('role', 'department', 'is_active', 'is_staff', 'is_superuser')
        }),
        ('Dates importantes', {
            'fields': ('last_login', 'date_joined'),
            'classes': ('collapse',)
        }),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'first_name', 'last_name', 
                      'role', 'department', 'password1', 'password2'),
        }),
    )


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    """
    Administration des profils utilisateurs
    """
    list_display = ['user', 'emergency_contact']
    search_fields = ['user__username', 'user__first_name', 'user__last_name']