/**
 * ===== SYSTÈME D'AUTHENTIFICATION ADMIN SIMPLIFIÉ =====
 * Note: Utilise SessionManager et AUTH_CREDENTIALS définis dans admin.js
 * Cet ordre est important dans admin.html: config → admin → auth → automation
 */

/**
 * Initialiser l'authentification
 */
function initializeAuth() {
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    checkAuthentication();
}

/**
 * Vérifier l'authentification
 */
function checkAuthentication() {
    const isAuthenticated = isUserAuthenticated();
    const loginModal = document.getElementById('login-modal');
    const adminInterface = document.getElementById('admin-interface');
    
    if (!loginModal || !adminInterface) {
        console.warn('⚠️ Éléments login/admin non trouvés');
        return;
    }
    
    if (isAuthenticated) {
        loginModal.style.display = 'none';
        adminInterface.style.display = 'flex';
        console.log('✅ Utilisateur authentifié');
    } else {
        loginModal.style.display = 'flex';
        adminInterface.style.display = 'none';
        console.log('❌ Authentification requise');
    }
}

/**
 * Vérifier si l'utilisateur est authentifié
 */
function isUserAuthenticated() {
    // Utiliser SESSION_KEY défini dans admin.js
    const session = localStorage.getItem(SESSION_KEY || 'novacoeur_admin_session');
    if (!session) return false;
    
    try {
        const parsed = JSON.parse(session);
        const isValid = parsed.expiresAt > Date.now();
        return isValid;
    } catch (e) {
        return false;
    }
}

/**
 * Gérer la connexion
 */
function handleLogin(e) {
    if (e) e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('login-error');
    
    // Validation
    if (!username || !password) {
        if (errorDiv) {
            errorDiv.textContent = '⚠️ Veuillez remplir tous les champs';
            errorDiv.style.display = 'block';
        }
        return;
    }
    
    // Vérifier les identifiants (utiliser AUTH_CREDENTIALS défini dans admin.js)
    if (username === AUTH_CREDENTIALS.username && password === AUTH_CREDENTIALS.password) {
        // Créer une session via SessionManager
        if (SessionManager && SessionManager.startSession) {
            SessionManager.startSession();
        } else {
            // Fallback si SessionManager n'est pas disponible
            const session = {
                token: 'token_' + Math.random().toString(36).substr(2, 9) + Date.now(),
                startTime: Date.now(),
                expiresAt: Date.now() + (24 * 60 * 60 * 1000)
            };
            localStorage.setItem(SESSION_KEY || 'novacoeur_admin_session', JSON.stringify(session));
        }
        
        // Nettoyer le formulaire
        document.getElementById('login-form').reset();
        
        // Mettre à jour l'affichage
        if (errorDiv) errorDiv.style.display = 'none';
        checkAuthentication();
        console.log('✅ Connexion réussie');
        
    } else {
        // Erreur de connexion
        if (errorDiv) {
            errorDiv.textContent = '❌ Identifiant ou mot de passe incorrect';
            errorDiv.style.display = 'block';
        }
        document.getElementById('password').value = '';
        console.warn('⚠️ Tentative de connexion échouée');
    }
}

/**
 * Gérer la déconnexion
 */
function handleLogout(e) {
    if (e) e.preventDefault();
    
    // Supprimer la session
    localStorage.removeItem(SESSION_KEY);
    
    // Nettoyer le formulaire
    const loginForm = document.getElementById('login-form');
    if (loginForm) loginForm.reset();
    
    // Mettre à jour l'affichage
    checkAuthentication();
    console.log('✅ Déconnecté');
}

/**
 * Vérifier l'expiration de session
 */
function checkSessionExpiry() {
    if (!isUserAuthenticated()) {
        handleLogout();
    }
}

// Initialiser au chargement
document.addEventListener('DOMContentLoaded', initializeAuth);

// Vérifier l'expiration toutes les minutes
setInterval(checkSessionExpiry, 60000);

// Exporter pour utilisation globale
window.AuthSystem = {
    isAuthenticated: isUserAuthenticated,
    login: handleLogin,
    logout: handleLogout,
    check: checkAuthentication
};

