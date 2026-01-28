#!/bin/bash
# Configuration de production pour NOVACOEUR

# Variables d'environnement
export NODE_ENV=production
export PORT=3001
export DOMAIN=https://tondomaine.com  # À remplacer par votre domaine

# Options de démarrage
echo "🚀 Démarrage NOVACOEUR en mode production..."
echo "📌 Domaine: $DOMAIN"
echo "📌 Port: $PORT"
echo "📌 Environnement: $NODE_ENV"
echo ""

# Assurer que node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install --production
fi

# Vérifier la base de données
if [ ! -d "data" ]; then
    echo "📁 Création du dossier data..."
    mkdir -p data/qrcodes
fi

if [ ! -f "data/pages.json" ]; then
    echo "📝 Création de la base de données..."
    echo "[]" > data/pages.json
fi

# Démarrer le serveur
echo "✅ Démarrage du serveur..."
npm start
