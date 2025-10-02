#!/usr/bin/env python
import os
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medical_backend.settings')
django.setup()

from patients.models import Patient

def check_patients():
    """Vérifier les patients dans la base de données"""
    print("=== Vérification des patients ===")
    
    patients = Patient.objects.all()
    print(f"Nombre total de patients: {patients.count()}")
    
    for patient in patients:
        print(f"ID: {patient.id}")
        print(f"Nom: {patient.first_name} {patient.last_name}")
        print(f"Email: {patient.email}")
        print(f"Ville: {patient.city}")
        print(f"Groupe sanguin: {patient.blood_type}")
        print(f"Statut: {patient.status}")
        print(f"Créé par: {patient.created_by}")
        print(f"Date de création: {patient.created_at}")
        print("-" * 50)

if __name__ == "__main__":
    check_patients()
