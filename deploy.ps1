# ===== SCRIPT DE DÉPLOIEMENT AUTOMATISÉ NOVACOEUR =====
# Installe les dépendances et lance le serveur

Write-Host @"
╔════════════════════════════════════════╗
║   🚀 DÉPLOIEMENT NOVACOEUR             ║
╚════════════════════════════════════════╝
"@ -ForegroundColor Cyan

# Vérifier si npm est installé
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ npm n'est pas installé!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ npm détecté" -ForegroundColor Green

# Nettoyer les anciens node_modules si nécessaire
if (Test-Path "node_modules") {
    Write-Host "🗑️  Nettoyage des anciens modules..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
    Remove-Item package-lock.json -Force -ErrorAction SilentlyContinue
}

# Installer les dépendances
Write-Host "📦 Installation des dépendances..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors de l'installation!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Dépendances installées" -ForegroundColor Green

# Créer les dossiers nécessaires
Write-Host "📁 Création des dossiers..." -ForegroundColor Yellow
$dirs = @("data", "data/qrcodes", "assets/images/logo", "assets/music")
foreach ($dir in $dirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "  ✅ Créé: $dir" -ForegroundColor Green
    }
}

Write-Host @"

╔════════════════════════════════════════╗
║   ✅ DÉPLOIEMENT RÉUSSI                ║
╠════════════════════════════════════════╣
║ 🚀 Démarrage du serveur...
║ 🌐 URL: http://localhost:3001
║ 📁 Admin: http://localhost:3001/admin.html
║ 💕 Love Page: http://localhost:3001/love-page.html?id=xxx
╚════════════════════════════════════════╝
"@ -ForegroundColor Green

# Lancer le serveur
npm start
