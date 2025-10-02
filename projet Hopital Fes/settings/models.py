from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class SystemSettings(models.Model):
    """Paramètres système de la plateforme"""
    
    # Informations générales
    hospital_name = models.CharField(
        max_length=200, 
        default="Hôpital EL GHASSANI",
        verbose_name="Nom de l'hôpital"
    )
    hospital_address = models.TextField(
        blank=True,
        verbose_name="Adresse de l'hôpital"
    )
    hospital_phone = models.CharField(
        max_length=20,
        blank=True,
        verbose_name="Téléphone"
    )
    hospital_email = models.EmailField(
        blank=True,
        verbose_name="Email"
    )
    
    # Configuration de l'application
    maintenance_mode = models.BooleanField(
        default=False,
        verbose_name="Mode maintenance"
    )
    max_file_size = models.IntegerField(
        default=10485760,  # 10MB
        verbose_name="Taille maximale des fichiers (bytes)"
    )
    allowed_file_types = models.TextField(
        default="pdf,jpg,jpeg,png,doc,docx",
        verbose_name="Types de fichiers autorisés"
    )
    
    # Configuration de sécurité
    session_timeout = models.IntegerField(
        default=3600,  # 1 heure
        verbose_name="Délai d'expiration de session (secondes)"
    )
    max_login_attempts = models.IntegerField(
        default=5,
        verbose_name="Nombre maximum de tentatives de connexion"
    )
    password_min_length = models.IntegerField(
        default=8,
        verbose_name="Longueur minimale des mots de passe"
    )
    
    # Configuration des notifications
    email_notifications = models.BooleanField(
        default=True,
        verbose_name="Notifications par email"
    )
    sms_notifications = models.BooleanField(
        default=False,
        verbose_name="Notifications par SMS"
    )
    notification_sound = models.BooleanField(
        default=True,
        verbose_name="Son des notifications"
    )
    
    # Configuration de l'interface
    default_language = models.CharField(
        max_length=10,
        default="fr",
        choices=[
            ('fr', 'Français'),
            ('ar', 'العربية'),
            ('en', 'English'),
        ],
        verbose_name="Langue par défaut"
    )
    theme = models.CharField(
        max_length=20,
        default="light",
        choices=[
            ('light', 'Clair'),
            ('dark', 'Sombre'),
            ('auto', 'Automatique'),
        ],
        verbose_name="Thème"
    )
    
    # Configuration de la base de données
    backup_frequency = models.CharField(
        max_length=20,
        default="daily",
        choices=[
            ('hourly', 'Horaire'),
            ('daily', 'Quotidien'),
            ('weekly', 'Hebdomadaire'),
            ('monthly', 'Mensuel'),
        ],
        verbose_name="Fréquence de sauvegarde"
    )
    backup_retention_days = models.IntegerField(
        default=30,
        verbose_name="Rétention des sauvegardes (jours)"
    )
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        verbose_name="Modifié par"
    )
    
    class Meta:
        verbose_name = "Paramètre système"
        verbose_name_plural = "Paramètres système"
    
    def __str__(self):
        return f"Paramètres - {self.hospital_name}"
    
    def save(self, *args, **kwargs):
        # S'assurer qu'il n'y a qu'une seule instance de paramètres
        if not self.pk and SystemSettings.objects.exists():
            # Si on essaie de créer un nouvel objet mais qu'il en existe déjà un
            return
        super().save(*args, **kwargs)

class SettingsLog(models.Model):
    """Logs système pour le monitoring"""
    
    SEVERITY_CHOICES = [
        ('info', 'Information'),
        ('warning', 'Avertissement'),
        ('error', 'Erreur'),
        ('critical', 'Critique'),
    ]
    
    ACTION_CHOICES = [
        ('login', 'Connexion'),
        ('logout', 'Déconnexion'),
        ('create', 'Création'),
        ('update', 'Modification'),
        ('delete', 'Suppression'),
        ('export', 'Export'),
        ('import', 'Import'),
        ('backup', 'Sauvegarde'),
        ('restore', 'Restauration'),
        ('system', 'Système'),
    ]
    
    timestamp = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        verbose_name="Utilisateur"
    )
    action = models.CharField(
        max_length=20,
        choices=ACTION_CHOICES,
        verbose_name="Action"
    )
    severity = models.CharField(
        max_length=20,
        choices=SEVERITY_CHOICES,
        default='info',
        verbose_name="Sévérité"
    )
    message = models.TextField(verbose_name="Message")
    details = models.JSONField(
        blank=True, 
        null=True,
        verbose_name="Détails"
    )
    ip_address = models.GenericIPAddressField(
        null=True, 
        blank=True,
        verbose_name="Adresse IP"
    )
    user_agent = models.TextField(
        blank=True,
        verbose_name="User Agent"
    )
    
    class Meta:
        verbose_name = "Log système"
        verbose_name_plural = "Logs système"
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.timestamp} - {self.get_severity_display()} - {self.message[:50]}"