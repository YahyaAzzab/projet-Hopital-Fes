from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
import uuid

User = get_user_model()

class SoftDeleteManager(models.Manager):
    """Manager pour gérer les objets supprimés doucement"""
    
    def get_queryset(self):
        return super().get_queryset().filter(is_deleted=False)
    
    def deleted(self):
        return super().get_queryset().filter(is_deleted=True)

class SoftDeleteMixin(models.Model):
    """Mixin pour la suppression douce"""
    is_deleted = models.BooleanField(default=False, verbose_name="Supprimé")
    deleted_at = models.DateTimeField(null=True, blank=True, verbose_name="Date de suppression")
    deleted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Supprimé par")
    deletion_reason = models.TextField(blank=True, verbose_name="Raison de la suppression")
    
    # Manager par défaut
    objects = SoftDeleteManager()
    all_objects = models.Manager()
    
    class Meta:
        abstract = True
    
    def soft_delete(self, user=None, reason=""):
        """Suppression douce"""
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.deleted_by = user
        self.deletion_reason = reason
        self.save()
    
    def restore(self):
        """Restaurer l'objet"""
        self.is_deleted = False
        self.deleted_at = None
        self.deleted_by = None
        self.deletion_reason = ""
        self.save()

class DeletedItem(models.Model):
    """Modèle pour stocker les informations sur les éléments supprimés"""
    DELETION_TYPES = [
        ('patient', 'Patient'),
        ('document', 'Document'),
        ('report', 'Rapport'),
        ('user', 'Utilisateur'),
        ('activity', 'Activité'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    deletion_type = models.CharField(max_length=20, choices=DELETION_TYPES, verbose_name="Type d'élément")
    original_id = models.PositiveIntegerField(verbose_name="ID original")
    original_data = models.JSONField(verbose_name="Données originales")
    deletion_code = models.CharField(max_length=20, unique=True, verbose_name="Code de récupération")
    deleted_at = models.DateTimeField(auto_now_add=True, verbose_name="Date de suppression")
    deleted_by = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Supprimé par")
    deletion_reason = models.TextField(blank=True, verbose_name="Raison de la suppression")
    can_restore = models.BooleanField(default=True, verbose_name="Peut être restauré")
    
    class Meta:
        verbose_name = "Élément supprimé"
        verbose_name_plural = "Éléments supprimés"
        ordering = ['-deleted_at']
    
    def __str__(self):
        return f"{self.get_deletion_type_display()} #{self.original_id} - {self.deletion_code}"
    
    @classmethod
    def create_deletion_record(cls, obj, user, reason=""):
        """Créer un enregistrement de suppression"""
        import random
        import string
        
        # Générer un code unique
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
        while cls.objects.filter(deletion_code=code).exists():
            code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
        
        # Déterminer le type d'objet
        deletion_type = 'patient' if hasattr(obj, 'patient_id') else \
                       'document' if hasattr(obj, 'file') else \
                       'report' if hasattr(obj, 'report_type') else \
                       'user' if hasattr(obj, 'username') else \
                       'activity' if hasattr(obj, 'action') else 'unknown'
        
        # Sérialiser les données
        import json
        from datetime import date, datetime
        
        original_data = {}
        for field in obj._meta.fields:
            if field.name not in ['id', 'created_at', 'updated_at']:
                value = getattr(obj, field.name)
                if hasattr(value, 'pk'):  # ForeignKey
                    original_data[field.name] = value.pk
                elif hasattr(value, 'all'):  # ManyToManyField
                    original_data[field.name] = list(value.values_list('pk', flat=True))
                elif isinstance(value, (date, datetime)):
                    original_data[field.name] = value.isoformat()
                else:
                    original_data[field.name] = value
        
        return cls.objects.create(
            deletion_type=deletion_type,
            original_id=obj.pk,
            original_data=original_data,
            deletion_code=code,
            deleted_by=user,
            deletion_reason=reason
        )