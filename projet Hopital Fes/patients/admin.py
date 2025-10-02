from django.contrib import admin
from .models import Patient, PatientDocument
from .forms import PatientForm, PatientDocumentForm


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    """
    Administration des patients avec formulaire personnalisé
    """
    form = PatientForm
    
    list_display = ['patient_id', 'get_full_name', 'ci', 'get_age', 'gender', 'blood_type', 'phone', 'status', 'created_at']
    list_filter = ['gender', 'status', 'blood_type', 'marital_status', 'created_at', 'city']
    search_fields = ['patient_id', 'first_name', 'last_name', 'ci', 'phone', 'email', 'city', 'insurance']
    list_per_page = 25
    ordering = ['-created_at']
    
    fieldsets = (
        ('🔸 Informations personnelles', {
            'fields': ('first_name', 'last_name', 'ci', 'date_of_birth', 'gender', 'occupation', 'marital_status'),
            'description': 'Informations de base du patient'
        }),
        ('📍 Coordonnées', {
            'fields': ('phone', 'email', 'address', 'city', 'emergency_contact'),
            'description': 'Informations de contact et d\'urgence'
        }),
        ('🩺 Informations médicales', {
            'fields': ('blood_type', 'insurance', 'allergies', 'medical_history', 'notes'),
            'description': 'Informations médicales essentielles pour les soins'
        }),
        ('📊 Statut et métadonnées', {
            'fields': ('status', 'created_at', 'updated_at', 'last_visit', 'created_by'),
            'classes': ('collapse',),
            'description': 'Informations de suivi et d\'audit'
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']
    
    def get_full_name(self, obj):
        return obj.get_full_name()
    get_full_name.short_description = 'Nom complet'
    
    def get_age(self, obj):
        return f"{obj.get_age()} ans"
    get_age.short_description = 'Âge'
    
    def save_model(self, request, obj, form, change):
        """Sauvegarder le modèle avec l'utilisateur qui a créé/modifié"""
        if not change:  # Nouveau patient
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(PatientDocument)
class PatientDocumentAdmin(admin.ModelAdmin):
    """
    Administration des documents patients avec formulaire personnalisé
    """
    form = PatientDocumentForm
    
    list_display = ['title', 'patient', 'document_type', 'created_at']
    list_filter = ['document_type', 'created_at']
    search_fields = ['title', 'patient__first_name', 'patient__last_name', 'description']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Informations du document', {
            'fields': ('patient', 'title', 'document_type', 'file', 'description')
        }),
        ('Métadonnées', {
            'fields': ('created_by', 'created_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at']