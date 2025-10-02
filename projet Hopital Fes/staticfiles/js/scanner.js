// Système de Scanner Intelligent
class IntelligentScanner {
    constructor() {
        this.isScanning = false;
        this.currentStream = null;
        this.scannedDocuments = [];
    }

    async startCamera() {
        try {
            this.currentStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                    facingMode: 'environment'
                }
            });

            const scanPreview = document.getElementById('scanPreview');
            if (scanPreview) {
                scanPreview.innerHTML = `
                    <div class="camera-container position-relative">
                        <video id="cameraVideo" autoplay playsinline style="width: 100%; height: 100%; object-fit: cover; border-radius: 16px;"></video>
                        <div class="scan-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
                            <div class="scan-frame border border-primary border-3 rounded" style="width: 300px; height: 400px; background: transparent;"></div>
                        </div>
                        <div class="scan-controls position-absolute bottom-0 start-0 w-100 p-3 bg-dark bg-opacity-75 rounded-bottom">
                            <div class="text-center">
                                <p class="text-white mb-3">Placez le document dans le cadre</p>
                                <div class="btn-group">
                                    <button class="btn btn-success me-2" onclick="scanner.captureDocument()">
                                        <i class="fas fa-camera me-2"></i>Capturer
                                    </button>
                                    <button class="btn btn-secondary" onclick="scanner.stopCamera(); scanner.loadScanner();">
                                        <i class="fas fa-times me-2"></i>Annuler
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                const video = document.getElementById('cameraVideo');
                video.srcObject = this.currentStream;
            }

            if (window.app && window.app.showToast) {
                window.app.showToast('Caméra démarrée avec succès', 'success');
            }
        } catch (error) {
            console.error('Erreur d\'accès à la caméra:', error);
            
            // Fallback vers la simulation
            console.log('Fallback vers la simulation de caméra...');
            startScanning();
            
            if (window.app && window.app.showToast) {
                window.app.showToast('Caméra non disponible - Mode simulation activé', 'warning');
            }
        }
    }

    stopCamera() {
        if (this.currentStream) {
            this.currentStream.getTracks().forEach(track => track.stop());
            this.currentStream = null;
        }
    }

    async captureDocument() {
        if (!this.currentStream) {
            window.app.showToast('Aucune caméra active', 'error');
            return;
        }

        try {
            const video = document.getElementById('cameraVideo');
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0);

            // Convertir en blob
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
            
            // Créer l'aperçu
            const imageUrl = URL.createObjectURL(blob);
            this.showCapturedDocument(imageUrl, blob);

            window.app.showToast('Document capturé avec succès', 'success');
        } catch (error) {
            console.error('Erreur de capture:', error);
            window.app.showToast('Erreur lors de la capture', 'error');
        }
    }

    showCapturedDocument(imageUrl, blob) {
        const scanPreview = document.getElementById('scanPreview');
        if (scanPreview) {
            scanPreview.innerHTML = `
                <div class="captured-document">
                    <img src="${imageUrl}" alt="Document capturé" style="max-width: 100%; max-height: 100%; border-radius: 16px;">
                    <div class="capture-actions mt-3">
                        <button class="btn btn-success me-2" onclick="scanner.processWithAI('${imageUrl}')">
                            <i class="fas fa-robot me-2"></i>Traiter avec IA
                        </button>
                        <button class="btn btn-warning me-2" onclick="scanner.enhanceImage('${imageUrl}')">
                            <i class="fas fa-magic me-2"></i>Améliorer
                        </button>
                        <button class="btn btn-primary me-2" onclick="scanner.saveDocument('${imageUrl}')">
                            <i class="fas fa-save me-2"></i>Sauvegarder
                        </button>
                        <button class="btn btn-secondary" onclick="scanner.retakePhoto()">
                            <i class="fas fa-redo me-2"></i>Reprendre
                        </button>
                    </div>
                </div>
            `;
        }
    }

    async uploadFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*,application/pdf,.doc,.docx';
        input.multiple = true;

        input.onchange = async (e) => {
            const files = Array.from(e.target.files);
            
            for (const file of files) {
                await this.processUploadedFile(file);
            }
        };

        input.click();
    }

    async processUploadedFile(file) {
        try {
            const fileUrl = URL.createObjectURL(file);
            
            // Stocker l'image pour le modal
            window.currentScannedImage = fileUrl;
            
            // Afficher l'aperçu
            const scanPreview = document.getElementById('scanPreview');
            if (scanPreview) {
                scanPreview.innerHTML = `
                    <div class="uploaded-document">
                        <div class="file-info">
                            <i class="fas fa-file-upload fa-3x text-primary mb-3"></i>
                            <h5>${file.name}</h5>
                            <p class="text-muted">Taille: ${(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                            <p class="text-muted">Type: ${file.type}</p>
                        </div>
                        <div class="upload-actions mt-4">
                            <button class="btn btn-success me-2" onclick="scanner.processWithAI('${fileUrl}', '${file.name}')">
                                <i class="fas fa-robot me-2"></i>Traiter avec IA
                            </button>
                            <button class="btn btn-primary me-2" onclick="scanner.saveDocument('${fileUrl}', '${file.name}')">
                                <i class="fas fa-save me-2"></i>Sauvegarder
                            </button>
                            <button class="btn btn-warning me-2" onclick="showScannerDetailsModal()">
                                <i class="fas fa-edit me-2"></i>Formulaire
                            </button>
                            <button class="btn btn-secondary" onclick="scanner.loadScanner()">
                                <i class="fas fa-times me-2"></i>Annuler
                            </button>
                        </div>
                    </div>
                `;
            }

            window.app.showToast(`Fichier ${file.name} uploadé avec succès`, 'success');
            
            // Ouvrir automatiquement le formulaire après 2 secondes
            setTimeout(() => {
                console.log('Ouverture automatique du formulaire pour le fichier uploadé...');
                showScannerDetailsModal();
            }, 2000);
            
        } catch (error) {
            console.error('Erreur d\'upload:', error);
            window.app.showToast('Erreur lors de l\'upload', 'error');
        }
    }

    async processWithAI(imageUrl, filename = 'document') {
        // Simulation du traitement IA
        window.app.showToast('Traitement IA en cours...', 'info');
        
        setTimeout(() => {
            const aiResults = {
                confidence: Math.floor(Math.random() * 20) + 80,
                documentType: this.classifyDocument(filename),
                extractedText: this.simulateOCR(filename),
                keywords: this.extractKeywords(filename),
                quality: Math.floor(Math.random() * 20) + 80,
                anomalies: this.detectAnomalies(),
                recommendations: this.generateRecommendations()
            };

            this.showAIResults(aiResults, imageUrl, filename);
            window.app.showToast(`Traitement IA terminé (${aiResults.confidence}% de confiance)`, 'success');
        }, 2000);
    }

    classifyDocument(filename) {
        const filename_lower = filename.toLowerCase();
        
        if (filename_lower.includes('radio') || filename_lower.includes('xray')) {
            return { type: 'xray', label: 'Radiographie', confidence: 0.95 };
        }
        
        if (filename_lower.includes('analyse') || filename_lower.includes('lab')) {
            return { type: 'lab_results', label: 'Analyses de Laboratoire', confidence: 0.92 };
        }
        
        if (filename_lower.includes('ordonnance') || filename_lower.includes('prescription')) {
            return { type: 'prescription', label: 'Ordonnance', confidence: 0.88 };
        }
        
        return { type: 'medical_record', label: 'Dossier Médical', confidence: 0.75 };
    }

    simulateOCR(filename) {
        const mockTexts = [
            'HÔPITAL EL GHASSANI - Service de Radiologie\nPatient: [Nom du patient]\nDate: ' + new Date().toLocaleDateString('fr-FR'),
            'LABORATOIRE D\'ANALYSES MÉDICALES\nRésultats des analyses sanguines\nHémoglobine: 14.2 g/dL',
            'ORDONNANCE MÉDICALE\nDr. [Nom du médecin]\nMédicament prescrit: [Nom]',
            'CONSULTATION MÉDICALE\nDate: ' + new Date().toLocaleDateString('fr-FR') + '\nMotif de consultation: [Motif]'
        ];
        
        return mockTexts[Math.floor(Math.random() * mockTexts.length)];
    }

    extractKeywords(filename) {
        const allKeywords = [
            'médical', 'patient', 'hôpital', 'traitement', 'diagnostic',
            'consultation', 'ordonnance', 'analyse', 'radiographie',
            'médicament', 'prescription', 'examen', 'résultat'
        ];
        
        return allKeywords.slice(0, Math.floor(Math.random() * 5) + 3);
    }

    detectAnomalies() {
        const possibleAnomalies = [
            'Document de bonne qualité',
            'Texte clairement lisible',
            'Pas d\'anomalie majeure détectée',
            'Image bien centrée',
            'Luminosité optimale'
        ];
        
        if (Math.random() > 0.8) {
            possibleAnomalies.push('⚠️ Zone légèrement floue détectée');
        }
        
        if (Math.random() > 0.9) {
            possibleAnomalies.push('⚠️ Contraste faible dans certaines zones');
        }
        
        return possibleAnomalies;
    }

    generateRecommendations() {
        return [
            'Vérifier l\'exactitude des informations extraites',
            'Associer au dossier patient correspondant',
            'Valider le classement automatique',
            'Archiver selon les procédures de l\'hôpital'
        ];
    }

    showAIResults(results, imageUrl, filename) {
        const scanPreview = document.getElementById('scanPreview');
        if (scanPreview) {
            scanPreview.innerHTML = `
                <div class="ai-results">
                    <div class="row">
                        <div class="col-md-6">
                            <img src="${imageUrl}" alt="Document traité" style="width: 100%; border-radius: 16px;">
                        </div>
                        <div class="col-md-6">
                            <div class="ai-analysis">
                                <h5><i class="fas fa-robot me-2"></i>Analyse IA</h5>
                                
                                <div class="mb-3">
                                    <strong>Type détecté:</strong>
                                    <span class="badge bg-primary ms-2">${results.documentType.label}</span>
                                    <span class="badge bg-info ms-1">${Math.round(results.documentType.confidence * 100)}%</span>
                                </div>
                                
                                <div class="mb-3">
                                    <strong>Qualité:</strong>
                                    <span class="badge bg-${results.quality >= 90 ? 'success' : results.quality >= 75 ? 'warning' : 'danger'} ms-2">
                                        ${results.quality}%
                                    </span>
                                </div>
                                
                                <div class="mb-3">
                                    <strong>Mots-clés extraits:</strong><br>
                                    ${results.keywords.map(keyword => `<span class="badge bg-secondary me-1">${keyword}</span>`).join('')}
                                </div>
                                
                                <div class="mb-3">
                                    <strong>Texte extrait:</strong>
                                    <div class="extracted-text p-2 bg-light rounded">
                                        ${results.extractedText}
                                    </div>
                                </div>
                                
                                <div class="ai-actions">
                                    <button class="btn btn-success me-2" onclick="scanner.saveProcessedDocument('${imageUrl}', '${filename}', ${JSON.stringify(results).replace(/"/g, '&quot;')})">
                                        <i class="fas fa-save me-2"></i>Sauvegarder
                                    </button>
                                    <button class="btn btn-warning me-2" onclick="scanner.enhanceImage('${imageUrl}')">
                                        <i class="fas fa-magic me-2"></i>Améliorer
                                    </button>
                                    <button class="btn btn-secondary" onclick="scanner.loadScanner()">
                                        <i class="fas fa-redo me-2"></i>Nouveau Scan
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    enhanceImage(imageUrl) {
        window.app.showToast('Amélioration de l\'image en cours...', 'info');
        
        setTimeout(() => {
            // Simulation d'amélioration
            const improvements = [
                'Contraste amélioré (+15%)',
                'Netteté augmentée (+20%)',
                'Bruit réduit (-30%)',
                'Luminosité optimisée'
            ];
            
            window.app.showToast(`Image améliorée: ${improvements.join(', ')}`, 'success');
        }, 1500);
    }

    saveDocument(imageUrl, filename = 'document') {
        // Ouvrir directement le formulaire au lieu de sauvegarder
        window.app.showToast('Ouverture du formulaire...', 'info');
        
        // Stocker l'image pour le formulaire
        window.currentScannedImage = imageUrl;
        
        // Ouvrir le formulaire
        setTimeout(() => {
            showScannerDetailsModal();
        }, 500);
    }

    saveProcessedDocument(imageUrl, filename, results) {
        // Ouvrir le formulaire avec les résultats IA au lieu de sauvegarder automatiquement
        window.app.showToast('Ouverture du formulaire avec analyse IA...', 'info');
        
        // Stocker l'image et les résultats pour le formulaire
        window.currentScannedImage = imageUrl;
        window.currentAIResults = results;
        
        // Ouvrir le formulaire
        setTimeout(() => {
            showScannerDetailsModal();
        }, 500);
    }

    retakePhoto() {
        this.startCamera();
    }

    loadScanner() {
        // Réinitialiser la zone de scanner
        const scanPreview = document.getElementById('scanPreview');
        if (scanPreview) {
            scanPreview.innerHTML = `
                <div class="scan-placeholder">
                    <i class="fas fa-camera fa-4x text-muted mb-3"></i>
                    <h4>Scanner Intelligent</h4>
                    <p class="text-muted">Placez le document ou utilisez la caméra pour numériser</p>
                    <div class="mt-3">
                        <button class="btn btn-primary me-2" onclick="startScanning()">
                            <i class="fas fa-play me-2"></i>Démarrer la Numérisation
                        </button>
                        <button class="btn btn-success" onclick="scanner.uploadFile()">
                            <i class="fas fa-upload me-2"></i>Upload Fichier
                        </button>
                    </div>
                </div>
            `;
        }
        
        this.stopCamera();
        
        // Réinitialiser les données temporaires
        window.currentScannedImage = null;
        window.currentAIResults = null;
    }

    // Traitement en lot
    async startBatchScan() {
        window.app.showToast('Scan en lot démarré - Sélectionnez plusieurs documents', 'info');
        
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.multiple = true;

        input.onchange = async (e) => {
            const files = Array.from(e.target.files);
            window.app.showToast(`Traitement de ${files.length} documents en cours...`, 'warning');
            
            // Traiter chaque fichier et générer un formulaire
            for (let i = 0; i < files.length; i++) {
                setTimeout(() => {
                    this.processBatchFile(files[i], i + 1, files.length);
                    if (i === files.length - 1) {
                        window.app.showToast(`Scan en lot terminé - ${files.length} documents traités`, 'success');
                    }
                }, i * 2000); // 2 secondes entre chaque document
            }
        };

        input.click();
    }

    processBatchFile(file, index, total) {
        // Simuler le traitement du fichier
        window.app.showToast(`Traitement du document ${index}/${total}: ${file.name}`, 'info');
        
        // Créer un objet document simulé
        const documentData = {
            id: Date.now() + index,
            name: file.name,
            size: file.size,
            type: file.type,
            uploadDate: new Date().toISOString(),
            status: 'pending_review'
        };

        // Ajouter à la liste des documents
        if (window.app && window.app.data) {
            window.app.data.documents.push(documentData);
            
            // Sauvegarder
            localStorage.setItem('medicalDigitizationData', JSON.stringify(window.app.data));
        }

        // Générer automatiquement un formulaire pour ce document
        setTimeout(() => {
            this.showBatchDocumentForm(documentData, index, total);
        }, 1000);
    }

    showBatchDocumentForm(documentData, index, total) {
        // Créer un modal pour chaque document du lot
        const modalId = `batchDocumentModal_${documentData.id}`;
        
        // Créer le modal HTML
        const modalHTML = `
            <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title" id="${modalId}Label">
                                <i class="fas fa-file-medical me-2"></i>Document ${index}/${total} - ${documentData.name}
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="batchDocumentForm_${documentData.id}">
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label fw-bold">Titre du Document *</label>
                                            <input type="text" class="form-control" id="batchTitle_${documentData.id}" 
                                                   value="${documentData.name.replace(/\.[^/.]+$/, '')}" required>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label fw-bold">Type de Document *</label>
                                            <select class="form-select" id="batchType_${documentData.id}" required>
                                                <option value="">Sélectionner</option>
                                                <option value="medical_record">Dossier Médical</option>
                                                <option value="prescription">Ordonnance</option>
                                                <option value="lab_results">Résultats Labo</option>
                                                <option value="xray">Radiographie</option>
                                                <option value="certificate">Certificat</option>
                                                <option value="report">Rapport</option>
                                                <option value="other">Autre</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label fw-bold">Patient *</label>
                                            <select class="form-select" id="batchPatient_${documentData.id}" required>
                                                <option value="">Sélectionner un patient</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label fw-bold">Date du Document</label>
                                            <input type="date" class="form-control" id="batchDate_${documentData.id}" 
                                                   value="${new Date().toISOString().split('T')[0]}">
                                        </div>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label fw-bold">Médecin</label>
                                            <input type="text" class="form-control" id="batchDoctor_${documentData.id}" 
                                                   value="${window.app.currentUser?.firstName + ' ' + window.app.currentUser?.lastName || ''}">
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label fw-bold">Département</label>
                                            <select class="form-select" id="batchDepartment_${documentData.id}">
                                                <option value="">Sélectionner</option>
                                                <option value="cardiology">Cardiologie</option>
                                                <option value="neurology">Neurologie</option>
                                                <option value="orthopedics">Orthopédie</option>
                                                <option value="pediatrics">Pédiatrie</option>
                                                <option value="emergency">Urgences</option>
                                                <option value="surgery">Chirurgie</option>
                                                <option value="radiology">Radiologie</option>
                                                <option value="laboratory">Laboratoire</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label fw-bold">Description</label>
                                    <textarea class="form-control" id="batchDescription_${documentData.id}" rows="3" 
                                              placeholder="Description du document..."></textarea>
                                </div>

                                <div class="row">
                                    <div class="col-md-4">
                                        <div class="mb-3">
                                            <label class="form-label fw-bold">Priorité</label>
                                            <select class="form-select" id="batchPriority_${documentData.id}">
                                                <option value="low">Faible</option>
                                                <option value="medium" selected>Moyenne</option>
                                                <option value="high">Élevée</option>
                                                <option value="urgent">Urgente</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="mb-3">
                                            <label class="form-label fw-bold">Confidentialité</label>
                                            <select class="form-select" id="batchConfidentiality_${documentData.id}">
                                                <option value="public">Publique</option>
                                                <option value="internal" selected>Interne</option>
                                                <option value="confidential">Confidentielle</option>
                                                <option value="secret">Secrète</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="mb-3">
                                            <label class="form-label fw-bold">Statut</label>
                                            <select class="form-select" id="batchStatus_${documentData.id}">
                                                <option value="pending_review" selected>En révision</option>
                                                <option value="approved">Approuvé</option>
                                                <option value="rejected">Rejeté</option>
                                                <option value="archived">Archivé</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                <i class="fas fa-times me-2"></i>Annuler
                            </button>
                            <button type="button" class="btn btn-success" onclick="saveBatchDocument(${documentData.id})">
                                <i class="fas fa-save me-2"></i>Sauvegarder
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Ajouter le modal au DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Peupler le select des patients
        this.populateBatchPatientSelect(documentData.id);

        // Afficher le modal
        const modal = new bootstrap.Modal(document.getElementById(modalId));
        modal.show();

        // Supprimer le modal du DOM quand il est fermé
        document.getElementById(modalId).addEventListener('hidden.bs.modal', () => {
            document.getElementById(modalId).remove();
        });

        window.app.showToast(`Formulaire généré pour le document ${index}/${total}`, 'success');
    }

    populateBatchPatientSelect(documentId) {
        const select = document.getElementById(`batchPatient_${documentId}`);
        if (!select || !window.app) return;
        
        select.innerHTML = '<option value="">Sélectionner un patient</option>';
        
        window.app.data.patients.forEach(patient => {
            const option = document.createElement('option');
            option.value = patient.id;
            option.textContent = `${patient.firstName} ${patient.lastName} (${patient.patientId})`;
            select.appendChild(option);
        });
    }

    // Analyse IA globale
    aiAnalyzeAll() {
        window.app.showToast('Analyse IA de tous les documents en cours...', 'warning');
        
        setTimeout(() => {
            let processed = 0;
            
            if (window.app && window.app.data) {
                window.app.data.documents.forEach(doc => {
                    if (!doc.aiProcessed) {
                        const aiResults = DocumentManager.processWithAI(doc);
                        doc.aiResults = aiResults;
                        processed++;
                    }
                });
            }
            
            window.app.showToast(`${processed} documents traités par IA`, 'success');
            window.app.loadDocuments(); // Recharger l'affichage
        }, 3000);
    }
}

// Créer l'instance globale
window.scanner = new IntelligentScanner();

// Fonctions globales
function startCamera() {
    window.scanner.startCamera();
}

function uploadFile() {
    window.scanner.uploadFile();
}

function captureDocument() {
    window.scanner.captureDocument();
}

function processWithAI() {
    window.scanner.processWithAI();
}

function enhanceImage() {
    window.scanner.enhanceImage();
}

function startBatchScan() {
    // Utiliser la nouvelle logique de scan en lot
    if (window.scanner && window.scanner.startBatchScan) {
        window.scanner.startBatchScan();
    } else {
        // Fallback si l'objet scanner n'existe pas
        startBatchScanFallback();
    }
}

// Fonction de fallback pour le scan en lot
function startBatchScanFallback() {
    window.app.showToast('Scan en lot démarré - Sélectionnez plusieurs documents', 'info');
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;

    input.onchange = async (e) => {
        const files = Array.from(e.target.files);
        window.app.showToast(`Traitement de ${files.length} documents en cours...`, 'warning');
        
        // Traiter chaque fichier et générer un formulaire
        for (let i = 0; i < files.length; i++) {
            setTimeout(() => {
                processBatchFileFallback(files[i], i + 1, files.length);
                if (i === files.length - 1) {
                    window.app.showToast(`Scan en lot terminé - ${files.length} documents traités`, 'success');
                }
            }, i * 2000); // 2 secondes entre chaque document
        }
    };

    input.click();
}

// Fonction de fallback pour traiter un fichier du lot
function processBatchFileFallback(file, index, total) {
    // Simuler le traitement du fichier
    window.app.showToast(`Traitement du document ${index}/${total}: ${file.name}`, 'info');
    
    // Créer un objet document simulé
    const documentData = {
        id: Date.now() + index,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadDate: new Date().toISOString(),
        status: 'pending_review'
    };

    // Ajouter à la liste des documents
    if (window.app && window.app.data) {
        window.app.data.documents.push(documentData);
        
        // Sauvegarder
        localStorage.setItem('medicalDigitizationData', JSON.stringify(window.app.data));
    }

    // Générer automatiquement un formulaire pour ce document
    setTimeout(() => {
        showBatchDocumentFormFallback(documentData, index, total);
    }, 1000);
}

// Fonction de fallback pour afficher le formulaire du document du lot
function showBatchDocumentFormFallback(documentData, index, total) {
    // Créer un modal pour chaque document du lot
    const modalId = `batchDocumentModal_${documentData.id}`;
    
    // Créer le modal HTML
    const modalHTML = `
        <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title" id="${modalId}Label">
                            <i class="fas fa-file-medical me-2"></i>Document ${index}/${total} - ${documentData.name}
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="batchDocumentForm_${documentData.id}">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label fw-bold">Titre du Document *</label>
                                        <input type="text" class="form-control" id="batchTitle_${documentData.id}" 
                                               value="${documentData.name.replace(/\.[^/.]+$/, '')}" required>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label fw-bold">Type de Document *</label>
                                        <select class="form-select" id="batchType_${documentData.id}" required>
                                            <option value="">Sélectionner</option>
                                            <option value="medical_record">Dossier Médical</option>
                                            <option value="prescription">Ordonnance</option>
                                            <option value="lab_results">Résultats Labo</option>
                                            <option value="xray">Radiographie</option>
                                            <option value="certificate">Certificat</option>
                                            <option value="report">Rapport</option>
                                            <option value="other">Autre</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label fw-bold">Patient *</label>
                                        <select class="form-select" id="batchPatient_${documentData.id}" required>
                                            <option value="">Sélectionner un patient</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label fw-bold">Date du Document</label>
                                        <input type="date" class="form-control" id="batchDate_${documentData.id}" 
                                               value="${new Date().toISOString().split('T')[0]}">
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label fw-bold">Médecin</label>
                                        <input type="text" class="form-control" id="batchDoctor_${documentData.id}" 
                                               value="${window.app.currentUser?.firstName + ' ' + window.app.currentUser?.lastName || ''}">
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label fw-bold">Département</label>
                                        <select class="form-select" id="batchDepartment_${documentData.id}">
                                            <option value="">Sélectionner</option>
                                            <option value="cardiology">Cardiologie</option>
                                            <option value="neurology">Neurologie</option>
                                            <option value="orthopedics">Orthopédie</option>
                                            <option value="pediatrics">Pédiatrie</option>
                                            <option value="emergency">Urgences</option>
                                            <option value="surgery">Chirurgie</option>
                                            <option value="radiology">Radiologie</option>
                                            <option value="laboratory">Laboratoire</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div class="mb-3">
                                <label class="form-label fw-bold">Description</label>
                                <textarea class="form-control" id="batchDescription_${documentData.id}" rows="3" 
                                          placeholder="Description du document..."></textarea>
                            </div>

                            <div class="row">
                                <div class="col-md-4">
                                    <div class="mb-3">
                                        <label class="form-label fw-bold">Priorité</label>
                                        <select class="form-select" id="batchPriority_${documentData.id}">
                                            <option value="low">Faible</option>
                                            <option value="medium" selected>Moyenne</option>
                                            <option value="high">Élevée</option>
                                            <option value="urgent">Urgente</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="mb-3">
                                        <label class="form-label fw-bold">Confidentialité</label>
                                        <select class="form-select" id="batchConfidentiality_${documentData.id}">
                                            <option value="public">Publique</option>
                                            <option value="internal" selected>Interne</option>
                                            <option value="confidential">Confidentielle</option>
                                            <option value="secret">Secrète</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="mb-3">
                                        <label class="form-label fw-bold">Statut</label>
                                        <select class="form-select" id="batchStatus_${documentData.id}">
                                            <option value="pending_review" selected>En révision</option>
                                            <option value="approved">Approuvé</option>
                                            <option value="rejected">Rejeté</option>
                                            <option value="archived">Archivé</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="fas fa-times me-2"></i>Annuler
                        </button>
                        <button type="button" class="btn btn-success" onclick="saveBatchDocument(${documentData.id})">
                            <i class="fas fa-save me-2"></i>Sauvegarder
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Ajouter le modal au DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Peupler le select des patients
    populateBatchPatientSelectFallback(documentData.id);

    // Afficher le modal
    const modal = new bootstrap.Modal(document.getElementById(modalId));
    modal.show();

    // Supprimer le modal du DOM quand il est fermé
    document.getElementById(modalId).addEventListener('hidden.bs.modal', () => {
        document.getElementById(modalId).remove();
    });

    window.app.showToast(`Formulaire généré pour le document ${index}/${total}`, 'success');
}

// Fonction de fallback pour peupler le select des patients
function populateBatchPatientSelectFallback(documentId) {
    const select = document.getElementById(`batchPatient_${documentId}`);
    if (!select || !window.app) return;
    
    select.innerHTML = '<option value="">Sélectionner un patient</option>';
    
    window.app.data.patients.forEach(patient => {
        const option = document.createElement('option');
        option.value = patient.id;
        option.textContent = `${patient.firstName} ${patient.lastName} (${patient.patientId})`;
        select.appendChild(option);
    });
}

// Fonction pour sauvegarder un document du lot
function saveBatchDocument(documentId) {
    // Récupérer les données du formulaire
    const title = document.getElementById(`batchTitle_${documentId}`).value;
    const type = document.getElementById(`batchType_${documentId}`).value;
    const patient = document.getElementById(`batchPatient_${documentId}`).value;
    const date = document.getElementById(`batchDate_${documentId}`).value;
    const doctor = document.getElementById(`batchDoctor_${documentId}`).value;
    const department = document.getElementById(`batchDepartment_${documentId}`).value;
    const description = document.getElementById(`batchDescription_${documentId}`).value;
    const priority = document.getElementById(`batchPriority_${documentId}`).value;
    const confidentiality = document.getElementById(`batchConfidentiality_${documentId}`).value;
    const status = document.getElementById(`batchStatus_${documentId}`).value;

    // Validation
    if (!title || !type || !patient) {
        window.app.showToast('Veuillez remplir tous les champs obligatoires', 'error');
        return;
    }

    // Trouver le document dans la liste
    const documentIndex = window.app.data.documents.findIndex(doc => doc.id === documentId);
    if (documentIndex === -1) {
        window.app.showToast('Document non trouvé', 'error');
        return;
    }

    // Mettre à jour le document avec les nouvelles informations
    const updatedDocument = {
        ...window.app.data.documents[documentIndex],
        title: title,
        type: type,
        patientId: patient,
        date: date,
        doctor: doctor,
        department: department,
        description: description,
        priority: priority,
        confidentiality: confidentiality,
        status: status,
        updatedAt: new Date().toISOString(),
        reviewedBy: window.app.currentUser?.id || 'system'
    };

    // Sauvegarder
    window.app.data.documents[documentIndex] = updatedDocument;
    localStorage.setItem('medicalDigitizationData', JSON.stringify(window.app.data));

    // Fermer le modal
    const modal = bootstrap.Modal.getInstance(document.getElementById(`batchDocumentModal_${documentId}`));
    if (modal) {
        modal.hide();
    }

    // Mettre à jour les compteurs
    window.app.updateDashboardStats();

    window.app.showToast(`Document "${title}" sauvegardé avec succès`, 'success');
}

function aiAnalyzeAll() {
    window.scanner.aiAnalyzeAll();
}

// Variables globales pour le scanner
let currentImageData = null;
let isFullscreen = false;
let currentRotation = 0;
let processingSteps = [];

// Fonctions principales du scanner amélioré
function startScanning() {
    console.log('Démarrage de la numérisation...');
    
    // Vérifier si on peut accéder à la caméra
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // Utiliser la vraie caméra
        if (window.scanner && window.scanner.startCamera) {
            window.scanner.startCamera();
            return;
        }
    }
    
    // Fallback: simulation de numérisation
    const scanPreview = document.getElementById('scanPreview');
    if (!scanPreview) {
        console.error('scanPreview element not found');
        if (window.app && window.app.showToast) {
            window.app.showToast('Erreur: Zone de scan non trouvée', 'error');
        } else {
            alert('Erreur: Zone de scan non trouvée');
        }
        return;
    }
    
    scanPreview.innerHTML = `
        <div class="scanning-active text-center p-4">
            <div class="scan-line mb-3"></div>
            <i class="fas fa-camera fa-3x text-primary mb-3"></i>
            <h5>Numérisation en cours...</h5>
            <p class="text-muted">Placez le document devant la caméra</p>
            <div class="spinner-border text-primary mb-3" role="status">
                <span class="visually-hidden">Chargement...</span>
            </div>
            <div class="mt-3">
                <button class="btn btn-warning" onclick="cancelScanning()">
                    <i class="fas fa-times me-2"></i>Annuler
                </button>
            </div>
        </div>
    `;
    
    // Démarrer la progression
    startProcessingSteps();
    
    // Simuler la capture après 3 secondes
    setTimeout(() => {
        console.log('Capture du document...');
        captureDocument();
    }, 3000);
    
    // Afficher une notification
    if (window.app && window.app.showToast) {
        window.app.showToast('Numérisation démarrée...', 'info');
    } else {
        console.log('Numérisation démarrée...');
    }
}

function captureDocument() {
    console.log('Capture du document en cours...');
    
    // Simuler une image capturée
    const sampleImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjU2MCIgdmlld0JveD0iMCAwIDQwMCA1NjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNTYwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjUwIiB5PSI1MCIgd2lkdGg9IjMwMCIgaGVpZ2h0PSI0NjAiIGZpbGw9IndoaXRlIiBzdHJva2U9IiNFNUU3RUIiIHN0cm9rZS13aWR0aD0iMiIvPgo8dGV4dCB4PSIyMDAiIHk9IjMwMCIgZmlsbD0iIzZCNzI4MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Eb2N1bWVudCBNw6lkaWNhbDwvdGV4dD4KPC9zdmc+';
    
    // Remplacer le contenu de scanPreview avec l'image capturée et les contrôles
    const scanPreview = document.getElementById('scanPreview');
    if (scanPreview) {
        scanPreview.innerHTML = `
            <div class="captured-image">
                <img id="scannedImage" src="${sampleImage}" alt="Document scanné" style="width: 100%; height: 100%; object-fit: cover; border-radius: 16px;">
                <div class="image-overlay">
                    <div class="image-controls">
                        <button class="btn btn-sm btn-primary me-2" onclick="enhanceImage()" title="Améliorer">
                            <i class="fas fa-magic"></i>
                        </button>
                        <button class="btn btn-sm btn-secondary me-2" onclick="rotateImage()" title="Rotation">
                            <i class="fas fa-redo"></i>
                        </button>
                        <button class="btn btn-sm btn-warning me-2" onclick="adjustBrightness()" title="Luminosité">
                            <i class="fas fa-sun"></i>
                        </button>
                        <button class="btn btn-sm btn-info me-2" onclick="adjustContrast()" title="Contraste">
                            <i class="fas fa-adjust"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="removeImage()" title="Supprimer">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="btn btn-sm btn-success" onclick="showScannerDetailsModal()" title="Ouvrir Formulaire">
                            <i class="fas fa-edit"></i> Formulaire
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Stocker l'image pour le modal
        window.currentScannedImage = sampleImage;
    }
    
    // Mettre à jour les informations de scan
    updateScanInfo();
    
    // Marquer l'étape de numérisation comme terminée
    completeStep(1);
    
    // Afficher le formulaire de détails automatiquement après 1.5 secondes
    setTimeout(() => {
        console.log('Ouverture automatique du formulaire de détails...');
        showScannerDetailsModal();
    }, 1500);
    
    // Afficher une notification si l'app est disponible
    if (window.app && window.app.showToast) {
        window.app.showToast('Document capturé ! Ouverture du formulaire...', 'success');
    } else {
        console.log('Document capturé avec succès !');
    }
}

function startProcessingSteps() {
    processingSteps = [
        { id: 1, name: 'Numérisation', status: 'active' },
        { id: 2, name: 'Validation', status: 'pending' },
        { id: 3, name: 'Classification', status: 'pending' },
        { id: 4, name: 'Reconnaissance', status: 'pending' },
        { id: 5, name: 'Indexation', status: 'pending' },
        { id: 6, name: 'Archivage', status: 'pending' }
    ];
    
    updateProcessingSteps();
}

function updateProcessingSteps() {
    processingSteps.forEach(step => {
        const stepElement = document.getElementById(`step${step.id}`);
        if (stepElement) {
            stepElement.className = `processing-step ${step.status}`;
            const statusElement = stepElement.querySelector('.step-status .badge');
            if (statusElement) {
                switch(step.status) {
                    case 'active':
                        statusElement.textContent = 'En cours';
                        statusElement.className = 'badge bg-primary';
                        break;
                    case 'completed':
                        statusElement.textContent = 'Terminé';
                        statusElement.className = 'badge bg-success';
                        break;
                    case 'error':
                        statusElement.textContent = 'Erreur';
                        statusElement.className = 'badge bg-danger';
                        break;
                    default:
                        statusElement.textContent = 'En attente';
                        statusElement.className = 'badge bg-secondary';
                }
            }
        }
    });
}

function completeStep(stepId) {
    const step = processingSteps.find(s => s.id === stepId);
    if (step) {
        step.status = 'completed';
        updateProcessingSteps();
        
        // Démarrer l'étape suivante
        if (stepId < 6) {
            setTimeout(() => {
                const nextStep = processingSteps.find(s => s.id === stepId + 1);
                if (nextStep) {
                    nextStep.status = 'active';
                    updateProcessingSteps();
                    
                    // Simuler le traitement de l'étape suivante
                    setTimeout(() => {
                        completeStep(stepId + 1);
                    }, 1500);
                }
            }, 500);
        }
    }
}

function updateScanInfo() {
    // Simuler les informations de scan
    const resolutionEl = document.getElementById('scanResolution');
    const formatEl = document.getElementById('scanFormatInfo');
    const sizeEl = document.getElementById('scanSize');
    const dimensionsEl = document.getElementById('scanDimensions');
    
    if (resolutionEl) resolutionEl.textContent = '150 DPI';
    if (formatEl) formatEl.textContent = 'JPEG';
    if (sizeEl) sizeEl.textContent = '2.3 MB';
    if (dimensionsEl) dimensionsEl.textContent = '2480x3508 px';
    
    // Mettre à jour la barre de qualité
    const qualityBar = document.getElementById('qualityBar');
    const qualityText = document.getElementById('qualityText');
    if (qualityBar && qualityText) {
        qualityBar.style.width = '85%';
        qualityBar.className = 'progress-bar bg-success';
        qualityText.textContent = '85% - Excellente';
    }
}

function showScannerDetailsModal() {
    console.log('Ouverture du modal de détails du scanner...');
    
    const modalElement = document.getElementById('scannerDetailsModal');
    if (!modalElement) {
        console.error('scannerDetailsModal element not found - Création du modal...');
        createScannerDetailsModal();
        return;
    }
    
    const modal = new bootstrap.Modal(modalElement);
    
    // Charger les patients dans le select
    populateScannerPatientSelect();
    
    // Définir la date par défaut
    const dateField = document.getElementById('scannerDate');
    if (dateField) {
        dateField.value = new Date().toISOString().split('T')[0];
    }
    
    // Définir un titre par défaut
    const titleField = document.getElementById('scannerTitle');
    if (titleField && !titleField.value) {
        titleField.value = `Document scanné - ${new Date().toLocaleDateString('fr-FR')}`;
    }
    
    // Pré-remplir avec les résultats IA si disponibles
    if (window.currentAIResults) {
        const aiResults = window.currentAIResults;
        
        // Pré-remplir le titre avec le type détecté par IA
        if (titleField && aiResults.documentType) {
            titleField.value = `${aiResults.documentType.label} - ${new Date().toLocaleDateString('fr-FR')}`;
        }
        
        // Pré-remplir le type de document
        const typeField = document.getElementById('scannerType');
        if (typeField && aiResults.documentType) {
            typeField.value = aiResults.documentType.type;
        }
        
        // Pré-remplir la description avec les mots-clés extraits
        const descriptionField = document.getElementById('scannerDescription');
        if (descriptionField && aiResults.keywords) {
            descriptionField.value = `Mots-clés extraits: ${aiResults.keywords.join(', ')}\n\n${aiResults.extractedText || ''}`;
        }
        
        // Pré-remplir la priorité basée sur la qualité
        const priorityField = document.getElementById('scannerPriority');
        if (priorityField && aiResults.quality) {
            if (aiResults.quality >= 90) {
                priorityField.value = 'high';
            } else if (aiResults.quality >= 75) {
                priorityField.value = 'medium';
            } else {
                priorityField.value = 'low';
            }
        }
        
        console.log('Formulaire pré-rempli avec les résultats IA:', aiResults);
    }
    
    // Copier l'image dans la modal
    const modalScannedImage = document.getElementById('modalScannedImage');
    if (modalScannedImage) {
        // Utiliser l'image stockée ou l'image du DOM
        if (window.currentScannedImage) {
            modalScannedImage.src = window.currentScannedImage;
        } else {
            const scannedImage = document.getElementById('scannedImage');
            if (scannedImage) {
                modalScannedImage.src = scannedImage.src;
            }
        }
    }
    
    // Afficher le modal
    modal.show();
    
    console.log('Modal de détails du scanner affiché');
    
    // Afficher une notification
    if (window.app && window.app.showToast) {
        window.app.showToast('Formulaire de détails du document ouvert', 'info');
    }
}

// Fonction pour créer le modal s'il n'existe pas
function createScannerDetailsModal() {
    const modalHTML = `
        <div class="modal fade" id="scannerDetailsModal" tabindex="-1" aria-labelledby="scannerDetailsModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title" id="scannerDetailsModalLabel">
                            <i class="fas fa-edit me-2"></i>Détails du Document Scanné
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <img id="modalScannedImage" src="" alt="Document scanné" class="img-fluid rounded mb-3" style="max-height: 300px;">
                            </div>
                            <div class="col-md-6">
                                <form id="scannerDetailsForm">
                                    <div class="mb-3">
                                        <label class="form-label fw-bold">Titre du Document *</label>
                                        <input type="text" class="form-control" id="scannerTitle" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label fw-bold">Type de Document *</label>
                                        <select class="form-select" id="scannerType" required onchange="updateDocumentType()">
                                            <option value="">Sélectionner</option>
                                            <option value="medical_record">Dossier Médical</option>
                                            <option value="prescription">Ordonnance</option>
                                            <option value="lab_results">Résultats Labo</option>
                                            <option value="xray">Radiographie</option>
                                            <option value="consultation">Consultation</option>
                                            <option value="certificate">Certificat</option>
                                            <option value="other">Autre</option>
                                        </select>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label fw-bold">Patient *</label>
                                        <select class="form-select" id="scannerPatient" required>
                                            <option value="">Sélectionner un patient</option>
                                        </select>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label fw-bold">Date du Document</label>
                                        <input type="date" class="form-control" id="scannerDate">
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label fw-bold">Priorité</label>
                                        <select class="form-select" id="scannerPriority">
                                            <option value="low">Faible</option>
                                            <option value="medium" selected>Moyenne</option>
                                            <option value="high">Élevée</option>
                                            <option value="urgent">Urgente</option>
                                        </select>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label fw-bold">Description</label>
                                        <textarea class="form-control" id="scannerDescription" rows="3" placeholder="Description du document..."></textarea>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="fas fa-times me-2"></i>Annuler
                        </button>
                        <button type="button" class="btn btn-success" onclick="saveScannedDocument()">
                            <i class="fas fa-save me-2"></i>Sauvegarder
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Ajouter le modal au DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Maintenant afficher le modal
    setTimeout(() => {
        showScannerDetailsModal();
    }, 100);
}

function populateScannerPatientSelect() {
    const select = document.getElementById('scannerPatient');
    if (!select || !window.app) return;
    
    select.innerHTML = '<option value="">Sélectionner un patient</option>';
    
    window.app.data.patients.forEach(patient => {
        const option = document.createElement('option');
        option.value = patient.id;
        option.textContent = `${patient.firstName} ${patient.lastName} (${patient.patientId})`;
        select.appendChild(option);
    });
}

function toggleFullscreen() {
    const scanArea = document.getElementById('scanArea');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    
    if (!isFullscreen) {
        if (scanArea.requestFullscreen) {
            scanArea.requestFullscreen();
        }
        fullscreenBtn.innerHTML = '<i class="fas fa-compress me-2"></i>Sortir du Plein Écran';
        isFullscreen = true;
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
        fullscreenBtn.innerHTML = '<i class="fas fa-expand me-2"></i>Plein Écran';
        isFullscreen = false;
    }
}

function rotateImage() {
    const image = document.getElementById('scannedImage');
    const modalImage = document.getElementById('modalScannedImage');
    
    currentRotation += 90;
    if (currentRotation >= 360) {
        currentRotation = 0;
    }
    
    const rotationStyle = `transform: rotate(${currentRotation}deg); transition: transform 0.3s ease;`;
    
    if (image) image.style.cssText = rotationStyle;
    if (modalImage) modalImage.style.cssText = rotationStyle;
    
    window.app.showToast(`Image pivotée de ${currentRotation}°`, 'info');
}

function enhanceImage() {
    window.app.showToast('Amélioration de l\'image en cours...', 'warning');
    
    setTimeout(() => {
        // Simuler l'amélioration
        const qualityBar = document.getElementById('qualityBar');
        const qualityText = document.getElementById('qualityText');
        
        if (qualityBar && qualityText) {
            qualityBar.style.width = '95%';
            qualityBar.className = 'progress-bar bg-success';
            qualityText.textContent = '95% - Parfaite';
        }
        
        window.app.showToast('Image améliorée avec succès !', 'success');
    }, 2000);
}

function adjustBrightness() {
    window.app.showToast('Ajustement de la luminosité...', 'info');
    setTimeout(() => window.app.showToast('Luminosité ajustée', 'success'), 1000);
}

function adjustContrast() {
    window.app.showToast('Ajustement du contraste...', 'info');
    setTimeout(() => window.app.showToast('Contraste ajusté', 'success'), 1000);
}

function adjustImageQuality() {
    window.app.showToast('Ajustement de la qualité d\'image...', 'info');
    setTimeout(() => window.app.showToast('Qualité d\'image optimisée', 'success'), 1500);
}

function removeImage() {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) {
        // Réinitialiser le scanner
        if (window.scanner && window.scanner.loadScanner) {
            window.scanner.loadScanner();
        } else {
            // Fallback
            const scanPreview = document.getElementById('scanPreview');
            if (scanPreview) {
                scanPreview.innerHTML = `
                    <div class="scan-placeholder">
                        <i class="fas fa-camera fa-3x text-muted mb-3"></i>
                        <h4>Scanner Intelligent</h4>
                        <p class="text-muted">Placez le document ou utilisez la caméra pour numériser</p>
                        <div class="mt-3">
                            <button class="btn btn-primary me-2" onclick="startScanning()">
                                <i class="fas fa-play me-2"></i>Démarrer la Numérisation
                            </button>
                            <button class="btn btn-success" onclick="scanner.uploadFile()">
                                <i class="fas fa-upload me-2"></i>Upload Fichier
                            </button>
                        </div>
                    </div>
                `;
            }
        }
        
        // Réinitialiser les étapes
        processingSteps = [];
        updateProcessingSteps();
        
        // Nettoyer les données temporaires
        window.currentScannedImage = null;
        window.currentAIResults = null;
        
        if (window.app && window.app.showToast) {
            window.app.showToast('Image supprimée', 'info');
        }
    }
}

// Fonction pour annuler le scanning
function cancelScanning() {
    console.log('Annulation de la numérisation...');
    
    // Réinitialiser le scanner
    if (window.scanner && window.scanner.loadScanner) {
        window.scanner.loadScanner();
    } else {
        // Fallback
        const scanPreview = document.getElementById('scanPreview');
        if (scanPreview) {
            scanPreview.innerHTML = `
                <div class="scan-placeholder">
                    <i class="fas fa-camera fa-3x text-muted mb-3"></i>
                    <h4>Scanner Intelligent</h4>
                    <p class="text-muted">Placez le document ou utilisez la caméra pour numériser</p>
                    <div class="mt-3">
                        <button class="btn btn-primary me-2" onclick="startScanning()">
                            <i class="fas fa-play me-2"></i>Démarrer la Numérisation
                        </button>
                        <button class="btn btn-success" onclick="scanner.uploadFile()">
                            <i class="fas fa-upload me-2"></i>Upload Fichier
                        </button>
                    </div>
                </div>
            `;
        }
    }
    
    // Réinitialiser les étapes
    processingSteps = [];
    updateProcessingSteps();
    
    // Nettoyer les données temporaires
    window.currentScannedImage = null;
    window.currentAIResults = null;
    
    if (window.app && window.app.showToast) {
        window.app.showToast('Numérisation annulée', 'info');
    }
}

function updateDocumentType() {
    const type = document.getElementById('scannerType').value;
    const titleField = document.getElementById('scannerTitle');
    
    if (type && !titleField.value) {
        const titles = {
            medical_record: 'Dossier Médical',
            prescription: 'Ordonnance Médicale',
            lab_results: 'Résultats de Laboratoire',
            xray: 'Radiographie',
            consultation: 'Rapport de Consultation',
            certificate: 'Certificat Médical',
            insurance: 'Document d\'Assurance',
            other: 'Document Médical'
        };
        
        titleField.value = titles[type] || 'Document Médical';
    }
}

function saveScannedDocument() {
    const formData = {
        title: document.getElementById('scannerTitle').value,
        type: document.getElementById('scannerType').value,
        patientId: parseInt(document.getElementById('scannerPatient').value),
        date: document.getElementById('scannerDate').value,
        priority: document.getElementById('scannerPriority').value,
        description: document.getElementById('scannerDescription').value,
        department: document.getElementById('scannerDepartment').value,
        doctor: document.getElementById('scannerDoctor').value,
        tags: document.getElementById('scannerTags').value,
        autoProcessOCR: document.getElementById('autoProcessOCR').checked,
        autoClassify: document.getElementById('autoClassify').checked
    };

    // Validation
    if (!formData.title || !formData.type || !formData.patientId) {
        window.app.showToast('Veuillez remplir tous les champs requis', 'error');
        return;
    }

    const patient = window.app.data.patients.find(p => p.id === formData.patientId);
    if (!patient) {
        window.app.showToast('Patient non trouvé', 'error');
        return;
    }

    // Créer le document avec les données du formulaire
    const newDocument = {
        id: Date.now(),
        title: formData.title,
        type: formData.type,
        patientId: formData.patientId,
        patientName: `${patient.firstName} ${patient.lastName}`,
        date: formData.date,
        priority: formData.priority || 'medium',
        description: formData.description || '',
        department: formData.department || '',
        doctor: formData.doctor || window.app.currentUser?.firstName + ' ' + window.app.currentUser?.lastName || 'Médecin',
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
        status: 'pending_review',
        source: 'scanner',
        uploadDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        aiProcessed: !!window.currentAIResults,
        aiResults: window.currentAIResults || null,
        imageData: window.currentScannedImage || ''
    };

    console.log('Nouveau document créé:', newDocument);

    // Ajouter le document à la liste
    window.app.data.documents.push(newDocument);
    
    // Mettre à jour le compteur de documents du patient
    patient.documentsCount = (patient.documentsCount || 0) + 1;
    
    // Sauvegarder dans localStorage
    localStorage.setItem('medicalDigitizationData', JSON.stringify(window.app.data));
    
    // Fermer le modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('scannerDetailsModal'));
    if (modal) {
        modal.hide();
    }
    
    // Recharger les documents et le dashboard
    if (window.app.loadDocuments) {
        window.app.loadDocuments();
    }
    if (window.app.loadDashboardData) {
        window.app.loadDashboardData();
    }
    
    // Afficher le succès
    window.app.showToast('Document scanné sauvegardé avec succès !', 'success');
    
    console.log('Document scanné sauvegardé avec succès');
    
    // Traitement IA automatique si activé
    if (formData.autoProcessOCR || formData.autoClassify) {
        setTimeout(() => {
            newDocument.aiProcessed = true;
            newDocument.aiInsights = {
                confidence: 0.95,
                extractedText: 'Texte extrait du document médical...',
                classification: formData.type,
                keywords: ['médical', 'patient', 'traitement']
            };
            
            // Mettre à jour localStorage
            localStorage.setItem('medicalDigitizationData', JSON.stringify(window.app.data));
            
            window.app.showToast('Document traité par IA', 'success');
            if (window.app.loadDocuments) {
                window.app.loadDocuments();
            }
            if (window.app.loadDashboardData) {
                window.app.loadDashboardData();
            }
        }, 2000);
    }
    
    // Nettoyer les données temporaires
    window.currentScannedImage = null;
    window.currentAIResults = null;
    
    // Réinitialiser le scanner
    removeImage();
}

// Fonction de test pour capturer et afficher le formulaire
function testCaptureAndForm() {
    console.log('Test rapide - Capture et formulaire...');
    
    // Capturer directement
    captureDocument();
    
    // Afficher le formulaire immédiatement
    setTimeout(() => {
        showScannerDetailsModal();
    }, 500);
}

// Fonction de test rapide pour vérifier le scanner
function testScannerQuick() {
    console.log('Test rapide du scanner...');
    
    // Simuler un scan complet
    const scanPreview = document.getElementById('scanPreview');
    if (scanPreview) {
        scanPreview.innerHTML = `
            <div class="text-center p-4">
                <div class="spinner-border text-primary mb-3" role="status">
                    <span class="visually-hidden">Scan en cours...</span>
                </div>
                <h5>Test de Scanner</h5>
                <p class="text-muted">Simulation de numérisation...</p>
            </div>
        `;
    }
    
    // Après 2 secondes, capturer et ouvrir le formulaire
    setTimeout(() => {
        captureDocument();
    }, 2000);
}

// Fonction pour forcer l'ouverture du formulaire
function forceOpenForm() {
    console.log('Forçage de l\'ouverture du formulaire...');
    
    // Créer une image simulée si nécessaire
    if (!window.currentScannedImage) {
        window.currentScannedImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjU2MCIgdmlld0JveD0iMCAwIDQwMCA1NjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNTYwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjUwIiB5PSI1MCIgd2lkdGg9IjMwMCIgaGVpZ2h0PSI0NjAiIGZpbGw9IndoaXRlIiBzdHJva2U9IiNFNUU3RUIiIHN0cm9rZS13aWR0aD0iMiIvPgo8dGV4dCB4PSIyMDAiIHk9IjMwMCIgZmlsbD0iIzZCNzI4MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Eb2N1bWVudCBNw6lkaWNhbDwvdGV4dD4KPC9zdmc+';
    }
    
    // Ouvrir directement le formulaire
    showScannerDetailsModal();
}

// Gestion du drag & drop
document.addEventListener('DOMContentLoaded', () => {
    const scanArea = document.getElementById('scanArea');
    const dropZone = document.getElementById('dropZone');
    
    if (scanArea) {
        scanArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (dropZone) dropZone.classList.remove('d-none');
        });
        
        scanArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            if (!scanArea.contains(e.relatedTarget) && dropZone) {
                dropZone.classList.add('d-none');
            }
        });
        
        scanArea.addEventListener('drop', (e) => {
            e.preventDefault();
            if (dropZone) dropZone.classList.add('d-none');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const file = files[0];
                if (file.type.startsWith('image/') || file.type === 'application/pdf') {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        document.getElementById('scanPreview').classList.add('d-none');
                        document.getElementById('capturedImage').classList.remove('d-none');
                        document.getElementById('scannedImage').src = event.target.result;
                        
                        updateScanInfo();
                        completeStep(1);
                        
                        setTimeout(() => {
                            showScannerDetailsModal();
                        }, 1000);
                    };
                    reader.readAsDataURL(file);
                } else {
                    window.app.showToast('Format de fichier non supporté', 'error');
                }
            }
        });
    }
});
