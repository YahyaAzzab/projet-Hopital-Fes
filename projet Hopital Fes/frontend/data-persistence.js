// Système de Persistance des Données
class DataPersistence {
    static STORAGE_KEY = 'medicalDigitizationData';
    static BACKUP_KEY = 'medicalDigitizationBackup';
    
    // Sauvegarder toutes les données
    static saveData(data) {
        try {
            const dataToSave = {
                ...data,
                lastSaved: new Date().toISOString(),
                version: '1.0.0'
            };
            
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(dataToSave));
            
            // Créer une sauvegarde de sécurité
            localStorage.setItem(this.BACKUP_KEY, JSON.stringify(dataToSave));
            
            console.log('Données sauvegardées avec succès');
            return true;
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            return false;
        }
    }
    
    // Charger toutes les données
    static loadData() {
        try {
            const storedData = localStorage.getItem(this.STORAGE_KEY);
            if (storedData) {
                const data = JSON.parse(storedData);
                console.log('Données chargées depuis localStorage');
                return data;
            }
        } catch (error) {
            console.error('Erreur lors du chargement:', error);
            // Essayer de charger la sauvegarde
            return this.loadBackup();
        }
        return null;
    }
    
    // Charger la sauvegarde de sécurité
    static loadBackup() {
        try {
            const backupData = localStorage.getItem(this.BACKUP_KEY);
            if (backupData) {
                const data = JSON.parse(backupData);
                console.log('Données chargées depuis la sauvegarde');
                return data;
            }
        } catch (error) {
            console.error('Erreur lors du chargement de la sauvegarde:', error);
        }
        return null;
    }
    
    // Sauvegarder automatiquement
    static autoSave(data) {
        // Sauvegarder toutes les 30 secondes
        setInterval(() => {
            this.saveData(data);
        }, 30000);
    }
    
    // Exporter les données
    static exportData(data) {
        const exportData = {
            ...data,
            exportedAt: new Date().toISOString(),
            version: '1.0.0'
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
            type: 'application/json' 
        });
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `medical-data-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
    
    // Importer les données
    static importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    this.saveData(data);
                    resolve(data);
                } catch (error) {
                    reject(error);
                }
            };
            reader.readAsText(file);
        });
    }
    
    // Vérifier l'espace de stockage disponible
    static getStorageInfo() {
        const used = JSON.stringify(localStorage).length;
        const available = 5 * 1024 * 1024; // 5MB approximatif
        const usedPercent = (used / available) * 100;
        
        return {
            used: used,
            available: available,
            usedPercent: usedPercent,
            status: usedPercent > 80 ? 'warning' : 'ok'
        };
    }
    
    // Nettoyer les données anciennes
    static cleanup() {
        const data = this.loadData();
        if (data && data.activities) {
            // Garder seulement les 100 dernières activités
            data.activities = data.activities.slice(0, 100);
            this.saveData(data);
        }
    }
}

// Intégration avec l'application principale
if (typeof window !== 'undefined') {
    window.DataPersistence = DataPersistence;
}
