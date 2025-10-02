from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from django.utils import timezone

User = get_user_model()


class Activity(models.Model):
    """
    Modèle Activity pour le suivi des activités du système
    """
    ACTION_CHOICES = [
        # Authentification
        ('login', 'Connexion'),
        ('logout', 'Déconnexion'),
        ('password_change', 'Changement de mot de passe'),
        ('password_reset', 'Réinitialisation de mot de passe'),
        
        # Patients
        ('patient_created', 'Patient créé'),
        ('patient_updated', 'Patient modifié'),
        ('patient_deleted', 'Patient supprimé'),
        ('patient_viewed', 'Patient consulté'),
        
        # Documents
        ('document_uploaded', 'Document téléchargé'),
        ('document_processed', 'Document traité'),
        ('document_updated', 'Document modifié'),
        ('document_deleted', 'Document supprimé'),
        ('document_viewed', 'Document consulté'),
        ('document_downloaded', 'Document téléchargé'),
        
        # Rapports
        ('report_created', 'Rapport créé'),
        ('report_updated', 'Rapport modifié'),
        ('report_deleted', 'Rapport supprimé'),
        ('report_viewed', 'Rapport consulté'),
        ('report_approved', 'Rapport approuvé'),
        ('report_rejected', 'Rapport rejeté'),
        
        # Utilisateurs
        ('user_created', 'Utilisateur créé'),
        ('user_updated', 'Utilisateur modifié'),
        ('user_deleted', 'Utilisateur supprimé'),
        ('user_activated', 'Utilisateur activé'),
        ('user_deactivated', 'Utilisateur désactivé'),
        
        # Système
        ('system_backup', 'Sauvegarde système'),
        ('system_restore', 'Restauration système'),
        ('data_export', 'Export de données'),
        ('data_import', 'Import de données'),
        ('settings_updated', 'Paramètres modifiés'),
        
        # Erreurs
        ('error_occurred', 'Erreur survenue'),
        ('security_alert', 'Alerte de sécurité'),
        ('access_denied', 'Accès refusé'),
    ]
    
    SEVERITY_CHOICES = [
        ('info', 'Information'),
        ('warning', 'Avertissement'),
        ('error', 'Erreur'),
        ('critical', 'Critique'),
    ]
    
    # Informations de base
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='activities',
        verbose_name='Utilisateur'
    )
    
    action = models.CharField(
        max_length=50,
        choices=ACTION_CHOICES,
        verbose_name='Action'
    )
    
    description = models.TextField(
        verbose_name='Description'
    )
    
    # Objet concerné (relation générique)
    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        verbose_name='Type d\'objet'
    )
    
    object_id = models.PositiveIntegerField(
        null=True,
        blank=True,
        verbose_name='ID de l\'objet'
    )
    
    content_object = GenericForeignKey(
        'content_type',
        'object_id'
    )
    
    # Détails supplémentaires
    details = models.JSONField(
        default=dict,
        blank=True,
        verbose_name='Détails supplémentaires'
    )
    
    severity = models.CharField(
        max_length=20,
        choices=SEVERITY_CHOICES,
        default='info',
        verbose_name='Sévérité'
    )
    
    # Métadonnées
    ip_address = models.GenericIPAddressField(
        blank=True,
        null=True,
        verbose_name='Adresse IP'
    )
    
    user_agent = models.TextField(
        blank=True,
        null=True,
        verbose_name='User Agent'
    )
    
    session_key = models.CharField(
        max_length=40,
        blank=True,
        null=True,
        verbose_name='Clé de session'
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Date de création'
    )
    
    class Meta:
        verbose_name = 'Activité'
        verbose_name_plural = 'Activités'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['action']),
            models.Index(fields=['severity']),
            models.Index(fields=['created_at']),
            models.Index(fields=['content_type', 'object_id']),
        ]
    
    def __str__(self):
        user_name = self.user.get_full_name() if self.user else 'Système'
        return f"{user_name} - {self.get_action_display()}"
    
    def get_action_display_color(self):
        """Obtenir la couleur d'affichage de l'action"""
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
        return colors.get(self.action, 'primary')
    
    def get_severity_display_color(self):
        """Obtenir la couleur d'affichage de la sévérité"""
        colors = {
            'info': 'primary',
            'warning': 'warning',
            'error': 'danger',
            'critical': 'dark',
        }
        return colors.get(self.severity, 'primary')
    
    def is_recent(self, minutes=30):
        """Vérifier si l'activité est récente"""
        now = timezone.now()
        return (now - self.created_at).total_seconds() < (minutes * 60)
    
    def get_related_object_name(self):
        """Obtenir le nom de l'objet concerné"""
        if self.content_object:
            return str(self.content_object)
        return "Objet supprimé"


class SystemLog(models.Model):
    """
    Logs système pour le débogage et la surveillance
    """
    LEVEL_CHOICES = [
        ('DEBUG', 'Debug'),
        ('INFO', 'Information'),
        ('WARNING', 'Avertissement'),
        ('ERROR', 'Erreur'),
        ('CRITICAL', 'Critique'),
    ]
    
    level = models.CharField(
        max_length=10,
        choices=LEVEL_CHOICES,
        verbose_name='Niveau'
    )
    
    message = models.TextField(
        verbose_name='Message'
    )
    
    module = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name='Module'
    )
    
    function = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name='Fonction'
    )
    
    line_number = models.PositiveIntegerField(
        blank=True,
        null=True,
        verbose_name='Numéro de ligne'
    )
    
    traceback = models.TextField(
        blank=True,
        null=True,
        verbose_name='Traceback'
    )
    
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name='Utilisateur'
    )
    
    ip_address = models.GenericIPAddressField(
        blank=True,
        null=True,
        verbose_name='Adresse IP'
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Date de création'
    )
    
    class Meta:
        verbose_name = 'Log système'
        verbose_name_plural = 'Logs système'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['level']),
            models.Index(fields=['created_at']),
            models.Index(fields=['module']),
        ]
    
    def __str__(self):
        return f"{self.level} - {self.message[:50]}..."
    
    def get_level_display_color(self):
        """Obtenir la couleur d'affichage du niveau"""
        colors = {
            'DEBUG': 'secondary',
            'INFO': 'primary',
            'WARNING': 'warning',
            'ERROR': 'danger',
            'CRITICAL': 'dark',
        }
        return colors.get(self.level, 'primary')