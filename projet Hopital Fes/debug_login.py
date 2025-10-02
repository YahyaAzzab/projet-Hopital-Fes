#!/usr/bin/env python
import os
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medical_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate

User = get_user_model()

print("=== DIAGNOSTIC DE CONNEXION ===")
print()

# Vérifier tous les utilisateurs
print("1. Utilisateurs existants :")
for user in User.objects.all():
    print(f"   - {user.username} | {user.email} | Actif: {user.is_active} | Staff: {user.is_staff} | Superuser: {user.is_superuser}")
    print(f"     Rôle: {user.role} | Département: {user.department}")
    print(f"     Permissions: {user.permissions}")
    print()

# Tester la connexion avec différents comptes
print("2. Test de connexion :")
test_accounts = [
    ('admin', 'admin123'),
    ('medecin', 'medecin123'),
    ('infirmier', 'infirmier123'),
    ('technicien', 'technicien123')
]

for username, password in test_accounts:
    user = authenticate(username=username, password=password)
    if user:
        print(f"   ✅ {username}: Connexion réussie")
        print(f"      - Actif: {user.is_active}")
        print(f"      - Staff: {user.is_staff}")
        print(f"      - Superuser: {user.is_superuser}")
    else:
        print(f"   ❌ {username}: Échec de connexion")

print()

# Vérifier spécifiquement le compte médecin
print("3. Détails du compte médecin :")
try:
    medecin = User.objects.get(username='medecin')
    print(f"   - Username: {medecin.username}")
    print(f"   - Email: {medecin.email}")
    print(f"   - Password hash: {medecin.password[:50]}...")
    print(f"   - is_active: {medecin.is_active}")
    print(f"   - is_staff: {medecin.is_staff}")
    print(f"   - is_superuser: {medecin.is_superuser}")
    print(f"   - has_usable_password: {medecin.has_usable_password()}")
    
    # Tester le mot de passe
    check_password = medecin.check_password('medecin123')
    print(f"   - check_password('medecin123'): {check_password}")
    
except User.DoesNotExist:
    print("   ❌ Compte médecin n'existe pas!")

print()

# Recréer le compte médecin avec un mot de passe simple
print("4. Recréation du compte médecin :")
if User.objects.filter(username='medecin').exists():
    User.objects.filter(username='medecin').delete()
    print("   Ancien compte supprimé")

# Créer avec un mot de passe très simple
medecin = User.objects.create_user(
    username='medecin',
    email='medecin@elghassani.ma',
    password='123',  # Mot de passe très simple
    first_name='Dr. Fatima',
    last_name='Benjelloun',
    role='doctor',
    department='Médecine Générale',
    permissions=['dashboard', 'patients', 'documents', 'reports'],
    is_staff=True,  # Important pour l'admin
    is_active=True
)

print("   Nouveau compte créé avec mot de passe '123'")

# Tester la nouvelle connexion
user = authenticate(username='medecin', password='123')
if user:
    print("   ✅ Connexion réussie avec le nouveau compte!")
else:
    print("   ❌ Échec de connexion avec le nouveau compte")

print()
print("=== NOUVELLES DONNÉES DE CONNEXION ===")
print("Username: medecin")
print("Password: 123")
print("URL: http://127.0.0.1:8000/admin/")
