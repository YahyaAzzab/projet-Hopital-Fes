// Système d'Authentification
class AuthSystem {
    static validateLogin(email, password) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!email || !password) {
            return { valid: false, message: 'Email et mot de passe requis' };
        }
        
        if (!emailRegex.test(email)) {
            return { valid: false, message: 'Format d\'email invalide' };
        }
        
        if (password.length < 6) {
            return { valid: false, message: 'Mot de passe trop court (minimum 6 caractères)' };
        }
        
        return { valid: true };
    }

    static hasPermission(user, permission) {
        return user && user.permissions && user.permissions.includes(permission);
    }

    static canAccess(user, page) {
        if (!user) return false;
        
        const pagePermissions = {
            dashboard: ['dashboard'],
            patients: ['patients'],
            documents: ['documents'],
            scanner: ['scanner'],
            reports: ['reports'],
            users: ['users'],
            settings: ['settings']
        };
        
        const requiredPermissions = pagePermissions[page] || [];
        return requiredPermissions.some(permission => 
            this.hasPermission(user, permission)
        );
    }

    static getRolePermissions(role) {
        const permissions = {
            admin: ['dashboard', 'patients', 'documents', 'scanner', 'reports', 'users', 'settings'],
            doctor: ['dashboard', 'patients', 'documents', 'scanner', 'reports'],
            nurse: ['patients_view', 'documents_view'], // Vue seule pour infirmier
            technician: ['settings'] // Seulement les paramètres pour technicien
        };
        return permissions[role] || [];
    }
}

// Export global
window.AuthSystem = AuthSystem;

