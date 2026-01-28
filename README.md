# 💕 NOVACOEUR - L'Art Numérique de l'Amour

## Version 2.0 - Système Automatisé ⚡

**NOVACOEUR** est une plateforme web complète pour créer des pages d'amour personnalisées avec photos, vidéos, musique et codes QR automatisés.

---

## 🎯 Fonctionnalités Principales

✨ **Création Automatisée**
- Formulaire rapide pour générer les love pages
- ID unique automatique pour chaque page
- Code QR généré instantanément

📲 **Accès Client Facile**
- Scan QR code
- Ou lien direct unique
- Responsive design (mobile, desktop, tablette)

💾 **Gestion Complète**
- Interface admin sécurisée
- Base de données JSON
- Export client automatisé
- Dashboard avec statistiques

🎨 **Design Premium**
- Interface moderne et élégante
- Animations fluides
- Galerie photos/vidéos
- Lecteur de musique intégré

---

## 🚀 Installation Rapide

### Windows (PowerShell)
```powershell
.\deploy.ps1
```

### Linux/Mac
```bash
chmod +x deploy.sh
./deploy.sh
```

### Manuel
```bash
npm install
npm start
```

---

## 💻 Utilisation

### 1. **Démarrer le serveur**
```bash
npm start
```
Serveur disponible sur: `http://localhost:3001`

### 2. **Accéder à l'admin**
```
http://localhost:3001/admin.html
```
- Username: `nova`
- Password: `Nov123@@@`

### 3. **Créer une love page**
- Remplir le formulaire rapide
- Cliquer "Créer Love Page"
- Télécharger le QR code
- Envoyer au client

### 4. **Client accède à sa page**
- Scanne le QR code
- Ou entre le lien direct
- Love page s'affiche automatiquement ✨

---

## 📁 Structure du Projet

```
NOVACOEUR/
├── server.js                    # API backend Express
├── package.json                 # Dépendances
├── deploy.ps1 / deploy.sh       # Scripts déploiement
├── GUIDE_AUTOMATISATION.md      # Guide complet
├── admin.html                   # Interface admin
├── love-page.html               # Template love page
├── index.html                   # Accueil
├── boutique.html                # Boutique
├── data/
│   ├── pages.json               # Base de données
│   └── qrcodes/                 # QR codes générés
└── assets/
    ├── css/
    │   ├── style.css
    │   ├── admin.css
    │   ├── boutique.css
    │   └── love-page.css
    ├── js/
    │   ├── config.js            # Configuration
    │   ├── admin.js             # Admin interface
    │   ├── auth.js              # Authentification
    │   ├── automation.js        # Formulaire auto
    │   └── love-page.js         # Affichage page
    └── images/
        └── logo/
```

---

## 🔌 API Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/pages` | Récupérer toutes les pages |
| `GET` | `/api/pages/:id` | Récupérer une page spécifique |
| `POST` | `/api/pages` | Créer une page manuellement |
| `PUT` | `/api/pages/:id` | Modifier une page |
| `DELETE` | `/api/pages/:id` | Supprimer une page |
| `POST` | `/api/create-love-page` | **[AUTO]** Créer page + QR |
| `GET` | `/api/qrcode/:pageId` | **[AUTO]** Télécharger QR code |
| `GET` | `/api/export-client/:pageId` | **[AUTO]** Export client |
| `GET` | `/api/health` | Vérifier le serveur |

---

## 🔐 Authentification

L'interface admin est protégée par authentification:
- **Username:** `nova`
- **Password:** `Nov123@@@`
- **Durée session:** 24 heures

**À modifier en production!**

---

## 📦 Dépendances

```json
{
  "express": "^4.18.2",      // Framework web
  "cors": "^2.8.5",           // CORS middleware
  "qrcode": "^1.5.3",         // Génération QR codes
  "uuid": "^9.0.0"            // IDs uniques
}
```

---

## 🌐 Déploiement

### Préparation
1. Changez le domaine dans `server.js`:
```javascript
const DOMAIN = 'https://votrdomaine.com';
```

2. Mettez à jour les identifiants admin:
```javascript
const ADMIN_CREDENTIALS = {
    username: 'votre_username',
    password: 'votre_password_fort'
};
```

### Sur un serveur
```bash
# Cloner le repo
git clone <repo>
cd novacoeur

# Installer
npm install

# Lancer
npm start
```

### Avec un process manager (PM2)
```bash
npm install -g pm2
pm2 start server.js --name novacoeur
pm2 save
pm2 startup
```

---

## 🛠️ Troubleshooting

| Problème | Solution |
|----------|----------|
| Port 3001 occupé | `PORT=3002 npm start` |
| QR code ne génère pas | Vérifiez `data/qrcodes/` permissions |
| Love page ne s'affiche pas | Vérifiez l'ID dans l'URL |
| npm non trouvé | Installez Node.js depuis nodejs.org |

---

## 📊 Configuration Offres

Les offres sont définis dans `assets/js/config.js`:

| Offre | Nom | Prix | Photos | Vidéos | Musique |
|-------|-----|------|--------|--------|---------|
| 1 | Éclat Simple | 7000 FCFA | 5 | 0 | ❌ |
| 2 | Émotion Complète | 10000 FCFA | 15 | 1 | ✅ |
| 3 | Infini Amoureux | 18000 FCFA | 20 | 3 | ✅ |

---

## 📝 Modèle de Page (JSON)

```json
{
  "id": 1674580000,
  "clientName": "Jean & Marie",
  "clientEmail": "client@example.com",
  "phoneNumber": "+33123456789",
  "message": "Je t'aime depuis le premier jour...",
  "offer": "2",
  "createdAt": "2026-01-28T10:30:00.000Z",
  "updatedAt": "2026-01-28T10:30:00.000Z",
  "status": "active"
}
```

---

## 📞 Support & Contact

- **Email:** bedelziregis@gmail.com
- **WhatsApp:** +225 0564896589
- **Entreprise:** NOVACOEUR

---

## 📄 Licence

© 2026 NOVACOEUR - Tous droits réservés

---

## 🎉 Changelog v2.0

✨ **Nouveau:**
- Système de création automatisée
- Génération instantanée de QR codes
- Formulaire rapide en interface admin
- Export client automatisé
- Endpoints API dédiés
- Scripts de déploiement

✅ **Améliorations:**
- Code complètement refactorisé
- Meilleure gestion des erreurs
- Logs améliorés avec emojis
- Validation des données côté serveur
- Headers de sécurité

---

**Version:** 2.0  
**Dernière mise à jour:** 28 janvier 2026  
**Statut:** ✅ Production Ready
