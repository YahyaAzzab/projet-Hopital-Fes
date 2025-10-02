from django import forms
from django.db.models import Q
from .models import Document
from patients.models import Patient
from users.models import User

class DocumentForm(forms.ModelForm):
    """Formulaire pour créer/modifier un document"""
    
    class Meta:
        model = Document
        fields = [
            'title', 'document_type', 'description', 'file',
            'patient', 'priority', 'status', 'doctor'
        ]
        widgets = {
            'title': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Titre du document',
                'required': True
            }),
            'document_type': forms.Select(attrs={
                'class': 'form-select',
                'required': True
            }),
            'description': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': 'Description du document...'
            }),
            'file': forms.FileInput(attrs={
                'class': 'form-control',
                'accept': 'image/*,application/pdf'
            }),
            'patient': forms.Select(attrs={
                'class': 'form-select'
            }),
            'priority': forms.Select(attrs={
                'class': 'form-select'
            }),
            'status': forms.Select(attrs={
                'class': 'form-select'
            }),
            'doctor': forms.Select(attrs={
                'class': 'form-select'
            })
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Filtrer les patients actifs
        self.fields['patient'].queryset = Patient.objects.filter(status='active')
        self.fields['patient'].empty_label = "Aucun patient"
        
        # Filtrer les médecins
        self.fields['doctor'].queryset = User.objects.filter(
            Q(role='Médecin') | Q(role='Doctor') | Q(is_staff=True)
        )
        self.fields['doctor'].empty_label = "Aucun médecin"
