#!/usr/bin/env python
import os
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medical_backend.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Créer le superutilisateur
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser(
        username='admin',
        email='admin@elghassani.ma',
        password='admin123',
        first_name='Administrateur',
        last_name='Système',
        role='admin',
        department='Administration'
    )
    print("Superutilisateur créé avec succès!")
    print("Username: admin")
    print("Password: admin123")
else:
    print("Le superutilisateur existe déjà!")

# Créer quelques utilisateurs de démonstration
if not User.objects.filter(username='medecin').exists():
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
    print("Utilisateur médecin créé!")

if not User.objects.filter(username='infirmier').exists():
    User.objects.create_user(
        username='infirmier',
        email='infirmier@elghassani.ma',
        password='infirmier123',
        first_name='Aicha',
        last_name='Idrissi',
        role='nurse',
        department='Soins',
        permissions=['patients_view', 'documents_view', 'reports_view', 'dashboard']
    )
    print("Utilisateur infirmier créé!")

if not User.objects.filter(username='technicien').exists():
    User.objects.create_user(
        username='technicien',
        email='technicien@elghassani.ma',
        password='technicien123',
        first_name='Mohammed',
        last_name='Alaoui',
        role='technician',
        department='Informatique',
        permissions=['settings', 'documents']
    )
    print("Utilisateur technicien créé!")

print("\nTous les utilisateurs de démonstration ont été créés!")
print("Vous pouvez maintenant démarrer le serveur avec: python manage.py runserver")
