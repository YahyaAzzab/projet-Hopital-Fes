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

print("=== CONFIGURATION DES PERMISSIONS MÉDECIN ===")
print()

# Récupérer le compte médecin
try:
    medecin = User.objects.get(username='medecin')
    print(f"Compte trouvé: {medecin.get_full_name()}")
    print(f"Rôle: {medecin.role}")
    print()
except User.DoesNotExist:
    print("❌ Compte médecin non trouvé!")
    exit()

# Supprimer toutes les permissions actuelles
medecin.user_permissions.clear()
print("✅ Permissions actuelles supprimées")

# Modules que le médecin doit pouvoir gérer
modules_medecin = [
    ('patients', 'patient'),      # Gestion des patients
    ('documents', 'document'),    # Gestion des documents
    ('reports', 'report'),        # Gestion des rapports
    ('activities', 'activity'),   # Suivi des activités (pour le dashboard)
]

# Permissions à attribuer (seulement view, add, change - pas delete pour la sécurité)
permission_types = ['view', 'add', 'change']

permissions_to_add = []

for app_label, model_name in modules_medecin:
    try:
        content_type = ContentType.objects.get(app_label=app_label, model=model_name)
        
        for perm_type in permission_types:
            try:
                perm = Permission.objects.get(
                    content_type=content_type,
                    codename=f'{perm_type}_{model_name}'
                )
                permissions_to_add.append(perm)
                print(f"✅ Permission ajoutée: {perm.codename} ({app_label}.{model_name})")
            except Permission.DoesNotExist:
                print(f"⚠️  Permission {perm_type}_{model_name} non trouvée")
                
    except ContentType.DoesNotExist:
        print(f"⚠️  Modèle {app_label}.{model_name} non trouvé")

print()

# Attribuer les permissions au médecin
medecin.user_permissions.set(permissions_to_add)
medecin.save()

print(f"✅ {len(permissions_to_add)} permissions attribuées au médecin")
print()

# Mettre à jour les permissions personnalisées dans le modèle User
medecin.permissions = [
    'dashboard',      # Accès au tableau de bord
    'patients',       # Gestion des patients
    'documents',      # Gestion des documents
    'reports',        # Gestion des rapports
    'scanner'         # Accès au scanner
]
medecin.save()

print("=== PERMISSIONS PERSONNALISÉES MÉDECIN ===")
print("Modules accessibles:")
print("  🏥 Dashboard - Tableau de bord principal")
print("  👥 Patients - Gestion des dossiers patients")
print("  📄 Documents - Gestion des documents médicaux")
print("  📊 Rapports - Gestion des rapports médicaux")
print("  🔍 Scanner - Scanner intelligent de documents")
print()

print("=== VÉRIFICATION DES PERMISSIONS ===")
user_permissions = medecin.user_permissions.all()
print(f"Permissions totales: {user_permissions.count()}")

for perm in user_permissions:
    print(f"  - {perm.codename} ({perm.content_type.app_label}.{perm.content_type.model})")

print()
print("=== RÉSULTAT ===")
print("Le médecin a maintenant accès uniquement aux modules médicaux!")
print("Modules accessibles: Dashboard, Patients, Documents, Rapports, Scanner")
print()
print("URL: http://127.0.0.1:8000/admin/")
print("Username: medecin")
print("Password: 123")
