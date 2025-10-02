// Gestion des Utilisateurs
class UserManager {
    static validateUserData(data) {
        const errors = [];
        
        if (!data.firstName || data.firstName.trim().length < 2) {
            errors.push('Le prénom doit contenir au moins 2 caractères');
        }
        
        if (!data.lastName || data.lastName.trim().length < 2) {
            errors.push('Le nom doit contenir au moins 2 caractères');
        }
        
        if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            errors.push('Email invalide');
        }
        
        if (!data.password || data.password.length < 6) {
            errors.push('Le mot de passe doit contenir au moins 6 caractères');
        }
        
        if (!data.role || !['admin', 'doctor', 'nurse', 'technician'].includes(data.role)) {
            errors.push('Rôle invalide');
        }
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    static createUser(data) {
        const validation = this.validateUserData(data);
        if (!validation.valid) {
            return { success: false, errors: validation.errors };
        }

        // Vérifier si l'email existe déjà
        const existingUser = window.app.data.users.find(u => u.email === data.email);
        if (existingUser) {
            return { success: false, errors: ['Cet email est déjà utilisé'] };
        }

        const newUser = {
            id: Date.now(),
            firstName: data.firstName.trim(),
            lastName: data.lastName.trim(),
            email: data.email.trim().toLowerCase(),
            password: data.password,
            role: data.role,
            roleName: this.getRoleDisplayName(data.role),
            initials: this.generateInitials(data.firstName, data.lastName),
            permissions: AuthSystem.getRolePermissions(data.role),
            department: data.department || this.getDefaultDepartment(data.role),
            isActive: true,
            lastLogin: null,
            createdAt: new Date().toISOString()
        };

        return { success: true, user: newUser };
    }

    static updateUser(userId, data) {
        const userIndex = window.app.data.users.findIndex(u => u.id === userId);
        if (userIndex === -1) {
            return { success: false, error: 'Utilisateur non trouvé' };
        }

        const user = window.app.data.users[userIndex];
        
        // Mettre à jour les champs modifiables
        if (data.firstName) user.firstName = data.firstName.trim();
        if (data.lastName) user.lastName = data.lastName.trim();
        if (data.email) user.email = data.email.trim().toLowerCase();
        if (data.department) user.department = data.department.trim();
        
        // Si le rôle change, mettre à jour les permissions
        if (data.role && data.role !== user.role) {
            user.role = data.role;
            user.roleName = this.getRoleDisplayName(data.role);
            user.permissions = AuthSystem.getRolePermissions(data.role);
        }
        
        // Mettre à jour les initiales
        user.initials = this.generateInitials(user.firstName, user.lastName);
        user.updatedAt = new Date().toISOString();

        return { success: true, user: user };
    }

    static toggleUserStatus(userId) {
        const user = window.app.data.users.find(u => u.id === userId);
        if (!user) {
            return { success: false, error: 'Utilisateur non trouvé' };
        }

        // Empêcher la désactivation de son propre compte
        if (userId === window.app.currentUser?.id) {
            return { success: false, error: 'Vous ne pouvez pas désactiver votre propre compte' };
        }

        user.isActive = !user.isActive;
        user.updatedAt = new Date().toISOString();

        return { 
            success: true, 
            user: user, 
            message: `Utilisateur ${user.isActive ? 'activé' : 'désactivé'} avec succès` 
        };
    }

    static deleteUser(userId) {
        const userIndex = window.app.data.users.findIndex(u => u.id === userId);
        if (userIndex === -1) {
            return { success: false, error: 'Utilisateur non trouvé' };
        }

        // Empêcher la suppression de son propre compte
        if (userId === window.app.currentUser?.id) {
            return { success: false, error: 'Vous ne pouvez pas supprimer votre propre compte' };
        }

        // Marquer comme supprimé au lieu de supprimer définitivement
        const user = window.app.data.users[userIndex];
        user.isActive = false;
        user.deletedAt = new Date().toISOString();

        return { success: true, message: 'Utilisateur supprimé avec succès' };
    }

    static generateInitials(firstName, lastName) {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }

    static getRoleDisplayName(role) {
        const roleNames = {
            admin: 'Administrateur',
            doctor: 'Médecin',
            nurse: 'Infirmière',
            technician: 'Technicien'
        };
        return roleNames[role] || role;
    }

    static getDefaultDepartment(role) {
        const departments = {
            admin: 'Administration',
            doctor: 'Médecine Générale',
            nurse: 'Soins Infirmiers',
            technician: 'Support Technique'
        };
        return departments[role] || 'Non spécifié';
    }

    static getUserStats(users) {
        const stats = {
            total: users.length,
            active: users.filter(u => u.isActive).length,
            inactive: users.filter(u => !u.isActive).length,
            byRole: {},
            byDepartment: {},
            recentLogins: users.filter(u => u.lastLogin && 
                new Date(u.lastLogin) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            ).length
        };
        
        // Statistiques par rôle
        users.forEach(user => {
            stats.byRole[user.role] = (stats.byRole[user.role] || 0) + 1;
            if (user.department) {
                stats.byDepartment[user.department] = (stats.byDepartment[user.department] || 0) + 1;
            }
        });
        
        return stats;
    }

    static searchUsers(users, searchTerm) {
        if (!searchTerm) return users;
        
        const term = searchTerm.toLowerCase();
        return users.filter(user =>
            user.firstName.toLowerCase().includes(term) ||
            user.lastName.toLowerCase().includes(term) ||
            user.email.toLowerCase().includes(term) ||
            user.department.toLowerCase().includes(term) ||
            user.roleName.toLowerCase().includes(term)
        );
    }

    static filterUsers(users, filters) {
        let filtered = [...users];
        
        if (filters.role) {
            filtered = filtered.filter(u => u.role === filters.role);
        }
        
        if (filters.isActive !== undefined) {
            filtered = filtered.filter(u => u.isActive === filters.isActive);
        }
        
        if (filters.department) {
            filtered = filtered.filter(u => u.department === filters.department);
        }
        
        return filtered;
    }

    static getPermissionsByRole(role) {
        return AuthSystem.getRolePermissions(role);
    }

    static canUserAccess(user, resource, action) {
        const permission = `${resource}:${action}`;
        return user.permissions.includes(permission) || user.permissions.includes(resource);
    }
}

// Fonctions globales pour la gestion des utilisateurs
function showAddUserModal() {
    // Réinitialiser le formulaire
    document.getElementById('addUserForm').reset();
    
    // Définir la date d'aujourd'hui par défaut
    document.getElementById('userHireDate').value = new Date().toISOString().split('T')[0];
    
    // Générer un ID employé automatique
    const employeeId = 'EMP' + String(Date.now()).slice(-4);
    document.getElementById('userEmployeeId').value = employeeId;
    
    // Générer un mot de passe temporaire
    const tempPassword = generateTempPassword();
    document.getElementById('userPassword').value = tempPassword;
    document.getElementById('userConfirmPassword').value = tempPassword;
    
    // Afficher le modal
    const modal = new bootstrap.Modal(document.getElementById('addUserModal'));
    modal.show();
}

function generateTempPassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function toggleUserPassword() {
    const passwordInput = document.getElementById('userPassword');
    const toggleBtn = event.target.closest('button');
    const icon = toggleBtn.querySelector('i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

function saveNewUser() {
    // Validation des champs requis
    const firstName = document.getElementById('userFirstName').value.trim();
    const lastName = document.getElementById('userLastName').value.trim();
    const email = document.getElementById('userEmail').value.trim();
    const role = document.getElementById('userRole').value;
    const password = document.getElementById('userPassword').value;
    const confirmPassword = document.getElementById('userConfirmPassword').value;
    
    if (!firstName || !lastName || !email || !role || !password || !confirmPassword) {
        window.app.showToast('Veuillez remplir tous les champs obligatoires', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        window.app.showToast('Les mots de passe ne correspondent pas', 'error');
        return;
    }
    
    if (password.length < 6) {
        window.app.showToast('Le mot de passe doit contenir au moins 6 caractères', 'error');
        return;
    }
    
    // Vérifier si l'email existe déjà
    const existingUser = window.app.data.users.find(user => user.email === email);
    if (existingUser) {
        window.app.showToast('Un utilisateur avec cet email existe déjà', 'error');
        return;
    }
    
    // Collecter les permissions
    const permissions = [];
    if (document.getElementById('permDashboard').checked) permissions.push('dashboard');
    if (document.getElementById('permPatients').checked) permissions.push('patients');
    if (document.getElementById('permDocuments').checked) permissions.push('documents');
    if (document.getElementById('permReports').checked) permissions.push('reports');
    if (document.getElementById('permScanner').checked) permissions.push('scanner');
    if (document.getElementById('permUsers').checked) permissions.push('users');
    
    // Créer le nouvel utilisateur
    const newUser = {
        id: window.app.data.users.length + 1,
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: document.getElementById('userPhone').value.trim(),
        role: role,
        department: document.getElementById('userDepartment').value,
        employeeId: document.getElementById('userEmployeeId').value.trim(),
        hireDate: document.getElementById('userHireDate').value,
        permissions: permissions,
        password: password, // En production, ceci devrait être hashé
        status: 'active',
        createdAt: new Date().toISOString(),
        notes: document.getElementById('userNotes').value.trim(),
        lastLogin: null,
        passwordChanged: false
    };
    
    // Ajouter à la liste des utilisateurs
    window.app.data.users.push(newUser);
    
    // Sauvegarder dans le localStorage
    localStorage.setItem('medicalDigitizationData', JSON.stringify(window.app.data));
    
    // Fermer le modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('addUserModal'));
    modal.hide();
    
    // Afficher le message de succès
    window.app.showToast(`Utilisateur ${firstName} ${lastName} créé avec succès !`, 'success');
    
    // Recharger la liste des utilisateurs
    window.app.loadUsers();
    
    // Afficher les informations de connexion
    setTimeout(() => {
        const message = `
            Utilisateur créé avec succès !
            Email: ${email}
            Mot de passe temporaire: ${password}
            L'utilisateur devra changer son mot de passe à la première connexion.
        `;
        alert(message);
    }, 1000);
}

function editUser(userId) {
    window.app.showToast(`Modification de l'utilisateur ${userId} en développement`, 'info');
}

function toggleUserStatus(userId) {
    const result = UserManager.toggleUserStatus(userId);
    if (result.success) {
        window.app.showToast(result.message, 'success');
        window.app.loadUsers(); // Recharger la liste
    } else {
        window.app.showToast(result.error, 'error');
    }
}

function deleteUser(userId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
        const result = UserManager.deleteUser(userId);
        if (result.success) {
            window.app.showToast(result.message, 'success');
            window.app.loadUsers(); // Recharger la liste
        } else {
            window.app.showToast(result.error, 'error');
        }
    }
}

function viewUserPermissions(userId) {
    const user = window.app.data.users.find(u => u.id === userId);
    if (user) {
        const permissionsText = user.permissions.join(', ');
        window.app.showToast(`Permissions de ${user.firstName}: ${permissionsText}`, 'info');
    }
}

function resetUserPassword(userId) {
    window.app.showToast('Réinitialisation du mot de passe en développement', 'info');
}

// Export global
window.UserManager = UserManager;
