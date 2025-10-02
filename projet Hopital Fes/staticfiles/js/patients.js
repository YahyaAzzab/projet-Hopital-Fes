// Gestion des Patients
class PatientManager {
    static generatePatientId() {
        const year = new Date().getFullYear();
        const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
        return `PAT${year}${random}`;
    }

    static calculateAge(dateOfBirth) {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    }

    static validatePatientData(data) {
        const errors = [];
        
        if (!data.firstName || data.firstName.trim().length < 2) {
            errors.push('Le prénom doit contenir au moins 2 caractères');
        }
        
        if (!data.lastName || data.lastName.trim().length < 2) {
            errors.push('Le nom doit contenir au moins 2 caractères');
        }
        
        if (!data.dateOfBirth) {
            errors.push('La date de naissance est requise');
        } else {
            const age = this.calculateAge(data.dateOfBirth);
            if (age < 0 || age > 120) {
                errors.push('Date de naissance invalide');
            }
        }
        
        if (!data.gender || !['M', 'F', 'O', 'male', 'female', 'other', 'Homme', 'Femme', 'Autre'].includes(data.gender)) {
            errors.push('Le genre est requis');
        }
        
        if (!data.bloodType || data.bloodType.trim() === '') {
            errors.push('Le groupe sanguin est requis');
        }
        
        if (!data.ci || data.ci.trim() === '') {
            errors.push('La carte d\'identité est requise');
        } else if (!/^[A-Z]{2}[0-9]{6}$/.test(data.ci.trim().toUpperCase())) {
            errors.push('Format de carte d\'identité invalide (ex: AB123456)');
        }
        
        if (data.phone && !/^[\+]?[0-9\s\-\(\)]{10,}$/.test(data.phone)) {
            errors.push('Numéro de téléphone invalide');
        }
        
        if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            errors.push('Email invalide');
        }
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    static createPatient(data) {
        const validation = this.validatePatientData(data);
        if (!validation.valid) {
            return { success: false, errors: validation.errors };
        }

        const newPatient = {
            id: Date.now(),
            patientId: this.generatePatientId(),
            firstName: data.firstName.trim(),
            lastName: data.lastName.trim(),
            ci: data.ci?.trim().toUpperCase() || '',
            dateOfBirth: data.dateOfBirth,
            age: this.calculateAge(data.dateOfBirth),
            gender: data.gender,
            phone: data.phone?.trim() || '',
            email: data.email?.trim() || '',
            address: data.address?.trim() || '',
            city: data.city?.trim() || '',
            bloodType: data.bloodType || '',
            emergencyContact: data.emergencyContact?.trim() || '',
            insurance: data.insurance?.trim() || '',
            allergies: data.allergies?.trim() || '',
            medicalHistory: data.medicalHistory?.trim() || '',
            occupation: data.occupation?.trim() || '',
            maritalStatus: data.maritalStatus || '',
            notes: data.notes?.trim() || '',
            status: 'active',
            documentsCount: 0,
            lastVisit: new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString()
        };

        return { success: true, patient: newPatient };
    }

    static searchPatients(patients, searchTerm) {
        if (!searchTerm) return patients;
        
        const term = searchTerm.toLowerCase();
        return patients.filter(patient =>
            patient.firstName.toLowerCase().includes(term) ||
            patient.lastName.toLowerCase().includes(term) ||
            patient.patientId.toLowerCase().includes(term) ||
            patient.phone.includes(term) ||
            patient.email.toLowerCase().includes(term)
        );
    }

    static filterPatients(patients, filters) {
        let filtered = [...patients];
        
        if (filters.status) {
            filtered = filtered.filter(p => p.status === filters.status);
        }
        
        if (filters.gender) {
            filtered = filtered.filter(p => p.gender === filters.gender);
        }
        
        if (filters.ageRange) {
            const [min, max] = filters.ageRange.split('-').map(Number);
            filtered = filtered.filter(p => {
                if (max) {
                    return p.age >= min && p.age <= max;
                } else {
                    return p.age >= min;
                }
            });
        }
        
        return filtered;
    }

    static sortPatients(patients, sortBy, sortOrder = 'asc') {
        return patients.sort((a, b) => {
            let valueA = a[sortBy];
            let valueB = b[sortBy];
            
            if (typeof valueA === 'string') {
                valueA = valueA.toLowerCase();
                valueB = valueB.toLowerCase();
            }
            
            if (sortOrder === 'desc') {
                return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
            } else {
                return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
            }
        });
    }
}

// Export global
window.PatientManager = PatientManager;

