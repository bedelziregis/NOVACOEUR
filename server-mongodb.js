/**
 * NOVACOEUR Backend API v3 - MongoDB Edition
 * Node.js/Express server with MongoDB database
 * Système automatisé de génération de love pages et codes QR
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

const app = express();
const PORT = process.env.PORT || 5500;
const DOMAIN = process.env.DOMAIN || 'http://localhost:5500';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/novacoeur';

// Import Models
const LovePage = require('./models/LovePage');

// ===== CONNEXION MONGODB =====
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;

let effectiveUri = MONGODB_URI;

try {
    // If DB_USER/DB_PASS provided, construct URI with encoded password (safer than embedding raw password)
    if (DB_USER && DB_PASS) {
        const encodedPass = encodeURIComponent(DB_PASS);
        if (effectiveUri && effectiveUri.startsWith('mongodb')) {
            const prefixIndex = effectiveUri.indexOf('//');
            const prefix = prefixIndex !== -1 ? effectiveUri.slice(0, prefixIndex + 2) : 'mongodb://';
            const rest = prefixIndex !== -1 ? effectiveUri.slice(prefixIndex + 2) : effectiveUri;
            const atIndex = rest.indexOf('@');
            const hostAndParams = atIndex !== -1 ? rest.slice(atIndex + 1) : rest;
            effectiveUri = `${prefix}${DB_USER}:${encodedPass}@${hostAndParams}`;
        } else {
            effectiveUri = `mongodb://${DB_USER}:${encodedPass}@localhost:27017/novacoeur`;
        }
        console.log('ℹ️  [NOVACOEUR] Utilisation de DB_USER/DB_PASS fournis via les variables d\'environnement (mot de passe encodé).');
    } else {
        // Fallback: if the URI contains an unencoded password with extra '@', attempt to encode it
        if (effectiveUri && effectiveUri.startsWith('mongodb')) {
            const prefixIndex = effectiveUri.indexOf('//');
            if (prefixIndex !== -1) {
                const prefix = effectiveUri.slice(0, prefixIndex + 2);
                const rest = effectiveUri.slice(prefixIndex + 2);
                const firstAt = rest.indexOf('@');
                const lastAt = rest.lastIndexOf('@');
                if (firstAt !== -1 && lastAt !== firstAt) {
                    const credentials = rest.slice(0, lastAt);
                    const hostAndParams = rest.slice(lastAt + 1);
                    const colonIndex = credentials.indexOf(':');
                    if (colonIndex !== -1) {
                        const user = credentials.slice(0, colonIndex);
                        const pass = credentials.slice(colonIndex + 1);
                        const encodedPass = encodeURIComponent(pass);
                        effectiveUri = `${prefix}${user}:${encodedPass}@${hostAndParams}`;
                        console.log('ℹ️  [NOVACOEUR] Mot de passe Mongo détecté avec caractères spéciaux — encodage appliqué.');
                    }
                }
            }
        }
    }
} catch (procErr) {
    console.warn('⚠️  [NOVACOEUR] Erreur lors du traitement de la chaîne Mongo:', procErr.message);
}

mongoose.connect(effectiveUri)
.then(() => {
    console.log('✅ [NOVACOEUR] Connecté à MongoDB');
})
.catch(err => {
    console.error('❌ [NOVACOEUR] Erreur MongoDB:', err.message);
    console.warn('⚠️  Fonctionnement sans MongoDB (mode fallback)');
    console.warn('ℹ️  Astuce: si votre mot de passe contient des caractères spéciaux (ex: @), encodez-les dans la chaîne de connexion (ex: @ -> %40) ou fournissez `DB_USER`/`DB_PASS` séparés.');
});

// Security & CORS Middleware
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// Serve static files
app.use(express.static(path.join(__dirname)));

// Directory for QR codes
const qrDir = path.join(__dirname, 'data', 'qrcodes');
if (!fs.existsSync(qrDir)) {
    fs.mkdirSync(qrDir, { recursive: true });
}

// ===== VALIDATION =====
function validatePageData(pageData) {
    if (!pageData || typeof pageData !== 'object') {
        return { valid: false, error: 'Données invalides' };
    }
    if (!pageData.clientName || typeof pageData.clientName !== 'string' || pageData.clientName.trim().length === 0) {
        return { valid: false, error: 'Le nom du client est requis' };
    }
    if (!pageData.message || typeof pageData.message !== 'string' || pageData.message.trim().length === 0) {
        return { valid: false, error: 'Le message est requis' };
    }
    if (!pageData.offer) {
        return { valid: false, error: 'L\'offre est requise' };
    }
    return { valid: true };
}

// ===== API ENDPOINTS =====

/**
 * GET /api/pages
 * Récupérer toutes les pages
 */
app.get('/api/pages', async (req, res) => {
    try {
        const pages = await LovePage.find({ status: { $ne: 'deleted' } }).sort({ createdAt: -1 });
        res.json({
            success: true,
            data: pages
        });
    } catch (err) {
        console.error('❌ Erreur lecture pages:', err.message);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la lecture des pages'
        });
    }
});

/**
 * GET /api/pages/:id
 * Récupérer une page spécifique
 */
app.get('/api/pages/:id', async (req, res) => {
    try {
        const page = await LovePage.findOne({ id: parseInt(req.params.id) });
        if (!page) {
            return res.status(404).json({
                success: false,
                error: 'Page non trouvée'
            });
        }
        res.json({
            success: true,
            data: page
        });
    } catch (err) {
        console.error('❌ Erreur lecture page:', err.message);
        res.status(500).json({
            success: false,
            error: 'Erreur serveur'
        });
    }
});

/**
 * POST /api/pages
 * Créer une nouvelle page
 */
app.post('/api/pages', async (req, res) => {
    try {
        const validation = validatePageData(req.body);
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                error: validation.error
            });
        }

        const newPage = new LovePage({
            id: Date.now(),
            clientName: req.body.clientName.trim(),
            clientEmail: req.body.clientEmail || '',
            phoneNumber: req.body.phoneNumber || '',
            message: req.body.message.trim(),
            offer: req.body.offer,
            status: 'active'
        });

        await newPage.save();
        
        res.status(201).json({
            success: true,
            message: 'Page créée avec succès',
            data: newPage
        });
    } catch (err) {
        console.error('❌ Erreur création page:', err.message);
        res.status(500).json({
            success: false,
            error: 'Erreur serveur'
        });
    }
});

/**
 * PUT /api/pages/:id
 * Modifier une page existante
 */
app.put('/api/pages/:id', async (req, res) => {
    try {
        const validation = validatePageData(req.body);
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                error: validation.error
            });
        }

        const page = await LovePage.findOneAndUpdate(
            { id: parseInt(req.params.id) },
            {
                clientName: req.body.clientName.trim(),
                clientEmail: req.body.clientEmail || '',
                phoneNumber: req.body.phoneNumber || '',
                message: req.body.message.trim(),
                offer: req.body.offer,
                photos: req.body.photos || [],
                videos: req.body.videos || [],
                music: req.body.music || null,
                updatedAt: new Date()
            },
            { new: true }
        );

        if (!page) {
            return res.status(404).json({
                success: false,
                error: 'Page non trouvée'
            });
        }

        res.json({
            success: true,
            message: 'Page mise à jour',
            data: page
        });
    } catch (err) {
        console.error('❌ Erreur mise à jour:', err.message);
        res.status(500).json({
            success: false,
            error: 'Erreur serveur'
        });
    }
});

/**
 * DELETE /api/pages/:id
 * Supprimer une page (soft delete)
 */
app.delete('/api/pages/:id', async (req, res) => {
    try {
        const page = await LovePage.findOneAndUpdate(
            { id: parseInt(req.params.id) },
            { status: 'deleted', updatedAt: new Date() },
            { new: true }
        );

        if (!page) {
            return res.status(404).json({
                success: false,
                error: 'Page non trouvée'
            });
        }

        res.json({
            success: true,
            message: 'Page supprimée avec succès',
            data: page
        });
    } catch (err) {
        console.error('❌ Erreur suppression:', err.message);
        res.status(500).json({
            success: false,
            error: 'Erreur serveur'
        });
    }
});

/**
 * POST /api/create-love-page
 * Créer automatiquement une love page pour un client
 */
app.post('/api/create-love-page', async (req, res) => {
    try {
        const { clientName, clientEmail, phoneNumber, message, offer } = req.body;
        
        if (!clientName || !message || !offer) {
            return res.status(400).json({
                success: false,
                error: 'Données manquantes'
            });
        }

        const pageId = Date.now();
        const pageLink = `${DOMAIN}/love-page.html?id=${pageId}`;

        const newPage = new LovePage({
            id: pageId,
            clientName: clientName.trim(),
            clientEmail: clientEmail || '',
            phoneNumber: phoneNumber || '',
            message: message.trim(),
            offer: offer,
            pageLink: pageLink,
            status: 'active'
        });

        await newPage.save();

        // Générer le QR code
        try {
            const qrPath = path.join(qrDir, `${pageId}.png`);
            await QRCode.toFile(qrPath, pageLink, {
                errorCorrectionLevel: 'H',
                type: 'image/png',
                quality: 0.95,
                margin: 1,
                width: 300
            });
            console.log(`✅ QR code généré: ${qrPath}`);
        } catch (qrErr) {
            console.warn('⚠️  Erreur génération QR:', qrErr.message);
        }

        res.status(201).json({
            success: true,
            message: 'Love page créée avec succès',
            data: {
                pageId: pageId,
                clientName: clientName,
                pageLink: pageLink,
                qrCodeUrl: `/api/qrcode/${pageId}`,
                createdAt: newPage.createdAt
            }
        });
    } catch (err) {
        console.error('❌ Erreur création love page:', err.message);
        res.status(500).json({
            success: false,
            error: 'Erreur serveur'
        });
    }
});

/**
 * GET /api/qrcode/:pageId
 * Télécharger le QR code
 */
app.get('/api/qrcode/:pageId', (req, res) => {
    try {
        const qrPath = path.join(qrDir, `${req.params.pageId}.png`);
        
        if (!fs.existsSync(qrPath)) {
            return res.status(404).json({
                success: false,
                error: 'QR code non trouvé'
            });
        }
        
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', `attachment; filename="qrcode_${req.params.pageId}.png"`);
        res.sendFile(qrPath);
    } catch (err) {
        console.error('❌ Erreur téléchargement QR:', err.message);
        res.status(500).json({
            success: false,
            error: 'Erreur serveur'
        });
    }
});

/**
 * GET /api/health
 * Vérifier le serveur
 */
app.get('/api/health', (req, res) => {
    const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    res.json({
        status: 'OK',
        message: 'NOVACOEUR API is running',
        database: mongoStatus,
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route non trouvée'
    });
});

app.use((err, req, res, next) => {
    console.error('❌ Erreur serveur:', err.message);
    res.status(500).json({
        success: false,
        error: 'Erreur serveur interne'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║     ✅ NOVACOEUR API DÉMARRÉ (MongoDB) ║
╠════════════════════════════════════════╣
║ 🌐 URL: http://localhost:${PORT}
║ 📊 Database: MongoDB
║ 🎨 QR Codes: ${qrDir}
║ 🌍 Domaine: ${DOMAIN}
║ 🚀 Mode: ${process.env.NODE_ENV || 'development'}
╚════════════════════════════════════════╝
    `);
});

module.exports = app;
