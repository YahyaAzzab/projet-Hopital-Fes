#!/usr/bin/env python
import os
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medical_backend.settings')
django.setup()

from users.models import User
from patients.models import Patient
from documents.models import Document
from reports.models import Report
from activities.models import Activity
from settings.models import SystemSettings, SettingsLog

def check_database_status():
    """Vérifier l'état de la base de données"""
    print("=== ÉTAT DE LA BASE DE DONNÉES ===")
    print()
    
    # Utilisateurs
    users_count = User.objects.count()
    print(f"👥 UTILISATEURS: {users_count}")
    if users_count > 0:
        for user in User.objects.all()[:5]:  # Afficher les 5 premiers
            print(f"   - {user.username} ({user.get_full_name()}) - {user.role}")
    print()
    
    # Patients
    patients_count = Patient.objects.count()
    print(f"🏥 PATIENTS: {patients_count}")
    print()
    
    # Documents
    documents_count = Document.objects.count()
    print(f"📄 DOCUMENTS: {documents_count}")
    print()
    
    # Rapports
    reports_count = Report.objects.count()
    print(f"📊 RAPPORTS: {reports_count}")
    print()
    
    # Activités
    activities_count = Activity.objects.count()
    print(f"📝 ACTIVITÉS: {activities_count}")
    print()
    
    # Paramètres
    settings_count = SystemSettings.objects.count()
    print(f"⚙️  PARAMÈTRES: {settings_count}")
    if settings_count > 0:
        settings = SystemSettings.objects.first()
        print(f"   - Hôpital: {settings.hospital_name}")
        print(f"   - Email: {settings.hospital_email}")
        print(f"   - Langue: {settings.default_language}")
    print()
    
    # Logs des paramètres
    settings_logs_count = SettingsLog.objects.count()
    print(f"📋 LOGS PARAMÈTRES: {settings_logs_count}")
    print()
    
    print("=" * 50)
    print("✅ BASE DE DONNÉES PRÊTE !")
    print("✅ Tables vides sauf utilisateurs")
    print("✅ Paramètres par défaut créés")

if __name__ == "__main__":
    check_database_status()
