#!/usr/bin/env python
import os
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medical_backend.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

print("=== CORRECTION DU STATUT TECHNICIEN ===")
print()

# Récupérer le compte technicien
try:
    technicien = User.objects.get(username='technicien')
    print(f"Compte trouvé: {technicien.get_full_name()}")
    print(f"Rôle: {technicien.role}")
    print(f"is_staff actuel: {technicien.is_staff}")
    print()
except User.DoesNotExist:
    print("❌ Compte technicien non trouvé!")
    exit()

# Activer le statut staff pour l'accès admin
technicien.is_staff = True
technicien.is_active = True
technicien.save()

print("✅ Statut staff activé pour le technicien")
print(f"is_staff: {technicien.is_staff}")
print(f"is_active: {technicien.is_active}")
print()

print("=== RÉSULTAT ===")
print("Le technicien peut maintenant se connecter à l'admin Django!")
print()
print("URL: http://127.0.0.1:8000/admin/")
print("Username: technicien")
print("Password: technicien123")
print()
print("Modules accessibles:")
print("  ⚙️ Paramètres - Configuration de la plateforme")
print("  📊 Activités - Monitoring des activités système")
