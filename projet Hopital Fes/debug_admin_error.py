#!/usr/bin/env python3
"""
Debug détaillé des erreurs admin
"""

import os
import sys
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medical_backend.settings')
django.setup()

from django.contrib.admin.sites import site
from django.contrib.auth import get_user_model
from patients.models import Patient
from documents.models import Document
from reports.models import Report

User = get_user_model()

def debug_admin_errors():
    """Debug des erreurs admin"""
    print("🔍 DEBUG DÉTAILLÉ DES ERREURS ADMIN")
    print("=" * 50)
    
    # Test 1: Vérifier les modèles
    print("\n1. VÉRIFICATION DES MODÈLES...")
    try:
        print(f"✅ User: {User.objects.count()} utilisateurs")
        print(f"✅ Patient: {Patient.objects.count()} patients")
        print(f"✅ Document: {Document.objects.count()} documents")
        print(f"✅ Report: {Report.objects.count()} rapports")
    except Exception as e:
        print(f"❌ Erreur modèles: {e}")
    
    # Test 2: Vérifier les admin
    print("\n2. VÉRIFICATION DES ADMIN...")
    try:
        # Test PatientAdmin
        patient_admin = site._registry[Patient]
        print(f"✅ PatientAdmin: {patient_admin}")
        
        # Test des méthodes list_display
        for field in patient_admin.list_display:
            print(f"   - {field}: {type(field)}")
            
    except Exception as e:
        print(f"❌ Erreur PatientAdmin: {e}")
    
    # Test 3: Test d'un patient spécifique
    print("\n3. TEST D'UN PATIENT...")
    try:
        patient = Patient.objects.first()
        if patient:
            print(f"✅ Patient trouvé: {patient}")
            print(f"   - get_full_name(): {patient.get_full_name()}")
            print(f"   - get_age(): {patient.get_age()}")
            print(f"   - gender: {patient.gender}")
            print(f"   - blood_type: {patient.blood_type}")
            print(f"   - status: {patient.status}")
            print(f"   - created_at: {patient.created_at}")
        else:
            print("❌ Aucun patient trouvé")
    except Exception as e:
        print(f"❌ Erreur patient: {e}")
    
    # Test 4: Test des méthodes admin
    print("\n4. TEST DES MÉTHODES ADMIN...")
    try:
        patient = Patient.objects.first()
        if patient:
            admin = site._registry[Patient]
            
            # Test get_full_name
            try:
                result = admin.get_full_name(patient)
                print(f"✅ get_full_name(): {result}")
            except Exception as e:
                print(f"❌ get_full_name(): {e}")
            
            # Test get_age
            try:
                result = admin.get_age(patient)
                print(f"✅ get_age(): {result}")
            except Exception as e:
                print(f"❌ get_age(): {e}")
                
    except Exception as e:
        print(f"❌ Erreur méthodes admin: {e}")
    
    # Test 5: Test des champs
    print("\n5. TEST DES CHAMPS...")
    try:
        patient = Patient.objects.first()
        if patient:
            for field in ['patient_id', 'first_name', 'last_name', 'ci', 'gender', 'blood_type', 'status', 'created_at']:
                try:
                    value = getattr(patient, field)
                    print(f"✅ {field}: {value} ({type(value)})")
                except Exception as e:
                    print(f"❌ {field}: {e}")
    except Exception as e:
        print(f"❌ Erreur champs: {e}")

if __name__ == "__main__":
    debug_admin_errors()
