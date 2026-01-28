/**
 * Configuration NOVACOEUR
 * Fichier de paramètres centralisé pour personnaliser le système
 */

// ===== API CONFIGURATION =====
// Détecter si on est en local ou en production
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
let API_BASE_URL = isLocalhost 
    ? 'http://localhost:3001'
    : `${window.location.protocol}//${window.location.host}`;

if (!API_BASE_URL || API_BASE_URL === 'undefined') {
    API_BASE_URL = `${window.location.protocol}//${window.location.host}`;
}

// Rendre API_BASE_URL disponible globalement
window.API_BASE_URL = API_BASE_URL;
console.log('✅ [NOVACOEUR] API_BASE_URL:', window.API_BASE_URL);
console.log('✅ [NOVACOEUR] Location:', window.location.href);

// ===== CONFIGURATION PRINCIPALE =====

const CONFIG = {
    // Informations de l'entreprise
    COMPANY: {
        name: 'NOVACOEUR',
        tagline: 'L\'art numérique de l\'amour',
        email: 'bedelziregis@gmail.com',
        whatsapp: '2250564896589',
        year: 2026
    },

    // Couleurs principales
    COLORS: {
        primary: '#ff1a52',
        primaryDark: '#d91e3a',
        secondary: '#f0f0f0',
        text: '#111111',
        textLight: '#666666',
        textLighter: '#999999',
        border: '#eeeeee'
    },

    // Configuration des offres
    OFFERS: {
        1: {
            id: 1,
            name: 'Éclat Simple',
            price: 7000,
            currency: 'FCFA',
            features: {
                message: true,
                photos: 5,
                videos: 0,
                music: false
            },
            description: 'Une déclaration simple et élégante',
            badge: 'Populaire'
        },
        2: {
            id: 2,
            name: 'Émotion Complète',
            price: 10000,
            currency: 'FCFA',
            features: {
                message: true,
                photos: 15,
                videos: 1,
                music: true
            },
            description: 'L\'expérience émotionnelle complète',
            badge: 'Recommandé'
        },
        3: {
            id: 3,
            name: 'Infini Amoureux',
            price: 18000,
            currency: 'FCFA',
            features: {
                message: true,
                photos: 20,
                videos: 3,
                music: true
            },
            description: 'L\'expérience ultime de l\'amour',
            badge: 'Premium'
        }
    },

    // Musiques présélectionnées
    MUSIC_PRESETS: [
        {
            id: 'music1',
            name: 'Romantique Douce',
            file: 'assets/music/romantic.mp3'
        },
        {
            id: 'music2',
            name: 'Passion Éternelle',
            file: 'assets/music/passion.mp3'
        },
        {
            id: 'music3',
            name: 'Amour Infini',
            file: 'assets/music/infinite.mp3'
        }
    ],

    // Limites et restrictions
    LIMITS: {
        messageMaxChars: 500,
        fileMaxSizeMB: 50,
        photosMaxSize: 5, // MB
        videosMaxSize: 50, // MB
        musicMaxSize: 20 // MB
    },

    // Messages et textes
    MESSAGES: {
        successPageCreated: 'Page créée avec succès!',
        errorSelectOffer: 'Veuillez sélectionner une offre',
        errorEmptyMessage: 'Veuillez entrer un message',
        errorMaxPhotos: 'Nombre maximum de photos dépassé',
        errorMaxVideos: 'Nombre maximum de vidéos dépassé',
        deleteConfirm: 'Êtes-vous sûr de vouloir supprimer cette page?',
        deletedSuccess: 'Page supprimée avec succès'
    },

    // Formats acceptés
    FORMATS: {
        photos: ['image/jpeg', 'image/png', 'image/webp'],
        videos: ['video/mp4', 'video/webm'],
        music: ['audio/mpeg', 'audio/wav', 'audio/x-m4a']
    }
};

// ===== FUNCTIONS UTILITAIRES =====

/**
 * Obtenir la configuration d'une offre spécifique
 * @param {number} offerId - ID de l'offre (1, 2 ou 3)
 * @returns {object} Configuration de l'offre
 */
function getOfferConfig(offerId) {
    return CONFIG.OFFERS[offerId] || null;
}

/**
 * Obtenir le nombre maximum de fichiers pour un type donné
 * @param {number} offerId - ID de l'offre
 * @param {string} type - 'photos', 'videos', ou 'music'
 * @returns {number} Nombre maximum
 */
function getMaxFiles(offerId, type) {
    const offer = getOfferConfig(offerId);
    if (!offer) return 0;
    return offer.features[type] || 0;
}

/**
 * Vérifier si un fichier est valide
 * @param {File} file - Le fichier à vérifier
 * @param {string} type - 'photos', 'videos', ou 'music'
 * @returns {boolean} True si valide
 */
function isValidFileType(file, type) {
    return CONFIG.FORMATS[type].includes(file.type);
}

/**
 * Formatter la taille de fichier en MB
 * @param {number} bytes - Taille en bytes
 * @returns {string} Taille formatée
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Générer un ID unique pour une page
 * @returns {string} ID unique
 */
function generatePageId() {
    return Date.now().toString();
}

/**
 * Formater une date
 * @param {string} isoDate - Date ISO
 * @returns {string} Date formatée
 */
function formatDate(isoDate) {
    return new Date(isoDate).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Convertir offre ID en texte lisible
 * @param {number} offerId - ID de l'offre
 * @returns {string} Texte lisible
 */
function getOfferName(offerId) {
    const offer = getOfferConfig(offerId);
    return offer ? offer.name : 'Offre inconnue';
}

// Make CONFIG available globally
window.CONFIG = CONFIG;
console.log('✅ [NOVACOEUR] CONFIG chargée avec succès');
