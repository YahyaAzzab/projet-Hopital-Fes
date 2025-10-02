#!/usr/bin/env python
import os
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medical_backend.settings')
django.setup()

from django.core.management import call_command
from django.db import connection
from patients.models import Patient
from documents.models import Document
from reports.models import Report
from activities.models import Activity
from settings.models import SystemSettings, SettingsLog

def reset_database():
    """Réinitialiser la base de données en gardant seulement les utilisateurs"""
    print("=== Réinitialisation de la base de données ===")
    
    # Supprimer toutes les données sauf les utilisateurs
    print("Suppression des patients...")
    Patient.objects.all().delete()
    
    print("Suppression des documents...")
    Document.objects.all().delete()
    
    print("Suppression des rapports...")
    Report.objects.all().delete()
    
    print("Suppression des activités...")
    Activity.objects.all().delete()
    
    print("Suppression des paramètres...")
    SystemSettings.objects.all().delete()
    SettingsLog.objects.all().delete()
    
    # Créer les paramètres par défaut
    print("Création des paramètres par défaut...")
    SystemSettings.objects.create(
        hospital_name="Hôpital EL GHASSANI",
        hospital_email="contact@elghassani.ma",
        default_language="fr",
        theme="light",
        maintenance_mode=False
    )
    
    print("✅ Base de données réinitialisée avec succès!")
    print("✅ Seuls les utilisateurs ont été conservés")
    print("✅ Paramètres par défaut créés")

if __name__ == "__main__":
    reset_database()
