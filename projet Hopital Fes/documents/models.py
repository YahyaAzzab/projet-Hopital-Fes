from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class Document(models.Model):
    """
    Modèle Document pour la gestion des documents médicaux numérisés
    """
    TYPE_CHOICES = [
        ('prescription', 'Ordonnance'),
        ('lab_result', 'Résultat de laboratoire'),
        ('radiology', 'Radiologie'),
        ('consultation', 'Consultation'),
        ('surgery', 'Chirurgie'),
        ('emergency', 'Urgence'),
        ('discharge', 'Sortie d\'hôpital'),
        ('certificate', 'Certificat médical'),
        ('other', 'Autre'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('processing', 'En cours de traitement'),
        ('completed', 'Terminé'),
        ('error', 'Erreur'),
        ('archived', 'Archivé'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Faible'),
        ('normal', 'Normal'),
        ('high', 'Élevé'),
        ('urgent', 'Urgent'),
    ]
    
    # Informations de base
    title = models.CharField(
        max_length=200,
        verbose_name='Titre'
    )
    
    document_type = models.CharField(
        max_length=50,
        choices=TYPE_CHOICES,
        verbose_name='Type de document'
    )
    
    description = models.TextField(
        blank=True,
        null=True,
        verbose_name='Description'
    )
    
    # Fichier et métadonnées
    file = models.FileField(
        upload_to='documents/%Y/%m/%d/',
        verbose_name='Fichier'
    )
    
    file_size = models.PositiveIntegerField(
        blank=True,
        null=True,
        verbose_name='Taille du fichier (bytes)'
    )
    
    file_type = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        verbose_name='Type de fichier'
    )
    
    # Patient associé
    patient = models.ForeignKey(
        'patients.Patient',
        on_delete=models.CASCADE,
        related_name='medical_documents',
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
        default='pending',
        verbose_name='Statut'
    )
    
    priority = models.CharField(
        max_length=20,
        choices=PRIORITY_CHOICES,
        default='normal',
        verbose_name='Priorité'
    )
    
    # Traitement IA
    ai_processed = models.BooleanField(
        default=False,
        verbose_name='Traité par IA'
    )
    
    ai_confidence = models.FloatField(
        blank=True,
        null=True,
        verbose_name='Confiance IA (%)'
    )
    
    ai_extracted_text = models.TextField(
        blank=True,
        null=True,
        verbose_name='Texte extrait par IA'
    )
    
    ai_findings = models.JSONField(
        default=dict,
        blank=True,
        verbose_name='Découvertes IA'
    )
    
    # Qualité et traitement
    quality_score = models.PositiveIntegerField(
        blank=True,
        null=True,
        verbose_name='Score de qualité (0-100)'
    )
    
    processing_time = models.DurationField(
        blank=True,
        null=True,
        verbose_name='Temps de traitement'
    )
    
    # Métadonnées
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_documents',
        verbose_name='Créé par'
    )
    
    doctor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='doctor_documents',
        verbose_name='Médecin'
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Date de création'
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Date de modification'
    )
    
    processed_at = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name='Date de traitement'
    )
    
    # Date du document (peut être différente de la date de création)
    document_date = models.DateTimeField(
        default=timezone.now,
        verbose_name='Date du document'
    )
    
    class Meta:
        verbose_name = 'Document'
        verbose_name_plural = 'Documents'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['document_type']),
            models.Index(fields=['status']),
            models.Index(fields=['priority']),
            models.Index(fields=['ai_processed']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.title} ({self.get_document_type_display()})"
    
    def get_file_size_display(self):
        """Afficher la taille du fichier de manière lisible"""
        if not self.file_size:
            return "N/A"
        
        size = self.file_size
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024.0:
                return f"{size:.1f} {unit}"
            size /= 1024.0
        return f"{size:.1f} TB"
    
    def get_quality_display(self):
        """Obtenir l'affichage de la qualité"""
        if not self.quality_score:
            return "Non évalué"
        
        if self.quality_score >= 90:
            return "Excellent"
        elif self.quality_score >= 70:
            return "Bon"
        elif self.quality_score >= 50:
            return "Moyen"
        else:
            return "Faible"
    
    def is_urgent(self):
        """Vérifier si le document est urgent"""
        return self.priority == 'urgent' or self.status == 'error'
    
    def get_processing_status_display(self):
        """Obtenir l'affichage du statut de traitement"""
        status_display = {
            'pending': 'En attente',
            'processing': 'En cours',
            'completed': 'Terminé',
            'error': 'Erreur',
            'archived': 'Archivé'
        }
        return status_display.get(self.status, self.status)


class DocumentTag(models.Model):
    """
    Tags pour catégoriser les documents
    """
    name = models.CharField(
        max_length=50,
        unique=True,
        verbose_name='Nom du tag'
    )
    
    color = models.CharField(
        max_length=7,
        default='#007bff',
        verbose_name='Couleur (hex)'
    )
    
    description = models.TextField(
        blank=True,
        null=True,
        verbose_name='Description'
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Date de création'
    )
    
    class Meta:
        verbose_name = 'Tag de document'
        verbose_name_plural = 'Tags de documents'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class DocumentTagRelation(models.Model):
    """
    Relation entre documents et tags
    """
    document = models.ForeignKey(
        Document,
        on_delete=models.CASCADE,
        related_name='tag_relations',
        verbose_name='Document'
    )
    
    tag = models.ForeignKey(
        DocumentTag,
        on_delete=models.CASCADE,
        related_name='document_relations',
        verbose_name='Tag'
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Date d\'association'
    )
    
    class Meta:
        unique_together = ['document', 'tag']
        verbose_name = 'Relation Document-Tag'
        verbose_name_plural = 'Relations Document-Tag'
    
    def __str__(self):
        return f"{self.document.title} - {self.tag.name}"