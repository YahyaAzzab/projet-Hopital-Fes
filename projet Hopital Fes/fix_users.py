#!/usr/bin/env python
import os
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medical_backend.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Supprimer et recréer le compte médecin
if User.objects.filter(username='medecin').exists():
    User.objects.filter(username='medecin').delete()
    print("Ancien compte médecin supprimé")

# Créer le compte médecin
User.objects.create_user(
    username='medecin',
    email='medecin@elghassani.ma',
    password='medecin123',
    first_name='Dr. Fatima',
    last_name='Benjelloun',
    role='doctor',
    department='Médecine Générale',
    permissions=['dashboard', 'patients', 'documents', 'reports']
)
print("Nouveau compte médecin créé!")

# Vérifier que le compte existe
medecin = User.objects.get(username='medecin')
print(f"Compte créé: {medecin.username}")
print(f"Email: {medecin.email}")
print(f"Rôle: {medecin.role}")
print(f"Actif: {medecin.is_active}")

# Tester la connexion
from django.contrib.auth import authenticate
user = authenticate(username='medecin', password='medecin123')
if user:
    print("✅ Connexion réussie!")
else:
    print("❌ Échec de la connexion")

print("\nComptes disponibles:")
for user in User.objects.all():
    print(f"- {user.username} ({user.role}) - Actif: {user.is_active}")
