// Utilitaires d'export Excel et PDF
class ExportUtils {
    
    // Exporter les patients en Excel
    static exportPatientsToExcel(patients) {
        try {
            // Créer les données CSV
            const csvContent = this.convertPatientsToCSV(patients);
            
            // Créer et télécharger le fichier
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            link.setAttribute('href', url);
            link.setAttribute('download', `patients_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(url);
            
            return { success: true, message: 'Export Excel réussi' };
        } catch (error) {
            console.error('Erreur export Excel:', error);
            return { success: false, message: 'Erreur lors de l\'export Excel' };
        }
    }
    
    // Convertir les patients en CSV
    static convertPatientsToCSV(patients) {
        const headers = [
            'ID Patient',
            'Prénom',
            'Nom',
            'Carte d\'Identité',
            'Date de Naissance',
            'Âge',
            'Genre',
            'Téléphone',
            'Email',
            'Adresse',
            'Ville',
            'Groupe Sanguin',
            'Contact d\'Urgence',
            'Assurance',
            'Allergies',
            'Antécédents Médicaux',
            'Profession',
            'État Civil',
            'Notes Médicales',
            'Statut',
            'Documents',
            'Dernière Visite',
            'Date de Création'
        ];
        
        const csvRows = [headers.join(',')];
        
        patients.forEach(patient => {
            const row = [
                this.escapeCsv(patient.patientId || ''),
                this.escapeCsv(patient.firstName || ''),
                this.escapeCsv(patient.lastName || ''),
                this.escapeCsv(patient.ci || ''),
                this.escapeCsv(patient.dateOfBirth || ''),
                this.escapeCsv(patient.age?.toString() || ''),
                this.escapeCsv(patient.gender || ''),
                this.escapeCsv(patient.phone || ''),
                this.escapeCsv(patient.email || ''),
                this.escapeCsv(patient.address || ''),
                this.escapeCsv(patient.city || ''),
                this.escapeCsv(patient.bloodType || ''),
                this.escapeCsv(patient.emergencyContact || ''),
                this.escapeCsv(patient.insurance || ''),
                this.escapeCsv(patient.allergies || ''),
                this.escapeCsv(patient.medicalHistory || ''),
                this.escapeCsv(patient.occupation || ''),
                this.escapeCsv(patient.maritalStatus || ''),
                this.escapeCsv(patient.notes || ''),
                this.escapeCsv(patient.status || ''),
                this.escapeCsv(patient.documentsCount?.toString() || '0'),
                this.escapeCsv(patient.lastVisit || ''),
                this.escapeCsv(patient.createdAt || '')
            ];
            csvRows.push(row.join(','));
        });
        
        return csvRows.join('\n');
    }
    
    // Exporter les documents en Excel
    static exportDocumentsToExcel(documents) {
        try {
            const csvContent = this.convertDocumentsToCSV(documents);
            
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            link.setAttribute('href', url);
            link.setAttribute('download', `documents_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(url);
            
            return { success: true, message: 'Export Excel réussi' };
        } catch (error) {
            console.error('Erreur export Excel:', error);
            return { success: false, message: 'Erreur lors de l\'export Excel' };
        }
    }
    
    // Convertir les documents en CSV
    static convertDocumentsToCSV(documents) {
        const headers = [
            'ID Document',
            'Titre',
            'Type',
            'Patient',
            'Date',
            'Statut',
            'Priorité',
            'Taille',
            'Qualité',
            'Traitement IA',
            'Date de Création'
        ];
        
        const csvRows = [headers.join(',')];
        
        documents.forEach(doc => {
            const row = [
                this.escapeCsv(doc.id?.toString() || ''),
                this.escapeCsv(doc.title || ''),
                this.escapeCsv(doc.type || ''),
                this.escapeCsv(doc.patientName || ''),
                this.escapeCsv(doc.date || ''),
                this.escapeCsv(doc.status || ''),
                this.escapeCsv(doc.priority || ''),
                this.escapeCsv(doc.size || ''),
                this.escapeCsv(doc.quality?.toString() || ''),
                this.escapeCsv(doc.aiProcessed ? 'Oui' : 'Non'),
                this.escapeCsv(doc.createdAt || '')
            ];
            csvRows.push(row.join(','));
        });
        
        return csvRows.join('\n');
    }
    
    // Exporter les rapports en Excel
    static exportReportsToExcel(reports) {
        try {
            const csvContent = this.convertReportsToCSV(reports);
            
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            link.setAttribute('href', url);
            link.setAttribute('download', `rapports_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(url);
            
            return { success: true, message: 'Export Excel réussi' };
        } catch (error) {
            console.error('Erreur export Excel:', error);
            return { success: false, message: 'Erreur lors de l\'export Excel' };
        }
    }
    
    // Exporter un document en PDF
    static exportDocumentToPDF(document) {
        try {
            if (typeof window.jsPDF === 'undefined' && typeof jsPDF === 'undefined') {
                return { success: false, message: 'jsPDF non disponible' };
            }
            
            const PDF = window.jsPDF || jsPDF;
            const pdf = new PDF();
            
            // En-tête
            pdf.setFontSize(20);
            pdf.text('Hôpital EL GHASSANI', 20, 20);
            pdf.setFontSize(12);
            pdf.text('Document Médical', 20, 30);
            pdf.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 20, 40);
            
            // Informations du document
            pdf.setFontSize(14);
            pdf.text('Informations du Document', 20, 60);
            
            pdf.setFontSize(10);
            let y = 70;
            const lineHeight = 7;
            
            pdf.text(`Titre: ${document.title}`, 20, y);
            y += lineHeight;
            pdf.text(`Type: ${document.type}`, 20, y);
            y += lineHeight;
            pdf.text(`Patient: ${document.patientName}`, 20, y);
            y += lineHeight;
            pdf.text(`Date: ${document.date}`, 20, y);
            y += lineHeight;
            pdf.text(`Statut: ${document.status}`, 20, y);
            y += lineHeight;
            pdf.text(`Priorité: ${document.priority}`, 20, y);
            y += lineHeight;
            pdf.text(`Taille: ${document.size}`, 20, y);
            y += lineHeight;
            pdf.text(`Qualité: ${document.quality}%`, 20, y);
            y += lineHeight;
            pdf.text(`Traitement IA: ${document.aiProcessed ? 'Oui' : 'Non'}`, 20, y);
            
            // Pied de page
            const pageHeight = pdf.internal.pageSize.height;
            pdf.setFontSize(8);
            pdf.text('Document généré automatiquement par le système de numérisation médicale', 20, pageHeight - 20);
            
            // Télécharger
            const fileName = `document_${document.id}_${new Date().toISOString().split('T')[0]}.pdf`;
            pdf.save(fileName);
            
            return { success: true, message: 'Export PDF réussi' };
        } catch (error) {
            console.error('Erreur export PDF:', error);
            return { success: false, message: 'Erreur lors de l\'export PDF' };
        }
    }
    
    // Exporter un rapport en PDF
    static exportReportToPDF(report) {
        try {
            if (typeof window.jsPDF === 'undefined' && typeof jsPDF === 'undefined') {
                return { success: false, message: 'jsPDF non disponible' };
            }
            
            const PDF = window.jsPDF || jsPDF;
            const pdf = new PDF();
            
            // En-tête
            pdf.setFontSize(20);
            pdf.text('Hôpital EL GHASSANI', 20, 20);
            pdf.setFontSize(12);
            pdf.text('Rapport Médical', 20, 30);
            pdf.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 20, 40);
            
            // Informations du rapport
            pdf.setFontSize(14);
            pdf.text('Informations du Rapport', 20, 60);
            
            pdf.setFontSize(10);
            let y = 70;
            const lineHeight = 7;
            
            pdf.text(`Titre: ${report.title}`, 20, y);
            y += lineHeight;
            pdf.text(`Type: ${report.type}`, 20, y);
            y += lineHeight;
            pdf.text(`Patient: ${report.patientName}`, 20, y);
            y += lineHeight;
            pdf.text(`Date: ${report.date}`, 20, y);
            y += lineHeight;
            pdf.text(`Statut: ${report.status}`, 20, y);
            y += lineHeight;
            
            if (report.summary) {
                y += lineHeight;
                pdf.text('Résumé:', 20, y);
                y += lineHeight;
                const summaryLines = pdf.splitTextToSize(report.summary, 170);
                pdf.text(summaryLines, 20, y);
                y += summaryLines.length * lineHeight;
            }
            
            // Pied de page
            const pageHeight = pdf.internal.pageSize.height;
            pdf.setFontSize(8);
            pdf.text('Rapport généré automatiquement par le système de numérisation médicale', 20, pageHeight - 20);
            
            // Télécharger
            const fileName = `rapport_${report.id}_${new Date().toISOString().split('T')[0]}.pdf`;
            pdf.save(fileName);
            
            return { success: true, message: 'Export PDF réussi' };
        } catch (error) {
            console.error('Erreur export PDF:', error);
            return { success: false, message: 'Erreur lors de l\'export PDF' };
        }
    }
    
    // Exporter toutes les données en Excel
    static exportAllDataToExcel(data) {
        try {
            const zip = new JSZip();
            
            // Patients
            const patientsCSV = this.convertPatientsToCSV(data.patients);
            zip.file('patients.csv', patientsCSV);
            
            // Documents
            const documentsCSV = this.convertDocumentsToCSV(data.documents);
            zip.file('documents.csv', documentsCSV);
            
            // Rapports
            const reportsCSV = this.convertReportsToCSV(data.reports);
            zip.file('rapports.csv', reportsCSV);
            
            // Utilisateurs
            const usersCSV = this.convertUsersToCSV(data.users);
            zip.file('utilisateurs.csv', usersCSV);
            
            // Générer le ZIP
            zip.generateAsync({ type: 'blob' }).then(content => {
                const link = document.createElement('a');
                const url = URL.createObjectURL(content);
                
                link.setAttribute('href', url);
                link.setAttribute('download', `donnees_completes_${new Date().toISOString().split('T')[0]}.zip`);
                link.style.visibility = 'hidden';
                
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                URL.revokeObjectURL(url);
            });
            
            return { success: true, message: 'Export complet réussi' };
        } catch (error) {
            console.error('Erreur export complet:', error);
            return { success: false, message: 'Erreur lors de l\'export complet' };
        }
    }
    
    // Convertir les rapports en CSV
    static convertReportsToCSV(reports) {
        const headers = [
            'ID Rapport',
            'Titre',
            'Type',
            'Patient',
            'Date',
            'Statut',
            'Résumé',
            'Insights IA',
            'Date de Création'
        ];
        
        const csvRows = [headers.join(',')];
        
        reports.forEach(report => {
            const row = [
                this.escapeCsv(report.id?.toString() || ''),
                this.escapeCsv(report.title || ''),
                this.escapeCsv(report.type || ''),
                this.escapeCsv(report.patientName || ''),
                this.escapeCsv(report.date || ''),
                this.escapeCsv(report.status || ''),
                this.escapeCsv(report.summary || ''),
                this.escapeCsv(report.aiInsights ? 'Oui' : 'Non'),
                this.escapeCsv(report.createdAt || '')
            ];
            csvRows.push(row.join(','));
        });
        
        return csvRows.join('\n');
    }
    
    // Convertir les utilisateurs en CSV
    static convertUsersToCSV(users) {
        const headers = [
            'ID',
            'Prénom',
            'Nom',
            'Email',
            'Rôle',
            'Département',
            'Actif',
            'Dernière Connexion'
        ];
        
        const csvRows = [headers.join(',')];
        
        users.forEach(user => {
            const row = [
                this.escapeCsv(user.id?.toString() || ''),
                this.escapeCsv(user.firstName || ''),
                this.escapeCsv(user.lastName || ''),
                this.escapeCsv(user.email || ''),
                this.escapeCsv(user.roleName || ''),
                this.escapeCsv(user.department || ''),
                this.escapeCsv(user.isActive ? 'Oui' : 'Non'),
                this.escapeCsv(user.lastLogin || '')
            ];
            csvRows.push(row.join(','));
        });
        
        return csvRows.join('\n');
    }
    
    // Échapper les caractères spéciaux pour CSV
    static escapeCsv(str) {
        if (str === null || str === undefined) return '';
        const string = str.toString();
        if (string.includes(',') || string.includes('"') || string.includes('\n')) {
            return `"${string.replace(/"/g, '""')}"`;
        }
        return string;
    }
}

// Exporter globalement
if (typeof window !== 'undefined') {
    window.ExportUtils = ExportUtils;
}
