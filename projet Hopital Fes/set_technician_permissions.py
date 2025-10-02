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

print("=== CONFIGURATION DES PERMISSIONS TECHNICIEN ===")
print()

# Récupérer le compte technicien
try:
    technicien = User.objects.get(username='technicien')
    print(f"Compte trouvé: {technicien.get_full_name()}")
    print(f"Rôle: {technicien.role}")
    print()
except User.DoesNotExist:
    print("❌ Compte technicien non trouvé!")
    exit()

# Supprimer toutes les permissions actuelles
technicien.user_permissions.clear()
print("✅ Permissions actuelles supprimées")

# Le technicien n'a pas besoin de permissions sur les modèles spécifiques
# Il gère les paramètres système et la maintenance
# On peut lui donner accès aux activités pour le monitoring

technician_modules = [
    ('activities', 'activity'),    # Monitoring des activités système
]

# Permissions à attribuer (view et change pour le monitoring)
permission_types = ['view', 'change']

permissions_to_add = []

for app_label, model_name in technician_modules:
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

# Attribuer les permissions au technicien
technicien.user_permissions.set(permissions_to_add)
technicien.save()

print(f"✅ {len(permissions_to_add)} permissions attribuées au technicien")
print()

# Mettre à jour les permissions personnalisées dans le modèle User
technicien.permissions = [
    'settings'  # Accès uniquement aux paramètres de la plateforme
]
technicien.save()

print("=== PERMISSIONS PERSONNALISÉES TECHNICIEN ===")
print("Modules accessibles:")
print("  ⚙️ Paramètres - Configuration de la plateforme")
print("  📊 Activités - Monitoring des activités système")
print()

print("=== VÉRIFICATION DES PERMISSIONS ===")
user_permissions = technicien.user_permissions.all()
print(f"Permissions totales: {user_permissions.count()}")

for perm in user_permissions:
    print(f"  - {perm.codename} ({perm.content_type.app_label}.{perm.content_type.model})")

print()
print("=== RÉSULTAT ===")
print("Le technicien a maintenant accès uniquement aux paramètres de la plateforme!")
print("Accès: Configuration système et monitoring")
print()
print("URL: http://127.0.0.1:8000/admin/")
print("Username: technicien")
print("Password: technicien123")
