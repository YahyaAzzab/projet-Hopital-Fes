from django import forms
from .models import Report


class ReportForm(forms.ModelForm):
    """
    Formulaire complet pour créer/modifier un rapport médical
    """
    class Meta:
        model = Report
        fields = [
            'title', 'report_type', 'patient', 'patient_name', 'summary', 'details',
            'diagnosis', 'treatment', 'priority', 'status', 'doctor', 'report_date'
        ]
        widgets = {
            'title': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Titre du rapport médical',
                'required': True
            }),
            'report_type': forms.Select(attrs={
                'class': 'form-select',
                'required': True
            }),
            'patient': forms.Select(attrs={
                'class': 'form-select',
                'required': True
            }),
            'patient_name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Nom du patient (si différent du patient sélectionné)'
            }),
            'summary': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 4,
                'placeholder': 'Résumé de la consultation ou de l\'examen médical...',
                'required': True
            }),
            'details': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 5,
                'placeholder': 'Détails complets de la consultation, observations, examens réalisés...'
            }),
            'diagnosis': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 4,
                'placeholder': 'Diagnostic médical, codes CIM-10, observations cliniques...'
            }),
            'treatment': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 4,
                'placeholder': 'Plan de traitement, prescriptions, recommandations, suivi...'
            }),
            'priority': forms.Select(attrs={
                'class': 'form-select'
            }),
            'status': forms.Select(attrs={
                'class': 'form-select'
            }),
            'doctor': forms.Select(attrs={
                'class': 'form-select'
            }),
            'report_date': forms.DateTimeInput(attrs={
                'class': 'form-control',
                'type': 'datetime-local'
            })
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Marquer les champs requis
        self.fields['title'].required = True
        self.fields['report_type'].required = True
        self.fields['patient'].required = True
        self.fields['summary'].required = True
        
        # Améliorer les placeholders
        self.fields['doctor'].widget.attrs.update({'placeholder': 'Médecin responsable'})
        self.fields['priority'].widget.attrs.update({'placeholder': 'Priorité du rapport'})
        
        # Charger les patients dans le select
        from patients.models import Patient
        self.fields['patient'].queryset = Patient.objects.filter(status='active').order_by('last_name', 'first_name')
        
        # Charger les médecins dans le select
        from users.models import User
        self.fields['doctor'].queryset = User.objects.filter(
            groups__name__in=['Médecin', 'Doctor']
        ).order_by('last_name', 'first_name')
