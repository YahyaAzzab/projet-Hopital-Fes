// Gestion des Documents et IA
class DocumentManager {
    static generateDocumentId() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 999).toString().padStart(3, '0');
        return `DOC${timestamp}${random}`;
    }

    static validateDocument(data) {
        const errors = [];
        
        if (!data.title || data.title.trim().length < 3) {
            errors.push('Le titre doit contenir au moins 3 caractères');
        }
        
        if (!data.type) {
            errors.push('Le type de document est requis');
        }
        
        if (!data.patientId) {
            errors.push('Le patient doit être sélectionné');
        }
        
        if (!data.date) {
            errors.push('La date du document est requise');
        }
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    static createDocument(data) {
        const validation = this.validateDocument(data);
        if (!validation.valid) {
            return { success: false, errors: validation.errors };
        }

        const newDocument = {
            id: Date.now(),
            documentId: this.generateDocumentId(),
            title: data.title.trim(),
            type: data.type,
            patientId: data.patientId,
            patientName: data.patientName,
            date: data.date,
            status: 'pending_review',
            priority: data.priority || 'medium',
            size: data.size || '1.0 MB',
            quality: data.quality || 85,
            aiProcessed: false,
            createdAt: new Date().toISOString(),
            metadata: {
                description: data.description || '',
                doctor: data.doctor || '',
                department: data.department || '',
                confidentiality: data.confidentiality || 'internal'
            }
        };

        return { success: true, document: newDocument };
    }

    static processWithAI(document) {
        // Simulation du traitement IA
        const aiResults = {
            confidence: Math.floor(Math.random() * 20) + 80, // 80-100%
            extractedText: this.generateMockOCR(document.type),
            classification: document.type,
            keywords: this.extractKeywords(document.type),
            anomalies: this.detectAnomalies(document.type),
            recommendations: this.generateRecommendations(document.type)
        };

        document.aiProcessed = true;
        document.quality = aiResults.confidence;
        document.aiResults = aiResults;

        return aiResults;
    }

    static generateMockOCR(type) {
        const ocrTexts = {
            medical_record: 'Patient: [Nom] - Date de naissance: [Date] - Diagnostic: [Diagnostic] - Traitement: [Traitement]',
            prescription: 'ORDONNANCE - Médecin: Dr. [Nom] - Médicament: [Nom] - Posologie: [Dose] - Durée: [Durée]',
            lab_results: 'RÉSULTATS D\'ANALYSE - Hémoglobine: 14.2 g/dL - Glycémie: 95 mg/dL - Cholestérol: 180 mg/dL',
            xray: 'RADIOGRAPHIE - Date: [Date] - Région: [Région] - Résultat: [Résultat] - Radiologue: Dr. [Nom]',
            consultation: 'CONSULTATION - Date: [Date] - Motif: [Motif] - Examen: [Examen] - Prescription: [Prescription]'
        };
        return ocrTexts[type] || 'Texte extrait par OCR...';
    }

    static extractKeywords(type) {
        const keywords = {
            medical_record: ['dossier', 'patient', 'médical', 'historique'],
            prescription: ['ordonnance', 'médicament', 'posologie', 'traitement'],
            lab_results: ['analyse', 'laboratoire', 'résultats', 'biologie'],
            xray: ['radiographie', 'imagerie', 'radio', 'diagnostic'],
            consultation: ['consultation', 'examen', 'visite', 'médecin']
        };
        return keywords[type] || ['document', 'médical'];
    }

    static detectAnomalies(type) {
        // Simulation de détection d'anomalies
        const anomalies = [
            'Qualité d\'image optimale',
            'Texte clairement lisible',
            'Pas d\'anomalie détectée'
        ];
        
        if (Math.random() > 0.7) {
            anomalies.push('Attention: Possible zone floue détectée');
        }
        
        return anomalies;
    }

    static generateRecommendations(type) {
        const recommendations = {
            medical_record: [
                'Vérifier la complétude du dossier',
                'Associer aux analyses récentes',
                'Archiver selon la procédure'
            ],
            prescription: [
                'Vérifier la posologie',
                'Contrôler les interactions médicamenteuses',
                'Notifier le pharmacien'
            ],
            lab_results: [
                'Comparer aux valeurs de référence',
                'Alerter si valeurs anormales',
                'Programmer suivi si nécessaire'
            ],
            xray: [
                'Faire valider par radiologue',
                'Comparer aux examens précédents',
                'Archiver avec le dossier patient'
            ]
        };
        
        return recommendations[type] || ['Document traité avec succès'];
    }

    static classifyDocument(content, filename) {
        const filename_lower = filename.toLowerCase();
        const content_lower = content.toLowerCase();
        
        // Classification intelligente basée sur le contenu et le nom
        if (filename_lower.includes('radio') || filename_lower.includes('xray') || content_lower.includes('radiographie')) {
            return { type: 'xray', confidence: 0.95 };
        }
        
        if (filename_lower.includes('analyse') || filename_lower.includes('lab') || content_lower.includes('laboratoire')) {
            return { type: 'lab_results', confidence: 0.92 };
        }
        
        if (filename_lower.includes('ordonnance') || filename_lower.includes('prescription') || content_lower.includes('médicament')) {
            return { type: 'prescription', confidence: 0.88 };
        }
        
        if (filename_lower.includes('consultation') || content_lower.includes('examen')) {
            return { type: 'consultation', confidence: 0.85 };
        }
        
        return { type: 'medical_record', confidence: 0.70 };
    }

    static enhanceDocument(document) {
        // Simulation d'amélioration du document
        const enhancements = {
            contrastAdjusted: true,
            noiseReduced: true,
            textSharpened: true,
            qualityImproved: Math.min(document.quality + 5, 100)
        };
        
        document.quality = enhancements.qualityImproved;
        document.enhanced = true;
        document.enhancements = enhancements;
        
        return enhancements;
    }

    static searchDocuments(documents, searchTerm) {
        if (!searchTerm) return documents;
        
        const term = searchTerm.toLowerCase();
        return documents.filter(doc =>
            doc.title.toLowerCase().includes(term) ||
            doc.patientName.toLowerCase().includes(term) ||
            doc.type.toLowerCase().includes(term) ||
            (doc.metadata && doc.metadata.description && doc.metadata.description.toLowerCase().includes(term))
        );
    }

    static filterDocuments(documents, filters) {
        let filtered = [...documents];
        
        if (filters.type) {
            filtered = filtered.filter(d => d.type === filters.type);
        }
        
        if (filters.status) {
            filtered = filtered.filter(d => d.status === filters.status);
        }
        
        if (filters.priority) {
            filtered = filtered.filter(d => d.priority === filters.priority);
        }
        
        if (filters.patientId) {
            filtered = filtered.filter(d => d.patientId === filters.patientId);
        }
        
        if (filters.aiProcessed !== undefined) {
            filtered = filtered.filter(d => d.aiProcessed === filters.aiProcessed);
        }
        
        return filtered;
    }

    static getDocumentStats(documents) {
        const stats = {
            total: documents.length,
            byType: {},
            byStatus: {},
            byPriority: {},
            aiProcessed: documents.filter(d => d.aiProcessed).length,
            averageQuality: 0
        };
        
        // Statistiques par type
        documents.forEach(doc => {
            stats.byType[doc.type] = (stats.byType[doc.type] || 0) + 1;
            stats.byStatus[doc.status] = (stats.byStatus[doc.status] || 0) + 1;
            stats.byPriority[doc.priority] = (stats.byPriority[doc.priority] || 0) + 1;
        });
        
        // Qualité moyenne
        if (documents.length > 0) {
            stats.averageQuality = Math.round(
                documents.reduce((sum, doc) => sum + (doc.quality || 0), 0) / documents.length
            );
        }
        
        return stats;
    }
}

// Export global
window.DocumentManager = DocumentManager;

