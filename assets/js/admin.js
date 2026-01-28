// ===== ADMIN SYSTEM =====

const AUTH_CREDENTIALS = {
    username: 'nova',
    password: 'Nov123@@@'
};

const SESSION_KEY = 'novacoeur_admin_session';
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 heures

// Session Manager
const SessionManager = {
    startSession: function() {
        const session = {
            token: this.generateToken(),
            startTime: Date.now(),
            expiresAt: Date.now() + SESSION_TIMEOUT
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        return session;
    },
    
    generateToken: function() {
        return 'token_' + Math.random().toString(36).substr(2, 9) + Date.now();
    },
    
    isValidSession: function() {
        const session = localStorage.getItem(SESSION_KEY);
        if (!session) return false;
        
        try {
            const parsed = JSON.parse(session);
            return parsed.expiresAt > Date.now();
        } catch (e) {
            console.error('❌ Erreur session:', e);
            return false;
        }
    },
    
    endSession: function() {
        localStorage.removeItem(SESSION_KEY);
    }
};

// Check authentication on page load
window.addEventListener('DOMContentLoaded', () => {
    console.log('✅ [NOVACOEUR] Page chargée - Vérification session');
    
    const loginModal = document.getElementById('login-modal');
    const adminInterface = document.getElementById('admin-interface');
    
    if (!loginModal || !adminInterface) {
        console.error('❌ [NOVACOEUR] Éléments login-modal ou admin-interface manquants');
        return;
    }
    
    if (SessionManager.isValidSession()) {
        console.log('✅ [NOVACOEUR] Session valide');
        loginModal.style.display = 'none';
        adminInterface.style.display = 'block';
        initializeAdminInterface();
    } else {
        console.log('❌ [NOVACOEUR] Pas de session - Affichage login');
        loginModal.style.display = 'flex';
        adminInterface.style.display = 'none';
        setupLoginForm();
    }
});

// Setup login form
function setupLoginForm() {
    const form = document.getElementById('login-form');
    const errorDiv = document.getElementById('login-error');
    
    if (!form) {
        console.error('❌ Formulaire login non trouvé');
        return;
    }
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        
        // Validation
        if (!username || !password) {
            if (errorDiv) {
                errorDiv.textContent = '⚠️ Veuillez remplir tous les champs';
                errorDiv.style.display = 'block';
            }
            return;
        }
        
        if (username === AUTH_CREDENTIALS.username && password === AUTH_CREDENTIALS.password) {
            SessionManager.startSession();
            if (errorDiv) errorDiv.style.display = 'none';
            
            document.getElementById('login-modal').style.display = 'none';
            document.getElementById('admin-interface').style.display = 'block';
            
            initializeAdminInterface();
            console.log('✅ Connexion réussie');
        } else {
            if (errorDiv) {
                errorDiv.textContent = '❌ Identifiant ou mot de passe incorrect';
                errorDiv.style.display = 'block';
            }
            document.getElementById('password').value = '';
            console.warn('⚠️ Tentative échouée');
        }
    });
}

// Initialize admin interface
function initializeAdminInterface() {
    console.log('[NOVACOEUR] Initialisation interface admin');
    try {
        updateDashboard();
        console.log('[NOVACOEUR] ✓ Dashboard mis à jour');
    } catch (e) {
        console.error('[NOVACOEUR] Erreur dashboard:', e);
    }
    
    // Adds a modal that lists pages and displays media loaded from IndexedDB for debugging
    try {
        setupTabNavigation();
        console.log('[NOVACOEUR] ✓ Navigation onglets activée');
    } catch (e) {
        console.error('[NOVACOEUR] Erreur navigation:', e);
    }
    
    try {
        setupFormHandlers();
        console.log('[NOVACOEUR] ✓ Formulaires initialisés');
    } catch (e) {
        console.error('[NOVACOEUR] Erreur formulaires:', e);
    }
    
    try {
        setupLogout();
        console.log('[NOVACOEUR] ✓ Logout configuré');
    } catch (e) {
        console.error('[NOVACOEUR] Erreur logout:', e);
    }
    try {
        setupDebugPanel();
        console.log('[NOVACOEUR] ✓ Debug panel configuré');
    } catch (e) {
        console.warn('[NOVACOEUR] setupDebugPanel failed', e);
    }
    
    console.log('[NOVACOEUR] ✓ Interface admin prête');
}

// Wait for API_BASE_URL to be defined
async function waitForAPI() {
    let retries = 0;
    while (!window.API_BASE_URL && retries < 10) {
        await new Promise(r => setTimeout(r, 100));
        retries++;
    }
    if (!window.API_BASE_URL) {
        console.error('[NOVACOEUR] ERREUR: API_BASE_URL non défini après 1s');
        window.API_BASE_URL = `${window.location.protocol}//${window.location.host}`;
        console.log('[NOVACOEUR] API_BASE_URL par défaut:', window.API_BASE_URL);
    }
}

// Data Store - Now using API instead of localStorage
const DataStore = {
    pages: [],
    
    // Load all pages from API
    loadPages: async function() {
        try {
            if (!window.API_BASE_URL) {
                throw new Error('API_BASE_URL not configured');
            }
            console.log('[NOVACOEUR] Appel API:', `${window.API_BASE_URL}/api/pages`);
            const res = await fetch(`${window.API_BASE_URL}/api/pages`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const response = await res.json();
            this.pages = response.data || [];
            console.log('[NOVACOEUR] Pages chargées depuis l\'API:', this.pages.length);
            return this.pages;
        } catch (err) {
            console.error('[NOVACOEUR] Erreur lors du chargement des pages:', err);
            return [];
        }
    },

    savePage: async function(pageData) {
        const photosMeta = [];
        const videosMeta = [];
        let musicMeta = null;

        try {
            if (pageData.photos && pageData.photos.length) {
                for (let p of pageData.photos) {
                    if (p.data) {
                        const id = 'm_' + Date.now() + '_' + Math.random().toString(36).substr(2,6);
                        const blob = dataURLtoBlob(p.data);
                        await MediaDB.putMedia(id, p.name || 'photo', p.type || blob.type, blob);
                        photosMeta.push({ id, name: p.name, type: p.type });
                    } else if (p.id) {
                        photosMeta.push({ id: p.id, name: p.name, type: p.type });
                    }
                }
            }

            if (pageData.videos && pageData.videos.length) {
                for (let v of pageData.videos) {
                    if (v.data) {
                        const id = 'm_' + Date.now() + '_' + Math.random().toString(36).substr(2,6);
                        const blob = dataURLtoBlob(v.data);
                        await MediaDB.putMedia(id, v.name || 'video', v.type || blob.type, blob);
                        videosMeta.push({ id, name: v.name, type: v.type });
                    } else if (v.id) {
                        videosMeta.push({ id: v.id, name: v.name, type: v.type });
                    }
                }
            }

            if (pageData.music) {
                if (pageData.music.data) {
                    const id = 'm_' + Date.now() + '_' + Math.random().toString(36).substr(2,6);
                    const blob = dataURLtoBlob(pageData.music.data);
                    await MediaDB.putMedia(id, pageData.music.name || 'music', pageData.music.type || blob.type, blob);
                    musicMeta = { id, name: pageData.music.name, type: pageData.music.type };
                } else if (pageData.music.id) {
                    musicMeta = { id: pageData.music.id, name: pageData.music.name, type: pageData.music.type };
                }
            }
        } catch (e) {
            console.error('[NOVACOEUR] Erreur lors de l\'enregistrement des médias dans IndexedDB', e);
            throw e;
        }

        const payload = {
            clientName: pageData.clientName,
            clientEmail: pageData.clientEmail,
            offerType: pageData.offerType,
            message: pageData.message,
            photos: photosMeta,
            videos: videosMeta,
            music: musicMeta
        };

        try {
            const res = await fetch(`${window.API_BASE_URL}/api/pages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const response = await res.json();
            const newPage = response.data;
            this.pages.push(newPage);
            console.log('[NOVACOEUR] Page créée via API:', newPage.id);
            return newPage;
        } catch (err) {
            console.error('[NOVACOEUR] Erreur sauvegarde page via API:', err);
            throw err;
        }
    },

    getPage: async function(id) {
        try {
            const res = await fetch(`${window.API_BASE_URL}/api/pages/${id}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const response = await res.json();
            return response.data;
        } catch (err) {
            console.error('[NOVACOEUR] Erreur chargement page:', err);
            return null;
        }
    },

    updatePage: async function(id, data) {
        try {
            const res = await fetch(`${window.API_BASE_URL}/api/pages/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const response = await res.json();
            const index = this.pages.findIndex(p => p.id == id);
            if (index !== -1) this.pages[index] = response.data;
            return response.data;
        } catch (err) {
            console.error('[NOVACOEUR] Erreur mise à jour page:', err);
        }
    },

    deletePage: async function(id) {
        try {
            const res = await fetch(`${window.API_BASE_URL}/api/pages/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            this.pages = this.pages.filter(p => p.id !== id);
            console.log('[NOVACOEUR] Page supprimée via API:', id);
            return true;
        } catch (err) {
            console.error('[NOVACOEUR] Erreur suppression page:', err);
            return false;
        }
    },

    getAllPages: function() {
        return this.pages;
    },

    getPagesByOffer: function(offer) {
        return this.pages.filter(p => p.offerType == offer).length;
    }
};

// --------------------
// IndexedDB media store helpers
// --------------------
const MediaDB = {
    dbName: 'novacoeur_db',
    dbVersion: 1,

    open: function() {
        return new Promise((resolve, reject) => {
            const req = indexedDB.open(this.dbName, this.dbVersion);
            req.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('media')) {
                    db.createObjectStore('media', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('pages')) {
                    db.createObjectStore('pages', { keyPath: 'id' });
                }
            };
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    },

    putMedia: async function(id, name, type, blob) {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('media', 'readwrite');
            const store = tx.objectStore('media');
            const obj = { id, name, type, blob };
            const r = store.put(obj);
            r.onsuccess = () => resolve(id);
            r.onerror = () => reject(r.error);
        });
    },

    getMedia: async function(id) {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('media', 'readonly');
            const store = tx.objectStore('media');
            const r = store.get(id);
            r.onsuccess = () => resolve(r.result);
            r.onerror = () => reject(r.error);
        });
    }
};

function dataURLtoBlob(dataurl) {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
}

// Migrate any existing pages that contain embedded data URLs into IndexedDB (runs once)
async function migrateExistingPages() {
    if (!DataStore.pages || !DataStore.pages.length) return;
    let migrated = false;
    for (let page of DataStore.pages) {
        // photos
        if (page.photos && page.photos.length && page.photos[0] && page.photos[0].data) {
            const newPhotos = [];
            for (let p of page.photos) {
                try {
                    const id = 'm_' + Date.now() + '_' + Math.random().toString(36).substr(2,6);
                    const blob = dataURLtoBlob(p.data);
                    await MediaDB.putMedia(id, p.name || 'photo', p.type || blob.type, blob);
                    newPhotos.push({ id, name: p.name, type: p.type });
                    migrated = true;
                } catch (e) {
                    console.warn('[NOVACOEUR] Migration photo échouée', e);
                }
            }
            page.photos = newPhotos;
        }

        // videos
        if (page.videos && page.videos.length && page.videos[0] && page.videos[0].data) {
            const newVideos = [];
            for (let v of page.videos) {
                try {
                    const id = 'm_' + Date.now() + '_' + Math.random().toString(36).substr(2,6);
                    const blob = dataURLtoBlob(v.data);
                    await MediaDB.putMedia(id, v.name || 'video', v.type || blob.type, blob);
                    newVideos.push({ id, name: v.name, type: v.type });
                    migrated = true;
                } catch (e) {
                    console.warn('[NOVACOEUR] Migration video échouée', e);
                }
            }
            page.videos = newVideos;
        }

        // music
        if (page.music && page.music.data) {
            try {
                const id = 'm_' + Date.now() + '_' + Math.random().toString(36).substr(2,6);
                const blob = dataURLtoBlob(page.music.data);
                await MediaDB.putMedia(id, page.music.name || 'music', page.music.type || blob.type, blob);
                page.music = { id, name: page.music.name, type: page.music.type };
                migrated = true;
            } catch (e) {
                console.warn('[NOVACOEUR] Migration musique échouée', e);
            }
        }
    }

    if (migrated) {
        try {
            localStorage.setItem('lovePages', JSON.stringify(DataStore.pages));
            console.log('[NOVACOEUR] ✓ Migration existante terminée');
        } catch (e) {
            console.error('[NOVACOEUR] Erreur en sauvegardant lovePages après migration', e);
        }
    }
}

// Call migration early
document.addEventListener('DOMContentLoaded', () => {
    try { migrateExistingPages(); } catch (e) { console.warn('[NOVACOEUR] migrateExistingPages failed', e); }
});

// --------------------
// Debug panel for media (admin)
// --------------------
function setupDebugPanel() {
    const openBtn = document.getElementById('open-media-debug');
    const modal = document.getElementById('media-debug-modal');
    const closeBtn = document.getElementById('close-media-debug');
    const container = document.getElementById('media-debug-container');

    if (!openBtn || !modal || !closeBtn || !container) return;

    openBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        container.innerHTML = '<p>Chargement des pages...</p>';
        modal.style.display = 'block';
        try {
            const pages = DataStore.getAllPages();
            if (!pages || pages.length === 0) {
                container.innerHTML = '<p>Aucune page trouvée.</p>';
                return;
            }

            container.innerHTML = '';
            for (let p of pages) {
                const card = document.createElement('div');
                card.className = 'debug-page-card';
                card.style.border = '1px solid #ddd';
                card.style.padding = '10px';
                card.style.marginBottom = '10px';

                const header = document.createElement('div');
                header.innerHTML = `<strong>${p.clientName}</strong> — ${new Date(p.createdAt).toLocaleString()}`;
                card.appendChild(header);

                // Photos
                const photoWrap = document.createElement('div');
                photoWrap.innerHTML = '<div><em>Photos:</em></div>';
                if (p.photos && p.photos.length) {
                    const thumbs = document.createElement('div');
                    thumbs.style.display = 'flex';
                    thumbs.style.gap = '8px';
                    for (let ph of p.photos) {
                        const imgContainer = document.createElement('div');
                        imgContainer.style.width = '120px';
                        imgContainer.style.textAlign = 'center';

                        const img = document.createElement('img');
                        img.style.maxWidth = '100%';
                        img.style.height = '80px';
                        img.alt = ph.name || '';

                        if (ph.data) {
                            img.src = ph.data;
                        } else if (ph.id) {
                            try {
                                const m = await MediaDB.getMedia(ph.id);
                                if (m && m.blob) img.src = URL.createObjectURL(m.blob);
                                else img.alt = 'media non trouvé';
                            } catch (e) { img.alt = 'erreur chargement'; }
                        } else {
                            img.alt = 'aucune source';
                        }

                        imgContainer.appendChild(img);
                        thumbs.appendChild(imgContainer);
                    }
                    photoWrap.appendChild(thumbs);
                } else {
                    photoWrap.innerHTML += '<div>Aucune photo</div>';
                }
                card.appendChild(photoWrap);

                // Videos
                const videoWrap = document.createElement('div');
                videoWrap.innerHTML = '<div><em>Vidéos:</em></div>';
                if (p.videos && p.videos.length) {
                    for (let v of p.videos) {
                        const vdiv = document.createElement('div');
                        vdiv.style.marginTop = '6px';
                        const vid = document.createElement('video');
                        vid.controls = true;
                        vid.style.maxWidth = '320px';
                        if (v.data) {
                            vid.src = v.data;
                        } else if (v.id) {
                            try {
                                const m = await MediaDB.getMedia(v.id);
                                if (m && m.blob) vid.src = URL.createObjectURL(m.blob);
                                else vdiv.textContent = 'media vidéo non trouvé';
                            } catch (e) { vdiv.textContent = 'erreur chargement vidéo'; }
                        }
                        vdiv.appendChild(vid);
                        if (v.name) {
                            const pName = document.createElement('div'); pName.textContent = v.name; vdiv.appendChild(pName);
                        }
                        videoWrap.appendChild(vdiv);
                    }
                } else {
                    videoWrap.innerHTML += '<div>Aucune vidéo</div>';
                }
                card.appendChild(videoWrap);

                // Music
                const musicWrap = document.createElement('div');
                musicWrap.innerHTML = '<div><em>Musique:</em></div>';
                if (p.music) {
                    const am = document.createElement('audio'); am.controls = true; am.style.display='block'; am.style.marginTop='6px';
                    if (p.music.data) {
                        am.src = p.music.data;
                    } else if (p.music.id) {
                        try {
                            const m = await MediaDB.getMedia(p.music.id);
                            if (m && m.blob) am.src = URL.createObjectURL(m.blob);
                            else musicWrap.appendChild(document.createTextNode('media musique non trouvé'));
                        } catch (e) { musicWrap.appendChild(document.createTextNode('erreur chargement musique')); }
                    }
                    musicWrap.appendChild(am);
                } else {
                    musicWrap.innerHTML += '<div>Aucune musique</div>';
                }
                card.appendChild(musicWrap);

                container.appendChild(card);
            }
        } catch (err) {
            container.innerHTML = '<div>Erreur lors du chargement des pages. Voir console.</div>';
            console.error('[NOVACOEUR] debug panel error', err);
        }
    });

    closeBtn.addEventListener('click', () => { modal.style.display = 'none'; container.innerHTML = ''; });
}

// Tab Navigation
function setupTabNavigation() {
    console.log('[NOVACOEUR] Configuration navigation onglets');
    const menuItems = document.querySelectorAll('.menu-item');
    
    if (menuItems.length === 0) {
        console.warn('[NOVACOEUR] Aucun menu-item trouvé!');
        return;
    }
    
    console.log(`[NOVACOEUR] ${menuItems.length} menu items trouvés`);
    
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const tab = item.dataset.tab;
            
            if (!tab) {
                console.error('[NOVACOEUR] data-tab manquant sur item');
                return;
            }
            
            console.log(`[NOVACOEUR] Affichage tab: ${tab}`);
            
            // Remove active from all menu items and tabs
            document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
            document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
            
            // Add active to current item and tab
            item.classList.add('active');
            const tabElement = document.getElementById(tab);
            if (tabElement) {
                tabElement.classList.add('active');
                console.log(`[NOVACOEUR] ✓ Tab ${tab} activé`);
                
                // Load pages when switching to manage-pages tab
                if (tab === 'manage-pages') {
                    console.log('[NOVACOEUR] Chargement des pages (onglet manage-pages)');
                    loadManagedPages();
                }
            } else {
                console.error(`[NOVACOEUR] Tab #${tab} non trouvé!`);
            }
        });
    });
}

// Dashboard Update
function updateDashboard() {
    const totalElement = document.getElementById('total-pages');
    const offer1Element = document.getElementById('count-offer-1');
    const offer2Element = document.getElementById('count-offer-2');
    const offer3Element = document.getElementById('count-offer-3');
    
    if (!totalElement || !offer1Element || !offer2Element || !offer3Element) {
        console.warn('[NOVACOEUR] Éléments dashboard manquants');
        return;
    }
    
    totalElement.textContent = DataStore.pages.length;
    offer1Element.textContent = DataStore.getPagesByOffer(1);
    offer2Element.textContent = DataStore.getPagesByOffer(2);
    offer3Element.textContent = DataStore.getPagesByOffer(3);
    console.log('[NOVACOEUR] ✓ Dashboard mis à jour');
}

// Quick action button
function setupFormHandlers() {
    console.log('[NOVACOEUR] Initialisation des gestionnaires de formulaire');
    
    // Setup quick button if it exists
    const quickBtn = document.getElementById('new-page-quick');
    if (quickBtn) {
        quickBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const newPageTab = document.querySelector('[data-tab="new-page"]');
            if (newPageTab) {
                newPageTab.click();
                console.log('[NOVACOEUR] Nouveau page cliqué');
            }
        });
        console.log('[NOVACOEUR] ✓ Bouton rapide configuré');
    } else {
        console.warn('[NOVACOEUR] Bouton new-page-quick non trouvé');
    }
    
    // Setup page form
    setupPageForm();
}

// ===== FORM HANDLING =====

const offerConfig = {
    1: { photos: 5, videos: 0, music: false },
    2: { photos: 15, videos: 1, music: true },
    3: { photos: 20, videos: 3, music: true }
};

function setupPageForm() {
    console.log('[NOVACOEUR] Initialisation formulaire nouvelle page');
    
    const form = document.getElementById('form-new-page');
    if (!form) {
        console.warn('[NOVACOEUR] Formulaire form-new-page non trouvé!');
        return;
    }
    
    console.log('[NOVACOEUR] ✓ Formulaire trouvé');
    
    // Disable HTML5 validation and handle manually
    form.setAttribute('novalidate', 'novalidate');
    
    const offerType = document.getElementById('offer-type');
    if (!offerType) {
        console.warn('[NOVACOEUR] Select offer-type non trouvé!');
        return;
    }

    console.log('[NOVACOEUR] ✓ Éléments formulaire trouvés');

    // Update form based on offer type
    offerType.addEventListener('change', (e) => {
        const offer = offerType.value;
        console.log(`[NOVACOEUR] Offre sélectionnée: ${offer}`);
        
        if (offer) {
            const config = offerConfig[offer];
            const videosSection = document.getElementById('videos-section');
            const musicSection = document.getElementById('music-section');
            
            if (videosSection) videosSection.style.display = config.videos > 0 ? 'block' : 'none';
            if (musicSection) musicSection.style.display = config.music ? 'block' : 'none';
            
            console.log(`[NOVACOEUR] ✓ Sections mises à jour pour offre ${offer}`);
        }
    });

    // Form Submit with manual validation
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('[NOVACOEUR] Soumission formulaire');
        
        const clientName = document.getElementById('client-name');
        const clientEmail = document.getElementById('client-email');
        const message = document.getElementById('message');
        
        // Manual validation
        if (!clientName || !clientName.value.trim()) {
            alert('Veuillez entrer le nom du client');
            if (clientName) clientName.focus();
            return;
        }
        
        if (!clientEmail || !clientEmail.value.trim()) {
            alert('Veuillez entrer l\'email du client');
            if (clientEmail) clientEmail.focus();
            return;
        }
        
        if (!offerType || !offerType.value) {
            alert('Veuillez sélectionner une offre');
            if (offerType) offerType.focus();
            return;
        }
        
        if (!message || !message.value.trim()) {
            alert('Veuillez entrer un message');
            if (message) message.focus();
            return;
        }
        
        // All validations passed
        console.log('[NOVACOEUR] ✓ Tous les champs validés');

        // Assemble media data from temporary storages
        const pageData = {
            clientName: clientName.value.trim(),
            clientEmail: clientEmail.value.trim(),
            offerType: parseInt(offerType.value),
            message: message.value.trim(),
            photos: (window._nova_selected_photos || []).map(p => ({ name: p.name, type: p.type, data: p.data })),
            videos: (window._nova_selected_videos || []).map(v => ({ name: v.name, type: v.type, data: v.data })),
            music: window._nova_selected_music ? { name: window._nova_selected_music.name, type: window._nova_selected_music.type, data: window._nova_selected_music.data } : null
        };

        try {
            const newPage = await DataStore.savePage(pageData);
            console.log('[NOVACOEUR] ✓ Page sauvegardée:', newPage);
            updateDashboard();
            alert('Page créée avec succès!');

            // Reset form and temporary storages
            form.reset();
            if (window.clearMediaPreviews) window.clearMediaPreviews();
            loadManagedPages();
        } catch (err) {
            console.error('[NOVACOEUR] Erreur sauvegarde page:', err);
            alert('Erreur lors de la création de la page (stockage). Essayez d\'effacer les données du localStorage ou de réduire la taille des fichiers.');
        }
    });
    
    console.log('[NOVACOEUR] ✓ Formulaire initialisé');
}

// --------------------
// Media handling helpers
// --------------------
function initMediaHandlers() {
    // Temporary storages on window so other functions can access in console if needed
    window._nova_selected_photos = window._nova_selected_photos || [];
    window._nova_selected_videos = window._nova_selected_videos || [];
    window._nova_selected_music = window._nova_selected_music || null;

    const photosInput = document.getElementById('photos-input');
    const uploadAreaPhotos = document.getElementById('upload-area-photos');
    const photosList = document.getElementById('photos-list');

    const videosInput = document.getElementById('videos-input');
    const uploadAreaVideos = document.getElementById('upload-area-videos');
    const videosList = document.getElementById('videos-list');

    const customMusicInput = document.getElementById('custom-music');
    const uploadAreaMusic = document.getElementById('upload-area-music');
    const customMusicDisplay = document.getElementById('custom-music-display');

    // Click to open file pickers
    if (uploadAreaPhotos && photosInput) uploadAreaPhotos.addEventListener('click', () => photosInput.click());
    if (uploadAreaVideos && videosInput) uploadAreaVideos.addEventListener('click', () => videosInput.click());
    if (uploadAreaMusic && customMusicInput) uploadAreaMusic.addEventListener('click', () => customMusicInput.click());

    // Drag & drop helpers
    function enableDragDrop(area, handler) {
        if (!area) return;
        area.addEventListener('dragover', (e) => { e.preventDefault(); area.classList.add('dragover'); });
        area.addEventListener('dragleave', (e) => { e.preventDefault(); area.classList.remove('dragover'); });
        area.addEventListener('drop', (e) => { e.preventDefault(); area.classList.remove('dragover'); handler(e.dataTransfer.files); });
    }

    enableDragDrop(uploadAreaPhotos, (files) => handleFiles(files, 'photo'));
    enableDragDrop(uploadAreaVideos, (files) => handleFiles(files, 'video'));
    enableDragDrop(uploadAreaMusic, (files) => handleFiles(files, 'music'));

    // File input change handlers
    if (photosInput) photosInput.addEventListener('change', (e) => handleFiles(e.target.files, 'photo'));
    if (videosInput) videosInput.addEventListener('change', (e) => handleFiles(e.target.files, 'video'));
    if (customMusicInput) customMusicInput.addEventListener('change', (e) => handleFiles(e.target.files, 'music'));

    function handleFiles(fileList, kind) {
        const files = Array.from(fileList || []);
        if (files.length === 0) return;

        const offer = document.getElementById('offer-type') ? document.getElementById('offer-type').value : null;
        const config = offerConfig[offer] || { photos: 5, videos: 0, music: false };

        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (evt) => {
                const data = evt.target.result;
                if (kind === 'photo') {
                    if (window._nova_selected_photos.length >= (config.photos || 5)) {
                        alert(`Nombre maximal de photos atteint (${config.photos})`);
                        return;
                    }
                    const obj = { name: file.name, type: file.type, size: file.size, data };
                    window._nova_selected_photos.push(obj);
                    addPhotoPreview(obj, photosList);
                } else if (kind === 'video') {
                    if ((config.videos || 0) === 0) { alert('Cette offre ne permet pas de télécharger de vidéo'); return; }
                    if (window._nova_selected_videos.length >= (config.videos || 1)) { alert(`Nombre maximal de vidéos atteint (${config.videos})`); return; }
                    const obj = { name: file.name, type: file.type, size: file.size, data };
                    window._nova_selected_videos.push(obj);
                    addVideoPreview(obj, videosList);
                } else if (kind === 'music') {
                    if (!config.music) { alert('Cette offre ne permet pas de musique personnalisée'); return; }
                    const obj = { name: file.name, type: file.type, size: file.size, data };
                    window._nova_selected_music = obj;
                    addMusicPreview(obj, customMusicDisplay);
                }
            };

            // Validate file type quickly
            reader.readAsDataURL(file);
        });
    }

    function addPhotoPreview(photoObj, container) {
        if (!container) return;
        const item = document.createElement('div');
        item.className = 'media-item photo-item';
        item.innerHTML = `
            <img src="${photoObj.data}" alt="${photoObj.name}" />
            <div class="media-meta">${photoObj.name}</div>
            <button class="btn-remove" title="Supprimer">&times;</button>
        `;
        const btn = item.querySelector('.btn-remove');
        btn.addEventListener('click', () => {
            const idx = window._nova_selected_photos.indexOf(photoObj);
            if (idx !== -1) window._nova_selected_photos.splice(idx, 1);
            item.remove();
        });
        container.appendChild(item);
    }

    function addVideoPreview(videoObj, container) {
        if (!container) return;
        const item = document.createElement('div');
        item.className = 'media-item video-item';
        item.innerHTML = `
            <video src="${videoObj.data}" controls preload="metadata" width="220"></video>
            <div class="media-meta">${videoObj.name}</div>
            <button class="btn-remove" title="Supprimer">&times;</button>
        `;
        const btn = item.querySelector('.btn-remove');
        btn.addEventListener('click', () => {
            const idx = window._nova_selected_videos.indexOf(videoObj);
            if (idx !== -1) window._nova_selected_videos.splice(idx, 1);
            item.remove();
        });
        container.appendChild(item);
    }

    function addMusicPreview(musicObj, container) {
        if (!container) return;
        container.innerHTML = '';
        const item = document.createElement('div');
        item.className = 'media-item music-item';
        item.innerHTML = `
            <audio src="${musicObj.data}" controls preload="metadata"></audio>
            <div class="media-meta">${musicObj.name}</div>
            <button class="btn-remove" title="Supprimer">&times;</button>
        `;
        const btn = item.querySelector('.btn-remove');
        btn.addEventListener('click', () => {
            window._nova_selected_music = null;
            item.remove();
        });
        container.appendChild(item);
    }

    window.clearMediaPreviews = function() {
        window._nova_selected_photos = [];
        window._nova_selected_videos = [];
        window._nova_selected_music = null;
        if (photosList) photosList.innerHTML = '';
        if (videosList) videosList.innerHTML = '';
        if (customMusicDisplay) customMusicDisplay.innerHTML = '';
    };

    // Preview button (renders a quick preview using selected media)
    const previewBtn = document.getElementById('preview-btn');
    if (previewBtn) {
        previewBtn.addEventListener('click', () => {
            const previewModal = document.getElementById('preview-modal');
            const previewContainer = document.getElementById('preview-container');
            if (!previewModal || !previewContainer) return;
            previewContainer.innerHTML = '';

            const title = document.createElement('h2');
            title.textContent = document.getElementById('client-name').value || 'Aperçu Page d\'amour';
            previewContainer.appendChild(title);

            const msg = document.createElement('p');
            msg.textContent = document.getElementById('message').value || '';
            previewContainer.appendChild(msg);

            // Photos
            const photos = window._nova_selected_photos || [];
            if (photos.length) {
                const gallery = document.createElement('div');
                gallery.className = 'preview-gallery';
                photos.forEach(p => {
                    const img = document.createElement('img');
                    img.src = p.data;
                    img.alt = p.name;
                    gallery.appendChild(img);
                });
                previewContainer.appendChild(gallery);
            }

            // Videos
            const videos = window._nova_selected_videos || [];
            if (videos.length) {
                videos.forEach(v => {
                    const vid = document.createElement('video');
                    vid.src = v.data;
                    vid.controls = true;
                    vid.width = 480;
                    previewContainer.appendChild(vid);
                });
            }

            // Music
            if (window._nova_selected_music) {
                const a = document.createElement('audio');
                a.src = window._nova_selected_music.data;
                a.controls = true;
                a.autoplay = false;
                previewContainer.appendChild(a);
            }

            previewModal.style.display = 'block';
            const closeBtn = document.getElementById('close-preview');
            if (closeBtn) closeBtn.addEventListener('click', () => previewModal.style.display = 'none');
        });
    }
}

// Initialize media handlers on script load (if admin is visible)
document.addEventListener('DOMContentLoaded', async () => {
    try { initMediaHandlers(); } catch (e) { console.warn('[NOVACOEUR] initMediaHandlers failed', e); }
    try {
        await waitForAPI();
        await DataStore.loadPages();
        loadManagedPages();
    } catch (e) { console.warn('[NOVACOEUR] Erreur chargement pages API', e); }
});

// Load Managed Pages
async function loadManagedPages() {
    console.log('[NOVACOEUR] Chargement des pages gérées');
    
    const pagesList = document.getElementById('pages-list');
    if (!pagesList) {
        console.warn('[NOVACOEUR] Element pages-list non trouvé!');
        return;
    }
    
    const pages = DataStore.getAllPages();
    console.log(`[NOVACOEUR] ${pages.length} pages trouvées`);
    
    if (pages.length === 0) {
        pagesList.innerHTML = '<p class="no-data">Aucune page créée pour le moment</p>';
        console.log('[NOVACOEUR] ✓ Aucune page - affichage message');
        return;
    }
    
    pagesList.innerHTML = pages.map(page => {
        const offerNames = {
            1: 'Éclat Simple',
            2: 'Émotion Complète',
            3: 'Infini Amoureux'
        };
        
        const date = new Date(page.createdAt).toLocaleDateString('fr-FR');
        const pageUrl = `love-page.html?id=${page.id}`;
        
        return `
            <div class="page-card">
                <div class="page-header">
                    <div>
                        <h3>${page.clientName}</h3>
                        <p class="page-date">Créée le ${date}</p>
                    </div>
                    <span class="offer-badge">${offerNames[page.offerType]}</span>
                </div>
                <div class="page-details">
                    <p><strong>Email:</strong> ${page.clientEmail}</p>
                    <p><strong>Photos:</strong> ${page.photos.length}</p>
                    <p><strong>Vidéos:</strong> ${page.videos.length}</p>
                </div>
                <div class="page-actions">
                    <button class="btn btn-small btn-info" onclick="window.open('${pageUrl}')">
                        <i class="fas fa-eye"></i> Voir
                    </button>
                    <button class="btn btn-small btn-secondary" onclick="editPage(${page.id})">
                        <i class="fas fa-edit"></i> Modifier
                    </button>
                    <button class="btn btn-small btn-danger" onclick="deletePage(${page.id})">
                        <i class="fas fa-trash"></i> Supprimer
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    console.log('[NOVACOEUR] ✓ Pages chargées et affichées');
}

// Delete Page
function deletePage(id) {
    console.log(`[NOVACOEUR] Suppression page ${id}`);
    
    if (confirm('Êtes-vous sûr de vouloir supprimer cette page?')) {
        try {
            DataStore.deletePage(id);
            console.log(`[NOVACOEUR] ✓ Page ${id} supprimée de la DB`);
            
            updateDashboard();
            loadManagedPages();
            
            alert('Page supprimée avec succès');
            console.log('[NOVACOEUR] ✓ Interface mise à jour après suppression');
        } catch (err) {
            console.error('[NOVACOEUR] Erreur suppression:', err);
            alert('Erreur lors de la suppression');
        }
    }
}

// Edit Page (placeholder)
function editPage(id) {
    console.log(`[NOVACOEUR] Édition page ${id}`);
    
    const page = DataStore.getPage(id);
    if (page) {
        console.log('[NOVACOEUR] ✓ Page trouvée:', page);
        alert('Fonction de modification en cours de développement');
    } else {
        console.warn(`[NOVACOEUR] Page ${id} non trouvée`);
    }
}

// Logout
function setupLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    if (!logoutBtn) {
        console.warn('[NOVACOEUR] Bouton logout non trouvé!');
        return;
    }
    
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('[NOVACOEUR] Déconnexion');
        
        SessionManager.endSession();
        console.log('[NOVACOEUR] ✓ Session terminée');
        
        const loginModal = document.getElementById('login-modal');
        const adminInterface = document.getElementById('admin-interface');
        const loginForm = document.getElementById('login-form');
        const loginError = document.getElementById('login-error');
        
        if (loginModal) loginModal.style.display = 'flex';
        if (adminInterface) adminInterface.style.display = 'none';
        if (loginForm) loginForm.reset();
        if (loginError) loginError.style.display = 'none';
        
        console.log('[NOVACOEUR] ✓ Interface réinitialisée pour connexion');
    });
    
    console.log('[NOVACOEUR] ✓ Logout handler configuré');
}

// ===== EXPOSITION GLOBALE =====
// Rendre les objets essentiels accessibles à d'autres scripts
window.ADMIN_CONFIG = {
    AUTH_CREDENTIALS: AUTH_CREDENTIALS,
    SESSION_KEY: SESSION_KEY,
    SESSION_TIMEOUT: SESSION_TIMEOUT,
    SessionManager: SessionManager
};

// Logs de confirmation
console.log('✅ [NOVACOEUR] admin.js chargé');
console.log('✅ [NOVACOEUR] SessionManager disponible globalement');
