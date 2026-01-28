/**
 * ===== LOVE PAGE DISPLAY =====
 * Gère l'affichage des pages d'amour créées
 */

// IndexedDB helper (compatible avec admin.js storage)
const MediaDB = {
    dbName: 'novacoeur_db',
    dbVersion: 1,
    
    open: function() {
        return new Promise((resolve, reject) => {
            const req = indexedDB.open(this.dbName, this.dbVersion);
            req.onupgradeneeded = (e) => {
                e.target.result.createObjectStore('media', { keyPath: 'id' });
            };
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    },
    
    getMedia: async function(id) {
        try {
            const db = await this.open();
            return new Promise((resolve, reject) => {
                const tx = db.transaction('media', 'readonly');
                const store = tx.objectStore('media');
                const r = store.get(id);
                r.onsuccess = () => resolve(r.result);
                r.onerror = () => reject(r.error);
            });
        } catch (err) {
            console.error('❌ Erreur MediaDB:', err);
            return null;
        }
    }
};

// Obtenir l'ID de la page depuis l'URL
const urlParams = new URLSearchParams(window.location.search);
const pageId = urlParams.get('id');

// Vérifier que l'ID existe
if (!pageId) {
    document.body.innerHTML = `
        <div style="text-align:center; padding:50px; font-family:Montserrat, sans-serif;">
            <h2>❌ Page non trouvée</h2>
            <p>L'identifiant de la page est manquant.</p>
            <a href="index.html" style="color:#ff1a52; text-decoration:none;">← Retour à l'accueil</a>
        </div>
    `;
}

// Attendre que API_BASE_URL soit défini
async function waitForAPI() {
    let retries = 0;
    while (!window.API_BASE_URL && retries < 10) {
        await new Promise(r => setTimeout(r, 100));
        retries++;
    }
    if (!window.API_BASE_URL) {
        console.error('❌ [NOVACOEUR] API_BASE_URL non défini après 1s');
        window.API_BASE_URL = `${window.location.protocol}//${window.location.host}`;
        console.log('✅ [NOVACOEUR] API_BASE_URL par défaut:', window.API_BASE_URL);
    }
}

// Charger les données de la page depuis l'API
async function loadPageData() {
    try {
        if (!window.API_BASE_URL) {
            throw new Error('API_BASE_URL non configurée');
        }
        console.log('📡 [NOVACOEUR] Chargement page:', `${window.API_BASE_URL}/api/pages/${pageId}`);
        const res = await fetch(`${window.API_BASE_URL}/api/pages/${pageId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const response = await res.json();
        const pageData = response.data;
        
        if (!pageData) {
            document.body.innerHTML = `
                <div style="text-align:center; padding:50px; font-family:Montserrat, sans-serif;">
                    <h2>❌ Page non trouvée</h2>
                    <p>La page demandée n'existe pas.</p>
                    <a href="index.html" style="color:#ff1a52; text-decoration:none;">← Retour à l'accueil</a>
                </div>
            `;
            return null;
        }
        
        console.log('✅ Page chargée:', pageData);
        return pageData;
    } catch (err) {
        console.error('❌ Erreur chargement:', err.message);
        document.body.innerHTML = `
            <div style="text-align:center; padding:50px; font-family:Montserrat, sans-serif;">
                <h2>❌ Erreur de chargement</h2>
                <p>${err.message}</p>
                <a href="index.html" style="color:#ff1a52; text-decoration:none;">← Retour à l'accueil</a>
            </div>
        `;
        return null;
    }
}

let pageData = null;

// Initialiser au chargement du DOM
async function initializePage() {
    console.log('⏳ [NOVACOEUR] Initialisation page...');
    await waitForAPI();
    pageData = await loadPageData();
    
    if (pageData) {
        displayLovePage(pageData);
        console.log('✅ Page initialisée avec succès');
    } else {
        console.error('❌ Impossible d\'initialiser la page');
    }
}

// Initialiser quand le DOM est prêt
document.addEventListener('DOMContentLoaded', initializePage);

function displayLovePage(data) {
    // Update title and subtitle in hero
    document.getElementById('page-title').textContent = 'Notre histoire';
    document.title = `${data.clientName} - NOVACOEUR`;
    
    // Display client name in showcase section
    document.getElementById('client-display-name').textContent = `${data.clientName} ❤️`;
    
    // Display message
    document.getElementById('love-message').textContent = data.message;
    
    // Display offer badge
    const offerNames = {
        1: 'Éclat Simple',
        2: 'Émotion Complète',
        3: 'Infini Amoureux'
    };
    document.getElementById('offer-badge').textContent = `Offre ${data.offerType} - ${offerNames[data.offerType]}`;
    
    // Display photos
    if (data.photos && data.photos.length > 0) {
        displayPhotos(data.photos);
    }
    
    // Display videos
    if (data.videos && data.videos.length > 0) {
        document.getElementById('videos-section').style.display = 'block';
        displayVideos(data.videos);
    }
    
    // Display music
    if (data.music) {
        document.getElementById('music-section').style.display = 'block';
        displayMusic(data.music);
    }
}

// Display Photos
async function displayPhotos(photos) {
    const gallery = document.getElementById('photos-gallery');
    gallery.innerHTML = '';

    for (let index = 0; index < photos.length; index++) {
        const photo = photos[index];
        let src = null;

        if (photo.data) {
            src = photo.data;
        } else if (photo.id) {
            try {
                const m = await MediaDB.getMedia(photo.id);
                if (m && m.blob) src = URL.createObjectURL(m.blob);
            } catch (e) {
                console.warn('[NOVACOEUR] Impossible de charger media photo', photo.id, e);
            }
        }

        if (!src) continue;

        // normalize to data property for compatibility with lightbox
        photo.data = src;

        const photoItem = document.createElement('div');
        photoItem.className = 'gallery-item';
        photoItem.innerHTML = `
            <img src="${src}" alt="Photo ${index + 1}" data-index="${index}">
        `;
        photoItem.addEventListener('click', () => openLightbox(index, photos));
        gallery.appendChild(photoItem);
    }
}

// Lightbox
let currentPhotoIndex = 0;
let currentPhotos = [];

function openLightbox(index, photos) {
    currentPhotoIndex = index;
    currentPhotos = photos;
    
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    
    lightboxImg.src = photos[index].data;
    lightbox.style.display = 'flex';
}

const lightboxClose = document.querySelector('.lightbox-premium-close');
if (lightboxClose) {
    lightboxClose.addEventListener('click', () => {
        document.getElementById('lightbox').style.display = 'none';
    });
}

const lightboxPrev = document.querySelector('.lightbox-premium-prev');
if (lightboxPrev) {
    lightboxPrev.addEventListener('click', () => {
        currentPhotoIndex = (currentPhotoIndex - 1 + currentPhotos.length) % currentPhotos.length;
        document.getElementById('lightbox-img').src = currentPhotos[currentPhotoIndex].data;
    });
}

const lightboxNext = document.querySelector('.lightbox-premium-next');
if (lightboxNext) {
    lightboxNext.addEventListener('click', () => {
        currentPhotoIndex = (currentPhotoIndex + 1) % currentPhotos.length;
        document.getElementById('lightbox-img').src = currentPhotos[currentPhotoIndex].data;
    });
}

// Keyboard navigation for lightbox
document.addEventListener('keydown', (e) => {
    if (document.getElementById('lightbox').style.display === 'flex') {
        if (e.key === 'ArrowLeft') {
            document.querySelector('.lightbox-prev').click();
        } else if (e.key === 'ArrowRight') {
            document.querySelector('.lightbox-next').click();
        } else if (e.key === 'Escape') {
            document.querySelector('.lightbox-close').click();
        }
    }
});

// Display Videos
async function displayVideos(videos) {
    const container = document.getElementById('videos-container');
    container.innerHTML = '';

    for (let i = 0; i < videos.length; i++) {
        const video = videos[i];
        let src = null;

        if (video.data) {
            src = video.data;
        } else if (video.id) {
            try {
                const m = await MediaDB.getMedia(video.id);
                if (m && m.blob) src = URL.createObjectURL(m.blob);
            } catch (e) {
                console.warn('[NOVACOEUR] Impossible de charger media video', video.id, e);
            }
        }

        if (!src) continue;
        video.data = src;

        const videoItem = document.createElement('div');
        videoItem.className = 'video-item';
        videoItem.innerHTML = `
            <video controls>
                <source src="${src}" type="video/mp4">
                Votre navigateur ne supporte pas la lecture vidéo.
            </video>
            <p>${video.name || ''}</p>
        `;
        container.appendChild(videoItem);
    }
}

// Display Music
function displayMusic(music) {
    if (!music) return; // Exit if no music

    const audioElement = document.getElementById('background-music');
    const musicSection = document.getElementById('music-section');
    if (!audioElement || !musicSection) return;

    // If music.data available use it, otherwise try to fetch by id from IndexedDB
    if (music.data) {
        audioElement.src = music.data;
        musicSection.style.display = 'block';
        tryPlayAudio(audioElement);
        return;
    }

    if (music.id) {
        MediaDB.getMedia(music.id).then(m => {
            if (m && m.blob) {
                audioElement.src = URL.createObjectURL(m.blob);
                musicSection.style.display = 'block';
                tryPlayAudio(audioElement);
            } else {
                musicSection.style.display = 'none';
            }
        }).catch(e => {
            console.warn('[NOVACOEUR] Impossible de charger musique', e);
            musicSection.style.display = 'none';
        });
    } else {
        musicSection.style.display = 'none';
    }
}

// Try to play audio and provide a fallback UI if autoplay is blocked by the browser
function tryPlayAudio(audioElem) {
    if (!audioElem) return;
    // Best-effort: attempt to play. Browsers may block; if blocked, show an activation button.
    const p = audioElem.play();
    if (p !== undefined) {
        p.then(() => {
            console.log('[NOVACOEUR] Musique lancée automatiquement');
        }).catch((err) => {
            console.warn('[NOVACOEUR] Autoplay bloqué:', err);
            // Try muted autoplay as a fallback (some browsers allow muted autoplay)
            audioElem.muted = true;
            audioElem.play().then(() => {
                console.log('[NOVACOEUR] Musique muette lancée automatiquement (muted autoplay)');
                // Show unmute button to let user enable sound
                showUnmuteButton(audioElem);
            }).catch((err2) => {
                console.warn('[NOVACOEUR] Muted autoplay échoué:', err2);
                // Show a prominent overlay to request a user gesture
                showPlayOverlay(audioElem);
            });
        });
    }
    // Also try again on first user interaction (some browsers allow play after interaction)
    function onFirstInteraction() {
        document.removeEventListener('click', onFirstInteraction);
        audioElem.play().then(()=>console.log('[NOVACOEUR] Musique lancée après interaction')).catch(()=>{});
    }
    document.addEventListener('click', onFirstInteraction, { once: true });
}

// Try to trigger play on a variety of user interactions (click, touch, scroll, key)
function attemptPlayOnInteraction(audioElem) {
    if (!audioElem) return;
    const tryPlay = () => {
        audioElem.play().then(() => {
            console.log('[NOVACOEUR] Musique lancée via interaction');
            removeListeners();
        }).catch(() => {});
    };

    const events = ['pointerdown', 'touchstart', 'scroll', 'keydown', 'click'];
    function removeListeners() {
        events.forEach(ev => document.removeEventListener(ev, tryPlay));
    }

    events.forEach(ev => document.addEventListener(ev, tryPlay, { once: true }));
}

function showMusicActivationButton(audioElem) {
    // If button already exists, don't add another
    if (document.getElementById('music-activate-btn')) return;
    const btn = document.createElement('button');
    btn.id = 'music-activate-btn';
    btn.textContent = 'Activer la musique';
    btn.style.position = 'fixed';
    btn.style.bottom = '18px';
    btn.style.right = '18px';
    btn.style.zIndex = '9999';
    btn.style.padding = '10px 14px';
    btn.style.background = '#ff4d6d';
    btn.style.color = '#fff';
    btn.style.border = 'none';
    btn.style.borderRadius = '6px';
    btn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
    btn.style.cursor = 'pointer';
    btn.addEventListener('click', () => {
        audioElem.play().then(() => {
            btn.remove();
        }).catch((e) => {
            console.warn('[NOVACOEUR] Impossible de lancer la musique après clic:', e);
        });
    });
    document.body.appendChild(btn);
}

// Full-screen overlay prompting the user to tap/click to start music (works around autoplay rules)
function showPlayOverlay(audioElem) {
    if (!audioElem) return;
    // Avoid duplicate overlays
    if (document.getElementById('music-play-overlay')) return;

    // Remove small activation/unmute buttons if present
    const small = document.getElementById('music-activate-btn'); if (small) small.remove();
    const unmute = document.getElementById('music-unmute-btn'); if (unmute) unmute.remove();

    const overlay = document.createElement('div');
    overlay.id = 'music-play-overlay';
    overlay.style.position = 'fixed';
    overlay.style.left = '0';
    overlay.style.top = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.background = 'linear-gradient(180deg, rgba(0,0,0,0.6), rgba(0,0,0,0.7))';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '100000';

    const box = document.createElement('div');
    box.style.textAlign = 'center';
    box.style.color = '#fff';
    box.style.maxWidth = '90%';
    box.style.padding = '24px';

    const title = document.createElement('h2');
    title.textContent = "Appuyez pour activer la musique";
    title.style.marginBottom = '12px';
    title.style.fontSize = '24px';

    const hint = document.createElement('p');
    hint.textContent = 'Votre navigateur bloque la lecture automatique. Un geste de votre part est nécessaire pour démarrer la bande sonore.';
    hint.style.marginBottom = '20px';
    hint.style.opacity = '0.95';

    const btn = document.createElement('button');
    btn.textContent = 'Jouer la musique';
    btn.style.padding = '12px 22px';
    btn.style.fontSize = '16px';
    btn.style.border = 'none';
    btn.style.borderRadius = '8px';
    btn.style.background = '#ff4d6d';
    btn.style.color = '#fff';
    btn.style.cursor = 'pointer';

    btn.addEventListener('click', async () => {
        try {
            // Unmute if muted
            audioElem.muted = false;
            await audioElem.play();
            overlay.remove();
            console.log('[NOVACOEUR] Musique lancée via overlay');
        } catch (e) {
            console.warn('[NOVACOEUR] Impossible de lancer la musique via overlay', e);
        }
    });

    box.appendChild(title);
    box.appendChild(hint);
    box.appendChild(btn);
    overlay.appendChild(box);
    document.body.appendChild(overlay);

    // Also try to start on any interaction with the overlay area
    overlay.addEventListener('pointerdown', async () => {
        try { await audioElem.play(); overlay.remove(); } catch(e){}
    }, { once: true });
}

function showUnmuteButton(audioElem) {
    if (!audioElem) return;
    if (document.getElementById('music-unmute-btn')) return;
    const btn = document.createElement('button');
    btn.id = 'music-unmute-btn';
    btn.textContent = 'Activer le son';
    btn.style.position = 'fixed';
    btn.style.bottom = '18px';
    btn.style.right = '18px';
    btn.style.zIndex = '9999';
    btn.style.padding = '10px 14px';
    btn.style.background = '#ff4d6d';
    btn.style.color = '#fff';
    btn.style.border = 'none';
    btn.style.borderRadius = '6px';
    btn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
    btn.style.cursor = 'pointer';
    btn.addEventListener('click', () => {
        audioElem.muted = false;
        audioElem.play().then(() => {
            btn.remove();
        }).catch((e) => {
            console.warn('[NOVACOEUR] Impossible de lancer la musique après démutage:', e);
        });
    });
    // Remove activation button if present
    const existing = document.getElementById('music-activate-btn');
    if (existing) existing.remove();
    document.body.appendChild(btn);
}

// Add animations on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.section-title, .message-box, .gallery-item').forEach(el => {
    observer.observe(el);
});

// Share functionality
document.addEventListener('DOMContentLoaded', async () => {
    // Re-initialize page if not already loaded (e.g., if DOMContentLoaded fired before script load)
    if (!pageData) {
        pageData = await loadPageData();
        if (pageData) displayLovePage(pageData);
    }
    
    // Check if share API is available
    if (navigator.share) {
        const shareBtn = document.getElementById('share-btn');
        if (shareBtn) {
            shareBtn.style.display = 'block';
            shareBtn.addEventListener('click', async () => {
                try {
                    await navigator.share({
                        title: `${document.getElementById('client-display-name').textContent.replace(' \u2764\ufe0f', '')} - NOVACOEUR`,
                        text: 'Découvrez notre histoire d\'amour sur NOVACOEUR',
                        url: window.location.href
                    });
                } catch (err) {
                    console.log('Partage annulé');
                }
            });
        }
    }
});
