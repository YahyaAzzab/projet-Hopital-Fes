from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class Report(models.Model):
    """
    Modèle Report pour la gestion des rapports médicaux intelligents
    """
    TYPE_CHOICES = [
        ('consultation', 'Rapport de consultation'),
        ('surgery', 'Rapport chirurgical'),
        ('emergency', 'Rapport d\'urgence'),
        ('discharge', 'Rapport de sortie'),
        ('lab_analysis', 'Analyse de laboratoire'),
        ('radiology', 'Rapport de radiologie'),
        ('pathology', 'Rapport d\'anatomopathologie'),
        ('quality', 'Rapport de qualité'),
        ('statistics', 'Rapport statistique'),
        ('other', 'Autre'),
    ]
    
    STATUS_CHOICES = [
        ('draft', 'Brouillon'),
        ('pending_review', 'En attente de révision'),
        ('approved', 'Approuvé'),
        ('rejected', 'Rejeté'),
        ('published', 'Publié'),
        ('archived', 'Archivé'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Faible'),
        ('normal', 'Normal'),
        ('high', 'Élevé'),
        ('urgent', 'Urgent'),
        ('critical', 'Critique'),
    ]
    
    # Informations de base
    title = models.CharField(
        max_length=200,
        verbose_name='Titre'
    )
    
    report_type = models.CharField(
        max_length=50,
        choices=TYPE_CHOICES,
        verbose_name='Type de rapport'
    )
    
    summary = models.TextField(
        blank=True,
        null=True,
        verbose_name='Résumé'
    )
    
    details = models.TextField(
        blank=True,
        null=True,
        verbose_name='Détails'
    )
    
    # Patient associé
    patient = models.ForeignKey(
        'patients.Patient',
        on_delete=models.CASCADE,
        related_name='reports',
        blank=True,
        null=True,
        verbose_name='Patient'
    )
    
    patient_name = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        verbose_name='Nom du patient'
    )
    
    # Statut et priorité
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft',
        verbose_name='Statut'
    )
    
    priority = models.CharField(
        max_length=20,
        choices=PRIORITY_CHOICES,
        default='normal',
        verbose_name='Priorité'
    )
    
    # Intelligence artificielle
    ai_processed = models.BooleanField(
        default=False,
        verbose_name='Traité par IA'
    )
    
    ai_insights = models.JSONField(
        default=dict,
        blank=True,
        verbose_name='Insights IA'
    )
    
    ai_recommendations = models.TextField(
        blank=True,
        null=True,
        verbose_name='Recommandations IA'
    )
    
    ai_confidence = models.FloatField(
        blank=True,
        null=True,
        verbose_name='Confiance IA (%)'
    )
    
    # Données médicales
    diagnosis = models.TextField(
        blank=True,
        null=True,
        verbose_name='Diagnostic'
    )
    
    treatment = models.TextField(
        blank=True,
        null=True,
        verbose_name='Traitement'
    )
    
    medications = models.JSONField(
        default=list,
        blank=True,
        verbose_name='Médicaments'
    )
    
    vital_signs = models.JSONField(
        default=dict,
        blank=True,
        verbose_name='Signes vitaux'
    )
    
    lab_results = models.JSONField(
        default=dict,
        blank=True,
        verbose_name='Résultats de laboratoire'
    )
    
    # Métadonnées
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_reports',
        verbose_name='Créé par'
    )
    
    doctor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='doctor_reports',
        verbose_name='Médecin'
    )
    
    reviewed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_reports',
        verbose_name='Révisé par'
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Date de création'
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Date de modification'
    )
    
    reviewed_at = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name='Date de révision'
    )
    
    # Date du rapport (peut être différente de la date de création)
    report_date = models.DateTimeField(
        default=timezone.now,
        verbose_name='Date du rapport'
    )
    
    # Fichiers associés
    attachments = models.JSONField(
        default=list,
        blank=True,
        verbose_name='Pièces jointes'
    )
    
    class Meta:
        verbose_name = 'Rapport'
        verbose_name_plural = 'Rapports'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['report_type']),
            models.Index(fields=['status']),
            models.Index(fields=['priority']),
            models.Index(fields=['ai_processed']),
            models.Index(fields=['created_at']),
            models.Index(fields=['report_date']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.get_report_type_display()}"
    
    def get_status_display_color(self):
        """Obtenir la couleur d'affichage du statut"""
        colors = {
            'draft': 'secondary',
            'pending_review': 'warning',
            'approved': 'success',
            'rejected': 'danger',
            'published': 'primary',
            'archived': 'dark',
        }
        return colors.get(self.status, 'secondary')
    
    def get_priority_display_color(self):
        """Obtenir la couleur d'affichage de la priorité"""
        colors = {
            'low': 'success',
            'normal': 'primary',
            'high': 'warning',
            'urgent': 'danger',
            'critical': 'dark',
        }
        return colors.get(self.priority, 'primary')
    
    def is_urgent(self):
        """Vérifier si le rapport est urgent"""
        return self.priority in ['urgent', 'critical']
    
    def get_ai_confidence_display(self):
        """Obtenir l'affichage de la confiance IA"""
        if not self.ai_confidence:
            return "Non évalué"
        
        if self.ai_confidence >= 90:
            return "Très élevée"
        elif self.ai_confidence >= 70:
            return "Élevée"
        elif self.ai_confidence >= 50:
            return "Moyenne"
        else:
            return "Faible"
    
    def get_attachments_count(self):
        """Obtenir le nombre de pièces jointes"""
        return len(self.attachments) if self.attachments else 0


class ReportTemplate(models.Model):
    """
    Modèles de rapports prédéfinis
    """
    name = models.CharField(
        max_length=100,
        verbose_name='Nom du modèle'
    )
    
    report_type = models.CharField(
        max_length=50,
        choices=Report.TYPE_CHOICES,
        verbose_name='Type de rapport'
    )
    
    template_content = models.JSONField(
        verbose_name='Contenu du modèle'
    )
    
    is_active = models.BooleanField(
        default=True,
        verbose_name='Actif'
    )
    
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        verbose_name='Créé par'
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Date de création'
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Date de modification'
    )
    
    class Meta:
        verbose_name = 'Modèle de rapport'
        verbose_name_plural = 'Modèles de rapports'
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.get_report_type_display()})"


class ReportComment(models.Model):
    """
    Commentaires sur les rapports
    """
    report = models.ForeignKey(
        Report,
        on_delete=models.CASCADE,
        related_name='comments',
        verbose_name='Rapport'
    )
    
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        verbose_name='Auteur'
    )
    
    content = models.TextField(
        verbose_name='Contenu'
    )
    
    is_internal = models.BooleanField(
        default=True,
        verbose_name='Commentaire interne'
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Date de création'
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Date de modification'
    )
    
    class Meta:
        verbose_name = 'Commentaire de rapport'
        verbose_name_plural = 'Commentaires de rapports'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Commentaire de {self.author.get_full_name()} sur {self.report.title}"