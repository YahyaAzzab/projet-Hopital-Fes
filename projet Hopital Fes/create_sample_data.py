#!/usr/bin/env python3
"""
Créer des données de démonstration pour tous les modèles
"""

import os
import sys
import django

# Configuration Django
sys.path.append('.')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medical_backend.settings')
django.setup()

from patients.models import Patient
from documents.models import Document
from reports.models import Report
from users.models import User
from django.utils import timezone
from datetime import date, timedelta
import random

def create_sample_data():
    """Créer des données de démonstration"""
    print("🏥 Création de données de démonstration...")
    
    # Récupérer un utilisateur admin
    admin_user = User.objects.filter(is_superuser=True).first()
    if not admin_user:
        print("❌ Aucun utilisateur admin trouvé")
        return
    
    # Récupérer un médecin
    doctor = User.objects.filter(username='medecin').first()
    if not doctor:
        print("❌ Aucun médecin trouvé")
        return
    
    # Récupérer des patients
    patients = list(Patient.objects.all())
    if not patients:
        print("❌ Aucun patient trouvé")
        return
    
    # Créer des documents
    print("\n📄 Création de documents...")
    documents_data = [
        {
            'title': 'Radiographie thoracique',
            'document_type': 'Radiologie',
            'patient': patients[0],
            'description': 'Radiographie thoracique de face et de profil',
            'created_by': doctor
        },
        {
            'title': 'Analyse sanguine complète',
            'document_type': 'Biologie',
            'patient': patients[1],
            'description': 'NFS, glycémie, cholestérol, triglycérides',
            'created_by': doctor
        },
        {
            'title': 'Échographie abdominale',
            'document_type': 'Imagerie',
            'patient': patients[2],
            'description': 'Échographie des organes abdominaux',
            'created_by': doctor
        },
        {
            'title': 'ECG de repos',
            'document_type': 'Cardiologie',
            'patient': patients[0],
            'description': 'Électrocardiogramme de repos',
            'created_by': doctor
        },
        {
            'title': 'Consultation cardiologique',
            'document_type': 'Consultation',
            'patient': patients[3],
            'description': 'Consultation de suivi cardiologique',
            'created_by': doctor
        }
    ]
    
    created_documents = 0
    for doc_data in documents_data:
        try:
            document = Document.objects.create(**doc_data)
            created_documents += 1
            print(f"✅ Document créé: {document.title}")
        except Exception as e:
            print(f"❌ Erreur création document {doc_data['title']}: {e}")
    
    # Créer des rapports
    print("\n📊 Création de rapports...")
    reports_data = [
        {
            'title': 'Rapport de consultation cardiologique',
            'report_type': 'Consultation',
            'patient': patients[0],
            'doctor': doctor,
            'report_date': date.today(),
            'summary': 'Patient présentant des douleurs thoraciques atypiques',
            'details': 'Examen clinique normal, ECG sans particularité. Surveillance recommandée.',
            'created_by': doctor
        },
        {
            'title': 'Rapport d\'hospitalisation',
            'report_type': 'Hospitalisation',
            'patient': patients[1],
            'doctor': doctor,
            'report_date': date.today() - timedelta(days=2),
            'summary': 'Hospitalisation pour diabète déséquilibré',
            'details': 'Glycémie élevée, HbA1c à 9.2%. Ajustement du traitement nécessaire.',
            'created_by': doctor
        },
        {
            'title': 'Rapport de sortie',
            'report_type': 'Sortie',
            'patient': patients[2],
            'doctor': doctor,
            'report_date': date.today() - timedelta(days=1),
            'summary': 'Sortie après appendicectomie',
            'details': 'Intervention réalisée sans complication. Repos et suivi recommandés.',
            'created_by': doctor
        }
    ]
    
    created_reports = 0
    for report_data in reports_data:
        try:
            report = Report.objects.create(**report_data)
            created_reports += 1
            print(f"✅ Rapport créé: {report.title}")
        except Exception as e:
            print(f"❌ Erreur création rapport {report_data['title']}: {e}")
    
    print(f"\n🎉 Données créées avec succès!")
    print(f"   - Documents: {created_documents}")
    print(f"   - Rapports: {created_reports}")
    print(f"   - Total patients: {Patient.objects.count()}")
    print(f"   - Total utilisateurs: {User.objects.count()}")

if __name__ == "__main__":
    create_sample_data()
