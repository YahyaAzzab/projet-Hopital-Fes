// Système de Rapports Intelligents
class IntelligentReports {
    static generateReport(type, patientId, data) {
        const patient = window.app.data.patients.find(p => p.id === patientId);
        if (!patient) {
            return { success: false, error: 'Patient non trouvé' };
        }

        const reportId = Date.now();
        const report = {
            id: reportId,
            title: `${this.getReportTypeLabel(type)} - ${patient.firstName} ${patient.lastName}`,
            type: type,
            patientId: patientId,
            patientName: `${patient.firstName} ${patient.lastName}`,
            date: new Date().toISOString().split('T')[0],
            status: 'draft',
            summary: data.summary || '',
            content: {
                diagnosis: data.diagnosis || '',
                treatment: data.treatment || '',
                notes: data.notes || '',
                recommendations: data.recommendations || []
            },
            aiInsights: false,
            createdBy: window.app.currentUser?.id,
            createdAt: new Date().toISOString()
        };

        return { success: true, report: report };
    }

    static generateAIReport(patientId) {
        const patient = window.app.data.patients.find(p => p.id === patientId);
        if (!patient) {
            return { success: false, error: 'Patient non trouvé' };
        }

        // Récupérer les documents du patient
        const patientDocuments = window.app.data.documents.filter(d => d.patientId === patientId);
        
        // Générer un rapport IA basé sur les documents
        const aiReport = {
            id: Date.now(),
            title: `Rapport IA - ${patient.firstName} ${patient.lastName}`,
            type: 'ai_analysis',
            patientId: patientId,
            patientName: `${patient.firstName} ${patient.lastName}`,
            date: new Date().toISOString().split('T')[0],
            status: 'completed',
            summary: this.generateAISummary(patient, patientDocuments),
            content: {
                diagnosis: this.generateAIDiagnosis(patientDocuments),
                treatment: this.generateAITreatment(patientDocuments),
                notes: this.generateAINotes(patient, patientDocuments),
                recommendations: this.generateAIRecommendations(patient, patientDocuments)
            },
            aiInsights: true,
            aiConfidence: Math.floor(Math.random() * 20) + 80,
            createdBy: 'AI_SYSTEM',
            createdAt: new Date().toISOString()
        };

        return { success: true, report: aiReport };
    }

    static generateAISummary(patient, documents) {
        const summaries = [
            `Analyse complète du dossier médical de ${patient.firstName} ${patient.lastName} (${patient.age} ans). `,
            `${documents.length} documents analysés. `,
            `État de santé général: stable. `,
            `Dernière consultation: ${patient.lastVisit}. `,
            `Suivi médical régulier recommandé.`
        ];
        
        return summaries.join('');
    }

    static generateAIDiagnosis(documents) {
        const diagnoses = [
            'Pas de pathologie majeure détectée',
            'Paramètres vitaux dans les normes',
            'Analyses sanguines satisfaisantes',
            'Examens d\'imagerie normaux'
        ];
        
        // Ajouter des diagnostics spécifiques selon les types de documents
        documents.forEach(doc => {
            switch (doc.type) {
                case 'lab_results':
                    diagnoses.push('Résultats biologiques conformes aux valeurs de référence');
                    break;
                case 'xray':
                    diagnoses.push('Imagerie thoracique sans anomalie visible');
                    break;
                case 'prescription':
                    diagnoses.push('Traitement médicamenteux adapté');
                    break;
            }
        });
        
        return diagnoses.slice(0, 3).join('. ') + '.';
    }

    static generateAITreatment(documents) {
        const treatments = [
            'Poursuite du traitement actuel',
            'Surveillance médicale régulière',
            'Contrôles périodiques recommandés'
        ];
        
        // Personnaliser selon les documents
        const prescriptions = documents.filter(d => d.type === 'prescription');
        if (prescriptions.length > 0) {
            treatments.push('Respect de la posologie prescrite');
        }
        
        return treatments.join('. ') + '.';
    }

    static generateAINotes(patient, documents) {
        return `Patient ${patient.firstName} ${patient.lastName}, ${patient.age} ans, présente un dossier médical complet avec ${documents.length} document(s). L'analyse automatique suggère un état de santé stable nécessitant un suivi médical régulier.`;
    }

    static generateAIRecommendations(patient, documents) {
        const recommendations = [
            'Planifier une consultation de suivi dans 3 mois',
            'Maintenir un mode de vie sain',
            'Continuer la surveillance médicale régulière'
        ];
        
        // Recommandations spécifiques selon l'âge
        if (patient.age > 50) {
            recommendations.push('Dépistage préventif recommandé');
        }
        
        if (patient.age > 65) {
            recommendations.push('Surveillance cardiologique annuelle');
        }
        
        // Selon les types de documents
        const hasLabResults = documents.some(d => d.type === 'lab_results');
        if (hasLabResults) {
            recommendations.push('Contrôle biologique dans 6 mois');
        }
        
        return recommendations;
    }

    static analyzeReportContent(content) {
        const analysis = {
            wordCount: content.split(' ').length,
            complexity: this.calculateComplexity(content),
            medicalTerms: this.extractMedicalTerms(content),
            sentiment: this.analyzeSentiment(content),
            completeness: this.assessCompleteness(content),
            suggestions: this.generateContentSuggestions(content)
        };
        
        return analysis;
    }

    static calculateComplexity(content) {
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const avgWordsPerSentence = content.split(' ').length / sentences.length;
        
        if (avgWordsPerSentence > 20) return 'Complexe';
        if (avgWordsPerSentence > 15) return 'Modéré';
        return 'Simple';
    }

    static extractMedicalTerms(content) {
        const medicalTerms = [
            'diagnostic', 'traitement', 'symptôme', 'pathologie', 'thérapie',
            'médicament', 'posologie', 'consultation', 'examen', 'analyse',
            'prescription', 'suivi', 'prévention', 'dépistage', 'chirurgie'
        ];
        
        const foundTerms = medicalTerms.filter(term => 
            content.toLowerCase().includes(term)
        );
        
        return foundTerms.slice(0, 5); // Limiter à 5 termes
    }

    static analyzeSentiment(content) {
        const positiveWords = ['amélioration', 'guérison', 'stable', 'normal', 'bon', 'satisfaisant'];
        const negativeWords = ['douleur', 'problème', 'complication', 'anormal', 'inquiétant'];
        
        const positiveCount = positiveWords.filter(word => 
            content.toLowerCase().includes(word)
        ).length;
        
        const negativeCount = negativeWords.filter(word => 
            content.toLowerCase().includes(word)
        ).length;
        
        if (positiveCount > negativeCount) return 'Positif';
        if (negativeCount > positiveCount) return 'Négatif';
        return 'Neutre';
    }

    static assessCompleteness(content) {
        const requiredSections = ['diagnostic', 'traitement', 'suivi'];
        const presentSections = requiredSections.filter(section => 
            content.toLowerCase().includes(section)
        );
        
        const completeness = (presentSections.length / requiredSections.length) * 100;
        return Math.round(completeness);
    }

    static generateContentSuggestions(content) {
        const suggestions = [];
        
        if (!content.toLowerCase().includes('diagnostic')) {
            suggestions.push('Ajouter un diagnostic précis');
        }
        
        if (!content.toLowerCase().includes('traitement')) {
            suggestions.push('Spécifier le plan de traitement');
        }
        
        if (!content.toLowerCase().includes('suivi')) {
            suggestions.push('Planifier le suivi médical');
        }
        
        if (content.length < 100) {
            suggestions.push('Développer davantage le contenu');
        }
        
        return suggestions;
    }

    static getReportTypeLabel(type) {
        const labels = {
            consultation: 'Rapport de Consultation',
            examination: 'Rapport d\'Examen',
            surgery: 'Rapport Chirurgical',
            discharge: 'Rapport de Sortie',
            follow_up: 'Rapport de Suivi',
            emergency: 'Rapport d\'Urgence',
            ai_analysis: 'Analyse IA',
            other: 'Autre Rapport'
        };
        return labels[type] || 'Rapport Médical';
    }

    static exportReport(reportId, format = 'pdf') {
        const report = window.app.data.reports.find(r => r.id === reportId);
        if (!report) {
            window.app.showToast('Rapport non trouvé', 'error');
            return;
        }

        // Simulation d'export
        const exportData = {
            ...report,
            exportDate: new Date().toISOString(),
            format: format,
            hospital: 'Hôpital EL GHASSANI',
            generatedBy: window.app.currentUser?.firstName + ' ' + window.app.currentUser?.lastName
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
            type: format === 'pdf' ? 'application/pdf' : 'application/json' 
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rapport-${report.id}-${format}.${format === 'pdf' ? 'pdf' : 'json'}`;
        a.click();
        URL.revokeObjectURL(url);

        window.app.showToast(`Rapport exporté en ${format.toUpperCase()}`, 'success');
    }
}

// Fonctions globales pour les rapports
function generateAIReport() {
    if (window.app && window.app.currentUser) {
        window.app.showToast('Génération de rapport IA en cours...', 'warning');
        
        setTimeout(() => {
            // Sélectionner un patient aléatoire pour la démo
            const randomPatient = window.app.data.patients[Math.floor(Math.random() * window.app.data.patients.length)];
            const result = IntelligentReports.generateAIReport(randomPatient.id);
            
            if (result.success) {
                window.app.data.reports.push(result.report);
                window.app.loadReports();
                window.app.showToast('Rapport IA généré avec succès', 'success');
            } else {
                window.app.showToast(result.error, 'error');
            }
        }, 2000);
    }
}

function showCreateReportModal() {
    window.app.showToast('Modal de création de rapport en développement', 'info');
}

function exportReportPDF(reportId) {
    IntelligentReports.exportReport(reportId, 'pdf');
}

function exportReportJSON(reportId) {
    IntelligentReports.exportReport(reportId, 'json');
}

// Fonctions pour la création de rapports intelligents
function showCreateReportModal() {
    const modal = new bootstrap.Modal(document.getElementById('createReportModal'));
    
    // Charger les patients dans le select
    populatePatientSelect('reportPatient');
    
    // Définir la date par défaut
    document.getElementById('reportDate').value = new Date().toISOString().split('T')[0];
    
    // Réinitialiser le formulaire
    document.getElementById('reportForm').reset();
    document.getElementById('reportDate').value = new Date().toISOString().split('T')[0];
    
    // Masquer les panneaux IA
    document.getElementById('patientInfoCard').classList.add('d-none');
    document.getElementById('reportPreview').classList.add('d-none');
    
    modal.show();
}

function populatePatientSelect(selectId) {
    const select = document.getElementById(selectId);
    if (!select || !window.app) return;
    
    select.innerHTML = '<option value="">Sélectionner un patient</option>';
    
    window.app.data.patients.forEach(patient => {
        const option = document.createElement('option');
        option.value = patient.id;
        option.textContent = `${patient.firstName} ${patient.lastName} (${patient.patientId})`;
        select.appendChild(option);
    });
}

function loadPatientInfo() {
    const patientId = parseInt(document.getElementById('reportPatient').value);
    const patient = window.app.data.patients.find(p => p.id === patientId);
    
    if (patient) {
        const patientCard = document.getElementById('patientInfoCard');
        patientCard.innerHTML = `
            <div class="patient-info-header">
                <div class="patient-avatar">${patient.firstName[0]}${patient.lastName[0]}</div>
                <div class="patient-details">
                    <div class="patient-name">${patient.firstName} ${patient.lastName}</div>
                    <div class="patient-meta">
                        ${patient.age} ans • ${patient.gender === 'male' ? 'Homme' : 'Femme'} • ${patient.patientId}
                    </div>
                </div>
            </div>
            <div class="patient-stats">
                <small class="text-muted">
                    <i class="fas fa-file-medical me-1"></i>${patient.documentsCount} documents •
                    <i class="fas fa-calendar me-1"></i>Dernière visite: ${window.app.formatDate(patient.lastVisit)}
                </small>
            </div>
        `;
        patientCard.classList.remove('d-none');
        
        // Pré-remplir le titre du rapport
        const reportType = document.getElementById('reportType').value;
        if (reportType) {
            updateReportTitle(reportType, patient);
        }
    } else {
        document.getElementById('patientInfoCard').classList.add('d-none');
    }
}

function updateReportTemplate() {
    const reportType = document.getElementById('reportType').value;
    const patientId = parseInt(document.getElementById('reportPatient').value);
    const patient = window.app.data.patients.find(p => p.id === patientId);
    
    if (reportType && patient) {
        updateReportTitle(reportType, patient);
        loadReportTemplate(reportType);
    }
}

function updateReportTitle(reportType, patient) {
    const titles = {
        consultation: `Rapport de Consultation - ${patient.firstName} ${patient.lastName}`,
        examination: `Examen Médical - ${patient.firstName} ${patient.lastName}`,
        surgery: `Rapport Chirurgical - ${patient.firstName} ${patient.lastName}`,
        discharge: `Rapport de Sortie - ${patient.firstName} ${patient.lastName}`,
        follow_up: `Suivi Médical - ${patient.firstName} ${patient.lastName}`,
        emergency: `Rapport d'Urgence - ${patient.firstName} ${patient.lastName}`,
        ai_analysis: `Analyse IA - ${patient.firstName} ${patient.lastName}`
    };
    
    document.getElementById('reportTitle').value = titles[reportType] || `Rapport - ${patient.firstName} ${patient.lastName}`;
}

function loadReportTemplate(type) {
    const templates = {
        consultation: {
            summary: 'Consultation du patient pour [motif]. Examen clinique révèle [résultats].',
            diagnosis: 'Diagnostic: [diagnostic principal]',
            treatment: 'Plan de traitement: [traitement recommandé]',
            notes: 'Observations: [notes particulières]'
        },
        examination: {
            summary: 'Examen médical complet du patient. Paramètres vitaux stables.',
            diagnosis: 'Résultats d\'examen: [résultats détaillés]',
            treatment: 'Recommandations: [recommandations médicales]',
            notes: 'Suivi recommandé: [plan de suivi]'
        },
        emergency: {
            summary: 'Prise en charge d\'urgence pour [motif urgent]. État stabilisé.',
            diagnosis: 'Diagnostic d\'urgence: [diagnostic]',
            treatment: 'Traitement d\'urgence: [actions réalisées]',
            notes: 'Évolution: [état du patient après traitement]'
        }
    };
    
    const template = templates[type];
    if (template) {
        if (!document.getElementById('reportSummary').value) {
            document.getElementById('reportSummary').value = template.summary;
        }
        if (!document.getElementById('reportDiagnosis').value) {
            document.getElementById('reportDiagnosis').value = template.diagnosis;
        }
        if (!document.getElementById('reportTreatment').value) {
            document.getElementById('reportTreatment').value = template.treatment;
        }
        if (!document.getElementById('reportNotes').value) {
            document.getElementById('reportNotes').value = template.notes;
        }
    }
}

function analyzeReportContent() {
    const summary = document.getElementById('reportSummary').value;
    const diagnosis = document.getElementById('reportDiagnosis').value;
    const treatment = document.getElementById('reportTreatment').value;
    
    if (!summary.trim()) {
        window.app.showToast('Veuillez saisir un résumé pour l\'analyse IA', 'warning');
        return;
    }
    
    // Afficher l'indicateur de traitement
    const aiPanel = document.getElementById('aiSuggestionsPanel');
    aiPanel.innerHTML = `
        <div class="ai-processing">
            <i class="fas fa-robot fa-spin"></i>
            <div>
                <strong>Analyse IA en cours...</strong>
                <div class="text-muted">Traitement du contenu médical</div>
            </div>
        </div>
    `;
    
    // Simulation d'analyse IA
    setTimeout(() => {
        const analysis = IntelligentReports.analyzeReportContent(summary + ' ' + diagnosis + ' ' + treatment);
        displayAIAnalysis(analysis);
    }, 2000);
}

function displayAIAnalysis(analysis) {
    const aiPanel = document.getElementById('aiSuggestionsPanel');
    aiPanel.innerHTML = `
        <div class="ai-completed mb-3">
            <i class="fas fa-check-circle me-2"></i>
            <strong>Analyse IA terminée</strong>
        </div>
        
        <div class="mb-3">
            <h6><i class="fas fa-chart-bar me-2"></i>Analyse du Contenu</h6>
            <div class="row text-center">
                <div class="col-4">
                    <div class="analysis-metric">
                        <div class="metric-value">${analysis.wordCount}</div>
                        <div class="metric-label">Mots</div>
                    </div>
                </div>
                <div class="col-4">
                    <div class="analysis-metric">
                        <div class="metric-value">${analysis.completeness}%</div>
                        <div class="metric-label">Complétude</div>
                    </div>
                </div>
                <div class="col-4">
                    <div class="analysis-metric">
                        <div class="metric-value">${analysis.medicalTerms.length}</div>
                        <div class="metric-label">Termes</div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="mb-3">
            <h6><i class="fas fa-lightbulb me-2"></i>Suggestions IA</h6>
            ${analysis.suggestions.map(suggestion => `
                <div class="ai-suggestion-item" onclick="applySuggestion('${suggestion}')">
                    <div class="suggestion-type text-warning">SUGGESTION</div>
                    <div class="suggestion-text">${suggestion}</div>
                    <div class="suggestion-confidence">
                        <span class="confidence-indicator confidence-high">
                            <i class="fas fa-check me-1"></i>Confiance élevée
                        </span>
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div class="mb-3">
            <h6><i class="fas fa-tags me-2"></i>Termes Médicaux Détectés</h6>
            <div class="d-flex flex-wrap gap-1">
                ${analysis.medicalTerms.map(term => `
                    <span class="badge bg-info">${term}</span>
                `).join('')}
            </div>
        </div>
    `;
}

function generateAISuggestions() {
    const reportType = document.getElementById('reportType').value;
    const summary = document.getElementById('reportSummary').value;
    
    if (!reportType || !summary.trim()) {
        window.app.showToast('Veuillez sélectionner un type de rapport et saisir un résumé', 'warning');
        return;
    }
    
    // Générer des suggestions IA selon le type
    const suggestions = generateIntelligentSuggestions(reportType, summary);
    displayAISuggestions(suggestions);
}

function generateIntelligentSuggestions(type, content) {
    const baseSuggestions = {
        consultation: [
            {
                text: 'Ajouter les signes vitaux du patient',
                type: 'vital_signs',
                confidence: 95,
                active: false
            },
            {
                text: 'Préciser la posologie des médicaments prescrits',
                type: 'medication_dosage',
                confidence: 88,
                active: false
            },
            {
                text: 'Inclure les antécédents médicaux pertinents',
                type: 'medical_history',
                confidence: 92,
                active: true
            },
            {
                text: 'Mentionner les examens complémentaires nécessaires',
                type: 'complementary_exams',
                confidence: 85,
                active: false
            },
            {
                text: 'Ajouter les conseils de suivi pour le patient',
                type: 'follow_up_advice',
                confidence: 90,
                active: false
            }
        ],
        examination: [
            {
                text: 'Détailler les résultats d\'examen',
                type: 'exam_results',
                confidence: 95,
                active: false
            },
            {
                text: 'Comparer aux examens précédents',
                type: 'comparison',
                confidence: 88,
                active: false
            },
            {
                text: 'Ajouter les recommandations spécifiques',
                type: 'recommendations',
                confidence: 92,
                active: true
            },
            {
                text: 'Inclure les facteurs de risque',
                type: 'risk_factors',
                confidence: 85,
                active: false
            },
            {
                text: 'Programmer les examens complémentaires',
                type: 'follow_up_exams',
                confidence: 90,
                active: false
            }
        ],
        emergency: [
            'Documenter l\'état d\'urgence initial',
            'Décrire les interventions d\'urgence',
            'Noter les paramètres vitaux critiques',
            'Mentionner les traitements administrés',
            'Planifier la surveillance post-urgence'
        ]
    };
    
    const suggestions = baseSuggestions[type] || baseSuggestions.consultation;
    
    // Analyser le contenu pour des suggestions personnalisées
    const customSuggestions = [];
    
    if (!content.toLowerCase().includes('paramètres')) {
        customSuggestions.push('Ajouter les paramètres vitaux (tension, pouls, température)');
    }
    
    if (!content.toLowerCase().includes('traitement')) {
        customSuggestions.push('Spécifier le plan de traitement recommandé');
    }
    
    if (!content.toLowerCase().includes('suivi')) {
        customSuggestions.push('Planifier le prochain rendez-vous de suivi');
    }
    
    return [...suggestions.slice(0, 3), ...customSuggestions.slice(0, 2)];
}

function displayAISuggestions(suggestions) {
    const aiPanel = document.getElementById('aiSuggestionsPanel');
    
    // Vérifier si suggestions est un tableau de strings ou d'objets
    const isObjectArray = suggestions.length > 0 && typeof suggestions[0] === 'object';
    
    aiPanel.innerHTML = `
        <div class="mb-3">
            <h6><i class="fas fa-robot me-2"></i>Suggestions IA</h6>
            ${suggestions.map((suggestion, index) => {
                const suggestionText = isObjectArray ? suggestion.text : suggestion;
                const isActive = isObjectArray && suggestion.active;
                const confidence = isObjectArray ? suggestion.confidence : 85;
                
                return `
                    <div class="ai-suggestion-item ${isActive ? 'active' : ''}" onclick="applySuggestion('${suggestionText}')">
                        <div class="suggestion-icon">
                            <i class="fas fa-lightbulb"></i>
                        </div>
                        <div class="suggestion-content">
                            <div class="suggestion-text">${suggestionText}</div>
                            <div class="suggestion-confidence">
                                <span class="confidence-indicator confidence-${confidence >= 90 ? 'high' : confidence >= 80 ? 'medium' : 'low'}">
                                    ${confidence}% confiance
                                </span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
        
        <div class="text-center mt-3">
            <button class="btn btn-sm btn-outline-warning" onclick="generateMoreSuggestions()">
                <i class="fas fa-plus me-2"></i>Plus de suggestions
            </button>
        </div>
    `;
}

function applySuggestion(suggestion) {
    // Ajouter la suggestion aux notes
    const notesField = document.getElementById('reportNotes');
    const currentNotes = notesField.value;
    const newNotes = currentNotes ? `${currentNotes}\n• ${suggestion}` : `• ${suggestion}`;
    notesField.value = newNotes;
    
    window.app.showToast('Suggestion appliquée aux notes', 'success');
}

function generateMoreSuggestions() {
    const moreSuggestions = [
        'Vérifier les allergies connues du patient',
        'Documenter l\'observance thérapeutique',
        'Évaluer la qualité de vie du patient',
        'Considérer les interactions médicamenteuses',
        'Planifier l\'éducation thérapeutique'
    ];
    
    displayAISuggestions(moreSuggestions);
}

function generateReportPreview() {
    const formData = getReportFormData();
    
    if (!formData.title || !formData.summary) {
        window.app.showToast('Veuillez remplir au moins le titre et le résumé', 'warning');
        return;
    }
    
    const patient = window.app.data.patients.find(p => p.id === parseInt(formData.patientId));
    
    const previewHTML = `
        <div class="preview-section">
            <div class="preview-label">Titre</div>
            <div>${formData.title}</div>
        </div>
        
        <div class="preview-section">
            <div class="preview-label">Patient</div>
            <div>${patient ? `${patient.firstName} ${patient.lastName} (${patient.patientId})` : 'Non sélectionné'}</div>
        </div>
        
        <div class="preview-section">
            <div class="preview-label">Type</div>
            <div>${IntelligentReports.getReportTypeLabel(formData.type)}</div>
        </div>
        
        <div class="preview-section">
            <div class="preview-label">Date</div>
            <div>${window.app.formatDate(formData.date)}</div>
        </div>
        
        <div class="preview-section">
            <div class="preview-label">Résumé</div>
            <div>${formData.summary}</div>
        </div>
        
        ${formData.diagnosis ? `
        <div class="preview-section">
            <div class="preview-label">Diagnostic</div>
            <div>${formData.diagnosis}</div>
        </div>
        ` : ''}
        
        ${formData.treatment ? `
        <div class="preview-section">
            <div class="preview-label">Traitement</div>
            <div>${formData.treatment}</div>
        </div>
        ` : ''}
        
        ${formData.notes ? `
        <div class="preview-section">
            <div class="preview-label">Notes</div>
            <div>${formData.notes}</div>
        </div>
        ` : ''}
    `;
    
    document.getElementById('previewContent').innerHTML = previewHTML;
    document.getElementById('reportPreview').classList.remove('d-none');
}

function getReportFormData() {
    return {
        title: document.getElementById('reportTitle').value,
        type: document.getElementById('reportType').value,
        patientId: document.getElementById('reportPatient').value,
        date: document.getElementById('reportDate').value,
        summary: document.getElementById('reportSummary').value,
        diagnosis: document.getElementById('reportDiagnosis').value,
        treatment: document.getElementById('reportTreatment').value,
        notes: document.getElementById('reportNotes').value,
        priority: document.getElementById('reportPriority').value,
        confidentiality: document.getElementById('reportConfidentiality').value,
        status: document.getElementById('reportStatus').value,
        aiEnabled: document.getElementById('enableAIAnalysis').checked
    };
}

function createIntelligentReport() {
    const formData = getReportFormData();
    
    // Validation
    if (!formData.title || !formData.type || !formData.patientId || !formData.summary) {
        window.app.showToast('Veuillez remplir tous les champs requis', 'error');
        return;
    }
    
    // Créer le rapport
    const patient = window.app.data.patients.find(p => p.id === parseInt(formData.patientId));
    
    const newReport = {
        id: Date.now(),
        title: formData.title,
        type: formData.type,
        patientId: parseInt(formData.patientId),
        patientName: `${patient.firstName} ${patient.lastName}`,
        date: formData.date,
        status: formData.status,
        summary: formData.summary,
        content: {
            diagnosis: formData.diagnosis,
            treatment: formData.treatment,
            notes: formData.notes
        },
        metadata: {
            priority: formData.priority,
            confidentiality: formData.confidentiality,
            aiEnabled: formData.aiEnabled
        },
        aiInsights: formData.aiEnabled,
        createdBy: window.app.currentUser.id,
        createdAt: new Date().toISOString()
    };
    
    // Ajouter le rapport aux données
    window.app.data.reports.push(newReport);
    
    // Fermer la modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('createReportModal'));
    modal.hide();
    
    // Recharger la liste des rapports
    window.app.loadReports();
    
    // Notification de succès
    window.app.showToast('Rapport intelligent créé avec succès !', 'success');
    
    // Si IA activée, traiter le rapport
    if (formData.aiEnabled) {
        setTimeout(() => {
            processReportWithAI(newReport.id);
        }, 1000);
    }
}

function saveReportAsDraft() {
    const formData = getReportFormData();
    formData.status = 'draft';
    
    if (!formData.title || !formData.patientId) {
        window.app.showToast('Titre et patient requis pour sauvegarder', 'error');
        return;
    }
    
    // Créer le brouillon
    const patient = window.app.data.patients.find(p => p.id === parseInt(formData.patientId));
    
    const draftReport = {
        id: Date.now(),
        title: formData.title + ' (Brouillon)',
        type: formData.type || 'consultation',
        patientId: parseInt(formData.patientId),
        patientName: `${patient.firstName} ${patient.lastName}`,
        date: formData.date || new Date().toISOString().split('T')[0],
        status: 'draft',
        summary: formData.summary,
        content: {
            diagnosis: formData.diagnosis,
            treatment: formData.treatment,
            notes: formData.notes
        },
        aiInsights: false,
        createdBy: window.app.currentUser.id,
        createdAt: new Date().toISOString()
    };
    
    window.app.data.reports.push(draftReport);
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('createReportModal'));
    modal.hide();
    
    window.app.loadReports();
    window.app.showToast('Brouillon sauvegardé avec succès', 'success');
}

function processReportWithAI(reportId) {
    const report = window.app.data.reports.find(r => r.id === reportId);
    if (!report) return;
    
    window.app.showToast('Traitement IA du rapport en cours...', 'warning');
    
    setTimeout(() => {
        // Simulation du traitement IA
        const aiEnhancements = {
            keywordAnalysis: IntelligentReports.extractMedicalTerms(report.summary),
            sentimentAnalysis: IntelligentReports.analyzeSentiment(report.summary),
            completenessScore: IntelligentReports.assessCompleteness(report.summary),
            recommendations: IntelligentReports.generateContentSuggestions(report.summary),
            qualityScore: Math.floor(Math.random() * 20) + 80
        };
        
        report.aiResults = aiEnhancements;
        report.aiInsights = true;
        
        window.app.showToast('Rapport enrichi par l\'IA avec succès !', 'success');
        window.app.loadReports();
    }, 2000);
}

// Nouvelles fonctions pour les rapports intelligents améliorés
function showAIAnalyticsModal() {
    window.app.showToast('Ouverture des analytics IA...', 'info');
    
    // Simulation d'ouverture d'une modal d'analytics
    setTimeout(() => {
        const analyticsData = {
            totalReports: window.app.data.reports.length,
            aiEnhancedReports: window.app.data.reports.filter(r => r.aiInsights).length,
            averageAccuracy: 94.2,
            processingTime: 2.3,
            insightsGenerated: 156,
            trends: {
                consultation: 45,
                examination: 32,
                surgery: 15,
                emergency: 8
            }
        };
        
        window.app.showToast(`Analytics: ${analyticsData.aiEnhancedReports} rapports IA sur ${analyticsData.totalReports}`, 'success');
    }, 1000);
}

function showReportTemplates() {
    window.app.showToast('Affichage des templates de rapports...', 'info');
    
    // Simulation d'affichage des templates
    setTimeout(() => {
        const templates = [
            'Template Consultation Standard',
            'Template Examen Médical',
            'Template Rapport Chirurgical',
            'Template Urgence',
            'Template Suivi Patient'
        ];
        
        window.app.showToast(`${templates.length} templates disponibles`, 'success');
    }, 1000);
}

function useReportTemplate(templateType) {
    window.app.showToast(`Utilisation du template ${templateType}...`, 'info');
    
    // Définir les templates selon le type
    const templates = {
        consultation: {
            title: 'RAPPORT DE CONSULTATION',
            type: 'consultation',
            summary: 'Rapport de consultation médicale standard',
            content: `RAPPORT DE CONSULTATION

Date: ${new Date().toLocaleDateString('fr-FR')}
Patient: [PATIENT]
Médecin: ${window.app.currentUser?.firstName + ' ' + window.app.currentUser?.lastName || 'Utilisateur Test'}

MOTIF DE CONSULTATION:
[Décrire le motif de la consultation]

ANAMNÈSE:
[Histoire de la maladie actuelle]

EXAMEN CLINIQUE:
- État général:
- Signes vitaux: TA: ___ mmHg, FC: ___ bpm, Temp: ___°C
- Examen physique:

DIAGNOSTIC:
[Diagnostic principal et différentiels]

TRAITEMENT:
[Prescription et recommandations]

SUIVI:
[Rendez-vous de contrôle]`
        },
        laboratoire: {
            title: 'RAPPORT DE LABORATOIRE',
            type: 'laboratory',
            summary: 'Rapport de résultats de laboratoire',
            content: `RAPPORT DE LABORATOIRE

Date: ${new Date().toLocaleDateString('fr-FR')}
Patient: [PATIENT]
Prescripteur: ${window.app.currentUser?.firstName + ' ' + window.app.currentUser?.lastName || 'Utilisateur Test'}

ANALYSES DEMANDÉES:
[Liste des analyses]

RÉSULTATS:
- Hémogramme:
• Globules rouges:
• Globules blancs:
• Plaquettes:
• Hémoglobine:

- Biochimie:
• Glycémie:
• Créatinine:
• Urée:

INTERPRÉTATION:
[Commentaires du biologiste]

CONCLUSION:
[Synthèse des résultats]`
        },
        radiologie: {
            title: 'RAPPORT RADIOLOGIQUE',
            type: 'radiology',
            summary: 'Rapport d\'examen radiologique',
            content: `RAPPORT RADIOLOGIQUE

Date: ${new Date().toLocaleDateString('fr-FR')}
Patient: [PATIENT]
Radiologue: ${window.app.currentUser?.firstName + ' ' + window.app.currentUser?.lastName || 'Utilisateur Test'}

EXAMEN DEMANDÉ:
[Type d'examen radiologique]

TECHNIQUE:
[Description de la technique utilisée]

RÉSULTATS:
[Description détaillée des images]

CONCLUSION:
[Diagnostic radiologique]

RECOMMANDATIONS:
[Examens complémentaires si nécessaire]`
        }
    };
    
    const template = templates[templateType];
    if (!template) {
        window.app.showToast('Template non trouvé', 'error');
        return;
    }
    
    // Remplir automatiquement le formulaire avec le template
    fillReportWithTemplate(template);
    
    window.app.showToast(`Template "${template.title}" appliqué`, 'success');
}

function fillReportWithTemplate(template) {
    // Remplir le formulaire avec le template
    const titleField = document.getElementById('reportTitle');
    const typeField = document.getElementById('reportType');
    const summaryField = document.getElementById('reportSummary');
    const contentField = document.getElementById('reportContent');
    
    if (titleField) titleField.value = template.title;
    if (typeField) typeField.value = template.type;
    
    // Mettre le contenu complet du template dans le résumé médical
    if (summaryField) {
        summaryField.value = template.content;
    }
    
    if (contentField) {
        contentField.value = template.content;
    }
    
    // Définir la date d'aujourd'hui
    const dateField = document.getElementById('reportDate');
    if (dateField) {
        dateField.value = new Date().toISOString().split('T')[0];
    }
    
    window.app.showToast(`Template "${template.title}" appliqué au formulaire`, 'success');
}

function createReportFromTemplate(template) {
    // Créer un nouveau rapport avec le template
    const newReport = {
        id: Date.now(),
        title: template.title,
        type: template.type,
        summary: `Rapport médical créé avec le template ${template.type}`,
        content: template.content,
        patient: '[PATIENT]',
        doctor: window.app.currentUser?.firstName + ' ' + window.app.currentUser?.lastName || 'Utilisateur Test',
        date: new Date().toISOString().split('T')[0],
        status: 'draft',
        priority: 'normal',
        aiInsights: null,
        createdAt: new Date().toISOString()
    };
    
    // Ajouter à la liste des rapports
    window.app.data.reports.push(newReport);
    
    // Sauvegarder
    localStorage.setItem('medicalDigitizationData', JSON.stringify(window.app.data));
    
    // Recharger la liste
    window.app.loadReports();
    
    window.app.showToast(`Rapport "${template.title}" créé avec succès !`, 'success');
}

function generateTrendAnalysis() {
    window.app.showToast('Génération de l\'analyse de tendance...', 'warning');
    
    setTimeout(() => {
        const trends = {
            consultations: '+12%',
            examinations: '+8%',
            surgeries: '+5%',
            emergencies: '+15%'
        };
        
        window.app.showToast('Analyse de tendance générée avec succès', 'success');
    }, 2000);
}

function generatePatientSummary() {
    window.app.showToast('Génération du résumé patient...', 'warning');
    
    setTimeout(() => {
        window.app.showToast('Résumé patient généré avec succès', 'success');
    }, 2000);
}

function generateRiskAssessment() {
    window.app.showToast('Génération de l\'évaluation des risques...', 'warning');
    
    setTimeout(() => {
        window.app.showToast('Évaluation des risques générée avec succès', 'success');
    }, 2000);
}

function generateComplianceReport() {
    window.app.showToast('Génération du rapport de conformité...', 'warning');
    
    setTimeout(() => {
        window.app.showToast('Rapport de conformité généré avec succès', 'success');
    }, 2000);
}

function generateEmergencyReport() {
    window.app.showToast('Génération du rapport d\'urgences...', 'warning');
    
    setTimeout(() => {
        window.app.showToast('Rapport d\'urgences généré avec succès', 'success');
    }, 2000);
}

function generateCustomReport() {
    window.app.showToast('Ouverture du générateur de rapport personnalisé...', 'info');
    
    setTimeout(() => {
        window.app.showToast('Générateur de rapport personnalisé ouvert', 'success');
    }, 1000);
}

function performAISearch() {
    const searchTerm = document.getElementById('aiSearchInput').value;
    if (!searchTerm.trim()) {
        window.app.showToast('Veuillez saisir un terme de recherche', 'warning');
        return;
    }
    
    window.app.showToast(`Recherche IA: "${searchTerm}"`, 'info');
    
    setTimeout(() => {
        const results = Math.floor(Math.random() * 10) + 1;
        window.app.showToast(`${results} résultats trouvés pour "${searchTerm}"`, 'success');
    }, 1500);
}

function applyReportFilters() {
    const type = document.getElementById('reportTypeFilter').value;
    const status = document.getElementById('reportStatusFilter').value;
    const period = document.getElementById('reportPeriodFilter').value;
    const patient = document.getElementById('reportPatientFilter').value;
    
    window.app.showToast('Filtres appliqués', 'success');
    window.app.loadReports();
}

function clearReportFilters() {
    document.getElementById('aiSearchInput').value = '';
    document.getElementById('reportTypeFilter').value = '';
    document.getElementById('reportStatusFilter').value = '';
    document.getElementById('reportPeriodFilter').value = '';
    document.getElementById('reportPatientFilter').value = '';
    
    window.app.showToast('Filtres effacés', 'info');
    window.app.loadReports();
}

function exportFilteredReports() {
    window.app.showToast('Export des rapports filtrés...', 'warning');
    
    setTimeout(() => {
        window.app.showToast('Rapports exportés avec succès', 'success');
    }, 2000);
}

function generateReportSummary() {
    window.app.showToast('Génération du résumé des rapports...', 'warning');
    
    setTimeout(() => {
        window.app.showToast('Résumé des rapports généré avec succès', 'success');
    }, 2000);
}

function bulkAIAnalysis() {
    window.app.showToast('Analyse IA en lot en cours...', 'warning');
    
    setTimeout(() => {
        window.app.showToast('Analyse IA en lot terminée', 'success');
    }, 3000);
}

// Fonctions pour les documents améliorés
function showDocumentAnalytics() {
    window.app.showToast('Ouverture des analytics documents...', 'info');
    
    setTimeout(() => {
        const analyticsData = {
            totalDocuments: window.app.data.documents.length,
            processedDocuments: window.app.data.documents.filter(d => d.status === 'processed').length,
            pendingDocuments: window.app.data.documents.filter(d => d.status === 'pending_review').length,
            averageProcessingTime: 1.8
        };
        
        window.app.showToast(`Analytics: ${analyticsData.processedDocuments} documents traités sur ${analyticsData.totalDocuments}`, 'success');
    }, 1000);
}

function bulkProcessDocuments() {
    window.app.showToast('Traitement IA en lot des documents...', 'warning');
    
    setTimeout(() => {
        window.app.showToast('Traitement IA en lot terminé', 'success');
        window.app.loadDocuments();
    }, 3000);
}

function showDocumentTemplates() {
    window.app.showToast('Affichage des templates de documents...', 'info');
    
    setTimeout(() => {
        const templates = [
            'Template Dossier Médical',
            'Template Ordonnance',
            'Template Résultats Labo',
            'Template Radiographie',
            'Template Certificat'
        ];
        
        window.app.showToast(`${templates.length} templates de documents disponibles`, 'success');
    }, 1000);
}

// Mise à jour des statistiques IA
function updateAIStats() {
    const aiReports = window.app.data.reports.filter(r => r.aiInsights).length;
    const totalReports = window.app.data.reports.length;
    const accuracy = totalReports > 0 ? Math.round((aiReports / totalReports) * 100) : 94;
    const insights = aiReports * 12; // Simulation
    const processingTime = (Math.random() * 2 + 1.5).toFixed(1);
    
    // Animation des nombres
    animateNumber('aiReportsCount', aiReports);
    animateNumber('aiAccuracy', accuracy + '%');
    animateNumber('insightsGenerated', insights);
    document.getElementById('avgProcessingTime').textContent = processingTime + 's';
}

function animateNumber(elementId, targetValue) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    element.classList.add('animate');
    element.textContent = targetValue;
    
    setTimeout(() => {
        element.classList.remove('animate');
    }, 800);
}

// Export global
window.IntelligentReports = IntelligentReports;
