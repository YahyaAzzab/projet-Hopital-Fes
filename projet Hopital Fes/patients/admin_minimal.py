from django.contrib import admin
from .models import Patient, PatientDocument


@admin.register(Patient)
class PatientAdminMinimal(admin.ModelAdmin):
    """
    Administration minimale des patients
    """
    pass


@admin.register(PatientDocument)
class PatientDocumentAdminMinimal(admin.ModelAdmin):
    """
    Administration minimale des documents patients
    """
    pass
