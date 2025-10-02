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

print("=== ATTRIBUTION DES PERMISSIONS ===")
print()

# Récupérer le compte médecin
try:
    medecin = User.objects.get(username='medecin')
    print(f"Compte trouvé: {medecin.get_full_name()}")
    print(f"Rôle: {medecin.role}")
    print(f"is_staff: {medecin.is_staff}")
    print()
except User.DoesNotExist:
    print("❌ Compte médecin non trouvé!")
    exit()

# Récupérer tous les modèles de notre application
models = [
    ('users', 'user'),
    ('patients', 'patient'),
    ('documents', 'document'),
    ('reports', 'report'),
    ('activities', 'activity'),
]

# Permissions à attribuer
permissions_to_add = []

for app_label, model_name in models:
    try:
        content_type = ContentType.objects.get(app_label=app_label, model=model_name)
        
        # Permissions de base pour chaque modèle
        model_permissions = Permission.objects.filter(content_type=content_type)
        
        for perm in model_permissions:
            permissions_to_add.append(perm)
            print(f"✅ Permission ajoutée: {perm.codename} ({app_label}.{model_name})")
            
    except ContentType.DoesNotExist:
        print(f"⚠️  Modèle {app_label}.{model_name} non trouvé")

print()

# Attribuer toutes les permissions au médecin
medecin.user_permissions.set(permissions_to_add)
medecin.save()

print(f"✅ {len(permissions_to_add)} permissions attribuées au compte médecin")
print()

# Vérifier les permissions
print("=== VÉRIFICATION DES PERMISSIONS ===")
user_permissions = medecin.user_permissions.all()
print(f"Permissions totales: {user_permissions.count()}")

for perm in user_permissions[:10]:  # Afficher les 10 premières
    print(f"  - {perm.codename} ({perm.content_type.app_label}.{perm.content_type.model})")

if user_permissions.count() > 10:
    print(f"  ... et {user_permissions.count() - 10} autres permissions")

print()
print("=== RÉSULTAT ===")
print("Le compte médecin a maintenant accès à tous les modèles!")
print("Rafraîchissez la page d'administration pour voir les changements.")
print()
print("URL: http://127.0.0.1:8000/admin/")
print("Username: medecin")
print("Password: 123")
