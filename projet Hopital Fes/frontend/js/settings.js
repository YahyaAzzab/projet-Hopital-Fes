// Système de Paramètres
class SettingsManager {
    static defaultSettings = {
        theme: 'light',
        language: 'fr',
        accentColor: '#2563eb',
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        alertSounds: false,
        animationsEnabled: true,
        compactMode: false,
        twoFactorAuth: false,
        loginAlerts: true,
        autoSave: true,
        sessionDuration: 480, // 8 heures en minutes
        notificationFrequency: 'daily',
        dateFormat: 'dd/mm/yyyy',
        timezone: 'Africa/Casablanca',
        scanQuality: 'medium',
        defaultResolution: 600,
        aiProcessing: true,
        ocrProcessing: true,
        smartClassification: true,
        aiConfidence: 'medium',
        // Nouvelles fonctionnalités
        autoBackup: false,
        backupFrequency: 'weekly',
        darkModeSchedule: false,
        nightModeStart: '20:00',
        nightModeEnd: '07:00',
        keyboardShortcuts: true,
        tooltips: true,
        soundEffects: true,
        hapticFeedback: false,
        autoRefresh: true,
        refreshInterval: 30, // secondes
        maxFileSize: 10, // MB
        allowedFormats: ['jpg', 'jpeg', 'png', 'pdf', 'tiff'],
        compressionLevel: 'medium',
        watermark: false,
        watermarkText: 'Confidentiel',
        auditLog: true,
        dataRetention: 365 // jours
    };

    static loadSettings() {
        const saved = localStorage.getItem('medicalPlatformSettings');
        if (saved) {
            try {
                return { ...this.defaultSettings, ...JSON.parse(saved) };
            } catch (error) {
                console.error('Erreur de chargement des paramètres:', error);
                return this.defaultSettings;
            }
        }
        return this.defaultSettings;
    }

    static saveSettings(settings) {
        try {
            const currentSettings = this.loadSettings();
            const updatedSettings = { ...currentSettings, ...settings };
            localStorage.setItem('medicalPlatformSettings', JSON.stringify(updatedSettings));
            return { success: true };
        } catch (error) {
            console.error('Erreur de sauvegarde des paramètres:', error);
            return { success: false, error: error.message };
        }
    }

    static applySetting(key, value) {
        const settings = this.loadSettings();
        settings[key] = value;
        this.saveSettings(settings);
        this.applySettingToUI(key, value);
    }

    static applySettingToUI(key, value) {
        switch (key) {
            case 'theme':
                this.applyTheme(value);
                break;
            case 'accentColor':
                this.applyAccentColor(value);
                break;
            case 'animationsEnabled':
                this.toggleAnimations(value);
                break;
            case 'compactMode':
                this.toggleCompactMode(value);
                break;
            case 'language':
                this.applyLanguage(value);
                break;
            case 'alertSounds':
                this.applyAlertSounds(value);
                break;
            case 'soundEffects':
                this.applySoundEffects(value);
                break;
        }
    }

    static applyTheme(theme) {
        const body = document.body;
        body.classList.remove('theme-light', 'theme-dark', 'theme-auto');
        
        if (theme === 'dark') {
            body.classList.add('theme-dark');
            document.documentElement.style.setProperty('--light-color', '#1e293b');
            document.documentElement.style.setProperty('--dark-color', '#f8fafc');
        } else if (theme === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.applyTheme(prefersDark ? 'dark' : 'light');
        } else {
            body.classList.add('theme-light');
            document.documentElement.style.setProperty('--light-color', '#f8fafc');
            document.documentElement.style.setProperty('--dark-color', '#0f172a');
        }
    }

    static applyAccentColor(color) {
        document.documentElement.style.setProperty('--primary-color', color);
        document.documentElement.style.setProperty('--medical-blue', color);
        
        // Mettre à jour la sélection visuelle
        document.querySelectorAll('.color-option').forEach(option => {
            option.classList.remove('active');
            if (option.dataset.color === color) {
                option.classList.add('active');
            }
        });
    }

    static toggleAnimations(enabled) {
        const body = document.body;
        if (enabled) {
            body.classList.remove('no-animations');
        } else {
            body.classList.add('no-animations');
        }
    }

    static toggleCompactMode(enabled) {
        const body = document.body;
        if (enabled) {
            body.classList.add('compact-mode');
        } else {
            body.classList.remove('compact-mode');
        }
    }

    static applyLanguage(language) {
        console.log('Changement de langue vers:', language);
        
        // Changer l'attribut lang du document
        document.documentElement.lang = language;
        
        // Gérer la direction du texte
        if (language === 'ar') {
            document.body.classList.add('rtl');
            document.documentElement.dir = 'rtl';
        } else {
            document.body.classList.remove('rtl');
            document.documentElement.dir = 'ltr';
        }
        
        // Appliquer les traductions
        this.translateInterface(language);
        
        // Sauvegarder la langue
        const settings = this.loadSettings();
        settings.language = language;
        this.saveSettings(settings);
        
        console.log('Langue appliquée avec succès');
    }
    
    static translateInterface(language) {
        const translations = this.getTranslations(language);
        
        // Traduire les éléments principaux
        this.translateElement('hospital-name', translations.hospitalName);
        this.translateElement('hospital-subtitle', translations.hospitalSubtitle);
        this.translateElement('login-title', translations.loginTitle);
        this.translateElement('email-label', translations.emailLabel);
        this.translateElement('password-label', translations.passwordLabel);
        this.translateElement('login-button', translations.loginButton);
        this.translateElement('demo-accounts-title', translations.demoAccountsTitle);
        
        // Traduire les boutons de démonstration
        this.translateElement('admin-button', translations.adminButton);
        this.translateElement('doctor-button', translations.doctorButton);
        this.translateElement('nurse-button', translations.nurseButton);
        this.translateElement('technician-button', translations.technicianButton);
    }
    
    static translateElement(className, text) {
        const elements = document.querySelectorAll(`.${className}`);
        elements.forEach(element => {
            if (text) {
                element.textContent = text;
            }
        });
    }
    
    static getTranslations(language) {
        const translations = {
            fr: {
                hospitalName: 'Hôpital EL GHASSANI',
                hospitalSubtitle: 'Système Intelligent de Dossiers Médicaux',
                loginTitle: 'Plateforme de Numérisation',
                emailLabel: 'Email',
                passwordLabel: 'Mot de passe',
                loginButton: 'Se connecter',
                demoAccountsTitle: 'Comptes de démonstration :',
                adminButton: 'Admin',
                doctorButton: 'Médecin',
                nurseButton: 'Infirmière',
                technicianButton: 'Technicien'
            },
            ar: {
                hospitalName: 'مستشفى الغساني',
                hospitalSubtitle: 'نظام ذكي للملفات الطبية',
                loginTitle: 'منصة الرقمنة',
                emailLabel: 'البريد الإلكتروني',
                passwordLabel: 'كلمة المرور',
                loginButton: 'تسجيل الدخول',
                demoAccountsTitle: 'حسابات تجريبية:',
                adminButton: 'مدير',
                doctorButton: 'طبيب',
                nurseButton: 'ممرضة',
                technicianButton: 'فني'
            },
            en: {
                hospitalName: 'EL GHASSANI Hospital',
                hospitalSubtitle: 'Intelligent Medical Records System',
                loginTitle: 'Digitization Platform',
                emailLabel: 'Email',
                passwordLabel: 'Password',
                loginButton: 'Sign In',
                demoAccountsTitle: 'Demo Accounts:',
                adminButton: 'Admin',
                doctorButton: 'Doctor',
                nurseButton: 'Nurse',
                technicianButton: 'Technician'
            }
        };
        
        return translations[language] || translations.fr;
    }
    
    static applyAlertSounds(enabled) {
        console.log('Alert sounds:', enabled ? 'activés' : 'désactivés');
        
        // Sauvegarder le paramètre
        const settings = this.loadSettings();
        settings.alertSounds = enabled;
        this.saveSettings(settings);
        
        // Tester le son si activé
        if (enabled && window.app) {
            window.app.showToast('Sons d\'alerte activés', 'info', 2000);
        }
    }
    
    static applySoundEffects(enabled) {
        console.log('Sound effects:', enabled ? 'activés' : 'désactivés');
        
        // Sauvegarder le paramètre
        const settings = this.loadSettings();
        settings.soundEffects = enabled;
        this.saveSettings(settings);
        
        // Tester l'effet sonore si activé
        if (enabled && window.app) {
            window.app.showToast('Effets sonores activés', 'info', 2000);
        }
    }

    static exportSettings() {
        const settings = this.loadSettings();
        const exportData = {
            settings: settings,
            user: window.app.currentUser,
            exportDate: new Date().toISOString(),
            platform: 'Medical Digitization Platform',
            version: '2.0.0'
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `parametres-medical-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        return { success: true };
    }

    static importSettings(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (data.settings) {
                        this.saveSettings(data.settings);
                        this.applyAllSettings(data.settings);
                        resolve({ success: true });
                    } else {
                        reject({ success: false, error: 'Format de fichier invalide' });
                    }
                } catch (error) {
                    reject({ success: false, error: 'Erreur de lecture du fichier' });
                }
            };
            reader.readAsText(file);
        });
    }

    static applyAllSettings(settings) {
        Object.keys(settings).forEach(key => {
            this.applySettingToUI(key, settings[key]);
        });
    }

    static resetToDefaults() {
        this.saveSettings(this.defaultSettings);
        this.applyAllSettings(this.defaultSettings);
        this.loadSettingsIntoForm();
        return { success: true };
    }

    static loadSettingsIntoForm() {
        const settings = this.loadSettings();
        
        // Charger les valeurs dans les formulaires
        Object.keys(settings).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = Boolean(settings[key]);
                } else if (element.type === 'radio') {
                    if (element.value === settings[key]) {
                        element.checked = true;
                    }
                } else if (element.type === 'number') {
                    element.value = settings[key] || 0;
                } else {
                    element.value = settings[key] || '';
                }
            }
        });

        // Appliquer les couleurs d'accent
        if (settings.accentColor) {
        this.applyAccentColor(settings.accentColor);
        }
        
        // Appliquer le thème
        if (settings.theme) {
            this.applyTheme(settings.theme);
        }
        
        // Appliquer les animations
        if (settings.animationsEnabled !== undefined) {
            this.toggleAnimations(settings.animationsEnabled);
        }
        
        // Appliquer le mode compact
        if (settings.compactMode !== undefined) {
            this.toggleCompactMode(settings.compactMode);
        }
    }

    static getSystemInfo() {
        return {
            version: '2.0.0',
            platform: 'Medical Digitization Platform',
            database: 'Local Storage',
            uptime: this.getUptime(),
            totalUsers: window.app.data.users.filter(u => u.isActive).length,
            totalPatients: window.app.data.patients.length,
            totalDocuments: window.app.data.documents.length,
            aiEnabled: true,
            lastBackup: localStorage.getItem('lastBackup') || 'Jamais',
            diskUsage: this.calculateDiskUsage()
        };
    }

    static getUptime() {
        const startTime = localStorage.getItem('systemStartTime') || Date.now();
        const uptime = Date.now() - parseInt(startTime);
        const hours = Math.floor(uptime / (1000 * 60 * 60));
        const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    }

    static calculateDiskUsage() {
        // Estimation basée sur les données stockées
        const dataSize = JSON.stringify(window.app.data).length;
        const settingsSize = JSON.stringify(this.loadSettings()).length;
        const totalBytes = dataSize + settingsSize;
        const totalMB = (totalBytes / (1024 * 1024)).toFixed(2);
        return `${totalMB} MB`;
    }

    static clearCache() {
        try {
            // Garder les données importantes
            const currentUser = localStorage.getItem('currentUser');
            const settings = localStorage.getItem('medicalPlatformSettings');
            
            // Vider le cache
            localStorage.clear();
            sessionStorage.clear();
            
            // Restaurer les données importantes
            if (currentUser) localStorage.setItem('currentUser', currentUser);
            if (settings) localStorage.setItem('medicalPlatformSettings', settings);
            
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    static createBackup() {
        const backupData = {
            userData: window.app.data,
            settings: this.loadSettings(),
            systemInfo: this.getSystemInfo(),
            backupDate: new Date().toISOString(),
            version: '2.0.0'
        };

        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sauvegarde-medical-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        // Enregistrer la date de sauvegarde
        localStorage.setItem('lastBackup', new Date().toISOString());

        return { success: true };
    }

    static restoreBackup(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const backupData = JSON.parse(e.target.result);
                    
                    if (backupData.userData && backupData.settings) {
                        // Restaurer les données
                        window.app.data = backupData.userData;
                        this.saveSettings(backupData.settings);
                        this.applyAllSettings(backupData.settings);
                        
                        // Recharger l'interface
                        window.app.loadPageData(window.app.currentPage);
                        
                        resolve({ success: true });
                    } else {
                        reject({ success: false, error: 'Format de sauvegarde invalide' });
                    }
                } catch (error) {
                    reject({ success: false, error: 'Erreur de lecture de la sauvegarde' });
                }
            };
            reader.readAsText(file);
        });
    }
}

// Fonctions globales pour les paramètres
function changeTheme() {
    const theme = document.getElementById('themeSelect').value;
    SettingsManager.applySetting('theme', theme);
    window.app.showToast(`Thème changé vers ${theme}`, 'success');
}

function changeLanguage() {
    const language = document.getElementById('languageSelect').value;
    SettingsManager.applySetting('language', language);
    window.app.showToast(`Langue changée vers ${language}`, 'success');
}

function toggleAlertSounds() {
    const checkbox = document.getElementById('alertSounds');
    SettingsManager.applySetting('alertSounds', checkbox.checked);
}

function toggleSoundEffects() {
    const checkbox = document.getElementById('soundEffects');
    SettingsManager.applySetting('soundEffects', checkbox.checked);
}

function changeAccentColor(color) {
    SettingsManager.applySetting('accentColor', color);
    window.app.showToast('Couleur d\'accent mise à jour', 'success');
}

function saveAllSettings() {
    const settings = {};
    
    // Collecter tous les paramètres depuis les éléments de la page
    const settingsPage = document.getElementById('settingsPage');
    if (!settingsPage) {
        window.app.showToast('Page des paramètres non trouvée', 'error');
        return;
    }
    
    // Collecter les valeurs des inputs
    settingsPage.querySelectorAll('input, select, textarea').forEach(element => {
        if (element.id && element.type !== 'button') {
            if (element.type === 'checkbox') {
                settings[element.id] = element.checked;
            } else if (element.type === 'number') {
                settings[element.id] = parseInt(element.value) || 0;
            } else {
                settings[element.id] = element.value;
            }
        }
    });

    // Sauvegarder les paramètres
    const result = SettingsManager.saveSettings(settings);
    if (result.success) {
        // Appliquer les paramètres immédiatement
        SettingsManager.applyAllSettings(settings);
        
        // Mettre à jour les statistiques
        if (window.app && window.app.updateSystemStats) {
            window.app.updateSystemStats();
        }
        
        window.app.showToast('Paramètres sauvegardés avec succès', 'success');
    } else {
        window.app.showToast('Erreur de sauvegarde: ' + (result.error || 'Erreur inconnue'), 'error');
    }
}

function exportData() {
    const result = SettingsManager.createBackup();
    if (result.success) {
        window.app.showToast('Sauvegarde créée avec succès', 'success');
    } else {
        window.app.showToast('Erreur lors de la sauvegarde', 'error');
    }
}

function clearCache() {
    if (confirm('Êtes-vous sûr de vouloir vider le cache ? Cette action est irréversible.')) {
        const result = SettingsManager.clearCache();
        if (result.success) {
            window.app.showToast('Cache vidé avec succès', 'success');
        } else {
            window.app.showToast('Erreur lors du vidage du cache', 'error');
        }
    }
}

function contactSupport() {
    // Créer un modal de support
    const modalHTML = `
        <div class="modal fade" id="supportModal" tabindex="-1" aria-labelledby="supportModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title" id="supportModalLabel">
                            <i class="fas fa-headset me-2"></i>Support Technique
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <h6><i class="fas fa-envelope me-2"></i>Contact Email</h6>
                                <p class="text-muted">Pour un support détaillé</p>
                                <div class="input-group mb-3">
                                    <input type="email" class="form-control" placeholder="Votre email" id="supportEmail">
                                    <button class="btn btn-primary" onclick="sendSupportEmail()">
                                        <i class="fas fa-paper-plane"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <h6><i class="fas fa-phone me-2"></i>Contact Téléphonique</h6>
                                <p class="text-muted">Support urgent</p>
                                <p><strong>+212 5 XX XX XX XX</strong></p>
                                <p><small class="text-muted">Lun-Ven: 8h-18h</small></p>
                            </div>
                        </div>
                        <hr>
                        <div class="mb-3">
                            <label class="form-label fw-bold">Description du problème</label>
                            <textarea class="form-control" id="supportMessage" rows="4" placeholder="Décrivez votre problème en détail..."></textarea>
                        </div>
                        <div class="mb-3">
                            <label class="form-label fw-bold">Priorité</label>
                            <select class="form-select" id="supportPriority">
                                <option value="low">Faible</option>
                                <option value="medium" selected>Moyenne</option>
                                <option value="high">Élevée</option>
                                <option value="urgent">Urgente</option>
                            </select>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
                        <button type="button" class="btn btn-primary" onclick="submitSupportRequest()">
                            <i class="fas fa-paper-plane me-2"></i>Envoyer la demande
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Supprimer le modal existant s'il y en a un
    const existingModal = document.getElementById('supportModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Ajouter le modal au DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Afficher le modal
    const modal = new bootstrap.Modal(document.getElementById('supportModal'));
    modal.show();
    
    // Supprimer le modal du DOM quand il est fermé
    document.getElementById('supportModal').addEventListener('hidden.bs.modal', () => {
        document.getElementById('supportModal').remove();
    });
}

function viewLogs() {
    // Créer un modal pour afficher les logs
    const logs = generateSystemLogs();
    
    const modalHTML = `
        <div class="modal fade" id="logsModal" tabindex="-1" aria-labelledby="logsModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header bg-info text-white">
                        <h5 class="modal-title" id="logsModalLabel">
                            <i class="fas fa-list-alt me-2"></i>Logs Système
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <div class="btn-group">
                                <button class="btn btn-sm btn-outline-primary" onclick="filterLogs('all')">Tous</button>
                                <button class="btn btn-sm btn-outline-success" onclick="filterLogs('info')">Info</button>
                                <button class="btn btn-sm btn-outline-warning" onclick="filterLogs('warning')">Warning</button>
                                <button class="btn btn-sm btn-outline-danger" onclick="filterLogs('error')">Erreur</button>
                            </div>
                            <button class="btn btn-sm btn-outline-secondary" onclick="refreshLogs()">
                                <i class="fas fa-sync-alt me-1"></i>Actualiser
                            </button>
                        </div>
                        <div class="logs-container" style="max-height: 400px; overflow-y: auto; background: #f8f9fa; padding: 15px; border-radius: 8px; font-family: monospace; font-size: 12px;">
                            ${logs.map(log => `
                                <div class="log-entry mb-2 p-2 rounded ${getLogClass(log.level)}" data-level="${log.level}">
                                    <span class="text-muted">[${log.timestamp}]</span>
                                    <span class="badge bg-${getLogBadgeColor(log.level)} me-2">${log.level.toUpperCase()}</span>
                                    <span>${log.message}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
                        <button type="button" class="btn btn-info" onclick="downloadLogs()">
                            <i class="fas fa-download me-2"></i>Télécharger les logs
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Supprimer le modal existant s'il y en a un
    const existingModal = document.getElementById('logsModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Ajouter le modal au DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Afficher le modal
    const modal = new bootstrap.Modal(document.getElementById('logsModal'));
    modal.show();
    
    // Supprimer le modal du DOM quand il est fermé
    document.getElementById('logsModal').addEventListener('hidden.bs.modal', () => {
        document.getElementById('logsModal').remove();
    });
}

// Fonctions utilitaires pour les logs
function generateSystemLogs() {
    const now = new Date();
    return [
        {
            timestamp: now.toLocaleTimeString('fr-FR'),
            level: 'info',
            message: 'Système démarré avec succès'
        },
        {
            timestamp: new Date(now.getTime() - 300000).toLocaleTimeString('fr-FR'),
            level: 'info',
            message: 'Utilisateur connecté: admin@elghassani.ma'
        },
        {
            timestamp: new Date(now.getTime() - 600000).toLocaleTimeString('fr-FR'),
            level: 'info',
            message: 'Document numérisé: Radiographie Pulmonaire - Mohammed Benali'
        },
        {
            timestamp: new Date(now.getTime() - 900000).toLocaleTimeString('fr-FR'),
            level: 'warning',
            message: 'Caméra non disponible, utilisation du mode simulation'
        },
        {
            timestamp: new Date(now.getTime() - 1200000).toLocaleTimeString('fr-FR'),
            level: 'info',
            message: 'Paramètres sauvegardés par l\'utilisateur'
        },
        {
            timestamp: new Date(now.getTime() - 1500000).toLocaleTimeString('fr-FR'),
            level: 'error',
            message: 'Erreur de connexion à la base de données (résolue)'
        },
        {
            timestamp: new Date(now.getTime() - 1800000).toLocaleTimeString('fr-FR'),
            level: 'info',
            message: 'Sauvegarde automatique effectuée'
        }
    ];
}

function getLogClass(level) {
    const classes = {
        'info': 'border-start border-primary border-3',
        'warning': 'border-start border-warning border-3',
        'error': 'border-start border-danger border-3'
    };
    return classes[level] || '';
}

function getLogBadgeColor(level) {
    const colors = {
        'info': 'primary',
        'warning': 'warning',
        'error': 'danger'
    };
    return colors[level] || 'secondary';
}

function filterLogs(level) {
    const logEntries = document.querySelectorAll('.log-entry');
    logEntries.forEach(entry => {
        if (level === 'all' || entry.dataset.level === level) {
            entry.style.display = 'block';
        } else {
            entry.style.display = 'none';
        }
    });
}

function refreshLogs() {
    window.app.showToast('Logs actualisés', 'info');
    // Dans un vrai système, ceci rechargerait les logs depuis le serveur
}

function downloadLogs() {
    const logs = generateSystemLogs();
    const logText = logs.map(log => `[${log.timestamp}] ${log.level.toUpperCase()}: ${log.message}`).join('\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-logs-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    window.app.showToast('Logs téléchargés', 'success');
}

function submitSupportRequest() {
    const email = document.getElementById('supportEmail').value;
    const message = document.getElementById('supportMessage').value;
    const priority = document.getElementById('supportPriority').value;
    
    if (!email || !message) {
        window.app.showToast('Veuillez remplir tous les champs', 'error');
        return;
    }
    
    // Simuler l'envoi de la demande
    window.app.showToast('Demande de support envoyée avec succès', 'success');
    
    // Fermer le modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('supportModal'));
    if (modal) {
        modal.hide();
    }
}

function sendSupportEmail() {
    const email = document.getElementById('supportEmail').value;
    if (!email) {
        window.app.showToast('Veuillez saisir votre email', 'error');
        return;
    }
    
    window.app.showToast(`Email de support envoyé à ${email}`, 'success');
}

function resetSettings() {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser tous les paramètres ?')) {
        const result = SettingsManager.resetToDefaults();
        if (result.success) {
            window.app.showToast('Paramètres réinitialisés avec succès', 'success');
        }
    }
}

function importBackup() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const result = await SettingsManager.restoreBackup(file);
                if (result.success) {
                    window.app.showToast('Sauvegarde restaurée avec succès', 'success');
                }
            } catch (error) {
                window.app.showToast(error.error || 'Erreur de restauration', 'error');
            }
        }
    };
    
    input.click();
}

// Fonctions de test pour vérifier le fonctionnement
function testSettingsFunctionality() {
    console.log('=== Test des fonctionnalités des paramètres ===');
    
    // Test 1: Chargement des paramètres
    console.log('Test 1: Chargement des paramètres');
    const settings = SettingsManager.loadSettings();
    console.log('Paramètres chargés:', settings);
    
    // Test 2: Sauvegarde d'un paramètre
    console.log('Test 2: Sauvegarde d\'un paramètre');
    const originalTheme = settings.theme;
    SettingsManager.applySetting('theme', 'dark');
    const newSettings = SettingsManager.loadSettings();
    console.log('Thème changé vers:', newSettings.theme);
    
    // Restaurer le thème original
    SettingsManager.applySetting('theme', originalTheme);
    
    // Test 3: Test des fonctions principales
    console.log('Test 3: Test des fonctions principales');
    
    // Test changeTheme
    console.log('- Test changeTheme()');
    changeTheme();
    
    // Test changeLanguage
    console.log('- Test changeLanguage()');
    changeLanguage();
    
    // Test changeAccentColor
    console.log('- Test changeAccentColor()');
    changeAccentColor('#059669');
    
    // Test 4: Test des informations système
    console.log('Test 4: Informations système');
    const systemInfo = SettingsManager.getSystemInfo();
    console.log('Informations système:', systemInfo);
    
    // Test 5: Test de l'utilisation du stockage
    console.log('Test 5: Utilisation du stockage');
    const diskUsage = SettingsManager.calculateDiskUsage();
    console.log('Utilisation du stockage:', diskUsage);
    
    console.log('=== Tests terminés ===');
    
    return {
        settingsLoaded: Object.keys(settings).length > 0,
        themeChanged: newSettings.theme === 'dark',
        systemInfoAvailable: Object.keys(systemInfo).length > 0,
        diskUsageCalculated: diskUsage !== '0.00 MB'
    };
}

// Fonction pour tester l'interface utilisateur
function testSettingsUI() {
    console.log('=== Test de l\'interface utilisateur des paramètres ===');
    
    const settingsPage = document.getElementById('settingsPage');
    if (!settingsPage) {
        console.error('Page des paramètres non trouvée');
        return false;
    }
    
    // Vérifier la présence des sections principales
    const sections = [
        'themeSelect',
        'languageSelect', 
        'aiProcessing',
        'emailNotifications',
        'twoFactorAuth',
        'scanQuality',
        'sessionDuration',
        'dateFormat',
        'timezone',
        'animationsEnabled',
        'compactMode'
    ];
    
    let allSectionsFound = true;
    sections.forEach(sectionId => {
        const element = document.getElementById(sectionId);
        if (element) {
            console.log(`✓ Section trouvée: ${sectionId}`);
        } else {
            console.error(`✗ Section manquante: ${sectionId}`);
            allSectionsFound = false;
        }
    });
    
    // Test du bouton de sauvegarde
    const saveButton = settingsPage.querySelector('button[onclick="saveAllSettings()"]');
    if (saveButton) {
        console.log('✓ Bouton de sauvegarde trouvé');
    } else {
        console.error('✗ Bouton de sauvegarde manquant');
        allSectionsFound = false;
    }
    
    console.log('=== Test UI terminé ===');
    return allSectionsFound;
}

// Export global
window.SettingsManager = SettingsManager;
window.testSettingsFunctionality = testSettingsFunctionality;
window.testSettingsUI = testSettingsUI;

