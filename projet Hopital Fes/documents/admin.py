from django.contrib import admin
from django.utils.html import format_html
from .models import Document, DocumentTag, DocumentTagRelation


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    """
    Administration des documents
    """
    list_display = [
        'title', 'document_type', 'patient_name', 'status', 
        'priority', 'ai_processed', 'get_quality_display', 
        'created_by', 'created_at'
    ]
    
    list_filter = [
        'document_type', 'status', 'priority', 'ai_processed',
        'created_at', 'processed_at'
    ]
    
    search_fields = [
        'title', 'patient_name', 'description', 'ai_extracted_text'
    ]
    
    ordering = ['-created_at']
    
    fieldsets = (
        ('Informations de base', {
            'fields': (
                'title', 'document_type', 'description', 'file',
                'patient', 'patient_name'
            )
        }),
        ('Statut et priorité', {
            'fields': ('status', 'priority', 'document_date')
        }),
        ('Traitement IA', {
            'fields': (
                'ai_processed', 'ai_confidence', 'ai_extracted_text',
                'ai_findings', 'quality_score', 'processing_time'
            ),
            'classes': ('collapse',)
        }),
        ('Métadonnées', {
            'fields': (
                'file_size', 'file_type', 'created_by', 'doctor',
                'created_at', 'updated_at', 'processed_at'
            ),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = [
        'file_size', 'file_type', 'created_at', 'updated_at',
        'processing_time', 'ai_confidence'
    ]
    
    autocomplete_fields = ['patient', 'created_by', 'doctor']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'patient', 'created_by', 'doctor'
        )
    
    def get_quality_display(self, obj):
        if not obj.quality_score:
            return "Non évalué"
        
        if obj.quality_score >= 90:
            color = 'green'
            text = 'Excellent'
        elif obj.quality_score >= 70:
            color = 'blue'
            text = 'Bon'
        elif obj.quality_score >= 50:
            color = 'orange'
            text = 'Moyen'
        else:
            color = 'red'
            text = 'Faible'
        
        return format_html(
            '<span style="color: {};">{} ({}%)</span>',
            color, text, obj.quality_score
        )
    get_quality_display.short_description = 'Qualité'
    
    def get_file_size_display(self, obj):
        return obj.get_file_size_display()
    get_file_size_display.short_description = 'Taille'
    
    def get_ai_confidence_display(self, obj):
        if not obj.ai_confidence:
            return "N/A"
        
        color = 'green' if obj.ai_confidence >= 70 else 'orange' if obj.ai_confidence >= 50 else 'red'
        return format_html(
            '<span style="color: {};">{:.1f}%</span>',
            color, obj.ai_confidence
        )
    get_ai_confidence_display.short_description = 'Confiance IA'


@admin.register(DocumentTag)
class DocumentTagAdmin(admin.ModelAdmin):
    """
    Administration des tags de documents
    """
    list_display = ['name', 'get_color_display', 'get_documents_count', 'created_at']
    
    search_fields = ['name', 'description']
    
    ordering = ['name']
    
    def get_color_display(self, obj):
        return format_html(
            '<span style="background-color: {}; color: white; padding: 2px 8px; border-radius: 3px;">{}</span>',
            obj.color, obj.name
        )
    get_color_display.short_description = 'Couleur'
    
    def get_documents_count(self, obj):
        count = obj.document_relations.count()
        return f"{count} documents"
    get_documents_count.short_description = 'Documents'


@admin.register(DocumentTagRelation)
class DocumentTagRelationAdmin(admin.ModelAdmin):
    """
    Administration des relations document-tag
    """
    list_display = ['document', 'tag', 'created_at']
    
    list_filter = ['tag', 'created_at']
    
    search_fields = ['document__title', 'tag__name']
    
    ordering = ['-created_at']
    
    autocomplete_fields = ['document', 'tag']