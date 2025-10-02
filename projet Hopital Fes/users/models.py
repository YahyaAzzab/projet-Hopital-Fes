from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class User(AbstractUser):
    """
    Modèle utilisateur personnalisé pour la plateforme médicale
    """
    ROLE_CHOICES = [
        ('admin', 'Administrateur'),
        ('doctor', 'Médecin'),
        ('nurse', 'Infirmière'),
        ('technician', 'Technicien'),
    ]
    
    # Champs personnalisés
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='nurse',
        verbose_name='Rôle'
    )
    
    department = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name='Département'
    )
    
    phone = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        verbose_name='Téléphone'
    )
    
    is_active = models.BooleanField(
        default=True,
        verbose_name='Actif'
    )
    
    last_login_ip = models.GenericIPAddressField(
        blank=True,
        null=True,
        verbose_name='Dernière IP de connexion'
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Date de création'
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Date de modification'
    )
    
    # Permissions personnalisées
    permissions = models.JSONField(
        default=list,
        blank=True,
        verbose_name='Permissions'
    )
    
    class Meta:
        verbose_name = 'Utilisateur'
        verbose_name_plural = 'Utilisateurs'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.get_role_display()})"
    
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}".strip()
    
    def get_short_name(self):
        return self.first_name
    
    def get_initials(self):
        return f"{self.first_name[0] if self.first_name else ''}{self.last_name[0] if self.last_name else ''}".upper()
    
    def has_permission(self, permission):
        """Vérifier si l'utilisateur a une permission spécifique"""
        return permission in (self.permissions or [])
    
    def get_role_name(self):
        """Obtenir le nom du rôle en français"""
        role_names = {
            'admin': 'Administrateur',
            'doctor': 'Médecin',
            'nurse': 'Infirmière',
            'technician': 'Technicien'
        }
        return role_names.get(self.role, self.role)


class UserProfile(models.Model):
    """
    Profil étendu pour les utilisateurs
    """
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile',
        verbose_name='Utilisateur'
    )
    
    avatar = models.ImageField(
        upload_to='avatars/',
        blank=True,
        null=True,
        verbose_name='Photo de profil'
    )
    
    bio = models.TextField(
        blank=True,
        null=True,
        verbose_name='Biographie'
    )
    
    specializations = models.JSONField(
        default=list,
        blank=True,
        verbose_name='Spécialisations'
    )
    
    languages = models.JSONField(
        default=list,
        blank=True,
        verbose_name='Langues parlées'
    )
    
    emergency_contact = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name='Contact d\'urgence'
    )
    
    class Meta:
        verbose_name = 'Profil utilisateur'
        verbose_name_plural = 'Profils utilisateurs'
    
    def __str__(self):
        return f"Profil de {self.user.get_full_name()}"