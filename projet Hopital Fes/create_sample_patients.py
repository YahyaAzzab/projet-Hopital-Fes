#!/usr/bin/env python3
"""
Créer des patients de démonstration
"""

import os
import sys
import django

# Configuration Django
sys.path.append('.')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medical_backend.settings')
django.setup()

from patients.models import Patient
from users.models import User
from django.utils import timezone
from datetime import date, timedelta
import random

def create_sample_patients():
    """Créer des patients de démonstration"""
    print("🏥 Création de patients de démonstration...")
    
    # Récupérer un utilisateur admin
    admin_user = User.objects.filter(is_superuser=True).first()
    if not admin_user:
        print("❌ Aucun utilisateur admin trouvé")
        return
    
    # Données de patients
    patients_data = [
        {
            'patient_id': 'PAT001',
            'first_name': 'Ahmed',
            'last_name': 'Alami',
            'ci': 'A123456789',
            'date_of_birth': date(1985, 3, 15),
            'gender': 'M',
            'phone': '+212612345678',
            'email': 'ahmed.alami@email.com',
            'address': '123 Rue Hassan II, Casablanca',
            'city': 'Casablanca',
            'blood_type': 'O+',
            'emergency_contact': '+212612345679',
            'insurance': 'CNSS',
            'allergies': 'Pénicilline',
            'medical_history': 'Hypertension',
            'occupation': 'Ingénieur',
            'marital_status': 'Marié',
            'notes': 'Patient régulier, suivi cardiologique',
            'status': 'active'
        },
        {
            'patient_id': 'PAT002',
            'first_name': 'Fatima',
            'last_name': 'Benali',
            'ci': 'B987654321',
            'date_of_birth': date(1990, 7, 22),
            'gender': 'F',
            'phone': '+212612345680',
            'email': 'fatima.benali@email.com',
            'address': '456 Avenue Mohammed V, Rabat',
            'city': 'Rabat',
            'blood_type': 'A+',
            'emergency_contact': '+212612345681',
            'insurance': 'RAM',
            'allergies': 'Aucune',
            'medical_history': 'Diabète type 2',
            'occupation': 'Enseignante',
            'marital_status': 'Célibataire',
            'notes': 'Contrôle glycémique régulier',
            'status': 'active'
        },
        {
            'patient_id': 'PAT003',
            'first_name': 'Mohammed',
            'last_name': 'Chraibi',
            'ci': 'C456789123',
            'date_of_birth': date(1978, 11, 8),
            'gender': 'M',
            'phone': '+212612345682',
            'email': 'mohammed.chraibi@email.com',
            'address': '789 Boulevard Zerktouni, Marrakech',
            'city': 'Marrakech',
            'blood_type': 'B+',
            'emergency_contact': '+212612345683',
            'insurance': 'CNSS',
            'allergies': 'Aspirine',
            'medical_history': 'Asthme chronique',
            'occupation': 'Commerçant',
            'marital_status': 'Marié',
            'notes': 'Utilise un inhalateur',
            'status': 'active'
        },
        {
            'patient_id': 'PAT004',
            'first_name': 'Aicha',
            'last_name': 'Dahbi',
            'ci': 'D789123456',
            'date_of_birth': date(1995, 4, 12),
            'gender': 'F',
            'phone': '+212612345684',
            'email': 'aicha.dahbi@email.com',
            'address': '321 Rue Ibn Battuta, Fès',
            'city': 'Fès',
            'blood_type': 'AB+',
            'emergency_contact': '+212612345685',
            'insurance': 'RAM',
            'allergies': 'Latex',
            'medical_history': 'Aucune',
            'occupation': 'Étudiante',
            'marital_status': 'Célibataire',
            'notes': 'Première consultation',
            'status': 'active'
        },
        {
            'patient_id': 'PAT005',
            'first_name': 'Youssef',
            'last_name': 'El Fassi',
            'ci': 'E321654987',
            'date_of_birth': date(1982, 9, 25),
            'gender': 'M',
            'phone': '+212612345686',
            'email': 'youssef.elfassi@email.com',
            'address': '654 Avenue Hassan II, Agadir',
            'city': 'Agadir',
            'blood_type': 'O-',
            'emergency_contact': '+212612345687',
            'insurance': 'CNSS',
            'allergies': 'Aucune',
            'medical_history': 'Chirurgie appendicectomie 2010',
            'occupation': 'Médecin',
            'marital_status': 'Marié',
            'notes': 'Collègue médecin, suivi préventif',
            'status': 'active'
        }
    ]
    
    created_count = 0
    for patient_data in patients_data:
        try:
            patient = Patient.objects.create(
                created_by=admin_user,
                **patient_data
            )
            created_count += 1
            print(f"✅ Patient créé: {patient.first_name} {patient.last_name} ({patient.patient_id})")
        except Exception as e:
            print(f"❌ Erreur création patient {patient_data['patient_id']}: {e}")
    
    print(f"\n🎉 {created_count} patients créés avec succès!")
    print(f"Total patients dans la DB: {Patient.objects.count()}")

if __name__ == "__main__":
    create_sample_patients()
