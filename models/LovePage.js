/**
 * ===== MODÈLE MONGOOSE POUR LOVE PAGES =====
 */

const mongoose = require('mongoose');

// Schéma de la page d'amour
const lovePageSchema = new mongoose.Schema({
    id: {
        type: Number,
        unique: true,
        required: true,
        default: () => Date.now()
    },
    clientName: {
        type: String,
        required: true,
        trim: true
    },
    clientEmail: {
        type: String,
        trim: true,
        lowercase: true
    },
    phoneNumber: {
        type: String,
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    offer: {
        type: String,
        required: true,
        enum: ['1', '2', '3']
    },
    photos: [{
        id: String,
        name: String,
        type: String,
        url: String
    }],
    videos: [{
        id: String,
        name: String,
        type: String,
        url: String
    }],
    music: {
        id: String,
        name: String,
        url: String
    },
    status: {
        type: String,
        default: 'active',
        enum: ['active', 'archived', 'deleted']
    },
    qrCodeUrl: String,
    pageLink: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Index pour les recherches rapides
lovePageSchema.index({ clientName: 1 });
lovePageSchema.index({ createdAt: -1 });
lovePageSchema.index({ id: 1 });

// Middleware pour mettre à jour updatedAt
lovePageSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Créer et exporter le modèle
const LovePage = mongoose.model('LovePage', lovePageSchema);

module.exports = LovePage;
