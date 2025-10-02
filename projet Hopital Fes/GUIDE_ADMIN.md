# 🏥 GUIDE D'UTILISATION - ADMIN DJANGO

## 📋 Comment Créer des Éléments dans l'Admin

### 🔗 Accès à l'Admin
1. Allez sur : http://127.0.0.1:8000/admin/
2. Connectez-vous avec : **admin** / **admin123**

### 👤 Créer un Patient

1. **Cliquez sur "Patients"** dans le menu principal
2. **Cliquez sur "Ajouter Patient"** (bouton vert en haut à droite)
3. **Remplissez le formulaire** :
   - **ID Patient** : PAT001, PAT002, etc. (obligatoire)
   - **Prénom** : Ahmed, Fatima, etc. (obligatoire)
   - **Nom** : Alami, Benali, etc. (obligatoire)
   - **Carte d'identité** : A123456789 (obligatoire, unique)
   - **Date de naissance** : 1985-03-15 (obligatoire)
   - **Genre** : Masculin/Féminin (obligatoire)
   - **Téléphone** : +212612345678 (optionnel)
   - **Email** : ahmed.alami@email.com (optionnel)
   - **Adresse** : 123 Rue Hassan II, Casablanca (optionnel)
   - **Ville** : Casablanca (optionnel)
   - **Groupe sanguin** : O+, A+, B+, etc. (optionnel)
   - **Contact d'urgence** : +212612345679 (optionnel)
   - **Assurance** : CNSS, RAM, etc. (optionnel)
   - **Allergies** : Pénicilline, Aspirine, etc. (optionnel)
   - **Antécédents médicaux** : Hypertension, Diabète, etc. (optionnel)
   - **Profession** : Ingénieur, Médecin, etc. (optionnel)
   - **État civil** : Célibataire, Marié, etc. (optionnel)
   - **Notes** : Notes médicales (optionnel)
   - **Statut** : Actif (par défaut)
4. **Cliquez sur "Enregistrer"**

### 📄 Créer un Document

1. **Cliquez sur "Documents"** dans le menu principal
2. **Cliquez sur "Ajouter Document"** (bouton vert)
3. **Remplissez le formulaire** :
   - **Titre** : Radiographie thoracique (obligatoire)
   - **Type de document** : Radiologie, Biologie, etc. (obligatoire)
   - **Patient** : Sélectionnez un patient (obligatoire)
   - **Fichier** : Uploadez un fichier (obligatoire)
   - **Description** : Description du document (optionnel)
4. **Cliquez sur "Enregistrer"**

### 📊 Créer un Rapport

1. **Cliquez sur "Rapports"** dans le menu principal
2. **Cliquez sur "Ajouter Rapport"** (bouton vert)
3. **Remplissez le formulaire** :
   - **Titre** : Rapport de consultation (obligatoire)
   - **Type de rapport** : Consultation, Hospitalisation, etc. (obligatoire)
   - **Patient** : Sélectionnez un patient (obligatoire)
   - **Médecin** : Sélectionnez un médecin (obligatoire)
   - **Date du rapport** : 2025-09-28 (obligatoire)
   - **Résumé** : Résumé du rapport (obligatoire)
   - **Détails** : Détails du rapport (obligatoire)
   - **Priorité** : Faible, Normal, Élevé, etc. (optionnel)
4. **Cliquez sur "Enregistrer"**

### 👥 Créer un Utilisateur

1. **Cliquez sur "Utilisateurs"** dans le menu principal
2. **Cliquez sur "Ajouter Utilisateur"** (bouton vert)
3. **Remplissez le formulaire** :
   - **Nom d'utilisateur** : nom_utilisateur (obligatoire)
   - **Mot de passe** : motdepasse123 (obligatoire)
   - **Confirmation du mot de passe** : motdepasse123 (obligatoire)
   - **Prénom** : Ahmed (optionnel)
   - **Nom** : Alami (optionnel)
   - **Email** : ahmed.alami@email.com (optionnel)
   - **Actif** : ✓ (recommandé)
   - **Personnel** : ✓ (pour accéder à l'admin)
   - **Superutilisateur** : ✓ (pour les administrateurs)
4. **Cliquez sur "Enregistrer"**

## 🎨 Design et Interface

### ✨ Fonctionnalités du Design
- **Interface moderne** avec design identique au frontend
- **Couleurs cohérentes** : Bleu, violet, vert médical
- **Formulaires élégants** avec validation visuelle
- **Boutons stylisés** avec effets hover
- **Messages d'erreur** clairs et colorés
- **Responsive** : S'adapte à tous les écrans

### 🔍 Navigation
- **Menu principal** : Accès à tous les modules
- **Boutons d'action** : Ajouter, Modifier, Supprimer
- **Recherche** : Trouvez rapidement les éléments
- **Filtres** : Filtrez par critères
- **Pagination** : Naviguez dans les grandes listes

## 📊 Données de Démonstration

### 👤 Patients Existants
- **Ahmed Alami** (PAT001) - Ingénieur, Hypertension
- **Fatima Benali** (PAT002) - Enseignante, Diabète
- **Mohammed Chraibi** (PAT003) - Commerçant, Asthme
- **Aicha Dahbi** (PAT004) - Étudiante, Première consultation
- **Youssef El Fassi** (PAT005) - Médecin, Suivi préventif

### 📄 Documents Existants
- Radiographie thoracique
- Analyse sanguine complète
- Échographie abdominale
- ECG de repos
- Consultation cardiologique

### 📊 Rapports Existants
- Rapport de consultation cardiologique
- Rapport d'hospitalisation
- Rapport de sortie

### 👥 Utilisateurs Existants
- **admin** / admin123 (Administrateur)
- **medecin** / medecin123 (Médecin)
- **infirmier** / infirmier123 (Infirmier)
- **technicien** / technicien123 (Technicien)

## 🔧 Rôles et Permissions

### 👑 Administrateur (admin)
- **Accès complet** à tous les modules
- **Création, modification, suppression** de tous les éléments
- **Gestion des utilisateurs** et permissions
- **Configuration système**

### 👨‍⚕️ Médecin (medecin)
- **Gestion des patients** : Création, modification, consultation
- **Gestion des documents** : Upload, visualisation
- **Gestion des rapports** : Création, modification
- **Pas d'accès** aux utilisateurs et paramètres

### 👩‍⚕️ Infirmier (infirmier)
- **Lecture seule** des patients, documents, rapports
- **Pas de modification** des données
- **Vue d'ensemble** des informations médicales

### 🔧 Technicien (technicien)
- **Accès uniquement** aux paramètres système
- **Configuration** de la plateforme
- **Maintenance** technique

## 🚀 Conseils d'Utilisation

### ✅ Bonnes Pratiques
1. **Utilisez des ID uniques** pour les patients (PAT001, PAT002, etc.)
2. **Remplissez les champs obligatoires** marqués d'un astérisque (*)
3. **Sauvegardez régulièrement** vos modifications
4. **Vérifiez les données** avant de sauvegarder
5. **Utilisez des descriptions claires** pour les documents

### ⚠️ Points d'Attention
1. **Les champs marqués (*) sont obligatoires**
2. **Les ID patients doivent être uniques**
3. **Les cartes d'identité doivent être uniques**
4. **Vérifiez les formats de date** (YYYY-MM-DD)
5. **Les mots de passe doivent être sécurisés**

## 🆘 Support et Aide

### 🔍 En Cas de Problème
1. **Vérifiez les champs obligatoires**
2. **Assurez-vous que les ID sont uniques**
3. **Vérifiez les formats de données**
4. **Rechargez la page** si nécessaire
5. **Contactez l'administrateur** si le problème persiste

### 📞 Contacts
- **Administrateur** : admin@hopital-elghassani.ma
- **Support technique** : support@hopital-elghassani.ma
- **Téléphone** : +212 5XX XXX XXX

---

**🏥 HÔPITAL EL GHASSANI - PLATEFORME DE NUMÉRISATION MÉDICALE**  
*Guide d'utilisation de l'interface d'administration Django*
