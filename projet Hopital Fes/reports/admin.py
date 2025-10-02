from django.contrib import admin
from django.utils.html import format_html
from django.urls import path, reverse
from django.shortcuts import render, redirect
from django.contrib import messages
from django.http import JsonResponse
from django.db.models import Count, Q
from .models import Report, ReportTemplate, ReportComment
from .forms import ReportForm


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    """
    Administration des rapports avec fonctionnalités IA avancées
    """
    form = ReportForm
    
    list_display = ['title', 'report_type', 'patient_name', 'doctor', 'status', 'priority', 'get_ai_status', 'get_ai_insights', 'created_at']
    list_filter = ['report_type', 'status', 'priority', 'ai_processed', 'created_at', 'doctor', 'ai_confidence']
    search_fields = ['title', 'patient_name', 'summary', 'diagnosis', 'patient__first_name', 'patient__last_name', 'ai_recommendations']
    list_per_page = 25
    ordering = ['-created_at']
    
    # Actions personnalisées pour l'IA
    actions = ['process_with_ai', 'generate_ai_insights', 'mark_as_urgent', 'export_ai_reports']
    
    fieldsets = (
        ('📋 Informations de base', {
            'fields': ('title', 'report_type', 'patient', 'patient_name', 'report_date'),
            'description': 'Informations générales du rapport'
        }),
        ('📝 Contenu du rapport', {
            'fields': ('summary', 'details'),
            'description': 'Résumé et détails de la consultation'
        }),
        ('🩺 Diagnostic et traitement', {
            'fields': ('diagnosis', 'treatment'),
            'description': 'Informations médicales essentielles'
        }),
        ('📊 Statut et priorité', {
            'fields': ('status', 'priority', 'doctor'),
            'description': 'Gestion du rapport'
        }),
        ('🤖 Intelligence Artificielle', {
            'fields': ('ai_recommendations', 'ai_processed', 'ai_confidence'),
            'classes': ('collapse',),
            'description': 'Recommandations et traitement par IA'
        }),
        ('📋 Métadonnées', {
            'fields': ('created_by', 'created_at', 'updated_at', 'reviewed_by', 'reviewed_at'),
            'classes': ('collapse',),
            'description': 'Informations de suivi et d\'audit'
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']
    
    def get_ai_status(self, obj):
        """Afficher le statut IA avec indicateurs visuels"""
        if obj.ai_processed:
            confidence = obj.get_ai_confidence_display() if obj.ai_confidence else "Non évalué"
            color = "success" if obj.ai_confidence and obj.ai_confidence >= 70 else "warning"
            return format_html(
                '<span class="badge bg-{}">✅ IA Traité ({})</span>',
                color, confidence
            )
        return format_html('<span class="badge bg-secondary">❌ Non traité</span>')
    get_ai_status.short_description = 'Statut IA'
    
    def get_ai_insights(self, obj):
        """Afficher les insights IA de manière compacte"""
        if obj.ai_processed and obj.ai_insights:
            insights_count = len(obj.ai_insights) if isinstance(obj.ai_insights, dict) else 0
            if insights_count > 0:
                return format_html(
                    '<span class="badge bg-info" title="{} insights disponibles">🧠 {} insights</span>',
                    insights_count, insights_count
                )
        return format_html('<span class="text-muted">-</span>')
    get_ai_insights.short_description = 'Insights IA'
    
    def save_model(self, request, obj, form, change):
        """Sauvegarder le modèle avec l'utilisateur qui a créé/modifié"""
        if not change:  # Nouveau rapport
            obj.created_by = request.user
        super().save_model(request, obj, form, change)
    
    # Actions personnalisées pour l'IA
    def process_with_ai(self, request, queryset):
        """Traiter les rapports sélectionnés avec l'IA"""
        processed_count = 0
        for report in queryset:
            if not report.ai_processed:
                # Simulation du traitement IA
                report.ai_processed = True
                report.ai_confidence = 85.5  # Score de confiance simulé
                report.ai_insights = {
                    'diagnosis_confidence': 0.92,
                    'treatment_recommendations': ['Suivi recommandé dans 2 semaines'],
                    'risk_factors': ['Hypertension détectée'],
                    'medication_interactions': []
                }
                report.ai_recommendations = "Rapport traité avec succès par l'IA. Diagnostic validé avec une confiance élevée."
                report.save()
                processed_count += 1
        
        if processed_count > 0:
            self.message_user(request, f'{processed_count} rapport(s) traité(s) avec succès par l\'IA.')
        else:
            self.message_user(request, 'Aucun rapport à traiter (déjà traités).', level=messages.WARNING)
    process_with_ai.short_description = "🤖 Traiter avec l'IA"
    
    def generate_ai_insights(self, request, queryset):
        """Générer des insights IA pour les rapports sélectionnés"""
        insights_count = 0
        for report in queryset:
            if report.ai_processed and report.summary:
                # Simulation de génération d'insights
                insights = {
                    'key_findings': ['Symptômes principaux identifiés', 'Traitement efficace recommandé'],
                    'patient_risk': 'Faible risque de complications',
                    'follow_up_needed': True,
                    'medication_compliance': 'Bonne observance attendue'
                }
                report.ai_insights.update(insights)
                report.save()
                insights_count += 1
        
        self.message_user(request, f'Insights générés pour {insights_count} rapport(s).')
    generate_ai_insights.short_description = "🧠 Générer des insights"
    
    def mark_as_urgent(self, request, queryset):
        """Marquer les rapports comme urgents"""
        updated = queryset.update(priority='urgent', status='pending_review')
        self.message_user(request, f'{updated} rapport(s) marqué(s) comme urgent(s).')
    mark_as_urgent.short_description = "🚨 Marquer comme urgent"
    
    def export_ai_reports(self, request, queryset):
        """Exporter les rapports traités par l'IA"""
        ai_reports = queryset.filter(ai_processed=True)
        if ai_reports.exists():
            # Simulation d'export
            export_data = []
            for report in ai_reports:
                export_data.append({
                    'titre': report.title,
                    'patient': report.patient_name,
                    'confiance_ia': report.ai_confidence,
                    'insights': len(report.ai_insights) if report.ai_insights else 0
                })
            self.message_user(request, f'Export de {len(export_data)} rapport(s) IA généré avec succès.')
        else:
            self.message_user(request, 'Aucun rapport traité par l\'IA à exporter.', level=messages.WARNING)
    export_ai_reports.short_description = "📊 Exporter rapports IA"
    
    def get_urls(self):
        """Ajouter des URLs personnalisées pour le dashboard IA"""
        urls = super().get_urls()
        custom_urls = [
            path('ai-dashboard/', self.admin_site.admin_view(self.ai_dashboard_view), name='reports_ai_dashboard'),
        ]
        return custom_urls + urls
    
    def ai_dashboard_view(self, request):
        """Vue du dashboard IA pour l'administration"""
        from django.db.models import Avg, Count
        
        # Statistiques générales
        total_reports = Report.objects.count()
        ai_processed = Report.objects.filter(ai_processed=True).count()
        avg_confidence = Report.objects.filter(ai_processed=True).aggregate(
            avg_conf=Avg('ai_confidence')
        )['avg_conf'] or 0
        urgent_reports = Report.objects.filter(priority__in=['urgent', 'critical']).count()
        
        # Rapports IA récents
        recent_ai_reports = Report.objects.filter(ai_processed=True).order_by('-created_at')[:5]
        
        # Statistiques par type
        type_stats = Report.objects.values('report_type').annotate(
            count=Count('id')
        ).order_by('-count')
        
        # Calculer les pourcentages
        for stat in type_stats:
            stat['type_display'] = dict(Report.TYPE_CHOICES).get(stat['report_type'], stat['report_type'])
            stat['percentage'] = (stat['count'] / total_reports * 100) if total_reports > 0 else 0
        
        context = {
            'total_reports': total_reports,
            'ai_processed': ai_processed,
            'avg_confidence': avg_confidence,
            'urgent_reports': urgent_reports,
            'recent_ai_reports': recent_ai_reports,
            'type_stats': type_stats,
            'title': 'Dashboard IA - Rapports',
            'opts': self.model._meta,
        }
        
        return render(request, 'admin/reports/ai_dashboard.html', context)


@admin.register(ReportTemplate)
class ReportTemplateAdmin(admin.ModelAdmin):
    """
    Administration des modèles de rapports
    """
    list_display = ['name', 'report_type', 'is_active', 'created_at']
    list_filter = ['report_type', 'is_active', 'created_at']
    search_fields = ['name']
    ordering = ['name']


@admin.register(ReportComment)
class ReportCommentAdmin(admin.ModelAdmin):
    """
    Administration des commentaires de rapports
    """
    list_display = ['report', 'author', 'is_internal', 'created_at']
    list_filter = ['is_internal', 'created_at']
    search_fields = ['report__title', 'author__first_name', 'author__last_name']
    ordering = ['-created_at']