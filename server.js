/**
 * NOVACOEUR Backend API
 * Node.js/Express server with JSON file storage
 * Système automatisé de génération de love pages et codes QR
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;
const DOMAIN = process.env.DOMAIN || 'http://localhost:3001';

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

// Serve static files (HTML, CSS, JS, images, etc.)
app.use(express.static(path.join(__dirname)));

// Directory for QR codes
const qrDir = path.join(__dirname, 'data', 'qrcodes');
if (!fs.existsSync(qrDir)) {
    fs.mkdirSync(qrDir, { recursive: true });
}

// Database file path
const dbPath = path.join(__dirname, 'data', 'pages.json');
const dataDir = path.join(__dirname, 'data');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database file if it doesn't exist
if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify([], null, 2));
}

// Helper functions to read/write database
function readDatabase() {
    try {
        const data = fs.readFileSync(dbPath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('❌ Erreur lecture DB:', err.message);
        return [];
    }
}

function writeDatabase(data) {
    try {
        if (!Array.isArray(data)) {
            throw new Error('Data must be an array');
        }
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
        return true;
    } catch (err) {
        console.error('❌ Erreur écriture DB:', err.message);
        return false;
    }
}

// Validation helper
function validatePageData(pageData) {
    if (!pageData || typeof pageData !== 'object') {
        return { valid: false, error: 'Données invalides' };
    }
    if (!pageData.title || typeof pageData.title !== 'string' || pageData.title.trim().length === 0) {
        return { valid: false, error: 'Le titre est requis' };
    }
    return { valid: true };
}

// ===== API ENDPOINTS =====

/**
 * GET /api/pages
 * Retrieve all pages
 */
app.get('/api/pages', (req, res) => {
    try {
        const pages = readDatabase();
        res.json({
            success: true,
            data: pages
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la lecture des pages'
        });
    }
});

/**
 * GET /api/pages/:id
 * Retrieve a single page by ID
 */
app.get('/api/pages/:id', (req, res) => {
    try {
        const pages = readDatabase();
        const page = pages.find(p => p.id == req.params.id);
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
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la lecture de la page'
        });
    }
});

/**
 * POST /api/pages
 * Create a new page
 */
app.post('/api/pages', (req, res) => {
    try {
        const validation = validatePageData(req.body);
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                error: validation.error
            });
        }

        const pages = readDatabase();
        const newPage = {
            id: Date.now(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...req.body
        };

        pages.push(newPage);
        if (writeDatabase(pages)) {
            res.status(201).json({
                success: true,
                message: 'Page créée avec succès',
                data: newPage
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la création'
            });
        }
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
 * Update an existing page
 */
app.put('/api/pages/:id', (req, res) => {
    try {
        const validation = validatePageData(req.body);
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                error: validation.error
            });
        }

        const pages = readDatabase();
        const index = pages.findIndex(p => p.id === parseInt(req.params.id));

        if (index === -1) {
            return res.status(404).json({
                success: false,
                error: 'Page non trouvée'
            });
        }

        pages[index] = {
            ...pages[index],
            ...req.body,
            id: pages[index].id,
            createdAt: pages[index].createdAt,
            updatedAt: new Date().toISOString()
        };

        if (writeDatabase(pages)) {
            res.json({
                success: true,
                message: 'Page mise à jour',
                data: pages[index]
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la mise à jour'
            });
        }
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
 * Delete a page
 */
app.delete('/api/pages/:id', (req, res) => {
    try {
        const pages = readDatabase();
        const index = pages.findIndex(p => p.id === parseInt(req.params.id));

        if (index === -1) {
            return res.status(404).json({
                success: false,
                error: 'Page non trouvée'
            });
        }

        const deleted = pages.splice(index, 1);

        if (writeDatabase(pages)) {
            res.json({
                success: true,
                message: 'Page supprimée avec succès',
                data: deleted[0]
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la suppression'
            });
        }
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
 * Génère un ID unique et un code QR
 */
app.post('/api/create-love-page', async (req, res) => {
    try {
        const { clientName, clientEmail, phoneNumber, message, offer } = req.body;
        
        // Validation
        if (!clientName || !message || !offer) {
            return res.status(400).json({
                success: false,
                error: 'Données manquantes: clientName, message, offer requis'
            });
        }

        const pages = readDatabase();
        
        // Créer la page avec ID unique
        const pageId = Date.now();
        const pageData = {
            id: pageId,
            clientName: clientName.trim(),
            clientEmail: clientEmail || '',
            phoneNumber: phoneNumber || '',
            message: message.trim(),
            offer: offer,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: 'active'
        };
        
        pages.push(pageData);
        
        if (!writeDatabase(pages)) {
            return res.status(500).json({
                success: false,
                error: 'Erreur sauvegarde page'
            });
        }
        
        // Générer le lien de la love page
        const pageLink = `${DOMAIN}/love-page.html?id=${pageId}`;
        
        // Générer le code QR
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
            console.error('⚠️ Erreur génération QR:', qrErr);
        }
        
        res.status(201).json({
            success: true,
            message: 'Love page créée avec succès',
            data: {
                pageId: pageId,
                clientName: clientName,
                pageLink: pageLink,
                qrCodeUrl: `/api/qrcode/${pageId}`,
                createdAt: pageData.createdAt
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
 * Télécharger le code QR d'une love page
 */
app.get('/api/qrcode/:pageId', (req, res) => {
    try {
        const qrPath = path.join(qrDir, `${req.params.pageId}.png`);
        
        if (!fs.existsSync(qrPath)) {
            return res.status(404).json({
                success: false,
                error: 'Code QR non trouvé'
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
 * GET /api/export-client/:pageId
 * Exporter les informations du client avec lien et QR code
 */
app.get('/api/export-client/:pageId', (req, res) => {
    try {
        const pages = readDatabase();
        const page = pages.find(p => p.id === parseInt(req.params.pageId));
        
        if (!page) {
            return res.status(404).json({
                success: false,
                error: 'Page non trouvée'
            });
        }
        
        const pageLink = `${DOMAIN}/love-page.html?id=${page.id}`;
        const qrPath = path.join(qrDir, `${page.id}.png`);
        
        res.json({
            success: true,
            data: {
                pageId: page.id,
                clientName: page.clientName,
                clientEmail: page.clientEmail,
                phoneNumber: page.phoneNumber,
                pageLink: pageLink,
                qrCodeUrl: `/api/qrcode/${page.id}`,
                qrCodeExists: fs.existsSync(qrPath),
                createdAt: page.createdAt
            }
        });
        
    } catch (err) {
        console.error('❌ Erreur export client:', err.message);
        res.status(500).json({
            success: false,
            error: 'Erreur serveur'
        });
    }
});

/**
 * GET /api/health
 * Health check
 */
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'NOVACOEUR API is running'
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
║     ✅ NOVACOEUR API DÉMARRÉ           ║
╠════════════════════════════════════════╣
║ 🌐 URL: http://localhost:${PORT}
║ 📁 Base de données: ${dbPath}
║ 🎨 QR Codes: ${qrDir}
║ 🌍 Domaine: ${DOMAIN}
║ 🚀 Mode: ${process.env.NODE_ENV || 'development'}
╚════════════════════════════════════════╝
    `);
});
