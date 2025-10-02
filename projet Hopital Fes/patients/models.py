from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import RegexValidator
from django.utils import timezone

User = get_user_model()


class Patient(models.Model):
    """
    Modèle Patient pour la gestion des dossiers médicaux
    """
    GENDER_CHOICES = [
        ('M', 'Masculin'),
        ('F', 'Féminin'),
        ('O', 'Autre'),
    ]
    
    BLOOD_TYPE_CHOICES = [
        ('A+', 'A+'),
        ('A-', 'A-'),
        ('B+', 'B+'),
        ('B-', 'B-'),
        ('AB+', 'AB+'),
        ('AB-', 'AB-'),
        ('O+', 'O+'),
        ('O-', 'O-'),
    ]
    
    MARITAL_STATUS_CHOICES = [
        ('single', 'Célibataire'),
        ('married', 'Marié(e)'),
        ('divorced', 'Divorcé(e)'),
        ('widowed', 'Veuf/Veuve'),
        ('separated', 'Séparé(e)'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Actif'),
        ('inactive', 'Inactif'),
        ('deceased', 'Décédé'),
        ('transferred', 'Transféré'),
    ]
    
    # Informations personnelles
    patient_id = models.CharField(
        max_length=20,
        unique=True,
        validators=[RegexValidator(r'^[A-Z0-9]+$', 'ID patient doit contenir uniquement des lettres majuscules et des chiffres')],
        verbose_name='ID Patient'
    )
    
    first_name = models.CharField(
        max_length=100,
        verbose_name='Prénom'
    )
    
    last_name = models.CharField(
        max_length=100,
        verbose_name='Nom'
    )
    
    ci = models.CharField(
        max_length=20,
        unique=True,
        verbose_name='Carte d\'Identité'
    )
    
    date_of_birth = models.DateField(
        verbose_name='Date de naissance'
    )
    
    gender = models.CharField(
        max_length=1,
        choices=GENDER_CHOICES,
        verbose_name='Genre'
    )
    
    # Coordonnées
    phone = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        verbose_name='Téléphone'
    )
    
    email = models.EmailField(
        blank=True,
        null=True,
        verbose_name='Email'
    )
    
    address = models.TextField(
        blank=True,
        null=True,
        verbose_name='Adresse'
    )
    
    city = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name='Ville'
    )
    
    # Informations médicales
    blood_type = models.CharField(
        max_length=3,
        choices=BLOOD_TYPE_CHOICES,
        blank=True,
        null=True,
        verbose_name='Groupe sanguin'
    )
    
    emergency_contact = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name='Contact d\'urgence'
    )
    
    insurance = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name='Assurance'
    )
    
    allergies = models.TextField(
        blank=True,
        null=True,
        verbose_name='Allergies'
    )
    
    medical_history = models.TextField(
        blank=True,
        null=True,
        verbose_name='Antécédents médicaux'
    )
    
    # Informations sociales
    occupation = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name='Profession'
    )
    
    marital_status = models.CharField(
        max_length=20,
        choices=MARITAL_STATUS_CHOICES,
        blank=True,
        null=True,
        verbose_name='État civil'
    )
    
    # Statut et notes
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='active',
        verbose_name='Statut'
    )
    
    notes = models.TextField(
        blank=True,
        null=True,
        verbose_name='Notes médicales'
    )
    
    # Métadonnées
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_patients',
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
    
    last_visit = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name='Dernière visite'
    )
    
    class Meta:
        verbose_name = 'Patient'
        verbose_name_plural = 'Patients'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['patient_id']),
            models.Index(fields=['ci']),
            models.Index(fields=['last_name', 'first_name']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.patient_id})"
    
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}".strip()
    
    def get_age(self):
        """Calculer l'âge du patient"""
        try:
            today = timezone.now().date()
            if isinstance(self.date_of_birth, str):
                from datetime import datetime
                birth_date = datetime.strptime(self.date_of_birth, '%Y-%m-%d').date()
            else:
                birth_date = self.date_of_birth
            return today.year - birth_date.year - (
                (today.month, today.day) < (birth_date.month, birth_date.day)
            )
        except:
            return 0
    
    def get_initials(self):
        return f"{self.first_name[0] if self.first_name else ''}{self.last_name[0] if self.last_name else ''}".upper()
    
    def get_documents_count(self):
        """Obtenir le nombre de documents associés"""
        try:
            return self.documents.count()
        except:
            return 0
    
    def get_reports_count(self):
        """Obtenir le nombre de rapports associés"""
        try:
            return self.reports.count()
        except:
            return 0


class PatientDocument(models.Model):
    """
    Documents associés à un patient
    """
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name='documents',
        verbose_name='Patient'
    )
    
    title = models.CharField(
        max_length=200,
        verbose_name='Titre'
    )
    
    document_type = models.CharField(
        max_length=100,
        verbose_name='Type de document'
    )
    
    file = models.FileField(
        upload_to='patient_documents/',
        verbose_name='Fichier'
    )
    
    description = models.TextField(
        blank=True,
        null=True,
        verbose_name='Description'
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
    
    class Meta:
        verbose_name = 'Document patient'
        verbose_name_plural = 'Documents patients'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.patient.get_full_name()}"