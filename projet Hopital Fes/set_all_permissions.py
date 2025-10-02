#!/usr/bin/env python
import os
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medical_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType

User = get_user_model()

print("=== CONFIGURATION DES PERMISSIONS POUR TOUS LES RÔLES ===")
print()

# Fonction pour attribuer des permissions
def set_user_permissions(username, modules, permission_types=['view', 'add', 'change']):
    try:
        user = User.objects.get(username=username)
        print(f"\n👤 Configuration pour {user.get_full_name()} ({user.role}):")
        
        # Supprimer toutes les permissions actuelles
        user.user_permissions.clear()
        
        permissions_to_add = []
        
        for app_label, model_name in modules:
            try:
                content_type = ContentType.objects.get(app_label=app_label, model=model_name)
                
                for perm_type in permission_types:
                    try:
                        perm = Permission.objects.get(
                            content_type=content_type,
                            codename=f'{perm_type}_{model_name}'
                        )
                        permissions_to_add.append(perm)
                        print(f"  ✅ {perm.codename}")
                    except Permission.DoesNotExist:
                        print(f"  ⚠️  {perm_type}_{model_name} non trouvé")
                        
            except ContentType.DoesNotExist:
                print(f"  ⚠️  Modèle {app_label}.{model_name} non trouvé")
        
        # Attribuer les permissions
        user.user_permissions.set(permissions_to_add)
        user.save()
        
        print(f"  📊 {len(permissions_to_add)} permissions attribuées")
        
    except User.DoesNotExist:
        print(f"❌ Utilisateur {username} non trouvé!")

# 1. ADMINISTRATEUR - Accès complet
print("1. ADMINISTRATEUR")
admin_modules = [
    ('users', 'user'),
    ('patients', 'patient'),
    ('documents', 'document'),
    ('reports', 'report'),
    ('activities', 'activity'),
]
set_user_permissions('admin', admin_modules, ['view', 'add', 'change', 'delete'])

# Mettre à jour les permissions personnalisées pour l'admin
admin = User.objects.get(username='admin')
admin.permissions = [
    'dashboard', 'patients', 'documents', 'scanner', 
    'reports', 'users', 'settings'
]
admin.save()

# 2. MÉDECIN - Modules médicaux
print("\n2. MÉDECIN")
doctor_modules = [
    ('patients', 'patient'),
    ('documents', 'document'),
    ('reports', 'report'),
    ('activities', 'activity'),
]
set_user_permissions('medecin', doctor_modules, ['view', 'add', 'change'])

# Mettre à jour les permissions personnalisées pour le médecin
medecin = User.objects.get(username='medecin')
medecin.permissions = [
    'dashboard', 'patients', 'documents', 'reports', 'scanner'
]
medecin.save()

# 3. INFIRMIÈRE - Lecture seule
print("\n3. INFIRMIÈRE")
nurse_modules = [
    ('patients', 'patient'),
    ('documents', 'document'),
    ('reports', 'report'),
    ('activities', 'activity'),
]
set_user_permissions('infirmier', nurse_modules, ['view'])  # Seulement lecture

# Mettre à jour les permissions personnalisées pour l'infirmière
infirmier = User.objects.get(username='infirmier')
infirmier.permissions = [
    'dashboard', 'patients_view', 'documents_view', 'reports_view'
]
infirmier.save()

# 4. TECHNICIEN - Maintenance et documents
print("\n4. TECHNICIEN")
technician_modules = [
    ('documents', 'document'),
    ('activities', 'activity'),
]
set_user_permissions('technicien', technician_modules, ['view', 'add', 'change'])

# Mettre à jour les permissions personnalisées pour le technicien
technicien = User.objects.get(username='technicien')
technicien.permissions = [
    'settings', 'documents', 'scanner'
]
technicien.save()

print("\n=== RÉSUMÉ DES PERMISSIONS ===")
print("🔑 ADMINISTRATEUR:")
print("  - Accès complet à tous les modules")
print("  - Peut créer, modifier, supprimer et consulter")
print("  - Gestion des utilisateurs et paramètres")

print("\n👨‍⚕️ MÉDECIN:")
print("  - Dashboard, Patients, Documents, Rapports, Scanner")
print("  - Peut créer, modifier et consulter")
print("  - Pas de suppression (sécurité médicale)")

print("\n👩‍⚕️ INFIRMIÈRE:")
print("  - Dashboard, Patients (lecture), Documents (lecture), Rapports (lecture)")
print("  - Consultation uniquement")
print("  - Pas de modification des données médicales")

print("\n🔧 TECHNICIEN:")
print("  - Paramètres, Documents, Scanner")
print("  - Maintenance du système")
print("  - Gestion technique des documents")

print("\n✅ Configuration terminée!")
print("Rafraîchissez les pages d'administration pour voir les changements.")
