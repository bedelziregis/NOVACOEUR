/**
 * ===== SYSTÈME D'AUTOMATISATION LOVE PAGE =====
 * Génération automatique des love pages et codes QR
 * Dépend de: config.js, admin.js, auth.js
 */

// Formulaire de création rapide
const AutomationUI = {
    init: function() {
        this.setupCreateForm();
        this.setupExportModal();
    },
    
    setupCreateForm: function() {
        const container = document.getElementById('automation-container');
        if (!container) return;
        
        container.innerHTML = `
            <div class="automation-section">
                <h3>⚡ Créer Love Page Rapide</h3>
                <form id="create-love-form" class="automation-form">
                    <div class="form-group">
                        <label>Nom du Client *</label>
                        <input type="text" id="client-name" placeholder="Jean & Marie" required>
                    </div>
                    <div class="form-group">
                        <label>Email (optionnel)</label>
                        <input type="email" id="client-email" placeholder="client@example.com">
                    </div>
                    <div class="form-group">
                        <label>Téléphone (optionnel)</label>
                        <input type="tel" id="client-phone" placeholder="+33...")>
                    </div>
                    <div class="form-group">
                        <label>Message/Déclaration *</label>
                        <textarea id="client-message" placeholder="Écrivez votre message..." rows="4" required></textarea>
                    </div>
                    <div class="form-group">
                        <label>Offre *</label>
                        <select id="client-offer" required>
                            <option value="">-- Sélectionner une offre --</option>
                            <option value="1">Éclat Simple (7000 FCFA)</option>
                            <option value="2">Émotion Complète (10000 FCFA)</option>
                            <option value="3">Infini Amoureux (18000 FCFA)</option>
                        </select>
                    </div>
                    <button type="submit" class="btn-primary">
                        ✨ Créer Love Page
                    </button>
                </form>
                <div id="create-status"></div>
            </div>
        `;
        
        document.getElementById('create-love-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitCreateForm();
        });
    },
    
    submitCreateForm: async function() {
        const statusDiv = document.getElementById('create-status');
        statusDiv.innerHTML = '⏳ Génération en cours...';
        statusDiv.style.display = 'block';
        
        try {
            const formData = {
                clientName: document.getElementById('client-name').value,
                clientEmail: document.getElementById('client-email').value,
                phoneNumber: document.getElementById('client-phone').value,
                message: document.getElementById('client-message').value,
                offer: document.getElementById('client-offer').value
            };
            
            const response = await fetch(`${window.API_BASE_URL}/api/create-love-page`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                statusDiv.innerHTML = `
                    <div class="success-message">
                        <h4>✅ Love Page créée!</h4>
                        <p><strong>Nom:</strong> ${result.data.clientName}</p>
                        <p><strong>ID:</strong> ${result.data.pageId}</p>
                        <p><strong>Lien:</strong> <a href="${result.data.pageLink}" target="_blank">${result.data.pageLink}</a></p>
                        <button class="btn-small" onclick="AutomationUI.downloadQRCode('${result.data.pageId}')">
                            📥 Télécharger QR Code
                        </button>
                        <button class="btn-small" onclick="AutomationUI.copyLink('${result.data.pageLink}')">
                            📋 Copier Lien
                        </button>
                        <button class="btn-small" onclick="location.reload()">
                            ➕ Créer une autre
                        </button>
                    </div>
                `;
            } else {
                statusDiv.innerHTML = `<div class="error-message">❌ ${result.error}</div>`;
            }
        } catch (err) {
            statusDiv.innerHTML = `<div class="error-message">❌ Erreur: ${err.message}</div>`;
            console.error(err);
        }
    },
    
    downloadQRCode: function(pageId) {
        window.location.href = `${window.API_BASE_URL}/api/qrcode/${pageId}`;
    },
    
    copyLink: function(link) {
        navigator.clipboard.writeText(link).then(() => {
            alert('✅ Lien copié au presse-papiers!');
        }).catch(() => {
            alert('Erreur: impossible de copier');
        });
    },
    
    setupExportModal: function() {
        // Modal pour exporter les infos client
        const style = document.createElement('style');
        style.textContent = `
            .automation-section {
                background: linear-gradient(135deg, #fff 0%, #f9f9f9 100%);
                border: 2px solid #ff1a52;
                border-radius: 12px;
                padding: 25px;
                margin: 20px 0;
                box-shadow: 0 8px 20px rgba(255, 26, 82, 0.1);
            }
            
            .automation-section h3 {
                color: #ff1a52;
                margin-bottom: 20px;
                font-size: 18px;
            }
            
            .automation-form {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }
            
            .form-group {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .form-group label {
                font-weight: 600;
                color: #333;
                font-size: 14px;
            }
            
            .form-group input,
            .form-group textarea,
            .form-group select {
                padding: 10px 15px;
                border: 2px solid #eee;
                border-radius: 8px;
                font-family: inherit;
                font-size: 14px;
                transition: border-color 0.3s;
            }
            
            .form-group input:focus,
            .form-group textarea:focus,
            .form-group select:focus {
                outline: none;
                border-color: #ff1a52;
                background: #fff;
            }
            
            .btn-small {
                padding: 10px 15px;
                background: #ff1a52;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 13px;
                margin: 5px 5px 5px 0;
                transition: 0.3s;
            }
            
            .btn-small:hover {
                background: #d91e3a;
                transform: translateY(-2px);
            }
            
            .success-message {
                background: #f0fff4;
                border-left: 4px solid #48bb78;
                padding: 15px;
                border-radius: 6px;
                margin-top: 20px;
            }
            
            .success-message h4 {
                color: #22543d;
                margin: 0 0 10px 0;
            }
            
            .success-message p {
                color: #22543d;
                margin: 8px 0;
                font-size: 13px;
            }
            
            .success-message a {
                color: #ff1a52;
                text-decoration: none;
                word-break: break-all;
            }
            
            .error-message {
                background: #fff5f5;
                border-left: 4px solid #f56565;
                color: #742a2a;
                padding: 15px;
                border-radius: 6px;
                margin-top: 20px;
            }
            
            #create-status {
                display: none;
                margin-top: 20px;
            }
        `;
        document.head.appendChild(style);
    }
};

// Initialiser au chargement
document.addEventListener('DOMContentLoaded', () => {
    // Attendre que SessionManager soit disponible
    const checkSession = setInterval(() => {
        if (typeof SessionManager !== 'undefined' && SessionManager.isValidSession && SessionManager.isValidSession()) {
            clearInterval(checkSession);
            setTimeout(() => AutomationUI.init(), 500);
        }
    }, 100);
    
    // Timeout après 3 secondes
    setTimeout(() => clearInterval(checkSession), 3000);
});
