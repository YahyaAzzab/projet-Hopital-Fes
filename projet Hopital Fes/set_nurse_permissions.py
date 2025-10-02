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

print("=== CONFIGURATION DES PERMISSIONS INFIRMIÈRE ===")
print()

# Récupérer le compte infirmière
try:
    infirmier = User.objects.get(username='infirmier')
    print(f"Compte trouvé: {infirmier.get_full_name()}")
    print(f"Rôle: {infirmier.role}")
    print()
except User.DoesNotExist:
    print("❌ Compte infirmière non trouvé!")
    exit()

# Supprimer toutes les permissions actuelles
infirmier.user_permissions.clear()
print("✅ Permissions actuelles supprimées")

# Modules que l'infirmière doit pouvoir consulter (lecture seule)
nurse_modules = [
    ('patients', 'patient'),      # Consultation des patients
    ('documents', 'document'),    # Consultation des documents
]

# Permissions à attribuer (seulement view - lecture seule)
permission_types = ['view']

permissions_to_add = []

for app_label, model_name in nurse_modules:
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

# Attribuer les permissions à l'infirmière
infirmier.user_permissions.set(permissions_to_add)
infirmier.save()

print(f"✅ {len(permissions_to_add)} permissions attribuées à l'infirmière")
print()

# Mettre à jour les permissions personnalisées dans le modèle User
infirmier.permissions = [
    'dashboard',           # Accès au tableau de bord
    'patients_view',       # Consultation des patients (lecture seule)
    'documents_view'       # Consultation des documents (lecture seule)
]
infirmier.save()

print("=== PERMISSIONS PERSONNALISÉES INFIRMIÈRE ===")
print("Modules accessibles:")
print("  🏥 Dashboard - Tableau de bord principal")
print("  👥 Patients - Consultation des dossiers patients (LECTURE SEULE)")
print("  📄 Documents - Consultation des documents médicaux (LECTURE SEULE)")
print()

print("=== VÉRIFICATION DES PERMISSIONS ===")
user_permissions = infirmier.user_permissions.all()
print(f"Permissions totales: {user_permissions.count()}")

for perm in user_permissions:
    print(f"  - {perm.codename} ({perm.content_type.app_label}.{perm.content_type.model})")

print()
print("=== RÉSULTAT ===")
print("L'infirmière a maintenant accès uniquement aux modules Patients et Documents!")
print("Accès: LECTURE SEULE (pas de création, modification ou suppression)")
print()
print("URL: http://127.0.0.1:8000/admin/")
print("Username: infirmier")
print("Password: infirmier123")
