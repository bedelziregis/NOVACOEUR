#!/bin/bash

# ===== SCRIPT DE DÉPLOIEMENT AUTOMATISÉ NOVACOEUR =====
# Installe les dépendances et lance le serveur

echo ""
echo "╔════════════════════════════════════════╗"
echo "║   🚀 DÉPLOIEMENT NOVACOEUR             ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Vérifier si npm est installé
if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé!"
    exit 1
fi

echo "✅ npm détecté"

# Nettoyer les anciens node_modules si nécessaire
if [ -d "node_modules" ]; then
    echo "🗑️  Nettoyage des anciens modules..."
    rm -rf node_modules package-lock.json
fi

# Installer les dépendances
echo "📦 Installation des dépendances..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de l'installation!"
    exit 1
fi

echo "✅ Dépendances installées"

# Créer les dossiers nécessaires
echo "📁 Création des dossiers..."
mkdir -p data/qrcodes
mkdir -p assets/images/logo
mkdir -p assets/music

echo "✅ Dossiers créés"

echo ""
echo "╔════════════════════════════════════════╗"
echo "║   ✅ DÉPLOIEMENT RÉUSSI                ║"
echo "╠════════════════════════════════════════╣"
echo "║ 🚀 Démarrage du serveur..."
echo "║ 🌐 URL: http://localhost:3001"
echo "║ 📁 Admin: http://localhost:3001/admin.html"
echo "║ 💕 Love Page: http://localhost:3001/love-page.html?id=xxx"
echo "╚════════════════════════════════════════╝"
echo ""

# Lancer le serveur
npm start
