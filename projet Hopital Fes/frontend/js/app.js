// Plateforme de Numérisation Médicale - Application Principale
class MedicalDigitizationApp {
    constructor() {
        this.currentUser = null;
        this.currentPage = 'dashboard';
        this.data = {
            patients: [],
            documents: [],
            reports: [],
            users: [],
            activities: [] // Nouveau: système d'activité récente
        };
        
        this.init();
    }

    async init() {
        console.log('Initialisation de l\'application...');
        this.checkAuth();
        this.initEvents();
        this.startSystemTime();
        this.loadSettings();
        await this.loadDataFromBackend();
        console.log('Application initialisée avec succès');
    }

    async loadDataFromBackend() {
        console.log('Chargement des données depuis le backend...');
        try {
            // Charger les patients
            const patientsResponse = await fetch('/api/patients/');
            if (patientsResponse.ok) {
                const patientsData = await patientsResponse.json();
                this.data.patients = patientsData.map(patient => ({
                    id: patient.id,
                    patientId: patient.patient_id,
                    firstName: patient.first_name,
                    lastName: patient.last_name,
                    ci: patient.ci || '',
                    dateOfBirth: patient.date_of_birth,
                    age: this.calculateAge(patient.date_of_birth),
                    gender: patient.gender,
                    phone: patient.phone_number,
                    email: patient.email,
                    address: patient.address,
                    city: patient.city,
                    bloodType: patient.blood_type,
                    emergencyContact: patient.emergency_contact,
                    insurance: patient.insurance_provider,
                    allergies: patient.allergies,
                    medicalHistory: patient.medical_history,
                    occupation: patient.occupation,
                    maritalStatus: patient.marital_status,
                    notes: patient.notes,
                    status: patient.status,
                    documentsCount: 0, // À calculer
                    lastVisit: patient.updated_at,
                    createdAt: patient.created_at
                }));
                console.log(`✅ ${this.data.patients.length} patients chargés depuis le backend`);
            } else {
                console.log('⚠️ Impossible de charger les patients, utilisation des données de démonstration');
                this.initDemoData();
            }
        } catch (error) {
            console.log('⚠️ Erreur lors du chargement des données, utilisation des données de démonstration:', error);
            this.initDemoData();
        }
    }

    calculateAge(dateOfBirth) {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    getCSRFToken() {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'csrftoken') {
                return value;
            }
        }
        return '';
    }

    initDemoData() {
        console.log('Initialisation des données de démonstration...');
        
        // Patients marocains de démonstration - 10 patients complets
        this.data.patients = [
            {
                id: 1, patientId: 'PAT2025001', firstName: 'Mohammed', lastName: 'Benali',
                ci: 'AB123456', dateOfBirth: '1985-03-15', age: 39, gender: 'male',
                phone: '+212 6 12 34 56 78', email: 'mohammed.benali@gmail.com',
                address: '123 Rue Hassan II, Casablanca', city: 'Casablanca', bloodType: 'A+',
                emergencyContact: 'Fatima Benali - 0666666666', insurance: 'CNSS',
                allergies: 'Aucune allergie connue', medicalHistory: 'Hypertension contrôlée depuis 2020',
                occupation: 'Ingénieur', maritalStatus: 'Marié', notes: 'Patient régulier, très coopératif',
                status: 'active', documentsCount: 5, lastVisit: '2025-01-15', createdAt: '2025-01-01T10:00:00Z'
            },
            {
                id: 2, patientId: 'PAT2025002', firstName: 'Fatima', lastName: 'Alaoui',
                ci: 'FA789012', dateOfBirth: '1990-07-22', age: 34, gender: 'female',
                phone: '+212 6 98 76 54 32', email: 'fatima.alaoui@yahoo.com',
                address: '456 Avenue Mohammed V, Rabat', city: 'Rabat', bloodType: 'B+',
                emergencyContact: 'Ahmed Alaoui - 0655555555', insurance: 'RAMED',
                allergies: 'Pénicilline, Aspirine', medicalHistory: 'Diabète type 2, Asthme léger',
                occupation: 'Enseignante', maritalStatus: 'Célibataire', notes: 'Nouvelle patiente, suivi régulier nécessaire',
                status: 'active', documentsCount: 3, lastVisit: '2025-01-20', createdAt: '2025-01-05T14:30:00Z'
            },
            {
                id: 3, patientId: 'PAT2025003', firstName: 'Youssef', lastName: 'Tazi',
                ci: 'YT345678', dateOfBirth: '1978-11-08', age: 45, gender: 'male',
                phone: '+212 6 44 33 22 11', email: 'youssef.tazi@outlook.com',
                address: '789 Boulevard Zerktouni, Marrakech', city: 'Marrakech', bloodType: 'O+',
                emergencyContact: 'Aicha Tazi - 0644444444', insurance: 'CNSS',
                allergies: 'Aucune', medicalHistory: 'Chirurgie cardiaque en 2019, Suivi cardiologique',
                occupation: 'Commerçant', maritalStatus: 'Marié', notes: 'Patient à risque, surveillance rapprochée',
                status: 'active', documentsCount: 8, lastVisit: '2025-01-18', createdAt: '2025-01-03T09:15:00Z'
            },
            {
                id: 4, patientId: 'PAT2025004', firstName: 'Aicha', lastName: 'Bennani',
                ci: 'AB901234', dateOfBirth: '1995-04-12', age: 29, gender: 'female',
                phone: '+212 6 77 88 99 00', email: 'aicha.bennani@gmail.com',
                address: '321 Rue de la Paix, Fès', city: 'Fès', bloodType: 'AB+',
                emergencyContact: 'Hassan Bennani - 0633333333', insurance: 'Assurance privée',
                allergies: 'Latex', medicalHistory: 'Grossesse à risque, Anémie ferriprive',
                occupation: 'Infirmière', maritalStatus: 'Mariée', notes: 'Femme enceinte, suivi gynécologique',
                status: 'active', documentsCount: 4, lastVisit: '2025-01-22', createdAt: '2025-01-08T16:45:00Z'
            },
            {
                id: 5, patientId: 'PAT2025005', firstName: 'Hassan', lastName: 'Chraibi',
                ci: 'HC567890', dateOfBirth: '1965-12-03', age: 58, gender: 'male',
                phone: '+212 6 22 33 44 55', email: 'hassan.chraibi@hotmail.com',
                address: '654 Avenue des Nations Unies, Agadir', city: 'Agadir', bloodType: 'A-',
                emergencyContact: 'Khadija Chraibi - 0622222222', insurance: 'CNSS',
                allergies: 'Iode, Crustacés', medicalHistory: 'Cancer du poumon en rémission, Diabète',
                occupation: 'Retraité', maritalStatus: 'Marié', notes: 'Patient oncologique, suivi spécialisé',
                status: 'active', documentsCount: 12, lastVisit: '2025-01-19', createdAt: '2025-01-02T11:20:00Z'
            },
            {
                id: 6, patientId: 'PAT2025006', firstName: 'Khadija', lastName: 'Idrissi',
                ci: 'KI234567', dateOfBirth: '1988-09-25', age: 35, gender: 'female',
                phone: '+212 6 55 66 77 88', email: 'khadija.idrissi@yahoo.fr',
                address: '987 Rue Ibn Battuta, Tanger', city: 'Tanger', bloodType: 'B-',
                emergencyContact: 'Omar Idrissi - 0611111111', insurance: 'RAMED',
                allergies: 'Aucune', medicalHistory: 'Migraines chroniques, Dépression',
                occupation: 'Fonctionnaire', maritalStatus: 'Divorcée', notes: 'Traitement psychiatrique en cours',
                status: 'active', documentsCount: 6, lastVisit: '2025-01-21', createdAt: '2025-01-06T13:10:00Z'
            },
            {
                id: 7, patientId: 'PAT2025007', firstName: 'Omar', lastName: 'Rachidi',
                ci: 'OR678901', dateOfBirth: '1992-06-14', age: 32, gender: 'male',
                phone: '+212 6 99 88 77 66', email: 'omar.rachidi@gmail.com',
                address: '147 Rue de la Liberté, Meknès', city: 'Meknès', bloodType: 'O-',
                emergencyContact: 'Zineb Rachidi - 0699999999', insurance: 'Assurance privée',
                allergies: 'Pollen, Acariens', medicalHistory: 'Asthme sévère, Rhinite allergique',
                occupation: 'Médecin', maritalStatus: 'Célibataire', notes: 'Colleague médical, suivi spécialisé',
                status: 'active', documentsCount: 7, lastVisit: '2025-01-17', createdAt: '2025-01-04T08:30:00Z'
            },
            {
                id: 8, patientId: 'PAT2025008', firstName: 'Zineb', lastName: 'Mansouri',
                ci: 'ZM345678', dateOfBirth: '1983-01-30', age: 41, gender: 'female',
                phone: '+212 6 11 22 33 44', email: 'zineb.mansouri@outlook.com',
                address: '258 Avenue Mohammed VI, Oujda', city: 'Oujda', bloodType: 'A+',
                emergencyContact: 'Mohammed Mansouri - 0688888888', insurance: 'CNSS',
                allergies: 'Sulfamides', medicalHistory: 'Lupus érythémateux, Insuffisance rénale',
                occupation: 'Avocate', maritalStatus: 'Mariée', notes: 'Maladie auto-immune, suivi rhumatologique',
                status: 'active', documentsCount: 9, lastVisit: '2025-01-16', createdAt: '2025-01-07T15:25:00Z'
            },
            {
                id: 9, patientId: 'PAT2025009', firstName: 'Karim', lastName: 'Bouazza',
                ci: 'KB456789', dateOfBirth: '1975-08-17', age: 48, gender: 'male',
                phone: '+212 6 33 44 55 66', email: 'karim.bouazza@yahoo.com',
                address: '369 Rue de la République, Tétouan', city: 'Tétouan', bloodType: 'AB-',
                emergencyContact: 'Naima Bouazza - 0677777777', insurance: 'RAMED',
                allergies: 'Aucune', medicalHistory: 'Hépatite C chronique, Cirrhose compensée',
                occupation: 'Artisan', maritalStatus: 'Marié', notes: 'Maladie hépatique, suivi gastro-entérologique',
                status: 'active', documentsCount: 11, lastVisit: '2025-01-14', createdAt: '2025-01-09T12:40:00Z'
            },
            {
                id: 10, patientId: 'PAT2025010', firstName: 'Naima', lastName: 'El Fassi',
                ci: 'NF567890', dateOfBirth: '1998-03-05', age: 26, gender: 'female',
                phone: '+212 6 66 77 88 99', email: 'naima.elfassi@gmail.com',
                address: '741 Avenue Hassan II, Salé', city: 'Salé', bloodType: 'B+',
                emergencyContact: 'Ahmed El Fassi - 0644444444', insurance: 'Assurance privée',
                allergies: 'Aucune', medicalHistory: 'Aucun antécédent médical',
                occupation: 'Étudiante en médecine', maritalStatus: 'Célibataire', notes: 'Étudiante en médecine, première consultation',
                status: 'active', documentsCount: 2, lastVisit: '2025-01-23', createdAt: '2025-01-10T10:00:00Z'
            }
        ];

        // Documents de démonstration - 15 documents complets
        this.data.documents = [
            {
                id: 1, title: 'Radiographie Pulmonaire - Mohammed Benali', type: 'xray',
                patientId: 1, patientName: 'Mohammed Benali', date: '2025-01-15',
                status: 'approved', priority: 'medium', size: '2.3 MB', quality: 95, aiProcessed: true,
                description: 'Radiographie thoracique de face et profil', 
                findings: 'Poumons clairs, pas d\'anomalie visible', 
                recommendations: 'Contrôle dans 6 mois', 
                doctor: 'Dr. Fatima Benjelloun', 
                department: 'Radiologie', 
                createdAt: '2025-01-15T10:30:00Z'
            },
            {
                id: 2, title: 'Analyses Sanguines - Fatima Alaoui', type: 'lab_results',
                patientId: 2, patientName: 'Fatima Alaoui', date: '2025-01-20',
                status: 'pending_review', priority: 'high', size: '1.8 MB', quality: 88, aiProcessed: true,
                description: 'Bilan sanguin complet avec glycémie et cholestérol', 
                findings: 'Glycémie élevée, cholestérol normal', 
                recommendations: 'Régime alimentaire et suivi diabétologique', 
                doctor: 'Dr. Mohammed Alaoui', 
                department: 'Laboratoire', 
                createdAt: '2025-01-20T14:15:00Z'
            },
            {
                id: 3, title: 'Ordonnance - Youssef Tazi', type: 'prescription',
                patientId: 3, patientName: 'Youssef Tazi', date: '2025-01-25',
                status: 'approved', priority: 'medium', size: '0.9 MB', quality: 92, aiProcessed: true,
                description: 'Traitement post-opératoire cardiaque', 
                findings: 'Patient stable après chirurgie', 
                recommendations: 'Prise régulière des médicaments', 
                doctor: 'Dr. Hassan Chraibi', 
                department: 'Cardiologie', 
                createdAt: '2025-01-25T09:45:00Z'
            },
            {
                id: 4, title: 'Échographie Abdominale - Aicha Bennani', type: 'ultrasound',
                patientId: 4, patientName: 'Aicha Bennani', date: '2025-01-22',
                status: 'completed', priority: 'high', size: '3.2 MB', quality: 90, aiProcessed: true,
                description: 'Échographie obstétricale 32 SA', 
                findings: 'Fœtus normal, liquide amniotique normal', 
                recommendations: 'Contrôle dans 4 semaines', 
                doctor: 'Dr. Zineb Mansouri', 
                department: 'Gynécologie', 
                createdAt: '2025-01-22T11:20:00Z'
            },
            {
                id: 5, title: 'Scanner Thoracique - Hassan Chraibi', type: 'ct_scan',
                patientId: 5, patientName: 'Hassan Chraibi', date: '2025-01-19',
                status: 'approved', priority: 'urgent', size: '15.7 MB', quality: 98, aiProcessed: true,
                description: 'Scanner thoracique avec injection de contraste', 
                findings: 'Pas de récidive tumorale visible', 
                recommendations: 'Contrôle dans 3 mois', 
                doctor: 'Dr. Omar Rachidi', 
                department: 'Oncologie', 
                createdAt: '2025-01-19T16:30:00Z'
            },
            {
                id: 6, title: 'IRM Cérébrale - Khadija Idrissi', type: 'mri',
                patientId: 6, patientName: 'Khadija Idrissi', date: '2025-01-21',
                status: 'pending_review', priority: 'medium', size: '25.4 MB', quality: 94, aiProcessed: true,
                description: 'IRM cérébrale pour migraines chroniques', 
                findings: 'Pas d\'anomalie structurelle', 
                recommendations: 'Consultation neurologique', 
                doctor: 'Dr. Naima El Fassi', 
                department: 'Neurologie', 
                createdAt: '2025-01-21T13:45:00Z'
            },
            {
                id: 7, title: 'Électrocardiogramme - Omar Rachidi', type: 'ecg',
                patientId: 7, patientName: 'Omar Rachidi', date: '2025-01-17',
                status: 'approved', priority: 'low', size: '0.5 MB', quality: 85, aiProcessed: true,
                description: 'ECG de repos et d\'effort', 
                findings: 'Rythme sinusal normal', 
                recommendations: 'Aucune anomalie détectée', 
                doctor: 'Dr. Youssef Tazi', 
                department: 'Cardiologie', 
                createdAt: '2025-01-17T08:15:00Z'
            },
            {
                id: 8, title: 'Biopsie Rénale - Zineb Mansouri', type: 'biopsy',
                patientId: 8, patientName: 'Zineb Mansouri', date: '2025-01-16',
                status: 'completed', priority: 'high', size: '1.2 MB', quality: 96, aiProcessed: true,
                description: 'Biopsie rénale pour lupus érythémateux', 
                findings: 'Glomérulonéphrite lupique active', 
                recommendations: 'Traitement immunosuppresseur', 
                doctor: 'Dr. Aicha Bennani', 
                department: 'Néphrologie', 
                createdAt: '2025-01-16T15:20:00Z'
            },
            {
                id: 9, title: 'Endoscopie Digestive - Karim Bouazza', type: 'endoscopy',
                patientId: 9, patientName: 'Karim Bouazza', date: '2025-01-14',
                status: 'approved', priority: 'medium', size: '4.8 MB', quality: 89, aiProcessed: true,
                description: 'Gastroscopie pour hépatite C', 
                findings: 'Varices œsophagiennes grade 1', 
                recommendations: 'Surveillance endoscopique', 
                doctor: 'Dr. Hassan Chraibi', 
                department: 'Gastro-entérologie', 
                createdAt: '2025-01-14T12:10:00Z'
            },
            {
                id: 10, title: 'Consultation Générale - Naima El Fassi', type: 'consultation',
                patientId: 10, patientName: 'Naima El Fassi', date: '2025-01-23',
                status: 'draft', priority: 'low', size: '0.3 MB', quality: 75, aiProcessed: false,
                description: 'Première consultation médicale', 
                findings: 'Examen clinique normal', 
                recommendations: 'Aucun traitement nécessaire', 
                doctor: 'Dr. Fatima Benjelloun', 
                department: 'Médecine Générale', 
                createdAt: '2025-01-23T10:00:00Z'
            },
            {
                id: 11, title: 'Radiographie Dentaire - Mohammed Benali', type: 'dental_xray',
                patientId: 1, patientName: 'Mohammed Benali', date: '2025-01-12',
                status: 'approved', priority: 'low', size: '1.1 MB', quality: 87, aiProcessed: true,
                description: 'Panoramique dentaire', 
                findings: 'Caries sur molaire 26', 
                recommendations: 'Soins dentaires nécessaires', 
                doctor: 'Dr. Karim Bouazza', 
                department: 'Dentisterie', 
                createdAt: '2025-01-12T14:30:00Z'
            },
            {
                id: 12, title: 'Mammographie - Fatima Alaoui', type: 'mammography',
                patientId: 2, patientName: 'Fatima Alaoui', date: '2025-01-18',
                status: 'completed', priority: 'medium', size: '2.7 MB', quality: 93, aiProcessed: true,
                description: 'Mammographie de dépistage', 
                findings: 'Pas d\'anomalie détectée', 
                recommendations: 'Contrôle dans 2 ans', 
                doctor: 'Dr. Zineb Mansouri', 
                department: 'Radiologie', 
                createdAt: '2025-01-18T09:45:00Z'
            },
            {
                id: 13, title: 'Test de Fonction Respiratoire - Youssef Tazi', type: 'pulmonary_test',
                patientId: 3, patientName: 'Youssef Tazi', date: '2025-01-24',
                status: 'approved', priority: 'medium', size: '0.8 MB', quality: 91, aiProcessed: true,
                description: 'Spirométrie et test de diffusion', 
                findings: 'Fonction respiratoire normale', 
                recommendations: 'Arrêt du tabac recommandé', 
                doctor: 'Dr. Omar Rachidi', 
                department: 'Pneumologie', 
                createdAt: '2025-01-24T11:15:00Z'
            },
            {
                id: 14, title: 'Échographie Pelvienne - Aicha Bennani', type: 'ultrasound',
                patientId: 4, patientName: 'Aicha Bennani', date: '2025-01-20',
                status: 'completed', priority: 'high', size: '2.9 MB', quality: 88, aiProcessed: true,
                description: 'Échographie pelvienne pour grossesse', 
                findings: 'Utérus et ovaires normaux', 
                recommendations: 'Suivi gynécologique régulier', 
                doctor: 'Dr. Naima El Fassi', 
                department: 'Gynécologie', 
                createdAt: '2025-01-20T16:00:00Z'
            },
            {
                id: 15, title: 'Radiographie Osseuse - Hassan Chraibi', type: 'bone_xray',
                patientId: 5, patientName: 'Hassan Chraibi', date: '2025-01-13',
                status: 'approved', priority: 'low', size: '1.5 MB', quality: 86, aiProcessed: true,
                description: 'Radiographie du genou droit', 
                findings: 'Arthrose modérée', 
                recommendations: 'Kinésithérapie recommandée', 
                doctor: 'Dr. Youssef Tazi', 
                department: 'Rhumatologie', 
                createdAt: '2025-01-13T15:45:00Z'
            }
        ];

        // Rapports de démonstration - 12 rapports complets
        this.data.reports = [
            {
                id: 1, title: 'Rapport de Consultation - Mohammed Benali', type: 'consultation',
                patientId: 1, patientName: 'Mohammed Benali', date: '2025-01-15',
                status: 'completed', summary: 'Consultation de contrôle pour hypertension. Patient stable.', 
                details: 'Tension artérielle: 130/85 mmHg. Poids stable. Médicaments bien tolérés. Pas d\'effets secondaires rapportés.',
                priority: 'medium', aiInsights: {
                    confidence: 92,
                    keywords: ['hypertension', 'contrôle', 'stable', 'médicaments'],
                    recommendations: 'Continuer le traitement actuel. Contrôle dans 3 mois.'
                },
                doctor: 'Dr. Fatima Benjelloun', department: 'Médecine Générale', createdAt: '2025-01-15T10:30:00Z'
            },
            {
                id: 2, title: 'Rapport d\'Examen Médical - Fatima Alaoui', type: 'examination',
                patientId: 2, patientName: 'Fatima Alaoui', date: '2025-01-20',
                status: 'draft', summary: 'Examen médical complet avec analyses.', 
                details: 'Examen clinique normal. Glycémie à jeun: 1.8 g/L. Cholestérol total: 2.1 g/L. Recommandations diététiques données.',
                priority: 'high', aiInsights: {
                    confidence: 88,
                    keywords: ['diabète', 'glycémie', 'cholestérol', 'régime'],
                    recommendations: 'Mise en place d\'un régime diabétique. Consultation diabétologique recommandée.'
                },
                doctor: 'Dr. Mohammed Alaoui', department: 'Endocrinologie', createdAt: '2025-01-20T14:15:00Z'
            },
            {
                id: 3, title: 'Rapport Chirurgical - Youssef Tazi', type: 'surgery',
                patientId: 3, patientName: 'Youssef Tazi', date: '2025-01-25',
                status: 'completed', summary: 'Suivi post-opératoire de pontage coronarien.', 
                details: 'Cicatrisation normale. Pas de complications. Fonction cardiaque améliorée. Rééducation en cours.',
                priority: 'high', aiInsights: {
                    confidence: 95,
                    keywords: ['chirurgie', 'pontage', 'cœur', 'suivi'],
                    recommendations: 'Continuer la rééducation cardiaque. Contrôle cardiologique dans 1 mois.'
                },
                doctor: 'Dr. Hassan Chraibi', department: 'Cardiologie', createdAt: '2025-01-25T09:45:00Z'
            },
            {
                id: 4, title: 'Rapport Obstétrical - Aicha Bennani', type: 'obstetrics',
                patientId: 4, patientName: 'Aicha Bennani', date: '2025-01-22',
                status: 'completed', summary: 'Suivi de grossesse 32 SA.', 
                details: 'Grossesse évolutive normale. Fœtus en présentation céphalique. Liquide amniotique normal. Contractions utérines normales.',
                priority: 'high', aiInsights: {
                    confidence: 90,
                    keywords: ['grossesse', 'fœtus', 'échographie', 'suivi'],
                    recommendations: 'Contrôle dans 2 semaines. Préparation à l\'accouchement recommandée.'
                },
                doctor: 'Dr. Zineb Mansouri', department: 'Gynécologie-Obstétrique', createdAt: '2025-01-22T11:20:00Z'
            },
            {
                id: 5, title: 'Rapport Oncologique - Hassan Chraibi', type: 'oncology',
                patientId: 5, patientName: 'Hassan Chraibi', date: '2025-01-19',
                status: 'completed', summary: 'Contrôle post-traitement cancer du poumon.', 
                details: 'Pas de signe de récidive. Fonction respiratoire stable. Tolérance au traitement correcte. Suivi psychologique en cours.',
                priority: 'urgent', aiInsights: {
                    confidence: 98,
                    keywords: ['cancer', 'poumon', 'récidive', 'traitement'],
                    recommendations: 'Contrôle scanner dans 3 mois. Continuer le suivi psychologique.'
                },
                doctor: 'Dr. Omar Rachidi', department: 'Oncologie', createdAt: '2025-01-19T16:30:00Z'
            },
            {
                id: 6, title: 'Rapport Neurologique - Khadija Idrissi', type: 'neurology',
                patientId: 6, patientName: 'Khadija Idrissi', date: '2025-01-21',
                status: 'pending_review', summary: 'Évaluation des migraines chroniques.', 
                details: 'Migraines avec aura. Fréquence: 3-4 par mois. Intensité modérée à sévère. Traitement prophylactique en cours.',
                priority: 'medium', aiInsights: {
                    confidence: 85,
                    keywords: ['migraine', 'aura', 'chronique', 'traitement'],
                    recommendations: 'Ajustement du traitement prophylactique. Tenir un journal des crises.'
                },
                doctor: 'Dr. Naima El Fassi', department: 'Neurologie', createdAt: '2025-01-21T13:45:00Z'
            },
            {
                id: 7, title: 'Rapport Cardiologique - Omar Rachidi', type: 'cardiology',
                patientId: 7, patientName: 'Omar Rachidi', date: '2025-01-17',
                status: 'completed', summary: 'Bilan cardiaque complet.', 
                details: 'ECG normal. Échocardiographie: fraction d\'éjection 65%. Pas d\'anomalie valvulaire. Test d\'effort normal.',
                priority: 'low', aiInsights: {
                    confidence: 92,
                    keywords: ['cœur', 'ECG', 'échocardiographie', 'normal'],
                    recommendations: 'Aucune pathologie cardiaque détectée. Contrôle dans 2 ans.'
                },
                doctor: 'Dr. Youssef Tazi', department: 'Cardiologie', createdAt: '2025-01-17T08:15:00Z'
            },
            {
                id: 8, title: 'Rapport Néphrologique - Zineb Mansouri', type: 'nephrology',
                patientId: 8, patientName: 'Zineb Mansouri', date: '2025-01-16',
                status: 'completed', summary: 'Suivi de lupus érythémateux avec atteinte rénale.', 
                details: 'Créatininémie: 120 μmol/L. Protéinurie: 2.5 g/24h. Biopsie rénale: glomérulonéphrite lupique active. Traitement immunosuppresseur adapté.',
                priority: 'high', aiInsights: {
                    confidence: 96,
                    keywords: ['lupus', 'rein', 'biopsie', 'immunosuppresseur'],
                    recommendations: 'Surveillance biologique rapprochée. Adaptation du traitement selon l\'évolution.'
                },
                doctor: 'Dr. Aicha Bennani', department: 'Néphrologie', createdAt: '2025-01-16T15:20:00Z'
            },
            {
                id: 9, title: 'Rapport Gastro-entérologique - Karim Bouazza', type: 'gastroenterology',
                patientId: 9, patientName: 'Karim Bouazza', date: '2025-01-14',
                status: 'completed', summary: 'Suivi d\'hépatite C chronique.', 
                details: 'Transaminases: ASAT 45 UI/L, ALAT 52 UI/L. Charge virale: 150 000 UI/mL. Fibroscan: F2. Varices œsophagiennes grade 1.',
                priority: 'medium', aiInsights: {
                    confidence: 89,
                    keywords: ['hépatite', 'C', 'foie', 'varices'],
                    recommendations: 'Traitement antiviral recommandé. Surveillance endoscopique des varices.'
                },
                doctor: 'Dr. Hassan Chraibi', department: 'Gastro-entérologie', createdAt: '2025-01-14T12:10:00Z'
            },
            {
                id: 10, title: 'Rapport de Première Consultation - Naima El Fassi', type: 'consultation',
                patientId: 10, patientName: 'Naima El Fassi', date: '2025-01-23',
                status: 'draft', summary: 'Première consultation médicale.', 
                details: 'Examen clinique normal. Pas d\'antécédent médical. Vaccinations à jour. Bilan de santé satisfaisant.',
                priority: 'low', aiInsights: {
                    confidence: 75,
                    keywords: ['première', 'consultation', 'normal', 'vaccination'],
                    recommendations: 'Aucun traitement nécessaire. Contrôle dans 1 an.'
                },
                doctor: 'Dr. Fatima Benjelloun', department: 'Médecine Générale', createdAt: '2025-01-23T10:00:00Z'
            },
            {
                id: 11, title: 'Rapport Dentaire - Mohammed Benali', type: 'dental',
                patientId: 1, patientName: 'Mohammed Benali', date: '2025-01-12',
                status: 'completed', summary: 'Contrôle dentaire et soins.', 
                details: 'Examen bucco-dentaire: carie sur molaire 26. Gingivite légère. Détartrage effectué. Soins conservateurs réalisés.',
                priority: 'low', aiInsights: {
                    confidence: 87,
                    keywords: ['dent', 'carie', 'gingivite', 'soins'],
                    recommendations: 'Brossage 3 fois par jour. Contrôle dans 6 mois.'
                },
                doctor: 'Dr. Karim Bouazza', department: 'Dentisterie', createdAt: '2025-01-12T14:30:00Z'
            },
            {
                id: 12, title: 'Rapport de Dépistage - Fatima Alaoui', type: 'screening',
                patientId: 2, patientName: 'Fatima Alaoui', date: '2025-01-18',
                status: 'completed', summary: 'Mammographie de dépistage.', 
                details: 'Mammographie bilatérale: ACR 1. Pas d\'anomalie détectée. Densité mammaire normale. Recommandations de suivi données.',
                priority: 'medium', aiInsights: {
                    confidence: 93,
                    keywords: ['mammographie', 'dépistage', 'sein', 'normal'],
                    recommendations: 'Contrôle dans 2 ans. Auto-examen mensuel recommandé.'
                },
                doctor: 'Dr. Zineb Mansouri', department: 'Radiologie', createdAt: '2025-01-18T09:45:00Z'
            }
        ];

        // Utilisateurs avec permissions correctes
        console.log('Initialisation des utilisateurs...');
        this.data.users = [
            {
                id: 1, firstName: 'Administrateur', lastName: 'Système', email: 'admin@hopital-elghassani.ma',
                password: 'admin123', role: 'admin', roleName: 'Administrateur', initials: 'AS',
                permissions: ['dashboard', 'patients', 'documents', 'scanner', 'reports', 'users', 'settings'],
                department: 'Administration', isActive: true, lastLogin: '2025-01-25 09:30:00'
            },
            {
                id: 2, firstName: 'Dr. Fatima', lastName: 'Benjelloun', email: 'medecin@hopital-elghassani.ma',
                password: 'medecin123', role: 'doctor', roleName: 'Médecin', initials: 'FB',
                permissions: ['dashboard', 'patients', 'documents', 'scanner', 'reports'],
                department: 'Médecine Générale', isActive: true, lastLogin: '2025-01-25 08:15:00'
            },
            {
                id: 3, firstName: 'Aicha', lastName: 'Idrissi', email: 'infirmier@hopital-elghassani.ma',
                password: 'infirmier123', role: 'nurse', roleName: 'Infirmière', initials: 'AI',
                permissions: ['patients_view', 'documents_view', 'reports_view', 'dashboard'],
                department: 'Soins Infirmiers', isActive: true, lastLogin: '2025-01-25 07:45:00'
            },
            {
                id: 4, firstName: 'Mohammed', lastName: 'Chraibi', email: 'technicien@hopital-elghassani.ma',
                password: 'technicien123', role: 'technician', roleName: 'Technicien', initials: 'MC',
                permissions: ['settings'],
                department: 'Support Technique', isActive: true, lastLogin: '2025-01-25 06:30:00'
            }
        ];

        console.log(`Utilisateurs initialisés: ${this.data.users.length}`, this.data.users);

        // Initialiser les activités récentes
        this.initActivities();
    }

    initActivities() {
        // Charger les activités depuis le localStorage
        const storedActivities = localStorage.getItem('recentActivities');
        if (storedActivities) {
            try {
                this.data.activities = JSON.parse(storedActivities);
                console.log('Activités chargées depuis le localStorage:', this.data.activities.length);
            } catch (error) {
                console.error('Erreur de chargement des activités:', error);
                this.data.activities = [];
            }
        } else {
            // Activités de démonstration
            this.data.activities = [
                {
                    id: 1,
                    type: 'login',
                    action: 'Connexion',
                    description: 'Connexion de l\'administrateur',
                    user: 'Mohammed Alaoui',
                    timestamp: new Date().toISOString(),
                    icon: 'fas fa-sign-in-alt',
                    color: 'success'
                },
                {
                    id: 2,
                    type: 'patient_created',
                    action: 'Patient créé',
                    description: 'Nouveau patient: Mohammed Benali',
                    user: 'Mohammed Alaoui',
                    timestamp: new Date(Date.now() - 3600000).toISOString(), // 1h ago
                    icon: 'fas fa-user-plus',
                    color: 'primary'
                },
                {
                    id: 3,
                    type: 'document_scanned',
                    action: 'Document numérisé',
                    description: 'Radiographie pulmonaire scannée',
                    user: 'Mohammed Alaoui',
                    timestamp: new Date(Date.now() - 7200000).toISOString(), // 2h ago
                    icon: 'fas fa-file-medical',
                    color: 'info'
                },
                {
                    id: 4,
                    type: 'document_created',
                    action: 'Document Créé',
                    description: 'Analyse sanguine - Fatima Alaoui',
                    user: 'Dr. Fatima Benjelloun',
                    timestamp: new Date(Date.now() - 10800000).toISOString(), // 3h ago
                    icon: 'fas fa-file-plus',
                    color: 'success'
                },
                {
                    id: 5,
                    type: 'report_generated',
                    action: 'Rapport Généré',
                    description: 'Rapport de consultation - Youssef Tazi',
                    user: 'Dr. Fatima Benjelloun',
                    timestamp: new Date(Date.now() - 14400000).toISOString(), // 4h ago
                    icon: 'fas fa-chart-line',
                    color: 'warning'
                }
            ];
            console.log('Activités de démonstration initialisées:', this.data.activities.length);
            this.saveActivities();
        }
    }

    // Enregistrer une nouvelle activité
    logActivity(type, action, description, details = {}) {
        try {
        const activity = {
            id: Date.now(),
            type: type,
            action: action,
            description: description,
            user: this.currentUser ? `${this.currentUser.firstName} ${this.currentUser.lastName}` : 'Système',
            timestamp: new Date().toISOString(),
            icon: this.getActivityIcon(type),
            color: this.getActivityColor(type),
            details: details
        };

        // Ajouter au début de la liste
        this.data.activities.unshift(activity);

        // Garder seulement les 50 dernières activités
        if (this.data.activities.length > 50) {
            this.data.activities = this.data.activities.slice(0, 50);
        }

        // Sauvegarder
        this.saveActivities();

        // Afficher notification
        this.showActivityNotification(activity);

        // Mettre à jour l'affichage si on est sur la page d'activité
        if (this.currentPage === 'dashboard') {
            this.updateRecentActivities();
        }

        return activity;
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement de l\'activité:', error);
            return null;
        }
    }

    // Obtenir l'icône pour le type d'activité
    getActivityIcon(type) {
        const icons = {
            'login': 'fas fa-sign-in-alt',
            'logout': 'fas fa-sign-out-alt',
            'patient_created': 'fas fa-user-plus',
            'patient_updated': 'fas fa-user-edit',
            'patient_deleted': 'fas fa-user-times',
            'document_created': 'fas fa-file-plus',
            'document_updated': 'fas fa-file-edit',
            'document_deleted': 'fas fa-file-times',
            'document_scanned': 'fas fa-file-medical',
            'report_created': 'fas fa-file-alt',
            'report_updated': 'fas fa-file-edit',
            'report_deleted': 'fas fa-file-times',
            'user_created': 'fas fa-user-plus',
            'user_updated': 'fas fa-user-edit',
            'user_deleted': 'fas fa-user-times',
            'settings_updated': 'fas fa-cog',
            'backup_created': 'fas fa-download',
            'cache_cleared': 'fas fa-broom'
        };
        return icons[type] || 'fas fa-circle';
    }

    // Obtenir la couleur pour le type d'activité
    getActivityColor(type) {
        const colors = {
            'login': 'success',
            'logout': 'warning',
            'patient_created': 'primary',
            'patient_updated': 'info',
            'patient_deleted': 'danger',
            'document_created': 'primary',
            'document_updated': 'info',
            'document_deleted': 'danger',
            'document_scanned': 'info',
            'report_created': 'primary',
            'report_updated': 'info',
            'report_deleted': 'danger',
            'user_created': 'primary',
            'user_updated': 'info',
            'user_deleted': 'danger',
            'settings_updated': 'secondary',
            'backup_created': 'success',
            'cache_cleared': 'warning'
        };
        return colors[type] || 'secondary';
    }

    // Sauvegarder les activités
    saveActivities() {
        localStorage.setItem('recentActivities', JSON.stringify(this.data.activities));
    }

    // Afficher une notification toast
    showToast(message, type = 'info', duration = 3000) {
        // Créer le conteneur de notifications s'il n'existe pas
        let toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toastContainer';
            toastContainer.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                max-width: 400px;
            `;
            document.body.appendChild(toastContainer);
        }

        // Créer la notification
        const toastId = 'toast_' + Date.now();
        const toast = document.createElement('div');
        toast.id = toastId;
        toast.className = `alert alert-${type} alert-dismissible fade show`;
        toast.style.cssText = `
            margin-bottom: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            border: none;
            border-radius: 8px;
        `;
        
        toast.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas fa-${this.getToastIcon(type)} me-2"></i>
                <span>${message}</span>
                <button type="button" class="btn-close ms-auto" onclick="this.parentElement.parentElement.remove()"></button>
            </div>
        `;

        // Ajouter la notification
        toastContainer.appendChild(toast);

        // Auto-supprimer après la durée spécifiée
        setTimeout(() => {
            const toastElement = document.getElementById(toastId);
            if (toastElement) {
                toastElement.classList.remove('show');
                setTimeout(() => toastElement.remove(), 300);
            }
        }, duration);

        // Gérer les sons de notification
        this.playNotificationSound(type);
    }

    // Obtenir l'icône pour le type de notification
    getToastIcon(type) {
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    // Jouer un son de notification
    playNotificationSound(type) {
        const settings = window.SettingsManager ? window.SettingsManager.loadSettings() : {};
        
        if (settings.alertSounds || settings.soundEffects) {
            try {
                // Créer un contexte audio simple
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                // Fréquences différentes selon le type
                const frequencies = {
                    'success': 800,
                    'error': 400,
                    'warning': 600,
                    'info': 500
                };
                
                oscillator.frequency.setValueAtTime(frequencies[type] || 500, audioContext.currentTime);
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.5);
            } catch (error) {
                console.log('Impossible de jouer le son de notification:', error);
            }
        }
    }

    // Afficher une notification d'activité
    showActivityNotification(activity) {
        const notificationHtml = `
            <div class="toast align-items-center text-white bg-${activity.color} border-0" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body">
                        <i class="${activity.icon} me-2"></i>
                        <strong>${activity.action}</strong><br>
                        <small>${activity.description}</small>
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
            </div>
        `;

        // Créer le conteneur de notifications s'il n'existe pas
        let toastContainer = document.getElementById('activityToastContainer');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'activityToastContainer';
            toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
            toastContainer.style.zIndex = '9999';
            document.body.appendChild(toastContainer);
        }

        // Ajouter la notification
        const toastElement = document.createElement('div');
        toastElement.innerHTML = notificationHtml;
        toastContainer.appendChild(toastElement.firstElementChild);

        // Initialiser et afficher la notification
        const toast = new bootstrap.Toast(toastElement.firstElementChild, {
            autohide: true,
            delay: 4000
        });
        toast.show();

        // Supprimer l'élément après fermeture
        toastElement.firstElementChild.addEventListener('hidden.bs.toast', () => {
            toastElement.remove();
        });
    }

    // Mettre à jour l'affichage des activités récentes
    updateRecentActivities() {
        console.log('Mise à jour des activités récentes...');
        const container = document.getElementById('recentActivitiesList');
        if (!container) {
            console.log('Conteneur recentActivities non trouvé');
            return;
        }

        console.log('Activités disponibles:', this.data.activities.length);
        const recentActivities = this.data.activities.slice(0, 10); // 10 plus récentes
        
        if (recentActivities.length === 0) {
            container.innerHTML = `
                <div class="text-center text-muted py-4">
                    <i class="fas fa-history fa-3x mb-3"></i>
                    <p>Aucune activité récente</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = recentActivities.map(activity => `
            <div class="activity-item d-flex align-items-center mb-3 p-3 rounded-3 bg-light">
                <div class="activity-icon me-3">
                    <div class="bg-${activity.color} text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
                        <i class="${activity.icon}"></i>
                    </div>
                </div>
                <div class="activity-content flex-grow-1">
                    <div class="activity-title fw-semibold">${activity.action}</div>
                    <div class="activity-description text-muted small">${activity.description}</div>
                    <div class="activity-meta text-muted small">
                        <i class="fas fa-user me-1"></i>${activity.user}
                        <i class="fas fa-clock ms-2 me-1"></i>${this.formatTimeAgo(activity.timestamp)}
                    </div>
                </div>
            </div>
        `).join('');
        
        console.log('Activités récentes mises à jour:', recentActivities.length);
    }

    // Formater le temps écoulé
    formatTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffMs = now - time;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'À l\'instant';
        if (diffMins < 60) return `Il y a ${diffMins} min`;
        if (diffHours < 24) return `Il y a ${diffHours}h`;
        return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    }

    // Mettre à jour les statistiques des patients
    updatePatientsStats() {
        const totalPatients = this.data.patients.length;
        const activePatients = this.data.patients.filter(p => p.status === 'active').length;
        const today = new Date().toISOString().split('T')[0];
        const newPatientsToday = this.data.patients.filter(p => 
            p.createdAt && p.createdAt.split('T')[0] === today
        ).length;
        const patientsWithDocuments = this.data.patients.filter(p => 
            this.data.documents.some(d => d.patientId === p.id)
        ).length;

        // Mettre à jour les compteurs
        this.updateElement('totalPatientsCount', totalPatients);
        this.updateElement('activePatientsCount', activePatients);
        this.updateElement('newPatientsToday', newPatientsToday);
        this.updateElement('patientsWithDocuments', patientsWithDocuments);
        this.updateElement('patientsCount', totalPatients);
    }

    // Mettre à jour le résumé des activités
    updateActivitySummary() {
        const activities = this.data.activities;
        
        // Compter les différents types d'activités
        const loginCount = activities.filter(a => a.type === 'login').length;
        const patientCreatedCount = activities.filter(a => a.type === 'patient_created').length;
        const documentScannedCount = activities.filter(a => a.type === 'document_scanned').length;
        const deletionCount = activities.filter(a => a.type.includes('deleted')).length;
        
        // Mettre à jour les compteurs
        this.updateElement('loginCount', loginCount);
        this.updateElement('patientCreatedCount', patientCreatedCount);
        this.updateElement('documentScannedCount', documentScannedCount);
        this.updateElement('deletionCount', deletionCount);
    }

    // Basculer l'affichage des sections administrateur
    toggleAdminSections() {
        const adminSections = document.getElementById('adminSections');
        if (adminSections) {
            if (this.currentUser && this.currentUser.role === 'admin') {
                adminSections.classList.remove('d-none');
                this.loadAdminDashboard();
            } else {
                adminSections.classList.add('d-none');
            }
        }
    }

    // Charger le dashboard administrateur
    loadAdminDashboard() {
        this.updateAdminAnalytics();
        this.loadSystemLogs();
        this.updateSystemMonitor();
    }

    // Mettre à jour les analytics administrateur
    updateAdminAnalytics() {
        const totalPatients = this.data.patients.length;
        const totalDocuments = this.data.documents.length;
        const aiProcessed = this.data.documents.filter(d => d.aiProcessed).length;
        
        // Calculer la moyenne des documents par patient
        const avgDocsPerPatient = totalPatients > 0 ? (totalDocuments / totalPatients).toFixed(1) : 0;
        
        // Calculer le taux de succès IA
        const aiSuccessRate = totalDocuments > 0 ? Math.round((aiProcessed / totalDocuments) * 100) : 0;
        
        // Documents traités aujourd'hui
        const today = new Date().toISOString().split('T')[0];
        const documentsToday = this.data.documents.filter(d => 
            d.createdAt && d.createdAt.split('T')[0] === today
        ).length;
        
        // Utilisateurs actifs (simulation)
        const activeUsers = this.data.users.filter(u => u.isActive).length;

        this.updateElement('avgDocumentsPerPatient', avgDocsPerPatient);
        this.updateElement('aiSuccessRate', aiSuccessRate + '%');
        this.updateElement('documentsToday', documentsToday);
        this.updateElement('activeUsers', activeUsers);
    }


    // Charger les logs système
    loadSystemLogs() {
        const logsContainer = document.getElementById('systemLogs');
        if (!logsContainer) return;

        const logs = this.generateSystemLogs();
        logsContainer.innerHTML = logs.map(log => `
            <div class="log-entry p-2 border-bottom">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <span class="badge bg-${this.getLogBadgeColor(log.level)} me-2">${log.level.toUpperCase()}</span>
                        <span class="log-message">${log.message}</span>
                    </div>
                    <small class="text-muted">${log.timestamp}</small>
                </div>
            </div>
        `).join('');
    }

    // Générer des logs système de démonstration
    generateSystemLogs() {
        return [
            {
                level: 'info',
                message: 'Système démarré avec succès',
                timestamp: new Date().toLocaleTimeString()
            },
            {
                level: 'info',
                message: 'Base de données connectée',
                timestamp: new Date(Date.now() - 300000).toLocaleTimeString()
            },
            {
                level: 'warning',
                message: 'Utilisation mémoire élevée détectée',
                timestamp: new Date(Date.now() - 600000).toLocaleTimeString()
            },
            {
                level: 'error',
                message: 'Erreur de connexion IA temporaire',
                timestamp: new Date(Date.now() - 900000).toLocaleTimeString()
            },
            {
                level: 'info',
                message: 'Sauvegarde automatique effectuée',
                timestamp: new Date(Date.now() - 1200000).toLocaleTimeString()
            }
        ];
    }

    // Mettre à jour le moniteur système
    updateSystemMonitor() {
        // Simulation des métriques système
        const storageUsage = Math.floor(Math.random() * 50) + 30; // 30-80%
        const aiPerformance = Math.floor(Math.random() * 20) + 75; // 75-95%

        this.updateElement('storageUsage', storageUsage + '%');
        this.updateElement('aiPerformance', aiPerformance + '%');

        // Mettre à jour les barres de progression
        const storageBar = document.querySelector('#storageUsage').closest('.mb-3').querySelector('.progress-bar');
        const aiBar = document.querySelector('#aiPerformance').closest('.mb-3').querySelector('.progress-bar');
        
        if (storageBar) {
            storageBar.style.width = storageUsage + '%';
            storageBar.className = `progress-bar ${storageUsage > 70 ? 'bg-warning' : 'bg-success'}`;
        }
        
        if (aiBar) {
            aiBar.style.width = aiPerformance + '%';
        }
    }

    // Actions administrateur
    backupSystem() {
        this.logActivity('backup_created', 'Sauvegarde Système', 'Sauvegarde complète du système effectuée');
        this.showToast('Sauvegarde du système en cours...', 'info');
        
        setTimeout(() => {
            this.updateElement('lastBackup', new Date().toLocaleString());
            this.showToast('Sauvegarde terminée avec succès', 'success');
        }, 2000);
    }

    clearCache() {
        this.logActivity('cache_cleared', 'Cache Vidé', 'Cache système vidé par l\'administrateur');
        this.showToast('Cache vidé avec succès', 'success');
    }

    generateSystemReport() {
        this.logActivity('report_created', 'Rapport Système', 'Rapport système généré');
        this.showToast('Génération du rapport système...', 'info');
        
        setTimeout(() => {
            this.showToast('Rapport système téléchargé', 'success');
        }, 1500);
    }

    maintenanceMode() {
        if (confirm('Êtes-vous sûr de vouloir activer le mode maintenance ?')) {
            this.logActivity('settings_updated', 'Mode Maintenance', 'Mode maintenance activé');
            this.showToast('Mode maintenance activé', 'warning');
        }
    }

    // Filtrer les logs
    filterLogs(level) {
        const logsContainer = document.getElementById('systemLogs');
        if (!logsContainer) return;

        const allLogs = this.generateSystemLogs();
        const filteredLogs = level === 'all' ? allLogs : allLogs.filter(log => log.level === level);

        logsContainer.innerHTML = filteredLogs.map(log => `
            <div class="log-entry p-2 border-bottom">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <span class="badge bg-${this.getLogBadgeColor(log.level)} me-2">${log.level.toUpperCase()}</span>
                        <span class="log-message">${log.message}</span>
                    </div>
                    <small class="text-muted">${log.timestamp}</small>
                </div>
            </div>
        `).join('');
    }

    // Vider les logs
    clearLogs() {
        const logsContainer = document.getElementById('systemLogs');
        if (logsContainer) {
            logsContainer.innerHTML = '<div class="p-3 text-center text-muted">Logs vidés</div>';
        }
    }

    // Obtenir la couleur du badge de log
    getLogBadgeColor(level) {
        const colors = {
            'info': 'primary',
            'warning': 'warning',
            'error': 'danger',
            'success': 'success'
        };
        return colors[level] || 'secondary';
    }

    // Exporter un graphique
    exportChart(chartId, format) {
        const canvas = document.getElementById(chartId);
        if (!canvas) {
            this.showToast('Graphique non trouvé', 'error');
            return;
        }

        // Obtenir le nom du graphique pour le fichier
        const chartNames = {
            'digitizationChart': 'Activite-Numerisation',
            'documentTypesChart': 'Types-Documents',
            'scanningChart': 'Activite-Scanner',
            'recentActivityChart': 'Activite-Recente'
        };

        const fileName = chartNames[chartId] || 'Graphique';
        
        if (format === 'png') {
            this.exportChartAsPNG(canvas, fileName);
        } else if (format === 'pdf') {
            this.exportChartAsPDF(canvas, fileName);
        } else {
            this.showToast('Format non supporté', 'error');
        }
    }

    // Exporter en PNG
    exportChartAsPNG(canvas, fileName) {
        try {
            // Créer un lien de téléchargement
            const link = document.createElement('a');
            link.download = `${fileName}-${new Date().toISOString().split('T')[0]}.png`;
            link.href = canvas.toDataURL('image/png');
            
            // Déclencher le téléchargement
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.logActivity('chart_exported', 'Graphique Exporté', `Graphique ${fileName} exporté en PNG`);
            this.showToast('Graphique exporté en PNG avec succès', 'success');
        } catch (error) {
            console.error('Erreur export PNG:', error);
            this.showToast('Erreur lors de l\'export PNG', 'error');
        }
    }

    // Exporter en PDF
    exportChartAsPDF(canvas, fileName) {
        try {
            // Créer un canvas temporaire avec une meilleure résolution
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            
            // Définir une taille plus grande pour une meilleure qualité
            tempCanvas.width = canvas.width * 2;
            tempCanvas.height = canvas.height * 2;
            
            // Dessiner le graphique sur le canvas temporaire
            tempCtx.scale(2, 2);
            tempCtx.drawImage(canvas, 0, 0);
            
            // Convertir en image et créer le PDF
            const imgData = tempCanvas.toDataURL('image/png');
            
            // Créer un PDF simple avec jsPDF (si disponible) ou utiliser une alternative
            if (typeof window.jsPDF !== 'undefined') {
                const pdf = new window.jsPDF();
                const imgWidth = 200;
                const pageHeight = 295;
                const imgHeight = (tempCanvas.height * imgWidth) / tempCanvas.width;
                let heightLeft = imgHeight;
                
                let position = 10;
                
                pdf.addImage(imgData, 'PNG', 5, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
                
                while (heightLeft >= 0) {
                    position = heightLeft - imgHeight;
                    pdf.addPage();
                    pdf.addImage(imgData, 'PNG', 5, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;
                }
                
                pdf.save(`${fileName}-${new Date().toISOString().split('T')[0]}.pdf`);
            } else {
                // Fallback: télécharger comme PNG si jsPDF n'est pas disponible
                this.exportChartAsPNG(tempCanvas, fileName);
                this.showToast('PDF non disponible, export en PNG', 'warning');
                return;
            }
            
            this.logActivity('chart_exported', 'Graphique Exporté', `Graphique ${fileName} exporté en PDF`);
            this.showToast('Graphique exporté en PDF avec succès', 'success');
        } catch (error) {
            console.error('Erreur export PDF:', error);
            // Fallback vers PNG en cas d'erreur
            this.exportChartAsPNG(canvas, fileName);
            this.showToast('Erreur PDF, export en PNG effectué', 'warning');
        }
    }

    // Exporter tous les graphiques
    exportAllCharts(format) {
        const charts = ['digitizationChart', 'documentTypesChart'];
        let exportedCount = 0;
        
        charts.forEach((chartId, index) => {
            const canvas = document.getElementById(chartId);
            if (canvas) {
                setTimeout(() => {
                    if (format === 'png') {
                        this.exportChartAsPNG(canvas, `Dashboard-${chartId}`);
                    } else if (format === 'pdf') {
                        this.exportChartAsPDF(canvas, `Dashboard-${chartId}`);
                    }
                    exportedCount++;
                    
                    if (exportedCount === charts.length) {
                        this.logActivity('charts_exported', 'Export Multiple', `${charts.length} graphiques exportés en ${format.toUpperCase()}`);
                        this.showToast(`${charts.length} graphiques exportés`, 'success');
                    }
                }, index * 1000); // Délai de 1 seconde entre chaque export
            }
        });
        
        if (exportedCount === 0) {
            this.showToast('Aucun graphique trouvé', 'warning');
        }
    }

    checkAuth() {
        // Toujours afficher la page d'authentification en premier
        // Supprimer toute session existante
        localStorage.removeItem('currentUser');
        this.showLoginPage();
    }

    initEvents() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Événements de recherche avec debounce
        const patientSearch = document.getElementById('patientSearch');
        if (patientSearch) {
            patientSearch.addEventListener('input', this.debounce(() => this.loadPatients(), 300));
        }

        const documentSearch = document.getElementById('documentSearch');
        if (documentSearch) {
            documentSearch.addEventListener('input', this.debounce(() => this.loadDocuments(), 300));
        }
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    async handleLogin() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const submitBtn = document.querySelector('.btn-login');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnSpinner = submitBtn.querySelector('.btn-spinner');
        const errorDiv = document.getElementById('loginError');

        submitBtn.disabled = true;
        btnText.classList.add('d-none');
        btnSpinner.classList.remove('d-none');
        errorDiv.classList.add('d-none');

        // Vérifier que les données sont initialisées
        if (!this.data.users || this.data.users.length === 0) {
            console.log('Initialisation des données...');
            this.initDemoData();
        }

        setTimeout(() => {
            try {
                const user = this.authenticateUser(email, password);
                
                if (user) {
                    this.currentUser = user;
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    
                    this.showMainApp();
                    this.showToast('Connexion réussie !', 'success');
                    
                    // Enregistrer l'activité de connexion après avoir défini currentUser
                    this.logActivity('login', 'Connexion', `Connexion de ${user.firstName} ${user.lastName} (${user.role})`, {
                        user: user.firstName + ' ' + user.lastName,
                        role: user.role,
                        email: user.email
                    });
                } else {
                    this.showLoginError('Email ou mot de passe incorrect');
                }
            } catch (error) {
                console.error('Erreur lors de la connexion:', error);
                this.showLoginError('Erreur lors de la connexion');
            } finally {
                // Réinitialiser le bouton dans tous les cas
                submitBtn.disabled = false;
                btnText.classList.remove('d-none');
                btnSpinner.classList.add('d-none');
            }
        }, 1200);
    }

    authenticateUser(email, password) {
        console.log('Tentative de connexion:', { email, password });
        console.log('Utilisateurs disponibles:', this.data.users);
        console.log('Nombre d\'utilisateurs:', this.data.users.length);
        
        // Vérifier que les données sont initialisées
        if (!this.data.users || this.data.users.length === 0) {
            console.error('Aucun utilisateur trouvé dans les données');
            return null;
        }
        
        const user = this.data.users.find(user => 
            user.email === email && user.password === password && user.isActive
        );
        
        console.log('Utilisateur trouvé:', user);
        return user;
    }

    async quickLogin(role) {
        const roleToEmail = {
            admin: 'admin@elghassani.ma',
            doctor: 'medecin@elghassani.ma',
            nurse: 'infirmier@elghassani.ma',
            technician: 'technicien@elghassani.ma'
        };

        const email = roleToEmail[role];
        const user = this.data.users.find(u => u.email === email);
        
        if (user) {
            document.getElementById('email').value = email;
            document.getElementById('password').value = user.password;
            await this.handleLogin();
        }
    }

    showLoginError(message) {
        const errorDiv = document.getElementById('loginError');
        errorDiv.textContent = message;
        errorDiv.classList.remove('d-none');
    }

    showLoginPage() {
        document.getElementById('loginPage').classList.remove('d-none');
        document.getElementById('mainApp').classList.add('d-none');
    }

    showMainApp() {
        document.getElementById('loginPage').classList.add('d-none');
        document.getElementById('mainApp').classList.remove('d-none');
        this.updateUserInterface();
        this.updateNavigationPermissions();
        
        // Rediriger vers la première page autorisée selon le rôle
        if (this.currentUser.role === 'nurse') {
            this.showPage('nurse-dashboard');
        } else if (this.currentUser.role === 'technician') {
            this.showPage('settings');
        } else {
            // Par défaut, aller au dashboard pour admin et doctor
        this.showPage('dashboard');
        }
    }

    updateUserInterface() {
        if (!this.currentUser) return;

        const userInitials = document.getElementById('userInitials');
        const userName = document.getElementById('userName');
        const userRole = document.getElementById('userRole');

        if (userInitials) userInitials.textContent = this.currentUser.initials;
        if (userName) userName.textContent = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
        if (userRole) userRole.textContent = this.currentUser.roleName;
    }

    updateNavigationPermissions() {
        if (!this.currentUser) return;

        console.log('Updating navigation permissions for user:', this.currentUser.email);
        console.log('User permissions:', this.currentUser.permissions);

        // Cacher tous les éléments de navigation d'abord
        const navItems = document.querySelectorAll('#mainNavigation .nav-item');
        navItems.forEach(item => {
            item.style.display = 'none';
        });

        // Afficher seulement les éléments autorisés selon le rôle
        this.currentUser.permissions.forEach(permission => {
            let navId = permission;
            
            // Gérer les permissions spéciales pour infirmier
            if (permission === 'patients_view') {
                navId = 'patients';
            } else if (permission === 'documents_view') {
                navId = 'documents';
            } else if (permission === 'reports_view') {
                navId = 'reports';
            }
            
            const navLink = document.querySelector(`#nav-${navId}`);
            if (navLink) {
                const navItem = navLink.closest('.nav-item');
                if (navItem) {
                    navItem.style.display = 'block';
                    console.log(`Showing navigation item: ${navId}`);
                }
            } else {
                console.warn(`Navigation item not found for permission: ${permission}`);
            }
        });
    }

    async showPage(page) {
        console.log(`Showing page: ${page}`);
        console.log('Current user:', this.currentUser);
        
        // Gérer les permissions spéciales pour infirmier et technicien
        let hasAccess = false;
        
        if (page === 'nurse-dashboard' && this.currentUser.role === 'nurse') {
            hasAccess = true; // L'infirmier a toujours accès à son dashboard
        } else if (page === 'patients' && this.currentUser.role === 'nurse') {
            hasAccess = this.currentUser.permissions.includes('patients_view');
        } else if (page === 'documents' && this.currentUser.role === 'nurse') {
            hasAccess = this.currentUser.permissions.includes('documents_view');
        } else if (page === 'reports' && this.currentUser.role === 'nurse') {
            hasAccess = this.currentUser.permissions.includes('reports_view');
        } else if (page === 'settings' && this.currentUser.role === 'technician') {
            hasAccess = this.currentUser.permissions.includes('settings');
        } else {
            hasAccess = AuthSystem.canAccess(this.currentUser, page);
        }
        
        console.log(`Access to ${page}:`, hasAccess);
        
        if (!hasAccess) {
            this.showToast('Vous n\'avez pas les permissions pour accéder à cette page', 'error');
            
            // Rediriger vers la première page autorisée
            if (this.currentUser.role === 'nurse') {
                this.showPage('patients');
            } else if (this.currentUser.role === 'technician') {
                this.showPage('settings');
            } else {
                this.showPage('dashboard');
            }
            return;
        }

        // Cacher toutes les pages
        const pages = document.querySelectorAll('.page-content');
        console.log('Found pages:', pages.length);
        pages.forEach(p => p.classList.add('d-none'));

        // Afficher la page cible
        const targetPage = document.getElementById(`${page}Page`);
        console.log(`Target page element:`, targetPage);
        
        if (targetPage) {
            targetPage.classList.remove('d-none');
            this.currentPage = page;
            this.updateActiveNavigation(page);
            await this.loadPageData(page);
            console.log(`Page ${page} loaded successfully`);
        } else {
            console.error(`Page not found: ${page}Page`);
            this.showToast(`Page ${page} non trouvée`, 'error');
        }
    }

    updateActiveNavigation(page) {
        const navLinks = document.querySelectorAll('#mainNavigation .nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.id === `nav-${page}`) {
                link.classList.add('active');
                console.log(`Set active navigation: ${page}`);
            }
        });
    }

    async loadPageData(page) {
        switch (page) {
            case 'dashboard': this.loadDashboardData(); break;
            case 'nurse-dashboard': this.loadNurseDashboard(); break;
            case 'patients': this.loadPatients(); break;
            case 'documents': this.loadDocuments(); break;
            case 'scanner': this.loadScanner(); break;
            case 'reports': this.loadReports(); break;
            case 'users': this.loadUsers(); break;
            case 'settings': this.loadSettingsPage(); break;
        }
    }

    loadDashboardData() {
        // Statistiques compatibles avec les données réelles
        const stats = {
            totalPatients: this.data.patients.length,
            totalDocuments: this.data.documents.length,
            pendingDocuments: this.data.documents.filter(d => d.status === 'pending_review').length,
            aiProcessed: this.data.documents.filter(d => d.aiProcessed).length
        };

        // Mettre à jour les affichages
        this.updateElement('totalPatients', stats.totalPatients);
        this.updateElement('totalDocuments', stats.totalDocuments);
        this.updateElement('pendingDocuments', stats.pendingDocuments);
        this.updateElement('aiProcessed', stats.aiProcessed);
        
        // Mettre à jour les activités récentes
        this.updateRecentActivities();
        this.updateActivitySummary();
        
        // Afficher les sections administrateur si nécessaire
        this.toggleAdminSections();

        this.loadDashboardCharts();
        this.loadRecentActivity();
    }

    loadDashboardCharts() {
        // Graphique d'activité - Septembre 2025
        const digitizationCtx = document.getElementById('digitizationChart');
        if (digitizationCtx) {
            new Chart(digitizationCtx, {
                type: 'line',
                data: {
                    labels: ['1 Sep', '5 Sep', '10 Sep', '15 Sep', '20 Sep', '25 Sep', '30 Sep'],
                    datasets: [{
                        label: 'Documents numérisés en Septembre',
                        data: [45, 52, 38, 67, 73, 58, 82],
                        borderColor: '#2563eb',
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        tension: 0.4,
                        fill: true,
                        pointBackgroundColor: '#2563eb',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 6
                    }, {
                        label: 'Documents traités par IA',
                        data: [32, 41, 28, 52, 58, 45, 67],
                        borderColor: '#059669',
                        backgroundColor: 'rgba(5, 150, 105, 0.1)',
                        tension: 0.4,
                        fill: false,
                        pointBackgroundColor: '#059669',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { 
                        legend: { 
                            display: true,
                            position: 'top'
                        },
                        title: {
                            display: true,
                            text: 'Activité de Numérisation - Septembre 2025'
                        }
                    },
                    scales: { 
                        y: { 
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Nombre de documents'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Date'
                            }
                        }
                    }
                }
            });
        }

        // Graphique des types - Septembre 2025
        const typesCtx = document.getElementById('documentTypesChart');
        if (typesCtx) {
            new Chart(typesCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Radiographies', 'Analyses Labo', 'Ordonnances', 'Dossiers Médicaux', 'Échographies'],
                    datasets: [{
                        data: [42, 28, 18, 8, 4],
                        backgroundColor: ['#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed'],
                        borderWidth: 2,
                        borderColor: '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { 
                        legend: { 
                            position: 'bottom',
                            labels: {
                                padding: 20,
                                usePointStyle: true
                            }
                        },
                        title: {
                            display: true,
                            text: 'Types de Documents - Septembre 2025'
                        }
                    }
                }
            });
        }
    }

    loadPatients() {
        const searchTerm = this.getElementValue('patientSearch');
        const statusFilter = this.getElementValue('patientStatus');
        const genderFilter = this.getElementValue('patientGender');

        let filteredPatients = [...this.data.patients];

        if (searchTerm) {
            filteredPatients = PatientManager.searchPatients(filteredPatients, searchTerm);
        }

        if (statusFilter || genderFilter) {
            filteredPatients = PatientManager.filterPatients(filteredPatients, {
                status: statusFilter,
                gender: genderFilter
            });
        }

        // Vérifier si l'utilisateur a seulement les permissions de vue
        const isViewOnly = this.currentUser && 
                          (this.currentUser.role === 'nurse' || 
                           this.currentUser.permissions.includes('patients_view'));
        
        this.renderPatientsTable(filteredPatients, isViewOnly);
        this.updatePatientsStats();
    }

    renderPatientsTable(patients, isViewOnly = false) {
        const tbody = document.getElementById('patientsTableBody');
        if (!tbody) return;

        if (patients.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="text-center py-5">
                        <div class="text-muted">
                            <i class="fas fa-user-slash fa-3x mb-3"></i>
                            <h5>Aucun patient trouvé</h5>
                            <p>Essayez de modifier vos filtres de recherche</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = patients.map(patient => `
            <tr class="align-middle patient-row">
                <td class="px-4">
                    <span class="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill fw-semibold">${patient.patientId}</span>
                </td>
                <td class="px-4">
                    <span class="badge bg-info bg-opacity-10 text-info px-3 py-2 rounded-pill fw-semibold">
                        <i class="fas fa-credit-card me-1"></i>${patient.ci || 'N/A'}
                    </span>
                </td>
                <td class="px-4">
                    <div class="d-flex align-items-center">
                        <div class="patient-avatar ${patient.gender} me-3">
                            ${patient.firstName.charAt(0)}${patient.lastName.charAt(0)}
                        </div>
                        <div>
                            <div class="fw-bold text-dark fs-6">${patient.firstName} ${patient.lastName}</div>
                            <small class="text-muted">${patient.email || 'Aucun email'}</small>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <i class="fas fa-calendar-alt me-2 text-muted"></i>
                        ${this.formatDate(patient.dateOfBirth)}
                    </div>
                </td>
                <td class="px-4">
                    <div class="text-center">
                        <div class="fw-bold text-dark fs-5">${patient.age}</div>
                        <small class="text-muted">ans</small>
                    </div>
                </td>
                <td>
                    <span class="badge bg-${patient.gender === 'male' || patient.gender === 'Homme' ? 'info' : 'warning'} fs-6">
                        <i class="fas fa-${patient.gender === 'male' || patient.gender === 'Homme' ? 'mars' : 'venus'} me-1"></i>
                        ${patient.gender === 'male' || patient.gender === 'Homme' ? 'Homme' : 'Femme'}
                    </span>
                    ${patient.bloodType ? `<small class="text-muted d-block mt-1"><i class="fas fa-tint me-1"></i>${patient.bloodType}</small>` : ''}
                </td>
                <td class="px-4">
                    <div class="d-flex align-items-center">
                        <i class="fas fa-phone me-2 text-success"></i>
                        <span class="fw-medium text-nowrap">${patient.phone || 'N/A'}</span>
                    </div>
                    ${patient.city ? `<small class="text-muted d-block"><i class="fas fa-map-marker-alt me-1"></i>${patient.city}</small>` : ''}
                </td>
                <td class="px-4">
                    <div class="text-center">
                        <span class="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill fw-semibold">
                            <i class="fas fa-file-medical me-1"></i>${patient.documentsCount || 0}
                    </span>
                    </div>
                </td>
                <td class="px-4">
                    <div class="text-center">
                        <span class="badge bg-${patient.status === 'active' ? 'success' : 'secondary'} bg-opacity-10 text-${patient.status === 'active' ? 'success' : 'secondary'} px-3 py-2 rounded-pill fw-semibold">
                            <i class="fas fa-${patient.status === 'active' ? 'check-circle' : 'pause-circle'} me-1"></i>
                        ${patient.status === 'active' ? 'Actif' : 'Inactif'}
                    </span>
                    </div>
                </td>
                <td class="px-4 text-center">
                    <div class="d-flex justify-content-center gap-2">
                        <button class="action-btn btn-view" onclick="viewPatient(${patient.id})" title="Voir">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${!isViewOnly ? `
                        <button class="action-btn btn-edit" onclick="editPatient(${patient.id})" title="Modifier">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn btn-info" onclick="viewPatientDocuments(${patient.id})" title="Documents">
                            <i class="fas fa-file-medical"></i>
                        </button>
                        <button class="action-btn btn-success" onclick="exportSinglePatient(${patient.id})" title="Exporter">
                            <i class="fas fa-download"></i>
                        </button>
                        <button class="action-btn btn-delete" onclick="deletePatient(${patient.id})" title="Supprimer">
                            <i class="fas fa-trash"></i>
                        </button>
                        ` : `
                        <button class="action-btn btn-info" onclick="viewPatientDocuments(${patient.id})" title="Documents">
                            <i class="fas fa-file-medical"></i>
                        </button>
                        <button class="action-btn btn-success" onclick="exportSinglePatient(${patient.id})" title="Exporter">
                            <i class="fas fa-download"></i>
                        </button>
                        `}
                    </div>
                </td>
            </tr>
        `).join('');
    }

    loadDocuments() {
        const searchTerm = this.getElementValue('documentSearch');
        const typeFilter = this.getElementValue('documentType');
        const statusFilter = this.getElementValue('documentStatus');

        let filteredDocuments = [...this.data.documents];

        // Appliquer le filtre par patient si défini
        if (this.currentPatientFilter) {
            filteredDocuments = filteredDocuments.filter(doc => doc.patientId === this.currentPatientFilter);
        }

        if (searchTerm) {
            filteredDocuments = DocumentManager.searchDocuments(filteredDocuments, searchTerm);
        }

        if (typeFilter || statusFilter) {
            filteredDocuments = DocumentManager.filterDocuments(filteredDocuments, {
                type: typeFilter,
                status: statusFilter
            });
        }

        // Vérifier si l'utilisateur a seulement les permissions de vue
        const isViewOnly = this.currentUser && 
                          (this.currentUser.role === 'nurse' || 
                           this.currentUser.permissions.includes('documents_view'));
        
        this.renderDocumentsGrid(filteredDocuments, isViewOnly);
    }

    renderDocumentsGrid(documents, isViewOnly = false) {
        const grid = document.getElementById('documentsGrid');
        if (!grid) return;

        grid.innerHTML = documents.map(doc => `
            <div class="col-md-4 mb-4">
                <div class="document-card">
                    <div class="document-icon">
                        <i class="fas ${this.getDocumentTypeIcon(doc.type)}"></i>
                    </div>
                    <div class="document-title">${doc.title}</div>
                    <div class="document-meta">
                        <div><strong>Patient:</strong> ${doc.patientName}</div>
                        <div><strong>Type:</strong> ${this.getDocumentTypeLabel(doc.type)}</div>
                        <div><strong>Date:</strong> ${this.formatDate(doc.date)}</div>
                        <div><strong>Qualité:</strong> 
                            <span class="badge bg-${this.getQualityColor(doc.quality)}">
                                ${doc.quality}%
                            </span>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mt-2">
                            <span class="badge bg-${this.getStatusColor(doc.status)}">
                                ${this.getStatusLabel(doc.status)}
                            </span>
                            ${doc.aiProcessed ? '<span class="badge bg-warning"><i class="fas fa-robot me-1"></i>IA</span>' : ''}
                        </div>
                    </div>
                    <div class="document-actions">
                        <button class="btn btn-primary btn-sm" onclick="viewDocument(${doc.id})" title="Voir">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${!isViewOnly ? `
                            <button class="btn btn-warning btn-sm" onclick="editDocument(${doc.id})" title="Modifier">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-success btn-sm" onclick="downloadDocument(${doc.id})" title="Télécharger PDF">
                            <i class="fas fa-file-pdf"></i>
                        </button>
                            <button class="btn btn-info btn-sm" onclick="exportSingleDocument(${doc.id})" title="Exporter Excel">
                                <i class="fas fa-file-excel"></i>
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="deleteDocument(${doc.id})" title="Supprimer">
                                <i class="fas fa-trash"></i>
                            </button>
                        ` : `
                            <button class="btn btn-success btn-sm" onclick="downloadDocument(${doc.id})" title="Télécharger PDF">
                                <i class="fas fa-file-pdf"></i>
                            </button>
                            <button class="btn btn-info btn-sm" onclick="exportSingleDocument(${doc.id})" title="Exporter Excel">
                                <i class="fas fa-file-excel"></i>
                            </button>
                        `}
                    </div>
                </div>
            </div>
        `).join('');
    }

    loadScanner() {
        if (window.scanner) {
            window.scanner.loadScanner();
        }
    }

    loadReports() {
        // Vérifier si l'utilisateur a seulement les permissions de vue
        const isViewOnly = this.currentUser && 
                          (this.currentUser.role === 'nurse' || 
                           this.currentUser.permissions.includes('reports_view'));
        
        this.renderReportsList(this.data.reports, isViewOnly);
        
        // Mettre à jour les statistiques IA
        if (typeof updateAIStats === 'function') {
            updateAIStats();
        }
    }

    renderReportsList(reports, isViewOnly = false) {
        const container = document.getElementById('reportsList');
        if (!container) return;

        container.innerHTML = reports.map(report => `
            <div class="col-md-6 mb-4">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">
                            <i class="fas ${this.getReportTypeIcon(report.type)} me-2"></i>
                            ${report.title}
                        </h5>
                        <p class="card-text">${report.summary}</p>
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <div>
                                <span class="badge bg-primary me-2">${this.getReportTypeLabel(report.type)}</span>
                                <span class="badge bg-${this.getStatusColor(report.status)}">${this.getStatusLabel(report.status)}</span>
                                ${report.aiInsights ? '<span class="badge bg-warning ms-2"><i class="fas fa-brain me-1"></i>IA</span>' : ''}
                            </div>
                        </div>
                        <div class="d-flex justify-content-between align-items-center">
                            <small class="text-muted">
                                <i class="fas fa-calendar me-1"></i>${this.formatDate(report.date)}
                            </small>
                            <div class="btn-group btn-group-sm">
                                <button class="btn btn-outline-primary" onclick="viewReport(${report.id})" title="Voir">
                                    <i class="fas fa-eye"></i>
                                </button>
                                ${!isViewOnly ? `
                                    <button class="btn btn-outline-warning" onclick="editReport(${report.id})" title="Modifier">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-outline-danger" onclick="deleteReport(${report.id})" title="Supprimer">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                ` : ''}
                                <button class="btn btn-outline-success" onclick="exportSingleReport(${report.id})" title="Télécharger Excel">
                                    <i class="fas fa-file-excel"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    loadUsers() {
        this.renderUsersTable(this.data.users);
    }

    renderUsersTable(users) {
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;

        tbody.innerHTML = users.map(user => `
            <tr>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="avatar-sm bg-light text-primary rounded-circle me-3">
                            ${user.initials}
                        </div>
                        <div>
                            <div class="fw-bold">${user.firstName} ${user.lastName}</div>
                            <small class="text-muted">${user.department}</small>
                        </div>
                    </div>
                </td>
                <td>${user.email}</td>
                <td>
                    <span class="badge bg-${this.getRoleColor(user.role)}">
                        ${user.roleName}
                    </span>
                </td>
                <td>${user.department}</td>
                <td>
                    <small class="text-muted">${user.lastLogin || 'Jamais'}</small>
                </td>
                <td>
                    <span class="badge bg-${user.isActive ? 'success' : 'danger'}">
                        ${user.isActive ? 'Actif' : 'Inactif'}
                    </span>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="viewUser(${user.id})" title="Voir">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-outline-warning" onclick="editUser(${user.id})" title="Modifier">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-${user.isActive ? 'danger' : 'success'}" 
                                onclick="toggleUserStatus(${user.id})" 
                                title="${user.isActive ? 'Désactiver' : 'Activer'}">
                            <i class="fas fa-${user.isActive ? 'user-slash' : 'user-check'}"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    loadSettingsPage() {
        if (window.SettingsManager) {
            window.SettingsManager.loadSettingsIntoForm();
        }
        
        // Mettre à jour les informations système
        this.updateElement('systemUptime', this.getSystemUptime());
        this.updateElement('totalUsers', `${this.data.users.filter(u => u.isActive).length} actifs`);
        this.updateElement('totalDocuments', this.data.documents.length);
        
        // Mettre à jour les informations de sauvegarde
        const lastBackup = localStorage.getItem('lastBackup');
        if (lastBackup) {
            const backupDate = new Date(lastBackup);
            this.updateElement('lastBackup', backupDate.toLocaleString('fr-FR'));
        } else {
            this.updateElement('lastBackup', 'Jamais');
        }
        
        // Calculer l'utilisation du stockage
        if (window.SettingsManager) {
            const diskUsage = window.SettingsManager.calculateDiskUsage();
            this.updateElement('diskUsage', diskUsage);
        }
        
        // Mettre à jour les statistiques système
        this.updateSystemStats();
    }

    updateSystemStats() {
        // Mettre à jour les statistiques en temps réel
        const systemInfo = window.SettingsManager ? window.SettingsManager.getSystemInfo() : {};
        
        if (systemInfo.totalUsers) {
            this.updateElement('totalUsers', `${systemInfo.totalUsers} actifs`);
        }
        if (systemInfo.totalDocuments) {
            this.updateElement('totalDocuments', systemInfo.totalDocuments);
        }
        if (systemInfo.uptime) {
            this.updateElement('systemUptime', systemInfo.uptime);
        }
    }

    loadSettings() {
        if (window.SettingsManager) {
            const settings = window.SettingsManager.loadSettings();
            window.SettingsManager.applyAllSettings(settings);
        }
    }

    // Méthodes utilitaires
    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    getElementValue(id) {
        const element = document.getElementById(id);
        return element ? element.value : '';
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR');
    }

    getDocumentTypeIcon(type) {
        const icons = {
            medical_record: 'fa-file-medical',
            prescription: 'fa-prescription',
            lab_results: 'fa-flask',
            xray: 'fa-x-ray',
            consultation: 'fa-user-md',
            other: 'fa-file'
        };
        return icons[type] || 'fa-file';
    }

    getDocumentTypeLabel(type) {
        const labels = {
            medical_record: 'Dossier Médical',
            prescription: 'Ordonnance',
            lab_results: 'Analyses',
            xray: 'Radiographie',
            consultation: 'Consultation',
            other: 'Autre'
        };
        return labels[type] || type;
    }

    getStatusColor(status) {
        const colors = {
            active: 'success', inactive: 'secondary', pending_review: 'warning',
            approved: 'success', rejected: 'danger', draft: 'secondary', completed: 'success'
        };
        return colors[status] || 'secondary';
    }

    getStatusLabel(status) {
        const labels = {
            active: 'Actif', inactive: 'Inactif', pending_review: 'En révision',
            approved: 'Approuvé', rejected: 'Rejeté', draft: 'Brouillon', completed: 'Terminé'
        };
        return labels[status] || status;
    }

    getQualityColor(quality) {
        if (quality >= 90) return 'success';
        if (quality >= 75) return 'warning';
        return 'danger';
    }

    getRoleColor(role) {
        const colors = { admin: 'danger', doctor: 'success', nurse: 'info', technician: 'warning' };
        return colors[role] || 'secondary';
    }

    getReportTypeIcon(type) {
        const icons = {
            consultation: 'fa-user-md', examination: 'fa-stethoscope', surgery: 'fa-scalpel',
            discharge: 'fa-sign-out-alt', follow_up: 'fa-calendar-check', emergency: 'fa-ambulance',
            ai_analysis: 'fa-robot', other: 'fa-file-alt'
        };
        return icons[type] || 'fa-file-alt';
    }

    getReportTypeLabel(type) {
        const labels = {
            consultation: 'Consultation', examination: 'Examen', surgery: 'Chirurgie',
            discharge: 'Sortie', follow_up: 'Suivi', emergency: 'Urgence',
            ai_analysis: 'Analyse IA', other: 'Autre'
        };
        return labels[type] || type;
    }

    getSystemUptime() {
        const startTime = localStorage.getItem('systemStartTime') || Date.now();
        const uptime = Date.now() - parseInt(startTime);
        const hours = Math.floor(uptime / (1000 * 60 * 60));
        const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    }

    startSystemTime() {
        if (!localStorage.getItem('systemStartTime')) {
            localStorage.setItem('systemStartTime', Date.now().toString());
        }
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const toastBody = document.getElementById('toastBody');
        const toastIcon = toast.querySelector('.toast-header i');

        if (toastBody) toastBody.textContent = message;

        if (toastIcon) {
            const iconClasses = {
                success: 'fa-check-circle text-success',
                error: 'fa-exclamation-circle text-danger',
                warning: 'fa-exclamation-triangle text-warning',
                info: 'fa-info-circle text-primary'
            };
            toastIcon.className = `fas ${iconClasses[type] || iconClasses.info} me-2`;
        }

        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.showLoginPage();
        this.showToast('Déconnexion réussie', 'info');
    }

    // Méthodes d'action pour les patients
    viewPatient(id) { 
        const patient = this.data.patients.find(p => p.id === id);
        if (patient) {
            this.showPatientModal(patient, 'view');
        } else {
            this.showToast('Patient non trouvé', 'error');
        }
    }
    
    editPatient(id) { 
        console.log('editPatient appelé avec ID:', id);
        const patient = this.data.patients.find(p => p.id === id);
        if (patient) {
            console.log('Patient trouvé pour édition:', patient);
            this.showPatientModal(patient, 'edit');
        } else {
            console.log('Patient non trouvé pour ID:', id);
            this.showToast('Patient non trouvé', 'error');
        }
    }
    
    deletePatient(id) {
        const patient = this.data.patients.find(p => p.id === id);
        if (patient) {
            if (confirm(`Êtes-vous sûr de vouloir supprimer le patient ${patient.firstName} ${patient.lastName} ?`)) {
                // Supprimer les documents associés
                this.data.documents = this.data.documents.filter(doc => doc.patientId !== id);
                
                // Supprimer le patient
                this.data.patients = this.data.patients.filter(p => p.id !== id);
                
                // Enregistrer l'activité
                this.logActivity('patient_deleted', 'Patient supprimé', 
                    `Patient ${patient.firstName} ${patient.lastName} supprimé`, {
                        patientId: patient.id,
                        patientName: `${patient.firstName} ${patient.lastName}`
                    });
                
                // Sauvegarder
                localStorage.setItem('medicalDigitizationData', JSON.stringify(this.data));
                
                this.loadPatients();
                this.loadDocuments();
                this.loadDashboardData();
                this.showToast(`Patient ${patient.firstName} ${patient.lastName} supprimé`, 'success');
            }
        } else {
            this.showToast('Patient non trouvé', 'error');
        }
    }
    
    // Exporter les patients en Excel
    exportPatientsToExcel() {
        if (this.data.patients.length === 0) {
            this.showToast('Aucun patient à exporter', 'warning');
            return;
        }
        
        this.showToast('Export des patients en cours...', 'info');
        
        const result = ExportUtils.exportPatientsToExcel(this.data.patients);
        
        if (result.success) {
            this.showToast('Export Excel des patients réussi', 'success');
            this.logActivity('patients_exported', 'Export Patients', `${this.data.patients.length} patients exportés en Excel`);
        } else {
            this.showToast(`Erreur: ${result.message}`, 'error');
        }
    }
    
    // Exporter les documents en Excel
    exportDocumentsToExcel() {
        if (this.data.documents.length === 0) {
            this.showToast('Aucun document à exporter', 'warning');
            return;
        }
        
        this.showToast('Export des documents en cours...', 'info');
        
        const result = ExportUtils.exportDocumentsToExcel(this.data.documents);
        
        if (result.success) {
            this.showToast('Export Excel des documents réussi', 'success');
            this.logActivity('documents_exported', 'Export Documents', `${this.data.documents.length} documents exportés en Excel`);
        } else {
            this.showToast(`Erreur: ${result.message}`, 'error');
        }
    }
    
    // Exporter toutes les données
    exportAllData() {
        this.showToast('Export de toutes les données en cours...', 'info');
        
        const result = ExportUtils.exportAllDataToExcel(this.data);
        
        if (result.success) {
            this.showToast('Export complet réussi', 'success');
            this.logActivity('all_data_exported', 'Export Complet', 'Toutes les données exportées');
        } else {
            this.showToast(`Erreur: ${result.message}`, 'error');
        }
    }
    
    // Exporter un seul patient
    exportSinglePatient(patientId) {
        const patient = this.data.patients.find(p => p.id === patientId);
        if (!patient) {
            this.showToast('Patient non trouvé', 'error');
            return;
        }
        
        this.showToast(`Export du patient ${patient.firstName} ${patient.lastName}...`, 'info');
        
        const result = ExportUtils.exportPatientsToExcel([patient]);
        
        if (result.success) {
            this.showToast(`Patient ${patient.firstName} ${patient.lastName} exporté avec succès`, 'success');
            this.logActivity('patient_exported', 'Export Patient', `Patient ${patient.firstName} ${patient.lastName} exporté individuellement`);
        } else {
            this.showToast(`Erreur: ${result.message}`, 'error');
        }
    }
    
    // Exporter un seul document
    exportSingleDocument(documentId) {
        const document = this.data.documents.find(d => d.id === documentId);
        if (!document) {
            this.showToast('Document non trouvé', 'error');
            return;
        }
        
        this.showToast(`Export du document "${document.title}"...`, 'info');
        
        const result = ExportUtils.exportDocumentsToExcel([document]);
        
        if (result.success) {
            this.showToast(`Document "${document.title}" exporté avec succès`, 'success');
            this.logActivity('document_exported', 'Export Document', `Document "${document.title}" exporté individuellement`);
        } else {
            this.showToast(`Erreur: ${result.message}`, 'error');
        }
    }
    
    // Exporter tous les rapports en Excel
    exportReportsToExcel() {
        if (this.data.reports.length === 0) {
            this.showToast('Aucun rapport à exporter', 'warning');
            return;
        }
        
        this.showToast('Export des rapports en cours...', 'info');
        
        const result = ExportUtils.exportReportsToExcel(this.data.reports);
        
        if (result.success) {
            this.showToast('Export Excel des rapports réussi', 'success');
            this.logActivity('reports_exported', 'Export Rapports', `${this.data.reports.length} rapports exportés en Excel`);
        } else {
            this.showToast(`Erreur: ${result.message}`, 'error');
        }
    }
    
    // Exporter un seul rapport en Excel
    exportSingleReport(reportId) {
        const report = this.data.reports.find(r => r.id === reportId);
        if (!report) {
            this.showToast('Rapport non trouvé', 'error');
            return;
        }
        
        this.showToast(`Export du rapport "${report.title}"...`, 'info');
        
        const result = ExportUtils.exportReportsToExcel([report]);
        
        if (result.success) {
            this.showToast(`Rapport "${report.title}" exporté avec succès`, 'success');
            this.logActivity('report_exported', 'Rapport Exporté', `Rapport "${report.title}" exporté en Excel`);
        } else {
            this.showToast(`Erreur: ${result.message}`, 'error');
        }
    }
    
    // Confirmer la sauvegarde des données
    confirmDataBackup() {
        if (confirm('Voulez-vous créer une sauvegarde complète de toutes les données ?\n\nCela inclut :\n- Tous les patients\n- Tous les documents\n- Tous les rapports\n- Tous les utilisateurs\n- Toutes les activités')) {
            this.exportAllData();
        }
    }
    
    viewPatientDocuments(id) { 
        const patient = this.data.patients.find(p => p.id === id);
        if (patient) {
            this.showToast(`Affichage des documents de ${patient.firstName} ${patient.lastName}`, 'info');
            // Filtrer les documents par patient
            this.currentPatientFilter = id;
            this.showPage('documents');
        }
    }
    
    // Méthodes d'action pour les documents
    viewDocument(id) { 
        console.log('viewDocument appelé avec ID:', id);
        const document = this.data.documents.find(d => d.id === id);
        if (document) {
            console.log('Document trouvé:', document);
            this.showDocumentModal(document, 'view');
        } else {
            console.log('Document non trouvé pour ID:', id);
            this.showToast('Document non trouvé', 'error');
        }
    }
    
    editDocument(id) {
        console.log('editDocument appelé avec ID:', id);
        const document = this.data.documents.find(d => d.id === id);
        if (document) {
            console.log('Document trouvé pour édition:', document);
            this.showDocumentModal(document, 'edit');
        } else {
            console.log('Document non trouvé pour ID:', id);
            this.showToast('Document non trouvé', 'error');
        }
    }
    
    deleteDocument(id) {
        console.log('deleteDocument appelé avec ID:', id);
        const document = this.data.documents.find(d => d.id === id);
        if (document) {
            console.log('Document trouvé pour suppression:', document);
            if (confirm(`Êtes-vous sûr de vouloir supprimer le document "${document.title}" ?`)) {
                // Supprimer le document
                this.data.documents = this.data.documents.filter(d => d.id !== id);
                
                // Mettre à jour le compteur de documents du patient
                const patient = this.data.patients.find(p => p.id === document.patientId);
                if (patient) {
                    patient.documentsCount = Math.max(0, (patient.documentsCount || 1) - 1);
                }
                
                // Enregistrer l'activité
                this.logActivity('document_deleted', 'Document supprimé', 
                    `Document "${document.title}" supprimé`, {
                        documentId: document.id,
                        documentTitle: document.title,
                        patientId: document.patientId
                    });
                
                // Sauvegarder
                localStorage.setItem('medicalDigitizationData', JSON.stringify(this.data));
                
                this.loadDocuments();
                this.loadPatients();
                this.loadDashboardData();
                this.showToast(`Document "${document.title}" supprimé`, 'success');
            }
        } else {
            this.showToast('Document non trouvé', 'error');
        }
    }
    
    downloadDocument(id) { 
        const document = this.data.documents.find(d => d.id === id);
        if (document) {
            this.showToast(`Téléchargement de "${document.title}"...`, 'info');
            
            // Utiliser ExportUtils pour créer un vrai PDF
            const result = ExportUtils.exportDocumentToPDF(document);
            
            if (result.success) {
                this.showToast(`Document "${document.title}" téléchargé en PDF`, 'success');
                this.logActivity('document_exported', 'Document Exporté', `Document "${document.title}" exporté en PDF`);
            } else {
                this.showToast(`Erreur: ${result.message}`, 'error');
            }
        } else {
            this.showToast('Document non trouvé', 'error');
        }
    }
    
    // Méthodes d'action pour les rapports
    viewReport(id) { 
        const report = this.data.reports.find(r => r.id === id);
        if (report) {
            this.showReportModal(report, 'view');
        } else {
            this.showToast('Rapport non trouvé', 'error');
        }
    }
    
    editReport(id) {
        console.log('editReport appelé avec ID:', id);
        const report = this.data.reports.find(r => r.id === id);
        if (report) {
            console.log('Rapport trouvé pour édition:', report);
            this.showReportModal(report, 'edit');
        } else {
            console.log('Rapport non trouvé pour ID:', id);
            this.showToast('Rapport non trouvé', 'error');
        }
    }
    
    deleteReport(id) {
        console.log('deleteReport appelé avec ID:', id);
        const report = this.data.reports.find(r => r.id === id);
        if (report) {
            console.log('Rapport trouvé pour suppression:', report);
            if (confirm(`Êtes-vous sûr de vouloir supprimer le rapport "${report.title}" ?`)) {
                // Supprimer le rapport
                this.data.reports = this.data.reports.filter(r => r.id !== id);
                
                // Enregistrer l'activité
                this.logActivity('report_deleted', 'Rapport supprimé', 
                    `Rapport "${report.title}" supprimé`, {
                        reportId: report.id,
                        reportTitle: report.title,
                        patientId: report.patientId,
                        patientName: report.patientName
                    });
                
                // Sauvegarder
                localStorage.setItem('medicalDigitizationData', JSON.stringify(this.data));
                
                this.loadReports();
                this.loadDashboardData();
                this.showToast(`Rapport "${report.title}" supprimé`, 'success');
            }
        } else {
            this.showToast('Rapport non trouvé', 'error');
        }
    }
    
    downloadReport(id) { 
        const report = this.data.reports.find(r => r.id === id);
        if (report) {
            this.showToast(`Téléchargement du rapport "${report.title}"...`, 'info');
            
            // Utiliser ExportUtils pour créer un vrai PDF
            const result = ExportUtils.exportReportToPDF(report);
            
            if (result.success) {
                this.showToast(`Rapport "${report.title}" téléchargé en PDF`, 'success');
                this.logActivity('report_exported', 'Rapport Exporté', `Rapport "${report.title}" exporté en PDF`);
            } else {
                this.showToast(`Erreur: ${result.message}`, 'error');
            }
        } else {
            this.showToast('Rapport non trouvé', 'error');
        }
    }
    
    // Méthodes d'action pour les utilisateurs
    viewUser(id) { 
        const user = this.data.users.find(u => u.id === id);
        if (user) {
            this.showUserModal(user, 'view');
        } else {
            this.showToast('Utilisateur non trouvé', 'error');
        }
    }
    
    editUser(id) { 
        const user = this.data.users.find(u => u.id === id);
        if (user) {
            this.showUserModal(user, 'edit');
        } else {
            this.showToast('Utilisateur non trouvé', 'error');
        }
    }

    // Fonctions modales
    showPatientModal(patient, mode = 'view') {
        console.log('showPatientModal appelé avec:', patient, 'mode:', mode);
        const modalId = `patientModal_${patient.id}`;
        const isEdit = mode === 'edit';
        
        const modalHTML = `
            <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title" id="${modalId}Label">
                                <i class="fas fa-user me-2"></i>${isEdit ? 'Modifier' : 'Voir'} Patient - ${patient.firstName} ${patient.lastName}
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="patientForm_${patient.id}">
                                <div class="row">
                                    <div class="col-md-4">
                                        <div class="mb-3">
                                            <label class="form-label fw-bold">Prénom *</label>
                                            <input type="text" class="form-control" id="patientFirstName_${patient.id}" 
                                                   value="${patient.firstName}" ${!isEdit ? 'readonly' : ''} required>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="mb-3">
                                            <label class="form-label fw-bold">Nom *</label>
                                            <input type="text" class="form-control" id="patientLastName_${patient.id}" 
                                                   value="${patient.lastName}" ${!isEdit ? 'readonly' : ''} required>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="mb-3">
                                            <label class="form-label fw-bold">Carte d'Identité *</label>
                                            <input type="text" class="form-control" id="patientCI_${patient.id}" 
                                                   value="${patient.ci || ''}" ${!isEdit ? 'readonly' : ''} required>
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label fw-bold">ID Patient</label>
                                            <input type="text" class="form-control" value="${patient.patientId}" readonly>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label fw-bold">Date de naissance *</label>
                                            <input type="date" class="form-control" id="patientDateOfBirth_${patient.id}" 
                                                   value="${patient.dateOfBirth}" ${!isEdit ? 'readonly' : ''} required>
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label fw-bold">Genre *</label>
                                            <select class="form-select" id="patientGender_${patient.id}" ${!isEdit ? 'disabled' : ''} required>
                                                <option value="male" ${patient.gender === 'male' ? 'selected' : ''}>Homme</option>
                                                <option value="female" ${patient.gender === 'female' ? 'selected' : ''}>Femme</option>
                                                <option value="other" ${patient.gender === 'other' ? 'selected' : ''}>Autre</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label fw-bold">Téléphone</label>
                                            <input type="tel" class="form-control" id="patientPhone_${patient.id}" 
                                                   value="${patient.phone || ''}" ${!isEdit ? 'readonly' : ''}>
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label fw-bold">Email</label>
                                            <input type="email" class="form-control" id="patientEmail_${patient.id}" 
                                                   value="${patient.email || ''}" ${!isEdit ? 'readonly' : ''}>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label fw-bold">Statut</label>
                                            <select class="form-select" id="patientStatus_${patient.id}" ${!isEdit ? 'disabled' : ''}>
                                                <option value="active" ${patient.status === 'active' ? 'selected' : ''}>Actif</option>
                                                <option value="inactive" ${patient.status === 'inactive' ? 'selected' : ''}>Inactif</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label fw-bold">Âge</label>
                                            <input type="text" class="form-control" value="${patient.age} ans" readonly>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label fw-bold">Documents</label>
                                            <input type="text" class="form-control" value="${patient.documentsCount || 0} documents" readonly>
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label fw-bold">Adresse</label>
                                            <textarea class="form-control" id="patientAddress_${patient.id}" rows="2" ${!isEdit ? 'readonly' : ''}>${patient.address || ''}</textarea>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label fw-bold">Ville</label>
                                            <input type="text" class="form-control" id="patientCity_${patient.id}" 
                                                   value="${patient.city || ''}" ${!isEdit ? 'readonly' : ''}>
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-4">
                                        <div class="mb-3">
                                            <label class="form-label fw-bold">Groupe Sanguin</label>
                                            <select class="form-select" id="patientBloodType_${patient.id}" ${!isEdit ? 'disabled' : ''}>
                                                <option value="">Sélectionner</option>
                                                <option value="A+" ${patient.bloodType === 'A+' ? 'selected' : ''}>A+</option>
                                                <option value="A-" ${patient.bloodType === 'A-' ? 'selected' : ''}>A-</option>
                                                <option value="B+" ${patient.bloodType === 'B+' ? 'selected' : ''}>B+</option>
                                                <option value="B-" ${patient.bloodType === 'B-' ? 'selected' : ''}>B-</option>
                                                <option value="AB+" ${patient.bloodType === 'AB+' ? 'selected' : ''}>AB+</option>
                                                <option value="AB-" ${patient.bloodType === 'AB-' ? 'selected' : ''}>AB-</option>
                                                <option value="O+" ${patient.bloodType === 'O+' ? 'selected' : ''}>O+</option>
                                                <option value="O-" ${patient.bloodType === 'O-' ? 'selected' : ''}>O-</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="mb-3">
                                            <label class="form-label fw-bold">Contact d'Urgence</label>
                                            <input type="tel" class="form-control" id="patientEmergencyContact_${patient.id}" 
                                                   value="${patient.emergencyContact || ''}" ${!isEdit ? 'readonly' : ''}>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="mb-3">
                                            <label class="form-label fw-bold">Assurance</label>
                                            <input type="text" class="form-control" id="patientInsurance_${patient.id}" 
                                                   value="${patient.insurance || ''}" ${!isEdit ? 'readonly' : ''}>
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label fw-bold">Allergies</label>
                                            <textarea class="form-control" id="patientAllergies_${patient.id}" rows="2" ${!isEdit ? 'readonly' : ''}>${patient.allergies || ''}</textarea>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label fw-bold">Antécédents Médicaux</label>
                                            <textarea class="form-control" id="patientMedicalHistory_${patient.id}" rows="2" ${!isEdit ? 'readonly' : ''}>${patient.medicalHistory || ''}</textarea>
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label fw-bold">Profession</label>
                                            <input type="text" class="form-control" id="patientOccupation_${patient.id}" 
                                                   value="${patient.occupation || ''}" ${!isEdit ? 'readonly' : ''}>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label fw-bold">État Civil</label>
                                            <select class="form-select" id="patientMaritalStatus_${patient.id}" ${!isEdit ? 'disabled' : ''}>
                                                <option value="">Sélectionner</option>
                                                <option value="single" ${patient.maritalStatus === 'single' ? 'selected' : ''}>Célibataire</option>
                                                <option value="married" ${patient.maritalStatus === 'married' ? 'selected' : ''}>Marié(e)</option>
                                                <option value="divorced" ${patient.maritalStatus === 'divorced' ? 'selected' : ''}>Divorcé(e)</option>
                                                <option value="widowed" ${patient.maritalStatus === 'widowed' ? 'selected' : ''}>Veuf/Veuve</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label fw-bold">Notes Médicales</label>
                                    <textarea class="form-control" id="patientNotes_${patient.id}" rows="3" ${!isEdit ? 'readonly' : ''}>${patient.notes || ''}</textarea>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                <i class="fas fa-times me-2"></i>Fermer
                            </button>
                            ${isEdit ? `
                                <button type="button" class="btn btn-success" onclick="savePatient(${patient.id})">
                                    <i class="fas fa-save me-2"></i>Sauvegarder
                                </button>
                            ` : `
                                <button type="button" class="btn btn-warning" onclick="editPatient(${patient.id})">
                                    <i class="fas fa-edit me-2"></i>Modifier
                                </button>
                            `}
                            <button type="button" class="btn btn-info" onclick="exportSinglePatient(${patient.id})">
                                <i class="fas fa-file-excel me-2"></i>Exporter Excel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Supprimer le modal existant s'il y en a un
        const existingModal = document.getElementById(modalId);
        if (existingModal) {
            existingModal.remove();
        }
        
        // Ajouter le modal au DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Afficher le modal
        const modal = new bootstrap.Modal(document.getElementById(modalId));
        modal.show();
        
        // Supprimer le modal du DOM quand il est fermé
        document.getElementById(modalId).addEventListener('hidden.bs.modal', () => {
            document.getElementById(modalId).remove();
        });
    }

    showDocumentModal(document, mode = 'view') {
        console.log('showDocumentModal appelé avec:', document, 'mode:', mode);
        const modalId = `documentModal_${document.id}`;
        const isEdit = mode === 'edit';
        
        const modalHTML = `
            <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true">
                <div class="modal-dialog modal-xl">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title" id="${modalId}Label">
                                <i class="fas fa-file-medical me-2"></i>${isEdit ? 'Modifier' : 'Voir'} Document - ${document.title}
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6">
                                    ${document.imageData ? `
                                        <img src="${document.imageData}" alt="Document" class="img-fluid rounded mb-3" style="max-height: 400px;">
                                    ` : `
                                        <div class="text-center p-4 bg-light rounded">
                                            <i class="fas fa-file-medical fa-3x text-muted mb-3"></i>
                                            <p class="text-muted">Aperçu du document non disponible</p>
                                        </div>
                                    `}
                                </div>
                                <div class="col-md-6">
                                    <form id="documentForm_${document.id}">
                                        <div class="mb-3">
                                            <label class="form-label fw-bold">Titre *</label>
                                            <input type="text" class="form-control" id="documentTitle_${document.id}" 
                                                   value="${document.title}" ${!isEdit ? 'readonly' : ''} required>
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label fw-bold">Type de Document *</label>
                                            <select class="form-select" id="documentType_${document.id}" ${!isEdit ? 'disabled' : ''} required>
                                                <option value="medical_record" ${document.type === 'medical_record' ? 'selected' : ''}>Dossier Médical</option>
                                                <option value="prescription" ${document.type === 'prescription' ? 'selected' : ''}>Ordonnance</option>
                                                <option value="lab_results" ${document.type === 'lab_results' ? 'selected' : ''}>Analyses</option>
                                                <option value="xray" ${document.type === 'xray' ? 'selected' : ''}>Radiographie</option>
                                                <option value="consultation" ${document.type === 'consultation' ? 'selected' : ''}>Consultation</option>
                                                <option value="other" ${document.type === 'other' ? 'selected' : ''}>Autre</option>
                                            </select>
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label fw-bold">Patient *</label>
                                            <select class="form-select" id="documentPatient_${document.id}" ${!isEdit ? 'disabled' : ''} required>
                                                <option value="">Sélectionner un patient</option>
                                                ${this.data.patients.map(patient => 
                                                    `<option value="${patient.id}" ${patient.id === document.patientId ? 'selected' : ''}>${patient.firstName} ${patient.lastName} (${patient.patientId})</option>`
                                                ).join('')}
                                            </select>
                                        </div>
                                        <div class="row">
                                            <div class="col-md-6">
                                                <div class="mb-3">
                                                    <label class="form-label fw-bold">Date *</label>
                                                    <input type="date" class="form-control" id="documentDate_${document.id}" 
                                                           value="${document.date}" ${!isEdit ? 'readonly' : ''} required>
                                                </div>
                                            </div>
                                            <div class="col-md-6">
                                                <div class="mb-3">
                                                    <label class="form-label fw-bold">Priorité</label>
                                                    <select class="form-select" id="documentPriority_${document.id}" ${!isEdit ? 'disabled' : ''}>
                                                        <option value="low" ${document.priority === 'low' ? 'selected' : ''}>Faible</option>
                                                        <option value="medium" ${document.priority === 'medium' ? 'selected' : ''}>Moyenne</option>
                                                        <option value="high" ${document.priority === 'high' ? 'selected' : ''}>Élevée</option>
                                                        <option value="urgent" ${document.priority === 'urgent' ? 'selected' : ''}>Urgente</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label fw-bold">Description</label>
                                            <textarea class="form-control" id="documentDescription_${document.id}" rows="3" 
                                                      ${!isEdit ? 'readonly' : ''}>${document.metadata?.description || ''}</textarea>
                                        </div>
                                        <div class="row">
                                            <div class="col-md-6">
                                                <div class="mb-3">
                                                    <label class="form-label fw-bold">Statut</label>
                                                    <select class="form-select" id="documentStatus_${document.id}" ${!isEdit ? 'disabled' : ''}>
                                                        <option value="pending_review" ${document.status === 'pending_review' ? 'selected' : ''}>En révision</option>
                                                        <option value="approved" ${document.status === 'approved' ? 'selected' : ''}>Approuvé</option>
                                                        <option value="rejected" ${document.status === 'rejected' ? 'selected' : ''}>Rejeté</option>
                                                        <option value="archived" ${document.status === 'archived' ? 'selected' : ''}>Archivé</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div class="col-md-6">
                                                <div class="mb-3">
                                                    <label class="form-label fw-bold">Qualité</label>
                                                    <div class="d-flex align-items-center">
                                                        <span class="badge bg-${this.getQualityColor(document.quality)} me-2">${document.quality}%</span>
                                                        ${document.aiProcessed ? '<span class="badge bg-warning"><i class="fas fa-robot me-1"></i>Traité par IA</span>' : ''}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        ${document.aiResults ? `
                                            <div class="mb-3">
                                                <label class="form-label fw-bold">Résultats IA</label>
                                                <div class="p-3 bg-light rounded">
                                                    <p><strong>Confiance:</strong> ${Math.round(document.aiResults.confidence)}%</p>
                                                    <p><strong>Mots-clés:</strong> ${document.aiResults.keywords?.join(', ') || 'N/A'}</p>
                                                    <p><strong>Texte extrait:</strong></p>
                                                    <textarea class="form-control" rows="3" readonly>${document.aiResults.extractedText || ''}</textarea>
                                                </div>
                                            </div>
                                        ` : ''}
                                    </form>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                <i class="fas fa-times me-2"></i>Fermer
                            </button>
                            <button type="button" class="btn btn-success" onclick="downloadDocument(${document.id})">
                                <i class="fas fa-file-pdf me-2"></i>Télécharger PDF
                            </button>
                            <button type="button" class="btn btn-info" onclick="exportSingleDocument(${document.id})">
                                <i class="fas fa-file-excel me-2"></i>Exporter Excel
                            </button>
                            ${isEdit ? `
                                <button type="button" class="btn btn-primary" onclick="saveDocument(${document.id})">
                                    <i class="fas fa-save me-2"></i>Sauvegarder
                                </button>
                            ` : `
                                <button type="button" class="btn btn-warning" onclick="editDocument(${document.id})">
                                    <i class="fas fa-edit me-2"></i>Modifier
                                </button>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Supprimer le modal existant s'il y en a un
        const existingModal = document.getElementById(modalId);
        if (existingModal) {
            existingModal.remove();
        }
        
        // Ajouter le modal au DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Afficher le modal
        const modal = new bootstrap.Modal(document.getElementById(modalId));
        modal.show();
        
        // Supprimer le modal du DOM quand il est fermé
        document.getElementById(modalId).addEventListener('hidden.bs.modal', () => {
            document.getElementById(modalId).remove();
        });
    }

    // Fonctions de sauvegarde
    async savePatient(patientId) {
        const patient = this.data.patients.find(p => p.id === patientId);
        if (!patient) {
            this.showToast('Patient non trouvé', 'error');
            return;
        }

        const formData = {
            patient_id: document.getElementById(`patientPatientId_${patientId}`).value,
            first_name: document.getElementById(`patientFirstName_${patientId}`).value,
            last_name: document.getElementById(`patientLastName_${patientId}`).value,
            ci: document.getElementById(`patientCI_${patientId}`).value,
            date_of_birth: document.getElementById(`patientDateOfBirth_${patientId}`).value,
            gender: document.getElementById(`patientGender_${patientId}`).value,
            phone_number: document.getElementById(`patientPhone_${patientId}`).value,
            email: document.getElementById(`patientEmail_${patientId}`).value,
            address: document.getElementById(`patientAddress_${patientId}`).value,
            city: document.getElementById(`patientCity_${patientId}`).value,
            blood_type: document.getElementById(`patientBloodType_${patientId}`).value,
            emergency_contact: document.getElementById(`patientEmergencyContact_${patientId}`).value,
            insurance_provider: document.getElementById(`patientInsurance_${patientId}`).value,
            allergies: document.getElementById(`patientAllergies_${patientId}`).value,
            medical_history: document.getElementById(`patientMedicalHistory_${patientId}`).value,
            occupation: document.getElementById(`patientOccupation_${patientId}`).value,
            marital_status: document.getElementById(`patientMaritalStatus_${patientId}`).value,
            notes: document.getElementById(`patientNotes_${patientId}`).value,
            status: document.getElementById(`patientStatus_${patientId}`).value
        };

        try {
            // Envoyer au backend
            const response = await fetch(`/api/patients/${patientId}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCSRFToken()
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                // Mettre à jour localement
                Object.assign(patient, {
                    firstName: formData.first_name,
                    lastName: formData.last_name,
                    ci: formData.ci,
                    dateOfBirth: formData.date_of_birth,
                    age: this.calculateAge(formData.date_of_birth),
                    gender: formData.gender,
                    phone: formData.phone_number,
                    email: formData.email,
                    address: formData.address,
                    city: formData.city,
                    bloodType: formData.blood_type,
                    emergencyContact: formData.emergency_contact,
                    insurance: formData.insurance_provider,
                    allergies: formData.allergies,
                    medicalHistory: formData.medical_history,
                    occupation: formData.occupation,
                    maritalStatus: formData.marital_status,
                    notes: formData.notes,
                    status: formData.status,
                    updatedAt: new Date().toISOString()
                });

                this.showToast('Patient mis à jour avec succès !', 'success');
                
                // Fermer le modal
                const modal = bootstrap.Modal.getInstance(document.getElementById(`patientModal_${patientId}`));
                if (modal) {
                    modal.hide();
                }

                // Recharger les données
                this.loadPatients();
                this.loadDashboardData();
            } else {
                this.showToast('Erreur lors de la mise à jour du patient', 'error');
            }
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            this.showToast('Erreur de connexion au serveur', 'error');
        }
    }

    saveDocument(documentId) {
        const document = this.data.documents.find(d => d.id === documentId);
        if (!document) {
            this.showToast('Document non trouvé', 'error');
            return;
        }

        const formData = {
            title: document.getElementById(`documentTitle_${documentId}`).value,
            type: document.getElementById(`documentType_${documentId}`).value,
            patientId: parseInt(document.getElementById(`documentPatient_${documentId}`).value),
            date: document.getElementById(`documentDate_${documentId}`).value,
            priority: document.getElementById(`documentPriority_${documentId}`).value,
            status: document.getElementById(`documentStatus_${documentId}`).value,
            description: document.getElementById(`documentDescription_${documentId}`).value
        };

        // Validation
        if (!formData.title || !formData.type || !formData.patientId || !formData.date) {
            this.showToast('Veuillez remplir tous les champs obligatoires', 'error');
            return;
        }

        // Trouver le patient
        const patient = this.data.patients.find(p => p.id === formData.patientId);
        if (!patient) {
            this.showToast('Patient non trouvé', 'error');
            return;
        }

        // Mettre à jour le document
        document.title = formData.title;
        document.type = formData.type;
        document.patientId = formData.patientId;
        document.patientName = `${patient.firstName} ${patient.lastName}`;
        document.date = formData.date;
        document.priority = formData.priority;
        document.status = formData.status;
        document.metadata = document.metadata || {};
        document.metadata.description = formData.description;
        document.updatedAt = new Date().toISOString();

        // Enregistrer l'activité
        this.logActivity('document_updated', 'Document modifié', 
            `Document "${formData.title}" modifié`, {
                documentId: documentId,
                documentTitle: formData.title,
                patientId: formData.patientId,
                patientName: `${patient.firstName} ${patient.lastName}`
            });

        // Sauvegarder
        localStorage.setItem('medicalDigitizationData', JSON.stringify(this.data));

        // Fermer le modal
        const modal = bootstrap.Modal.getInstance(document.getElementById(`documentModal_${documentId}`));
        if (modal) {
            modal.hide();
        }

        // Recharger les données
        this.loadDocuments();
        this.loadDashboardData();

        this.showToast(`Document "${document.title}" mis à jour`, 'success');
    }

    // Fonctions modales pour les rapports et utilisateurs
    showReportModal(report, mode = 'view') {
        console.log('showReportModal appelé avec:', report, 'mode:', mode);
        const modalId = `reportModal_${report.id}`;
        const isEdit = mode === 'edit';
        
        const modalHTML = `
            <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header bg-info text-white">
                            <h5 class="modal-title" id="${modalId}Label">
                                <i class="fas fa-chart-line me-2"></i>${isEdit ? 'Modifier' : 'Voir'} Rapport - ${report.title}
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="reportForm_${report.id}">
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label fw-bold">Titre *</label>
                                            <input type="text" class="form-control" id="reportTitle_${report.id}" 
                                                   value="${report.title}" ${!isEdit ? 'readonly' : ''} required>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label fw-bold">Type de Rapport *</label>
                                            <select class="form-select" id="reportType_${report.id}" ${!isEdit ? 'disabled' : ''} required>
                                                <option value="medical" ${report.type === 'medical' ? 'selected' : ''}>Médical</option>
                                                <option value="lab" ${report.type === 'lab' ? 'selected' : ''}>Laboratoire</option>
                                                <option value="radiology" ${report.type === 'radiology' ? 'selected' : ''}>Radiologie</option>
                                                <option value="consultation" ${report.type === 'consultation' ? 'selected' : ''}>Consultation</option>
                                                <option value="surgery" ${report.type === 'surgery' ? 'selected' : ''}>Chirurgie</option>
                                                <option value="other" ${report.type === 'other' ? 'selected' : ''}>Autre</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label fw-bold">Patient *</label>
                                            <select class="form-select" id="reportPatient_${report.id}" ${!isEdit ? 'disabled' : ''} required>
                                                <option value="">Sélectionner un patient</option>
                                                ${this.data.patients.map(patient => 
                                                    `<option value="${patient.id}" ${patient.id === report.patientId ? 'selected' : ''}>${patient.firstName} ${patient.lastName} (${patient.patientId})</option>`
                                                ).join('')}
                                            </select>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label fw-bold">Date *</label>
                                            <input type="date" class="form-control" id="reportDate_${report.id}" 
                                                   value="${report.date}" ${!isEdit ? 'readonly' : ''} required>
                                        </div>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label fw-bold">Résumé</label>
                                    <textarea class="form-control" id="reportSummary_${report.id}" rows="4" 
                                              ${!isEdit ? 'readonly' : ''}>${report.summary || ''}</textarea>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label fw-bold">Détails du Rapport</label>
                                    <textarea class="form-control" id="reportDetails_${report.id}" rows="6" 
                                              ${!isEdit ? 'readonly' : ''}>${report.details || ''}</textarea>
                                </div>
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label fw-bold">Statut</label>
                                            <select class="form-select" id="reportStatus_${report.id}" ${!isEdit ? 'disabled' : ''}>
                                                <option value="draft" ${report.status === 'draft' ? 'selected' : ''}>Brouillon</option>
                                                <option value="completed" ${report.status === 'completed' ? 'selected' : ''}>Terminé</option>
                                                <option value="reviewed" ${report.status === 'reviewed' ? 'selected' : ''}>Révisé</option>
                                                <option value="approved" ${report.status === 'approved' ? 'selected' : ''}>Approuvé</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label fw-bold">Priorité</label>
                                            <select class="form-select" id="reportPriority_${report.id}" ${!isEdit ? 'disabled' : ''}>
                                                <option value="low" ${report.priority === 'low' ? 'selected' : ''}>Faible</option>
                                                <option value="medium" ${report.priority === 'medium' ? 'selected' : ''}>Moyenne</option>
                                                <option value="high" ${report.priority === 'high' ? 'selected' : ''}>Élevée</option>
                                                <option value="urgent" ${report.priority === 'urgent' ? 'selected' : ''}>Urgente</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                ${report.aiInsights ? `
                                    <div class="mb-3">
                                        <label class="form-label fw-bold">Insights IA</label>
                                        <div class="p-3 bg-light rounded">
                                            <p><strong>Confiance:</strong> ${Math.round(report.aiInsights.confidence || 0)}%</p>
                                            <p><strong>Mots-clés:</strong> ${report.aiInsights.keywords?.join(', ') || 'N/A'}</p>
                                            <p><strong>Recommandations:</strong></p>
                                            <textarea class="form-control" rows="3" readonly>${report.aiInsights.recommendations || ''}</textarea>
                                        </div>
                                    </div>
                                ` : ''}
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                <i class="fas fa-times me-2"></i>Fermer
                            </button>
                            <button type="button" class="btn btn-success" onclick="downloadReport(${report.id})">
                                <i class="fas fa-file-pdf me-2"></i>Télécharger PDF
                            </button>
                            ${isEdit ? `
                                <button type="button" class="btn btn-primary" onclick="saveReport(${report.id})">
                                    <i class="fas fa-save me-2"></i>Sauvegarder
                                </button>
                            ` : `
                                <button type="button" class="btn btn-warning" onclick="editReport(${report.id})">
                                    <i class="fas fa-edit me-2"></i>Modifier
                                </button>
                                <button type="button" class="btn btn-danger" onclick="deleteReport(${report.id})">
                                    <i class="fas fa-trash me-2"></i>Supprimer
                                </button>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Supprimer le modal existant s'il y en a un
        const existingModal = document.getElementById(modalId);
        if (existingModal) {
            existingModal.remove();
        }
        
        // Ajouter le modal au DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Afficher le modal
        const modal = new bootstrap.Modal(document.getElementById(modalId));
        modal.show();
        
        // Supprimer le modal du DOM quand il est fermé
        document.getElementById(modalId).addEventListener('hidden.bs.modal', () => {
            document.getElementById(modalId).remove();
        });
    }

    showUserModal(user, mode = 'view') {
        console.log('showUserModal appelé avec:', user, 'mode:', mode);
        const modalId = `userModal_${user.id}`;
        const isEdit = mode === 'edit';
        
        const modalHTML = `
            <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title" id="${modalId}Label">
                                <i class="fas fa-user me-2"></i>${isEdit ? 'Modifier' : 'Voir'} Utilisateur - ${user.firstName} ${user.lastName}
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="userForm_${user.id}">
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label fw-bold">Prénom *</label>
                                            <input type="text" class="form-control" id="userFirstName_${user.id}" 
                                                   value="${user.firstName}" ${!isEdit ? 'readonly' : ''} required>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label fw-bold">Nom *</label>
                                            <input type="text" class="form-control" id="userLastName_${user.id}" 
                                                   value="${user.lastName}" ${!isEdit ? 'readonly' : ''} required>
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label fw-bold">Email *</label>
                                            <input type="email" class="form-control" id="userEmail_${user.id}" 
                                                   value="${user.email}" ${!isEdit ? 'readonly' : ''} required>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label fw-bold">Rôle *</label>
                                            <select class="form-select" id="userRole_${user.id}" ${!isEdit ? 'disabled' : ''} required>
                                                <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Administrateur</option>
                                                <option value="doctor" ${user.role === 'doctor' ? 'selected' : ''}>Médecin</option>
                                                <option value="nurse" ${user.role === 'nurse' ? 'selected' : ''}>Infirmier</option>
                                                <option value="technician" ${user.role === 'technician' ? 'selected' : ''}>Technicien</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label fw-bold">Département</label>
                                            <input type="text" class="form-control" id="userDepartment_${user.id}" 
                                                   value="${user.department || ''}" ${!isEdit ? 'readonly' : ''}>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label fw-bold">Statut</label>
                                            <select class="form-select" id="userStatus_${user.id}" ${!isEdit ? 'disabled' : ''}>
                                                <option value="active" ${user.isActive ? 'selected' : ''}>Actif</option>
                                                <option value="inactive" ${!user.isActive ? 'selected' : ''}>Inactif</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                ${isEdit ? `
                                    <div class="mb-3">
                                        <label class="form-label fw-bold">Nouveau Mot de Passe</label>
                                        <input type="password" class="form-control" id="userPassword_${user.id}" 
                                               placeholder="Laisser vide pour ne pas changer">
                                    </div>
                                ` : ''}
                                <div class="mb-3">
                                    <label class="form-label fw-bold">Permissions</label>
                                    <div class="row">
                                        <div class="col-md-6">
                                            <div class="form-check">
                                                <input class="form-check-input" type="checkbox" id="permDashboard_${user.id}" 
                                                       ${user.permissions.includes('dashboard') ? 'checked' : ''} ${!isEdit ? 'disabled' : ''}>
                                                <label class="form-check-label" for="permDashboard_${user.id}">Dashboard</label>
                                            </div>
                                            <div class="form-check">
                                                <input class="form-check-input" type="checkbox" id="permPatients_${user.id}" 
                                                       ${user.permissions.includes('patients') ? 'checked' : ''} ${!isEdit ? 'disabled' : ''}>
                                                <label class="form-check-label" for="permPatients_${user.id}">Patients</label>
                                            </div>
                                            <div class="form-check">
                                                <input class="form-check-input" type="checkbox" id="permDocuments_${user.id}" 
                                                       ${user.permissions.includes('documents') ? 'checked' : ''} ${!isEdit ? 'disabled' : ''}>
                                                <label class="form-check-label" for="permDocuments_${user.id}">Documents</label>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="form-check">
                                                <input class="form-check-input" type="checkbox" id="permReports_${user.id}" 
                                                       ${user.permissions.includes('reports') ? 'checked' : ''} ${!isEdit ? 'disabled' : ''}>
                                                <label class="form-check-label" for="permReports_${user.id}">Rapports</label>
                                            </div>
                                            <div class="form-check">
                                                <input class="form-check-input" type="checkbox" id="permUsers_${user.id}" 
                                                       ${user.permissions.includes('users') ? 'checked' : ''} ${!isEdit ? 'disabled' : ''}>
                                                <label class="form-check-label" for="permUsers_${user.id}">Utilisateurs</label>
                                            </div>
                                            <div class="form-check">
                                                <input class="form-check-input" type="checkbox" id="permSettings_${user.id}" 
                                                       ${user.permissions.includes('settings') ? 'checked' : ''} ${!isEdit ? 'disabled' : ''}>
                                                <label class="form-check-label" for="permSettings_${user.id}">Paramètres</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                <i class="fas fa-times me-2"></i>Fermer
                            </button>
                            ${isEdit ? `
                                <button type="button" class="btn btn-primary" onclick="saveUser(${user.id})">
                                    <i class="fas fa-save me-2"></i>Sauvegarder
                                </button>
                            ` : `
                                <button type="button" class="btn btn-warning" onclick="editUser(${user.id})">
                                    <i class="fas fa-edit me-2"></i>Modifier
                                </button>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Supprimer le modal existant s'il y en a un
        const existingModal = document.getElementById(modalId);
        if (existingModal) {
            existingModal.remove();
        }
        
        // Ajouter le modal au DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Afficher le modal avec vérification Bootstrap
        if (typeof bootstrap !== 'undefined') {
            console.log('Bootstrap disponible, affichage modal normal');
            const modal = new bootstrap.Modal(document.getElementById(modalId));
            modal.show();
        } else {
            console.log('Bootstrap non disponible, affichage modal manuel');
            // Fallback si Bootstrap n'est pas disponible
            document.getElementById(modalId).style.display = 'block';
            document.getElementById(modalId).classList.add('show');
            document.body.classList.add('modal-open');
            
            // Ajouter le backdrop
            const backdrop = document.createElement('div');
            backdrop.className = 'modal-backdrop fade show';
            backdrop.id = `backdrop_${modalId}`;
            document.body.appendChild(backdrop);
        }
        
        // Supprimer le modal du DOM quand il est fermé
        document.getElementById(modalId).addEventListener('hidden.bs.modal', () => {
            document.getElementById(modalId).remove();
            const backdrop = document.getElementById(`backdrop_${modalId}`);
            if (backdrop) backdrop.remove();
        });
    }
    
    // Fonction de sauvegarde des utilisateurs
    saveUser(userId) {
        const user = this.data.users.find(u => u.id === userId);
        if (!user) {
            this.showToast('Utilisateur non trouvé', 'error');
            return;
        }
        
        // Collecter les données du formulaire
        const formData = {
            firstName: document.getElementById(`userFirstName_${userId}`).value,
            lastName: document.getElementById(`userLastName_${userId}`).value,
            email: document.getElementById(`userEmail_${userId}`).value,
            role: document.getElementById(`userRole_${userId}`).value,
            department: document.getElementById(`userDepartment_${userId}`).value,
            isActive: document.getElementById(`userStatus_${userId}`).value === 'active'
        };
        
        // Validation
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.role) {
            this.showToast('Veuillez remplir tous les champs obligatoires', 'error');
            return;
        }
        
        // Collecter les permissions
        const permissions = [];
        if (document.getElementById(`permDashboard_${userId}`).checked) permissions.push('dashboard');
        if (document.getElementById(`permPatients_${userId}`).checked) permissions.push('patients');
        if (document.getElementById(`permDocuments_${userId}`).checked) permissions.push('documents');
        if (document.getElementById(`permReports_${userId}`).checked) permissions.push('reports');
        if (document.getElementById(`permUsers_${userId}`).checked) permissions.push('users');
        if (document.getElementById(`permSettings_${userId}`).checked) permissions.push('settings');
        
        formData.permissions = permissions;
        
        // Gérer le mot de passe
        const newPassword = document.getElementById(`userPassword_${userId}`).value;
        if (newPassword) {
            formData.password = newPassword;
        }
        
        // Mettre à jour l'utilisateur
        Object.assign(user, formData, {
            roleName: this.getRoleName(formData.role),
            initials: formData.firstName.charAt(0) + formData.lastName.charAt(0),
            updatedAt: new Date().toISOString()
        });
        
        // Enregistrer l'activité
        this.logActivity('user_updated', 'Utilisateur modifié', 
            `Utilisateur "${formData.firstName} ${formData.lastName}" modifié`, {
                userId: userId,
                userEmail: formData.email,
                userRole: formData.role
            });

        // Sauvegarder
        localStorage.setItem('medicalDigitizationData', JSON.stringify(this.data));

        // Fermer le modal
        const modal = bootstrap.Modal.getInstance(document.getElementById(`userModal_${userId}`));
        if (modal) {
            modal.hide();
        }

        // Recharger les données
        this.loadUsers();
        this.loadDashboardData();

        this.showToast(`Utilisateur "${user.firstName} ${user.lastName}" mis à jour`, 'success');
    }
    
    getRoleName(role) {
        const roleNames = {
            'admin': 'Administrateur',
            'doctor': 'Médecin',
            'nurse': 'Infirmière',
            'technician': 'Technicien'
        };
        return roleNames[role] || role;
    }
    
    // Fonction de sauvegarde des rapports
    saveReport(reportId) {
        const report = this.data.reports.find(r => r.id === reportId);
        if (!report) {
            this.showToast('Rapport non trouvé', 'error');
            return;
        }
        
        // Collecter les données du formulaire
        const formData = {
            title: document.getElementById(`reportTitle_${reportId}`).value,
            type: document.getElementById(`reportType_${reportId}`).value,
            patientId: parseInt(document.getElementById(`reportPatient_${reportId}`).value),
            date: document.getElementById(`reportDate_${reportId}`).value,
            summary: document.getElementById(`reportSummary_${reportId}`).value,
            details: document.getElementById(`reportDetails_${reportId}`).value,
            status: document.getElementById(`reportStatus_${reportId}`).value,
            priority: document.getElementById(`reportPriority_${reportId}`).value
        };
        
        // Validation
        if (!formData.title || !formData.type || !formData.patientId || !formData.date) {
            this.showToast('Veuillez remplir tous les champs obligatoires', 'error');
            return;
        }
        
        // Trouver le patient
        const patient = this.data.patients.find(p => p.id === formData.patientId);
        if (!patient) {
            this.showToast('Patient non trouvé', 'error');
            return;
        }
        
        // Mettre à jour le rapport
        Object.assign(report, formData, {
            patientName: `${patient.firstName} ${patient.lastName}`,
            updatedAt: new Date().toISOString()
        });
        
        // Enregistrer l'activité
        this.logActivity('report_updated', 'Rapport modifié', 
            `Rapport "${formData.title}" modifié`, {
                reportId: reportId,
                reportTitle: formData.title,
                patientId: formData.patientId,
                patientName: `${patient.firstName} ${patient.lastName}`
            });

        // Sauvegarder
        localStorage.setItem('medicalDigitizationData', JSON.stringify(this.data));

        // Fermer le modal
        const modal = bootstrap.Modal.getInstance(document.getElementById(`reportModal_${reportId}`));
        if (modal) {
            modal.hide();
        }

        // Recharger les données
        this.loadReports();
        this.loadDashboardData();

        this.showToast(`Rapport "${report.title}" mis à jour`, 'success');
    }
    
    loadNurseDashboard() {
        // Dashboard spécial pour l'infirmier - affiche les listes en lecture seule
        const container = document.getElementById('mainContent');
        if (!container) return;
        
        container.innerHTML = `
            <div class="container-fluid">
                <div class="row">
                    <div class="col-12">
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <h2><i class="fas fa-user-nurse me-2"></i>Tableau de Bord Infirmier</h2>
                            <div class="text-muted">
                                <i class="fas fa-user me-1"></i>${this.currentUser.firstName} ${this.currentUser.lastName}
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Statistiques rapides -->
                <div class="row mb-4">
                    <div class="col-md-3">
                        <div class="card bg-primary text-white">
                            <div class="card-body">
                                <div class="d-flex justify-content-between">
                                    <div>
                                        <h4>${this.data.patients.length}</h4>
                                        <p class="mb-0">Patients</p>
                                    </div>
                                    <div class="align-self-center">
                                        <i class="fas fa-users fa-2x"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card bg-success text-white">
                            <div class="card-body">
                                <div class="d-flex justify-content-between">
                                    <div>
                                        <h4>${this.data.documents.length}</h4>
                                        <p class="mb-0">Documents</p>
                                    </div>
                                    <div class="align-self-center">
                                        <i class="fas fa-file-medical fa-2x"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card bg-info text-white">
                            <div class="card-body">
                                <div class="d-flex justify-content-between">
                                    <div>
                                        <h4>${this.data.reports.length}</h4>
                                        <p class="mb-0">Rapports</p>
                                    </div>
                                    <div class="align-self-center">
                                        <i class="fas fa-chart-line fa-2x"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card bg-warning text-white">
                            <div class="card-body">
                                <div class="d-flex justify-content-between">
                                    <div>
                                        <h4>${this.data.documents.filter(d => d.status === 'pending_review').length}</h4>
                                        <p class="mb-0">En Révision</p>
                                    </div>
                                    <div class="align-self-center">
                                        <i class="fas fa-clock fa-2x"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Liste des Patients -->
                <div class="row mb-4">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-header">
                                <h5><i class="fas fa-users me-2"></i>Liste des Patients</h5>
                            </div>
                            <div class="card-body">
                                <div class="table-responsive">
                                    <table class="table table-hover">
                                        <thead>
                                            <tr>
                                                <th>ID Patient</th>
                                                <th>Nom</th>
                                                <th>Âge</th>
                                                <th>Ville</th>
                                                <th>Groupe Sanguin</th>
                                                <th>Dernière Visite</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody id="nursePatientsTable">
                                            <!-- Les patients s'afficheront ici -->
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Liste des Documents -->
                <div class="row mb-4">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-header">
                                <h5><i class="fas fa-file-medical me-2"></i>Liste des Documents</h5>
                            </div>
                            <div class="card-body">
                                <div class="row" id="nurseDocumentsGrid">
                                    <!-- Les documents s'afficheront ici -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Liste des Rapports -->
                <div class="row">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-header">
                                <h5><i class="fas fa-chart-line me-2"></i>Liste des Rapports</h5>
                            </div>
                            <div class="card-body">
                                <div class="row" id="nurseReportsGrid">
                                    <!-- Les rapports s'afficheront ici -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Charger les données
        this.loadNursePatients();
        this.loadNurseDocuments();
        this.loadNurseReports();
    }
    
    loadNursePatients() {
        const tbody = document.getElementById('nursePatientsTable');
        if (!tbody) return;
        
        tbody.innerHTML = this.data.patients.map(patient => `
            <tr>
                <td>${patient.patientId}</td>
                <td>${patient.firstName} ${patient.lastName}</td>
                <td>${patient.age} ans</td>
                <td>${patient.city || 'N/A'}</td>
                <td>${patient.bloodType || 'N/A'}</td>
                <td>${this.formatDate(patient.lastVisit)}</td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="viewPatient(${patient.id})" title="Voir">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }
    
    loadNurseDocuments() {
        const grid = document.getElementById('nurseDocumentsGrid');
        if (!grid) return;
        
        grid.innerHTML = this.data.documents.map(doc => `
            <div class="col-md-4 mb-3">
                <div class="card">
                    <div class="card-body">
                        <h6 class="card-title">${doc.title}</h6>
                        <p class="card-text">
                            <small class="text-muted">
                                <i class="fas fa-user me-1"></i>${doc.patientName}<br>
                                <i class="fas fa-calendar me-1"></i>${this.formatDate(doc.date)}<br>
                                <i class="fas fa-tag me-1"></i>${this.getDocumentTypeLabel(doc.type)}
                            </small>
                        </p>
                        <div class="d-flex justify-content-between">
                            <span class="badge bg-${this.getStatusColor(doc.status)}">${this.getStatusLabel(doc.status)}</span>
                            <button class="btn btn-primary btn-sm" onclick="viewDocument(${doc.id})" title="Voir">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    loadNurseReports() {
        const grid = document.getElementById('nurseReportsGrid');
        if (!grid) return;
        
        grid.innerHTML = this.data.reports.map(report => `
            <div class="col-md-6 mb-3">
                <div class="card">
                    <div class="card-body">
                        <h6 class="card-title">${report.title}</h6>
                        <p class="card-text">${report.summary}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <small class="text-muted">
                                <i class="fas fa-user me-1"></i>${report.patientName}<br>
                                <i class="fas fa-calendar me-1"></i>${this.formatDate(report.date)}
                            </small>
                            <button class="btn btn-primary btn-sm" onclick="viewReport(${report.id})" title="Voir">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

// Fonctions globales
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const icon = document.querySelector('.btn-outline-secondary i');
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

function confirmDataBackup() {
    if (window.app) {
        window.app.confirmDataBackup();
    }
}

function downloadDocument(id) {
    if (window.app) {
        window.app.downloadDocument(id);
    }
}

function downloadReport(id) {
    if (window.app) {
        window.app.downloadReport(id);
    }
}

function quickLogin(role) {
    if (window.app) window.app.quickLogin(role);
}

// Fonctions globales pour les patients
function viewPatient(id) {
    if (window.app) window.app.viewPatient(id);
}

function editPatient(id) {
    if (window.app) window.app.editPatient(id);
}

function deletePatient(id) {
    if (window.app) window.app.deletePatient(id);
}

function viewPatientDocuments(id) {
    if (window.app) window.app.viewPatientDocuments(id);
}

function savePatient(id) {
    if (window.app) window.app.savePatient(id);
}

// Fonctions globales pour les documents
function viewDocument(id) {
    if (window.app) window.app.viewDocument(id);
}

function editDocument(id) {
    if (window.app) window.app.editDocument(id);
}

function deleteDocument(id) {
    if (window.app) window.app.deleteDocument(id);
}

function saveDocument(id) {
    if (window.app) window.app.saveDocument(id);
}

// Fonctions globales pour les rapports
function viewReport(id) {
    if (window.app) window.app.viewReport(id);
}

function editReport(id) {
    if (window.app) window.app.editReport(id);
}

function deleteReport(id) {
    if (window.app) window.app.deleteReport(id);
}

function saveReport(id) {
    if (window.app) window.app.saveReport(id);
}

function exportSingleReport(id) {
    if (window.app) window.app.exportSingleReport(id);
}

// Fonctions globales pour les utilisateurs
function viewUser(id) {
    if (window.app) window.app.viewUser(id);
}

function editUser(id) {
    if (window.app) window.app.editUser(id);
}

function toggleUserStatus(id) {
    if (window.app) window.app.toggleUserStatus(id);
}

function saveUser(id) {
    if (window.app) window.app.saveUser(id);
}

// Fonctions d'export individuelles
function exportSinglePatient(id) {
    if (window.app) window.app.exportSinglePatient(id);
}

function exportSingleDocument(id) {
    if (window.app) window.app.exportSingleDocument(id);
}

function showPage(page) {
    if (window.app) window.app.showPage(page);
}

function logout() {
    if (window.app) window.app.logout();
}

function showProfile() {
    if (!window.app || !window.app.currentUser) {
        window.app.showToast('Aucun utilisateur connecté', 'error');
        return;
    }

    const user = window.app.currentUser;
    
    // Créer la modale de profil
    const modalHtml = `
        <div class="modal fade" id="profileModal" tabindex="-1" aria-labelledby="profileModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-gradient-primary text-white">
                        <h5 class="modal-title" id="profileModalLabel">
                            <i class="fas fa-user me-2"></i>Profil Utilisateur
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-4 text-center">
                                <div class="profile-avatar mb-3">
                                    <div class="avatar-large bg-gradient-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center" style="width: 120px; height: 120px; font-size: 3rem; font-weight: bold;">
                                        ${user.firstName.charAt(0)}${user.lastName.charAt(0)}
                                    </div>
                                </div>
                                <h4 class="mb-1">${user.firstName} ${user.lastName}</h4>
                                <span class="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill">
                                    ${user.role}
                                </span>
                            </div>
                            <div class="col-md-8">
                                <div class="profile-info">
                                    <div class="info-section mb-4">
                                        <h6 class="text-primary mb-3">
                                            <i class="fas fa-user-circle me-2"></i>Informations Personnelles
                                        </h6>
                                        <div class="row">
                                            <div class="col-sm-6 mb-3">
                                                <label class="form-label fw-bold">Prénom</label>
                                                <div class="form-control-plaintext bg-light p-2 rounded">${user.firstName}</div>
                                            </div>
                                            <div class="col-sm-6 mb-3">
                                                <label class="form-label fw-bold">Nom</label>
                                                <div class="form-control-plaintext bg-light p-2 rounded">${user.lastName}</div>
                                            </div>
                                            <div class="col-sm-6 mb-3">
                                                <label class="form-label fw-bold">Email</label>
                                                <div class="form-control-plaintext bg-light p-2 rounded">${user.email}</div>
                                            </div>
                                            <div class="col-sm-6 mb-3">
                                                <label class="form-label fw-bold">Rôle</label>
                                                <div class="form-control-plaintext bg-light p-2 rounded">${user.role}</div>
                                            </div>
                                            <div class="col-sm-6 mb-3">
                                                <label class="form-label fw-bold">Département</label>
                                                <div class="form-control-plaintext bg-light p-2 rounded">${user.department || 'Non spécifié'}</div>
                                            </div>
                                            <div class="col-sm-6 mb-3">
                                                <label class="form-label fw-bold">Statut</label>
                                                <div class="form-control-plaintext bg-light p-2 rounded">
                                                    <span class="badge bg-success">Actif</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="info-section mb-4">
                                        <h6 class="text-primary mb-3">
                                            <i class="fas fa-shield-alt me-2"></i>Permissions
                                        </h6>
                                        <div class="permissions-grid">
                                            ${user.permissions ? user.permissions.map(permission => `
                                                <span class="badge bg-info bg-opacity-10 text-info me-2 mb-2 px-3 py-2 rounded-pill">
                                                    <i class="fas fa-check-circle me-1"></i>${permission}
                                                </span>
                                            `).join('') : '<span class="text-muted">Aucune permission spécifiée</span>'}
                                        </div>
                                    </div>
                                    
                                    <div class="info-section">
                                        <h6 class="text-primary mb-3">
                                            <i class="fas fa-clock me-2"></i>Informations de Session
                                        </h6>
                                        <div class="row">
                                            <div class="col-sm-6 mb-3">
                                                <label class="form-label fw-bold">Dernière connexion</label>
                                                <div class="form-control-plaintext bg-light p-2 rounded">${new Date().toLocaleString('fr-FR')}</div>
                                            </div>
                                            <div class="col-sm-6 mb-3">
                                                <label class="form-label fw-bold">Durée de session</label>
                                                <div class="form-control-plaintext bg-light p-2 rounded">En cours</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="fas fa-times me-2"></i>Fermer
                        </button>
                        <button type="button" class="btn btn-primary" onclick="changePassword()">
                            <i class="fas fa-key me-2"></i>Changer le mot de passe
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Supprimer l'ancienne modale si elle existe
    const existingModal = document.getElementById('profileModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Ajouter la nouvelle modale au DOM
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Afficher la modale
    const modal = new bootstrap.Modal(document.getElementById('profileModal'));
    modal.show();
}

function changePassword() {
    if (!window.app || !window.app.currentUser) {
        window.app.showToast('Aucun utilisateur connecté', 'error');
        return;
    }

    const user = window.app.currentUser;
    
    // Créer la modale de changement de mot de passe
    const modalHtml = `
        <div class="modal fade" id="changePasswordModal" tabindex="-1" aria-labelledby="changePasswordModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-gradient-warning text-white">
                        <h5 class="modal-title" id="changePasswordModalLabel">
                            <i class="fas fa-key me-2"></i>Changer le mot de passe
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="alert alert-info">
                            <i class="fas fa-info-circle me-2"></i>
                            Pour des raisons de sécurité, veuillez entrer votre mot de passe actuel avant de définir un nouveau mot de passe.
                        </div>
                        
                        <form id="changePasswordForm">
                            <div class="mb-3">
                                <label for="currentPassword" class="form-label fw-bold">Mot de passe actuel</label>
                                <div class="input-group">
                                    <span class="input-group-text">
                                        <i class="fas fa-lock"></i>
                                    </span>
                                    <input type="password" class="form-control" id="currentPassword" required>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <label for="newPassword" class="form-label fw-bold">Nouveau mot de passe</label>
                                <div class="input-group">
                                    <span class="input-group-text">
                                        <i class="fas fa-key"></i>
                                    </span>
                                    <input type="password" class="form-control" id="newPassword" required minlength="6">
                                </div>
                                <div class="form-text">Minimum 6 caractères</div>
                            </div>
                            
                            <div class="mb-3">
                                <label for="confirmPassword" class="form-label fw-bold">Confirmer le nouveau mot de passe</label>
                                <div class="input-group">
                                    <span class="input-group-text">
                                        <i class="fas fa-check-circle"></i>
                                    </span>
                                    <input type="password" class="form-control" id="confirmPassword" required minlength="6">
                                </div>
                            </div>
                            
                            <div id="passwordError" class="alert alert-danger d-none" role="alert"></div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="fas fa-times me-2"></i>Annuler
                        </button>
                        <button type="button" class="btn btn-warning" onclick="submitPasswordChange()">
                            <i class="fas fa-save me-2"></i>Changer le mot de passe
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Supprimer l'ancienne modale si elle existe
    const existingModal = document.getElementById('changePasswordModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Ajouter la nouvelle modale au DOM
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Afficher la modale
    const modal = new bootstrap.Modal(document.getElementById('changePasswordModal'));
    modal.show();
}

function submitPasswordChange() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorDiv = document.getElementById('passwordError');
    
    // Réinitialiser les erreurs
    errorDiv.classList.add('d-none');
    
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
        errorDiv.textContent = 'Tous les champs sont requis';
        errorDiv.classList.remove('d-none');
        return;
    }
    
    if (newPassword.length < 6) {
        errorDiv.textContent = 'Le nouveau mot de passe doit contenir au moins 6 caractères';
        errorDiv.classList.remove('d-none');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        errorDiv.textContent = 'Les mots de passe ne correspondent pas';
        errorDiv.classList.remove('d-none');
        return;
    }
    
    if (currentPassword !== window.app.currentUser.password) {
        errorDiv.textContent = 'Le mot de passe actuel est incorrect';
        errorDiv.classList.remove('d-none');
        return;
    }
    
    // Simuler le changement de mot de passe
    window.app.showToast('Changement de mot de passe en cours...', 'info');
    
    setTimeout(() => {
        // Mettre à jour le mot de passe (en mode démo)
        window.app.currentUser.password = newPassword;
        
        // Enregistrer l'activité
        window.app.logActivity('password_changed', 'Mot de passe changé', 
            'Mot de passe modifié avec succès', {
                user: window.app.currentUser.firstName + ' ' + window.app.currentUser.lastName,
                timestamp: new Date().toISOString()
            });
        
        // Fermer la modale
        const modal = bootstrap.Modal.getInstance(document.getElementById('changePasswordModal'));
        modal.hide();
        
        // Réinitialiser le formulaire
        document.getElementById('changePasswordForm').reset();
        
        window.app.showToast('Mot de passe changé avec succès', 'success');
    }, 1500);
}

// Fonction pour actualiser l'activité récente
function refreshRecentActivity() {
    if (window.app) {
        window.app.showToast('Actualisation des activités...', 'info');
        
        // Simuler une actualisation
        setTimeout(() => {
            window.app.showToast('Activités actualisées avec succès', 'success');
        }, 1000);
    }
}

// Fonction pour ajouter une nouvelle activité en temps réel
function addRealtimeActivity(type, title, description) {
    const activitiesList = document.getElementById('recentActivitiesList');
    if (!activitiesList) return;
    
    const activityTypes = {
        'document_scan': { icon: 'fas fa-file-upload', color: 'success' },
        'patient_created': { icon: 'fas fa-user-plus', color: 'primary' },
        'ai_processing': { icon: 'fas fa-robot', color: 'warning' },
        'user_login': { icon: 'fas fa-sign-in-alt', color: 'info' },
        'document_deleted': { icon: 'fas fa-trash', color: 'danger' },
        'document_updated': { icon: 'fas fa-edit', color: 'secondary' },
        'system_backup': { icon: 'fas fa-database', color: 'dark' }
    };
    
    const activityType = activityTypes[type] || activityTypes['document_scan'];
    
    const newActivity = document.createElement('div');
    newActivity.className = 'activity-item new-activity d-flex align-items-center mb-3 p-3 bg-light rounded-3';
    
    newActivity.innerHTML = `
        <div class="activity-icon bg-${activityType.color} bg-opacity-10 rounded-circle p-3 me-3">
            <i class="${activityType.icon} text-${activityType.color}"></i>
        </div>
        <div class="flex-grow-1">
            <div class="activity-title fw-semibold text-dark">${title}</div>
            <div class="activity-description text-muted">${description}</div>
        </div>
        <div class="activity-time text-muted">
            <i class="fas fa-clock me-1"></i>À l'instant
        </div>
    `;
    
    // Ajouter en haut de la liste
    activitiesList.insertBefore(newActivity, activitiesList.firstChild);
    
    // Limiter à 10 activités maximum
    const activities = activitiesList.querySelectorAll('.activity-item');
    if (activities.length > 10) {
        activitiesList.removeChild(activities[activities.length - 1]);
    }
    
    // Mettre à jour les timestamps après 1 minute
    setTimeout(() => {
        const timeElement = newActivity.querySelector('.activity-time');
        if (timeElement) {
            timeElement.innerHTML = '<i class="fas fa-clock me-1"></i>Il y a 1 minute';
        }
    }, 60000);
    
    // Mettre à jour après 5 minutes
    setTimeout(() => {
        const timeElement = newActivity.querySelector('.activity-time');
        if (timeElement) {
            timeElement.innerHTML = '<i class="fas fa-clock me-1"></i>Il y a 5 minutes';
        }
    }, 300000);
}

// Fonction pour simuler des activités en temps réel
function startRealtimeActivities() {
    const activities = [
        {
            type: 'document_scan',
            title: 'Document numérisé',
            description: 'Nouveau document ajouté au système'
        },
        {
            type: 'patient_created',
            title: 'Nouveau patient',
            description: 'Patient ajouté à la base de données'
        },
        {
            type: 'ai_processing',
            title: 'Traitement IA',
            description: 'Analyse automatique en cours'
        },
        {
            type: 'user_login',
            title: 'Connexion utilisateur',
            description: 'Nouvelle connexion détectée'
        },
        {
            type: 'document_deleted',
            title: 'Document supprimé',
            description: 'Document obsolète supprimé'
        }
    ];
    
    // Ajouter une activité aléatoire toutes les 30-60 secondes
    realtimeInterval = setInterval(() => {
        const randomActivity = activities[Math.floor(Math.random() * activities.length)];
        addRealtimeActivity(randomActivity.type, randomActivity.title, randomActivity.description);
    }, Math.random() * 30000 + 30000); // Entre 30 et 60 secondes
}

// Variable pour stocker l'intervalle des activités temps réel
let realtimeInterval = null;

// Fonction pour démarrer/arrêter le mode temps réel
function toggleRealtimeMode() {
    const indicator = document.getElementById('realtimeIndicator');
    const button = document.querySelector('[onclick="refreshRecentActivity()"]');
    
    if (realtimeInterval) {
        // Arrêter le mode temps réel
        clearInterval(realtimeInterval);
        realtimeInterval = null;
        
        indicator.innerHTML = '<i class="fas fa-circle me-1" style="font-size: 0.6rem; color: #dc3545;"></i>Arrêté';
        indicator.className = 'badge bg-danger bg-opacity-10 text-danger ms-2';
        button.innerHTML = '<i class="fas fa-play me-1"></i>Démarrer Temps Réel';
        
        if (window.app) {
            window.app.showToast('Mode temps réel arrêté', 'warning');
        }
    } else {
        // Démarrer le mode temps réel
        startRealtimeActivities();
        
        indicator.innerHTML = '<i class="fas fa-circle me-1" style="font-size: 0.6rem; animation: pulse 2s infinite;"></i>Temps réel';
        indicator.className = 'badge bg-success bg-opacity-10 text-success ms-2';
        button.innerHTML = '<i class="fas fa-stop me-1"></i>Arrêter Temps Réel';
        
        if (window.app) {
            window.app.showToast('Mode temps réel activé', 'success');
        }
    }
}

// Démarrer les activités en temps réel au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        // Démarrer automatiquement le mode temps réel
        toggleRealtimeMode();
    }, 3000); // Démarrer après 3 secondes
});

// Fonctions pour les modales
function showAddPatientModal() {
    if (window.app) {
        const modal = new bootstrap.Modal(document.getElementById('addPatientModal'));
        modal.show();
    }
}

function showUploadDocumentModal() {
    if (window.app) {
        const modal = new bootstrap.Modal(document.getElementById('uploadDocumentModal'));
        
        // Charger les patients dans le select
        const select = document.getElementById('documentPatient');
        if (select) {
            select.innerHTML = '<option value="">Sélectionner un patient</option>';
            window.app.data.patients.forEach(patient => {
                const option = document.createElement('option');
                option.value = patient.id;
                option.textContent = `${patient.firstName} ${patient.lastName} (${patient.patientId})`;
                select.appendChild(option);
            });
        }
        
        document.getElementById('documentDate').value = new Date().toISOString().split('T')[0];
        modal.show();
    }
}

function showPatientModal() {
    if (window.app) {
        const modal = new bootstrap.Modal(document.getElementById('addPatientModal'));
        
        // Réinitialiser le formulaire
        const form = document.getElementById('patientForm');
        if (form) {
            form.reset();
        }
        
        modal.show();
    }
}

function showReportModal() {
    if (window.app) {
        const modal = new bootstrap.Modal(document.getElementById('createReportModal'));
        
        // Charger les patients dans le select
        const select = document.getElementById('reportPatient');
        if (select) {
            select.innerHTML = '<option value="">Sélectionner un patient</option>';
            window.app.data.patients.forEach(patient => {
                const option = document.createElement('option');
                option.value = patient.id;
                option.textContent = `${patient.firstName} ${patient.lastName} (${patient.patientId})`;
                select.appendChild(option);
            });
        }
        
        document.getElementById('reportDate').value = new Date().toISOString().split('T')[0];
        modal.show();
    }
}

async function saveNewPatient() {
    // Validation des champs requis
    const firstName = document.getElementById('patientFirstName').value.trim();
    const lastName = document.getElementById('patientLastName').value.trim();
    const ci = document.getElementById('patientCI').value.trim();
    const dateOfBirth = document.getElementById('patientDateOfBirth').value;
    const gender = document.getElementById('patientGender').value;
    const bloodType = document.getElementById('patientBloodType').value;

    // Vérifier les champs requis
    if (!firstName) {
        alert('Le prénom est requis');
        document.getElementById('patientFirstName').focus();
        return;
    }
    if (!lastName) {
        alert('Le nom est requis');
        document.getElementById('patientLastName').focus();
        return;
    }
    if (!ci) {
        alert('La carte d\'identité est requise');
        document.getElementById('patientCI').focus();
        return;
    }
    if (!dateOfBirth) {
        alert('La date de naissance est requise');
        document.getElementById('patientDateOfBirth').focus();
        return;
    }
    if (!gender) {
        alert('Le genre est requis');
        document.getElementById('patientGender').focus();
        return;
    }
    if (!bloodType) {
        alert('Le groupe sanguin est requis');
        document.getElementById('patientBloodType').focus();
        return;
    }

    const formData = {
        patient_id: document.getElementById('patientPatientId').value || generatePatientId(),
        first_name: firstName,
        last_name: lastName,
        ci: ci,
        date_of_birth: dateOfBirth,
        gender: gender,
        phone_number: document.getElementById('patientPhone').value,
        email: document.getElementById('patientEmail').value,
        address: document.getElementById('patientAddress').value,
        city: document.getElementById('patientCity').value,
        blood_type: bloodType,
        emergency_contact: document.getElementById('patientEmergencyContact').value,
        insurance_provider: document.getElementById('patientInsurance').value,
        allergies: document.getElementById('patientAllergies').value,
        medical_history: document.getElementById('patientMedicalHistory').value,
        occupation: document.getElementById('patientOccupation').value,
        marital_status: document.getElementById('patientMaritalStatus').value,
        notes: document.getElementById('patientNotes').value,
        status: 'active'
    };

    try {
        // Envoyer au backend
        const response = await fetch('/api/patients/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': window.app.getCSRFToken()
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            const newPatient = await response.json();
            
            // Ajouter localement
            const patientData = {
                id: newPatient.id,
                patientId: newPatient.patient_id,
                firstName: newPatient.first_name,
                lastName: newPatient.last_name,
                ci: newPatient.ci || '',
                dateOfBirth: newPatient.date_of_birth,
                age: window.app.calculateAge(newPatient.date_of_birth),
                gender: newPatient.gender,
                phone: newPatient.phone_number,
                email: newPatient.email,
                address: newPatient.address,
                city: newPatient.city,
                bloodType: newPatient.blood_type,
                emergencyContact: newPatient.emergency_contact,
                insurance: newPatient.insurance_provider,
                allergies: newPatient.allergies,
                medicalHistory: newPatient.medical_history,
                occupation: newPatient.occupation,
                maritalStatus: newPatient.marital_status,
                notes: newPatient.notes,
                status: newPatient.status,
                documentsCount: 0,
                lastVisit: newPatient.created_at,
                createdAt: newPatient.created_at
            };
            
            window.app.data.patients.push(patientData);
            
            // Enregistrer l'activité
            window.app.logActivity('patient_created', 'Patient Créé', 
                `Nouveau patient ${formData.first_name} ${formData.last_name} créé`, {
                    patientId: newPatient.id,
                    patientName: `${formData.first_name} ${formData.last_name}`,
                    ci: formData.ci
                });
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('addPatientModal'));
            modal.hide();
            window.app.loadPatients();
            window.app.showToast('Patient créé avec succès !', 'success');
        } else {
            const errorData = await response.json();
            window.app.showToast(`Erreur: ${errorData.detail || 'Erreur lors de la création'}`, 'error');
        }
    } catch (error) {
        console.error('Erreur lors de la création:', error);
        window.app.showToast('Erreur de connexion au serveur', 'error');
    }
}

function saveUploadedDocument() {
    const formData = {
        title: document.getElementById('documentTitle').value,
        type: document.getElementById('documentType').value,
        patientId: parseInt(document.getElementById('documentPatient').value),
        date: document.getElementById('documentDate').value,
        priority: document.getElementById('documentPriority').value,
        description: document.getElementById('documentDescription').value
    };

    const patient = window.app.data.patients.find(p => p.id === formData.patientId);
    if (!patient) {
        window.app.showToast('Patient non trouvé', 'error');
        return;
    }

    formData.patientName = `${patient.firstName} ${patient.lastName}`;
    const result = DocumentManager.createDocument(formData);
    
    if (result.success) {
        window.app.data.documents.push(result.document);
        
        // Mettre à jour le compteur de documents du patient
        patient.documentsCount = (patient.documentsCount || 0) + 1;
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('uploadDocumentModal'));
        modal.hide();
        window.app.loadDocuments();
        window.app.showToast('Document créé avec succès !', 'success');
        
        // Traitement IA automatique si activé
        if (document.getElementById('autoProcessAI').checked) {
            setTimeout(() => {
                DocumentManager.processWithAI(result.document);
                window.app.showToast('Document traité par IA', 'success');
                window.app.loadDocuments();
                window.app.loadDashboardData(); // Mettre à jour les stats
            }, 1000);
        }
    } else {
        window.app.showToast(`Erreur: ${result.errors.join(', ')}`, 'error');
    }
}

function processDocumentWithAI() {
    window.app.showToast('Traitement IA du document en cours...', 'warning');
    
    setTimeout(() => {
        window.app.showToast('Document analysé et enrichi par IA', 'success');
    }, 2000);
}

function importPatientsCSV() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx,.xls';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Vérifier la taille du fichier (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                window.app.showToast('Fichier trop volumineux. Maximum 5MB autorisé.', 'error');
                return;
            }
            
            window.app.showToast(`Import Excel: ${file.name} en cours...`, 'info');
            
            // Vérifier le type de fichier
            const fileExtension = file.name.split('.').pop().toLowerCase();
            
            if (fileExtension === 'csv') {
                // Afficher les instructions pour le format CSV
                showCSVInstructions();
                importCSVFile(file);
            } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
                importExcelFile(file);
            } else {
                window.app.showToast('Format de fichier non supporté. Utilisez CSV ou Excel.', 'error');
            }
        }
    };
    
    input.click();
}

// Afficher les instructions pour le format CSV
function showCSVInstructions() {
    const instructions = `
Format CSV requis:
- Colonnes: Prénom, Nom, CI, Date de naissance, Genre, Téléphone, Email, Adresse
- Séparateur: virgule (,)
- Encodage: UTF-8
- CI: Format AB123456 (2 lettres + 6 chiffres)
- Date: YYYY-MM-DD ou DD/MM/YYYY
- Genre: Homme/Femme ou Male/Female
    `;
    
    console.log('Instructions CSV:', instructions);
}

// Fonction pour importer un fichier CSV
function importCSVFile(file) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
        try {
            const csv = e.target.result;
            const lines = csv.split('\n').filter(line => line.trim() !== '');
            
            if (lines.length < 2) {
                window.app.showToast('Le fichier CSV doit contenir au moins un en-tête et une ligne de données', 'warning');
                return;
            }
            
            // Parser la première ligne (en-têtes) en gérant les guillemets
            const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase());
            
            const newPatients = [];
            
            for (let i = 1; i < lines.length; i++) {
                if (lines[i].trim()) {
                    try {
                        // Parser chaque ligne en gérant les guillemets et les virgules
                        const values = parseCSVLine(lines[i]).map(v => v.trim());
                        const patient = parseCSVRow(headers, values);
                        if (patient) {
                            newPatients.push(patient);
                        }
                    } catch (lineError) {
                        console.warn(`Erreur ligne ${i + 1}:`, lineError);
                        // Continuer avec les autres lignes
                    }
                }
            }
            
            if (newPatients.length === 0) {
                window.app.showToast('Aucune donnée valide trouvée dans le fichier CSV', 'warning');
                return;
            }
            
            processImportedPatients(newPatients);
            
        } catch (error) {
            console.error('Erreur lecture CSV:', error);
            window.app.showToast('Erreur lors de la lecture du fichier CSV. Vérifiez le format du fichier.', 'error');
        }
    };
    
    reader.onerror = () => {
        window.app.showToast('Erreur lors de la lecture du fichier', 'error');
    };
    
    reader.readAsText(file, 'UTF-8');
}

// Fonction pour parser une ligne CSV en gérant les guillemets
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                // Guillemet échappé
                current += '"';
                i++; // Passer le prochain guillemet
            } else {
                // Basculer l'état des guillemets
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            // Fin d'un champ
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    
    // Ajouter le dernier champ
    result.push(current);
    
    return result;
}

// Fonction pour importer un fichier Excel (simulation)
function importExcelFile(file) {
    // Simulation d'import Excel - dans un vrai projet, utiliser une librairie comme SheetJS
            setTimeout(() => {
                const newPatients = [
                    {
                        id: Date.now() + 1,
                        patientId: 'PAT2025005',
                        firstName: 'Hassan',
                        lastName: 'Benkirane',
                        dateOfBirth: '1980-06-15',
                        age: 43,
                        gender: 'male',
                        phone: '+212 6 55 66 77 88',
                        email: 'hassan.benkirane@gmail.com',
                        status: 'active',
                        documentsCount: 0,
                lastVisit: new Date().toISOString().split('T')[0],
                createdAt: new Date().toISOString()
            },
            {
                id: Date.now() + 2,
                patientId: 'PAT2025006',
                firstName: 'Fatima',
                lastName: 'Alaoui',
                dateOfBirth: '1992-03-22',
                age: 31,
                gender: 'female',
                phone: '+212 6 44 33 22 11',
                email: 'fatima.alaoui@gmail.com',
                status: 'active',
                documentsCount: 0,
                lastVisit: new Date().toISOString().split('T')[0],
                createdAt: new Date().toISOString()
            },
            {
                id: Date.now() + 3,
                patientId: 'PAT2025007',
                firstName: 'Omar',
                lastName: 'Idrissi',
                dateOfBirth: '1975-11-08',
                age: 48,
                gender: 'male',
                phone: '+212 6 77 88 99 00',
                email: 'omar.idrissi@gmail.com',
                status: 'active',
                documentsCount: 0,
                lastVisit: new Date().toISOString().split('T')[0],
                createdAt: new Date().toISOString()
            }
        ];
        
        processImportedPatients(newPatients);
            }, 2000);
        }

// Parser une ligne CSV
function parseCSVRow(headers, values) {
    try {
        const patient = {
            id: Date.now() + Math.random(),
            patientId: generatePatientId(),
            status: 'active',
            documentsCount: 0,
            lastVisit: new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString()
        };
        
        // Nettoyer et normaliser les en-têtes
        const cleanHeaders = headers.map(h => h.replace(/"/g, '').trim().toLowerCase());
        
        cleanHeaders.forEach((header, index) => {
            const value = (values[index] || '').replace(/"/g, '').trim();
            
            if (!value) return; // Ignorer les valeurs vides
            
            switch (header) {
                case 'prenom':
                case 'firstname':
                case 'prénom':
                case 'nom_prenom':
                case 'first_name':
                    patient.firstName = value;
                    break;
                case 'nom':
                case 'lastname':
                case 'nom_famille':
                case 'last_name':
                case 'family_name':
                    patient.lastName = value;
                    break;
                case 'ci':
                case 'carte_identite':
                case 'carte d\'identité':
                case 'carte_identite':
                case 'id_card':
                case 'identite':
                    patient.ci = value.toUpperCase();
                    break;
                case 'datenaissance':
                case 'dateofbirth':
                case 'date de naissance':
                case 'birth_date':
                case 'naissance':
                    if (value) {
                        // Essayer de parser différentes dates
                        let birthDate = null;
                        try {
                            // Formats supportés: YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY
                            if (value.includes('/')) {
                                const parts = value.split('/');
                                if (parts.length === 3) {
                                    birthDate = new Date(parts[2], parts[1] - 1, parts[0]);
                                }
                            } else if (value.includes('-')) {
                                const parts = value.split('-');
                                if (parts.length === 3) {
                                    if (parts[0].length === 4) {
                                        // YYYY-MM-DD
                                        birthDate = new Date(parts[0], parts[1] - 1, parts[2]);
                                    } else {
                                        // DD-MM-YYYY
                                        birthDate = new Date(parts[2], parts[1] - 1, parts[0]);
                                    }
                                }
                            } else {
                                birthDate = new Date(value);
                            }
                            
                            if (birthDate && !isNaN(birthDate.getTime())) {
                                patient.dateOfBirth = birthDate.toISOString().split('T')[0];
                                const today = new Date();
                                patient.age = today.getFullYear() - birthDate.getFullYear();
                            }
                        } catch (dateError) {
                            console.warn('Erreur parsing date:', value, dateError);
                        }
                    }
                    break;
                case 'genre':
                case 'gender':
                case 'sexe':
                case 'sex':
                    const genderValue = value.toLowerCase();
                    if (genderValue.includes('homme') || genderValue.includes('male') || genderValue.includes('m')) {
                        patient.gender = 'male';
                    } else if (genderValue.includes('femme') || genderValue.includes('female') || genderValue.includes('f')) {
                        patient.gender = 'female';
                    } else {
                        patient.gender = genderValue;
                    }
                    break;
                case 'telephone':
                case 'phone':
                case 'téléphone':
                case 'tel':
                case 'mobile':
                case 'numero':
                    patient.phone = value;
                    break;
                case 'email':
                case 'e-mail':
                case 'courriel':
                    if (value.includes('@')) {
                        patient.email = value;
                    }
                    break;
                case 'adresse':
                case 'address':
                case 'adr':
                    patient.address = value;
                    break;
            }
        });
        
        // Validation minimale - au moins prénom et nom
        if (patient.firstName && patient.lastName) {
            // S'assurer que l'âge est calculé si la date de naissance existe
            if (patient.dateOfBirth && !patient.age) {
                const birthDate = new Date(patient.dateOfBirth);
                const today = new Date();
                patient.age = today.getFullYear() - birthDate.getFullYear();
            }
            
            return patient;
        }
        
        console.warn('Patient ignoré - données insuffisantes:', { firstName: patient.firstName, lastName: patient.lastName });
        return null;
        
    } catch (error) {
        console.error('Erreur parsing CSV row:', error);
        return null;
    }
}

// Générer un ID patient
function generatePatientId() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    return `PAT${year}${month}${random}`;
}

// Traiter les patients importés
function processImportedPatients(newPatients) {
    if (newPatients.length === 0) {
        window.app.showToast('Aucun patient valide trouvé dans le fichier', 'warning');
        return;
    }
    
    // Ajouter les nouveaux patients
    window.app.data.patients.push(...newPatients);
    
    // Enregistrer les activités
    newPatients.forEach(patient => {
        window.app.logActivity('patient_created', 'Patient Importé', 
            `Patient ${patient.firstName} ${patient.lastName} importé depuis Excel`, {
                patientId: patient.id,
                patientName: `${patient.firstName} ${patient.lastName}`,
                source: 'Excel Import'
            });
    });
    
    // Sauvegarder
    localStorage.setItem('medicalDigitizationData', JSON.stringify(window.app.data));
    
    // Recharger les données
    window.app.loadPatients();
    window.app.loadDashboardData();
    
    window.app.showToast(`${newPatients.length} patients importés avec succès`, 'success');
}

function clearPatientFilters() {
    document.getElementById('patientSearch').value = '';
    document.getElementById('patientStatus').value = '';
    document.getElementById('patientGender').value = '';
    if (document.getElementById('patientAge')) {
        document.getElementById('patientAge').value = '';
    }
    window.app.loadPatients();
}

function clearDocumentFilters() {
    document.getElementById('documentSearch').value = '';
    document.getElementById('documentType').value = '';
    document.getElementById('documentStatus').value = '';
    if (document.getElementById('documentPriority')) {
        document.getElementById('documentPriority').value = '';
    }
    window.app.loadDocuments();
}

// Nouvelles fonctions pour les rapports améliorés
function enhanceReportWithAI(reportId) {
    window.app.showToast('Enrichissement du rapport avec l\'IA...', 'warning');
    
    setTimeout(() => {
        // Trouver le rapport et ajouter des insights IA
        const report = window.app.data.reports.find(r => r.id == reportId);
        if (report) {
            report.aiInsights = {
                confidence: 0.94,
                suggestions: [
                    'Considérer des analyses complémentaires',
                    'Surveillance renforcée recommandée',
                    'Suivi dans 3 mois'
                ],
                riskFactors: ['Hypertension', 'Diabète'],
                recommendations: ['Régime alimentaire', 'Exercice modéré']
            };
            window.app.showToast('Rapport enrichi avec l\'IA !', 'success');
            window.app.loadReports();
        }
    }, 2000);
}


// Fonctions pour les documents améliorés
function startBatchScan() {
    window.app.showToast('Démarrage du scan en lot...', 'warning');
    
    setTimeout(() => {
        window.app.showToast('Scan en lot terminé avec succès', 'success');
    }, 3000);
}

// Fonction pour charger l'activité récente dynamiquement
function loadRecentActivity() {
    const recentActivityContainer = document.getElementById('recentActivity');
    if (!recentActivityContainer) return;

    // Créer une liste d'activités basée sur les données réelles
    const activities = [];
    
    // Activités des documents récents
    const recentDocuments = window.app.data.documents
        .sort((a, b) => new Date(b.uploadDate || b.date) - new Date(a.uploadDate || a.date))
        .slice(0, 3);
    
    recentDocuments.forEach(doc => {
        const patient = window.app.data.patients.find(p => p.id === doc.patientId);
        const patientName = patient ? `${patient.firstName} ${patient.lastName}` : 'Patient inconnu';
        
        activities.push({
            icon: 'fas fa-file-upload',
            iconClass: 'bg-success',
            title: 'Document numérisé',
            description: `${doc.title || doc.name} - ${patientName}`,
            time: getTimeAgo(new Date(doc.uploadDate || doc.date))
        });
    });

    // Activités des patients récents
    const recentPatients = window.app.data.patients
        .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
        .slice(0, 2);
    
    recentPatients.forEach(patient => {
        activities.push({
            icon: 'fas fa-user-plus',
            iconClass: 'bg-info',
            title: 'Nouveau patient',
            description: `${patient.firstName} ${patient.lastName} ajouté`,
            time: getTimeAgo(new Date(patient.createdAt || patient.date))
        });
    });

    // Activités des rapports récents
    const recentReports = window.app.data.reports
        .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
        .slice(0, 2);
    
    recentReports.forEach(report => {
        const patient = window.app.data.patients.find(p => p.id === report.patientId);
        const patientName = patient ? `${patient.firstName} ${patient.lastName}` : 'Patient inconnu';
        
        activities.push({
            icon: 'fas fa-file-medical',
            iconClass: 'bg-warning',
            title: 'Rapport créé',
            description: `${report.title} - ${patientName}`,
            time: getTimeAgo(new Date(report.createdAt || report.date))
        });
    });

    // Trier par date et prendre les 5 plus récents
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));

    // Générer le HTML
    if (activities.length === 0) {
        recentActivityContainer.innerHTML = `
            <div class="text-center text-muted py-4">
                <i class="fas fa-history fa-3x mb-3"></i>
                <p>Aucune activité récente</p>
            </div>
        `;
        return;
    }

    const activitiesHTML = activities.slice(0, 5).map(activity => `
        <div class="activity-item">
            <div class="activity-icon ${activity.iconClass}">
                <i class="${activity.icon}"></i>
            </div>
            <div class="activity-content">
                <div class="activity-title">${activity.title}</div>
                <div class="activity-description">${activity.description}</div>
                <div class="activity-time">${activity.time}</div>
            </div>
        </div>
    `).join('');

    recentActivityContainer.innerHTML = activitiesHTML;
}

// Fonction utilitaire pour calculer le temps écoulé
function getTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
        return 'Il y a quelques secondes';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    } else {
        const days = Math.floor(diffInSeconds / 86400);
        return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    window.app = new MedicalDigitizationApp();
    
    // Exposer les fonctions globalement
    window.quickLogin = (role) => {
        if (window.app) {
            window.app.quickLogin(role);
        }
    };
    
    window.showUploadDocumentModal = () => {
        if (window.app) {
            showUploadDocumentModal();
        }
    };
    
    window.showPatientModal = () => {
        if (window.app) {
            showPatientModal();
        }
    };
    
    window.showReportModal = () => {
        if (window.app) {
            showReportModal();
        }
    };
});