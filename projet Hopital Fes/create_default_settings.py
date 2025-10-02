#!/usr/bin/env python
import os
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medical_backend.settings')
django.setup()

from settings.models import SystemSettings

print("=== CRÉATION DES PARAMÈTRES PAR DÉFAUT ===")
print()

# Vérifier si des paramètres existent déjà
if SystemSettings.objects.exists():
    print("✅ Des paramètres existent déjà")
    settings = SystemSettings.objects.first()
    print(f"Hôpital: {settings.hospital_name}")
else:
    print("Création des paramètres par défaut...")
    
    # Créer les paramètres par défaut
    settings = SystemSettings.objects.create(
        hospital_name="Hôpital EL GHASSANI",
        hospital_address="Fès, Maroc",
        hospital_phone="+212 5 35 12 34 56",
        hospital_email="contact@elghassani.ma",
        maintenance_mode=False,
        max_file_size=10485760,  # 10MB
        allowed_file_types="pdf,jpg,jpeg,png,doc,docx",
        session_timeout=3600,  # 1 heure
        max_login_attempts=5,
        password_min_length=8,
        email_notifications=True,
        sms_notifications=False,
        notification_sound=True,
        default_language="fr",
        theme="light",
        backup_frequency="daily",
        backup_retention_days=30
    )
    
    print("✅ Paramètres créés avec succès!")
    print(f"Hôpital: {settings.hospital_name}")
    print(f"Email: {settings.hospital_email}")
    print(f"Langue: {settings.default_language}")
    print(f"Thème: {settings.theme}")

print()
print("=== RÉSULTAT ===")
print("Les paramètres de la plateforme sont maintenant disponibles!")
print("Le technicien peut maintenant les modifier dans l'admin Django.")
print()
print("URL: http://127.0.0.1:8000/admin/")
print("Username: technicien")
print("Password: technicien123")
