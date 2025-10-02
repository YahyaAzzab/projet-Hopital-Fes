#!/usr/bin/env python3
"""
Debug des modèles pour identifier le problème
"""

import os
import sys
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medical_backend.settings')
django.setup()

from patients.models import Patient
from users.models import User

def debug_models():
    """Debug des modèles"""
    print("🔍 DEBUG DES MODÈLES")
    print("=" * 30)
    
    # Test 1: Créer un patient simple
    print("\n1. CRÉATION D'UN PATIENT...")
    try:
        # Récupérer un utilisateur
        user = User.objects.first()
        if not user:
            print("❌ Aucun utilisateur trouvé")
            return
        
        print(f"✅ Utilisateur trouvé: {user}")
        
        # Créer un patient simple
        patient = Patient.objects.create(
            patient_id="TEST001",
            first_name="Test",
            last_name="Patient",
            ci="TEST123456",
            date_of_birth="1990-01-01",
            gender="M",
            created_by=user
        )
        print(f"✅ Patient créé: {patient}")
        
        # Test des méthodes
        print(f"   - __str__: {str(patient)}")
        print(f"   - get_full_name(): {patient.get_full_name()}")
        print(f"   - get_age(): {patient.get_age()}")
        
        # Test des champs
        for field in ['patient_id', 'first_name', 'last_name', 'ci', 'gender', 'status']:
            value = getattr(patient, field)
            print(f"   - {field}: {value}")
        
    except Exception as e:
        print(f"❌ Erreur création patient: {e}")
        import traceback
        traceback.print_exc()
    
    # Test 2: Test des relations
    print("\n2. TEST DES RELATIONS...")
    try:
        patient = Patient.objects.first()
        if patient:
            print(f"✅ Patient: {patient}")
            print(f"   - created_by: {patient.created_by}")
            print(f"   - created_by type: {type(patient.created_by)}")
            
            # Test des méthodes de relation
            try:
                docs_count = patient.get_documents_count()
                print(f"   - get_documents_count(): {docs_count}")
            except Exception as e:
                print(f"   - get_documents_count() erreur: {e}")
            
            try:
                reports_count = patient.get_reports_count()
                print(f"   - get_reports_count(): {reports_count}")
            except Exception as e:
                print(f"   - get_reports_count() erreur: {e}")
                
    except Exception as e:
        print(f"❌ Erreur relations: {e}")
        import traceback
        traceback.print_exc()
    
    # Test 3: Test d'itération
    print("\n3. TEST D'ITÉRATION...")
    try:
        patients = Patient.objects.all()
        print(f"✅ QuerySet patients: {patients}")
        print(f"   - Type: {type(patients)}")
        print(f"   - Count: {patients.count()}")
        
        # Test d'itération
        for i, patient in enumerate(patients[:3]):
            print(f"   - Patient {i}: {patient}")
            print(f"     - Type: {type(patient)}")
            print(f"     - Iterable: {hasattr(patient, '__iter__')}")
            
    except Exception as e:
        print(f"❌ Erreur itération: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_models()
