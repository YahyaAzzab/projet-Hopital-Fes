# 🔐 GUIDE DE CONNEXION - HÔPITAL EL GHASSANI

## 🌐 Connexion Frontend (Interface Utilisateur)

### 🔗 Accès
- **URL** : http://127.0.0.1:8000/
- **Interface** : Moderne et intuitive

### 👤 Comptes de Connexion

#### 👑 Administrateur
- **Email** : `admin@hopital-elghassani.ma`
- **Mot de passe** : `admin123`
- **Accès** : Toutes les fonctionnalités

#### 👨‍⚕️ Médecin
- **Email** : `medecin@hopital-elghassani.ma`
- **Mot de passe** : `medecin123`
- **Accès** : Patients, Documents, Rapports

#### 👩‍⚕️ Infirmier
- **Email** : `infirmier@hopital-elghassani.ma`
- **Mot de passe** : `infirmier123`
- **Accès** : Dashboard infirmier (lecture seule)

#### 🔧 Technicien
- **Email** : `technicien@hopital-elghassani.ma`
- **Mot de passe** : `technicien123`
- **Accès** : Paramètres système

## 🏗️ Connexion Admin Django (Interface d'Administration)

### 🔗 Accès
- **URL** : http://127.0.0.1:8000/admin/
- **Interface** : Administration Django

### 👤 Comptes de Connexion

#### 👑 Administrateur
- **Nom d'utilisateur** : `admin`
- **Mot de passe** : `admin123`
- **Accès** : Tous les modules

#### 👨‍⚕️ Médecin
- **Nom d'utilisateur** : `medecin`
- **Mot de passe** : `medecin123`
- **Accès** : Patients, Documents, Rapports

#### 👩‍⚕️ Infirmier
- **Nom d'utilisateur** : `infirmier`
- **Mot de passe** : `infirmier123`
- **Accès** : Lecture seule

#### 🔧 Technicien
- **Nom d'utilisateur** : `technicien`
- **Mot de passe** : `technicien123`
- **Accès** : Paramètres système

## 🚀 Instructions de Connexion

### 🌐 Pour le Frontend
1. **Ouvrez votre navigateur**
2. **Allez sur** : http://127.0.0.1:8000/
3. **Entrez l'email** : `admin@hopital-elghassani.ma`
4. **Entrez le mot de passe** : `admin123`
5. **Cliquez sur** "SE CONNECTER"
6. **Vous accédez au dashboard** avec toutes les fonctionnalités

### 🏗️ Pour l'Admin Django
1. **Ouvrez votre navigateur**
2. **Allez sur** : http://127.0.0.1:8000/admin/
3. **Entrez le nom d'utilisateur** : `admin`
4. **Entrez le mot de passe** : `admin123`
5. **Cliquez sur** "Se connecter"
6. **Vous accédez à l'interface d'administration**

## ⚠️ Résolution des Problèmes

### ❌ "Utilisateur non trouvé"
**Solution** : Utilisez exactement les emails ci-dessus :
- `admin@hopital-elghassani.ma` (pas `admin@elghassani.ma`)

### ❌ "Email ou mot de passe incorrect"
**Vérifiez** :
- L'email est correct (avec `hopital-elghassani.ma`)
- Le mot de passe est correct (`admin123`)
- Pas d'espaces avant/après

### ❌ Page ne se charge pas
**Vérifiez** :
- Le serveur Django est démarré
- L'URL est correcte
- Pas de problème de réseau

## 🔄 Test de Connexion

### ✅ Test Rapide
1. **Frontend** : http://127.0.0.1:8000/ → `admin@hopital-elghassani.ma` / `admin123`
2. **Admin** : http://127.0.0.1:8000/admin/ → `admin` / `admin123`

### 🧪 Test Complet
```bash
# Tester le frontend
python test_login_frontend.py

# Tester l'admin
python test_simple_admin.py
```

## 📱 Fonctionnalités par Rôle

### 👑 Administrateur
- **Dashboard** complet avec statistiques
- **Gestion des patients** (CRUD complet)
- **Gestion des documents** (upload, visualisation)
- **Gestion des rapports** (création, modification)
- **Gestion des utilisateurs** (administration)
- **Paramètres système** (configuration)

### 👨‍⚕️ Médecin
- **Dashboard** avec données médicales
- **Gestion des patients** (création, modification)
- **Gestion des documents** (upload, consultation)
- **Gestion des rapports** (création, modification)
- **Pas d'accès** aux utilisateurs et paramètres

### 👩‍⚕️ Infirmier
- **Dashboard infirmier** (lecture seule)
- **Consultation des patients** (lecture seule)
- **Consultation des documents** (lecture seule)
- **Consultation des rapports** (lecture seule)
- **Pas de modification** des données

### 🔧 Technicien
- **Paramètres système** uniquement
- **Configuration** de la plateforme
- **Maintenance** technique
- **Pas d'accès** aux données médicales

## 🔐 Sécurité

### ⚠️ Important
- **Changez les mots de passe** en production
- **Ne partagez pas** les identifiants
- **Déconnectez-vous** après utilisation
- **Utilisez des mots de passe forts**

### 🔒 Mots de Passe Recommandés (Production)
- **admin** : `Admin@2024!`
- **medecin** : `Medecin@2024!`
- **infirmier** : `Infirmier@2024!`
- **technicien** : `Technicien@2024!`

## 📞 Support

### 🆘 En Cas de Problème
1. **Vérifiez les identifiants** ci-dessus
2. **Rechargez la page** (F5)
3. **Videz le cache** du navigateur
4. **Vérifiez que le serveur** est démarré
5. **Contactez l'administrateur** si nécessaire

### 📧 Contacts
- **Administrateur** : admin@hopital-elghassani.ma
- **Support IT** : support@hopital-elghassani.ma
- **Téléphone** : +212 5XX XXX XXX

---

## 🏥 HÔPITAL EL GHASSANI - GUIDE DE CONNEXION

**Plateforme de Numérisation Médicale**  
*Tous les comptes sont configurés et prêts à l'utilisation*

### 🎯 Résumé
- **Frontend** : http://127.0.0.1:8000/ (connexion par email)
- **Admin** : http://127.0.0.1:8000/admin/ (connexion par nom d'utilisateur)
- **Compte principal** : `admin@hopital-elghassani.ma` / `admin123`

**La connexion fonctionne maintenant parfaitement !** ✨
