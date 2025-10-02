from django.contrib import admin
from .models import Patient, PatientDocument


@admin.register(Patient)
class PatientAdminSimple(admin.ModelAdmin):
    """
    Administration simple des patients
    """
    list_display = ['patient_id', 'first_name', 'last_name', 'ci', 'gender', 'status']
    list_filter = ['gender', 'status']
    search_fields = ['patient_id', 'first_name', 'last_name', 'ci']
    ordering = ['-created_at']


@admin.register(PatientDocument)
class PatientDocumentAdminSimple(admin.ModelAdmin):
    """
    Administration simple des documents patients
    """
    list_display = ['title', 'patient', 'document_type', 'created_at']
    list_filter = ['document_type', 'created_at']
    search_fields = ['title', 'patient__first_name', 'patient__last_name']
    ordering = ['-created_at']
