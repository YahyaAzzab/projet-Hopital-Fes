from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class Message(models.Model):
    """
    Modèle pour la communication entre utilisateurs
    """
    PRIORITY_CHOICES = [
        ('low', 'Faible'),
        ('normal', 'Normal'),
        ('high', 'Élevé'),
        ('urgent', 'Urgent'),
    ]
    
    STATUS_CHOICES = [
        ('unread', 'Non lu'),
        ('read', 'Lu'),
        ('replied', 'Répondu'),
        ('closed', 'Fermé'),
    ]
    
    CATEGORY_CHOICES = [
        ('general', 'Général'),
        ('technical', 'Technique'),
        ('medical', 'Médical'),
        ('urgent', 'Urgent'),
        ('suggestion', 'Suggestion'),
        ('complaint', 'Plainte'),
    ]
    
    # Informations de base
    title = models.CharField(
        max_length=200,
        verbose_name='Titre'
    )
    
    content = models.TextField(
        verbose_name='Contenu'
    )
    
    # Utilisateurs
    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='sent_messages',
        verbose_name='Expéditeur'
    )
    
    recipient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='received_messages',
        verbose_name='Destinataire'
    )
    
    # Métadonnées
    priority = models.CharField(
        max_length=20,
        choices=PRIORITY_CHOICES,
        default='normal',
        verbose_name='Priorité'
    )
    
    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        default='general',
        verbose_name='Catégorie'
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='unread',
        verbose_name='Statut'
    )
    
    # Timestamps
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Date d\'envoi'
    )
    
    read_at = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name='Date de lecture'
    )
    
    # Pièces jointes
    attachment = models.FileField(
        upload_to='messages/attachments/',
        blank=True,
        null=True,
        verbose_name='Pièce jointe'
    )
    
    class Meta:
        verbose_name = 'Message'
        verbose_name_plural = 'Messages'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', 'status']),
            models.Index(fields=['sender', 'created_at']),
            models.Index(fields=['priority', 'category']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.sender.get_full_name()} → {self.recipient.get_full_name()}"
    
    def mark_as_read(self):
        """Marquer le message comme lu"""
        if self.status == 'unread':
            self.status = 'read'
            self.read_at = timezone.now()
            self.save()


class MessageThread(models.Model):
    """
    Fil de discussion pour regrouper les messages
    """
    title = models.CharField(
        max_length=200,
        verbose_name='Titre du fil'
    )
    
    participants = models.ManyToManyField(
        User,
        related_name='message_threads',
        verbose_name='Participants'
    )
    
    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='created_threads',
        verbose_name='Créé par'
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Date de création'
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Dernière mise à jour'
    )
    
    is_active = models.BooleanField(
        default=True,
        verbose_name='Actif'
    )
    
    class Meta:
        verbose_name = 'Fil de discussion'
        verbose_name_plural = 'Fils de discussion'
        ordering = ['-updated_at']
    
    def __str__(self):
        return self.title
    
    def get_latest_message(self):
        """Obtenir le dernier message du fil"""
        return self.messages.order_by('-created_at').first()


class Notification(models.Model):
    """
    Notifications pour les utilisateurs
    """
    NOTIFICATION_TYPES = [
        ('message', 'Nouveau message'),
        ('system', 'Notification système'),
        ('reminder', 'Rappel'),
        ('alert', 'Alerte'),
    ]
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notifications',
        verbose_name='Utilisateur'
    )
    
    title = models.CharField(
        max_length=200,
        verbose_name='Titre'
    )
    
    message = models.TextField(
        verbose_name='Message'
    )
    
    notification_type = models.CharField(
        max_length=20,
        choices=NOTIFICATION_TYPES,
        default='message',
        verbose_name='Type de notification'
    )
    
    is_read = models.BooleanField(
        default=False,
        verbose_name='Lu'
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Date de création'
    )
    
    # Lien optionnel vers un message ou autre objet
    message_link = models.ForeignKey(
        Message,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        verbose_name='Lien vers message'
    )
    
    class Meta:
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.user.get_full_name()}"
    
    def mark_as_read(self):
        """Marquer la notification comme lue"""
        self.is_read = True
        self.save()
