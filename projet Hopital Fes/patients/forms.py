from django import forms
from .models import Patient, PatientDocument


class PatientForm(forms.ModelForm):
    """
    Formulaire pour créer/modifier un patient basé sur le frontend
    """
    class Meta:
        model = Patient
        fields = [
            'first_name', 'last_name', 'ci', 'date_of_birth', 'gender',
            'phone', 'email', 'address', 'city', 'blood_type', 'emergency_contact',
            'insurance', 'allergies', 'medical_history', 'occupation', 'marital_status', 'notes'
        ]
        widgets = {
            'first_name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Prénom du patient',
                'required': True
            }),
            'last_name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Nom du patient',
                'required': True
            }),
            'ci': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'AB123456',
                'maxlength': '8',
                'required': True
            }),
            'date_of_birth': forms.DateInput(attrs={
                'class': 'form-control',
                'type': 'date',
                'required': True
            }),
            'gender': forms.Select(attrs={
                'class': 'form-select',
                'required': True
            }),
            'phone': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': '+212 6 XX XX XX XX'
            }),
            'email': forms.EmailInput(attrs={
                'class': 'form-control',
                'placeholder': 'patient@email.com'
            }),
            'address': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 2,
                'placeholder': 'Adresse complète du patient'
            }),
            'city': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Fès'
            }),
            'blood_type': forms.Select(attrs={
                'class': 'form-select'
            }),
            'emergency_contact': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': '+212 6 XX XX XX XX'
            }),
            'insurance': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'CNSS, RAMED, Privée...'
            }),
            'allergies': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 2,
                'placeholder': 'Liste des allergies connues'
            }),
            'medical_history': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 2,
                'placeholder': 'Maladies chroniques, opérations...'
            }),
            'occupation': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Profession du patient'
            }),
            'marital_status': forms.Select(attrs={
                'class': 'form-select'
            }),
            'notes': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': 'Notes importantes sur le patient'
            })
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Marquer les champs requis
        self.fields['first_name'].required = True
        self.fields['last_name'].required = True
        self.fields['ci'].required = True
        self.fields['date_of_birth'].required = True
        self.fields['gender'].required = True
        self.fields['blood_type'].required = True  # Groupe sanguin obligatoire
        
        # Améliorer les placeholders
        self.fields['phone'].widget.attrs.update({'placeholder': '+212 6 XX XX XX XX'})
        self.fields['email'].widget.attrs.update({'placeholder': 'patient@email.com'})
        self.fields['address'].widget.attrs.update({'placeholder': 'Adresse complète du patient'})
        self.fields['city'].widget.attrs.update({'placeholder': 'Fès'})
        self.fields['emergency_contact'].widget.attrs.update({'placeholder': '+212 6 XX XX XX XX'})
        self.fields['insurance'].widget.attrs.update({'placeholder': 'CNSS, RAMED, Privée...'})
        self.fields['allergies'].widget.attrs.update({'placeholder': 'Liste des allergies connues (médicaments, aliments, autres)'})
        self.fields['medical_history'].widget.attrs.update({'placeholder': 'Maladies chroniques, opérations, hospitalisations...'})
        self.fields['occupation'].widget.attrs.update({'placeholder': 'Profession du patient'})
        self.fields['notes'].widget.attrs.update({'placeholder': 'Notes importantes sur le patient, traitements en cours, observations...'})


class PatientDocumentForm(forms.ModelForm):
    """
    Formulaire pour créer/modifier un document patient basé sur le frontend
    """
    class Meta:
        model = PatientDocument
        fields = ['patient', 'title', 'document_type', 'file', 'description']
        widgets = {
            'patient': forms.Select(attrs={
                'class': 'form-select',
                'required': True
            }),
            'title': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Titre du document',
                'required': True
            }),
            'document_type': forms.Select(attrs={
                'class': 'form-select',
                'required': True
            }),
            'file': forms.FileInput(attrs={
                'class': 'form-control',
                'accept': 'image/*,application/pdf,.doc,.docx',
                'required': True
            }),
            'description': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': 'Description du document...'
            })
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Marquer les champs requis
        self.fields['patient'].required = True
        self.fields['title'].required = True
        self.fields['document_type'].required = True
        self.fields['file'].required = True
