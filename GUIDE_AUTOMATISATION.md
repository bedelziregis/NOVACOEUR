# 🎯 GUIDE COMPLET - SYSTÈME AUTOMATISÉ NOVACOEUR

## 📋 Résumé du Workflow Automatisé

```
1️⃣  Client arrive sur admin
2️⃣  Remplit le formulaire rapide (nom, email, message, offre)
3️⃣  Clique "Créer Love Page"
4️⃣  ⚡ Automatiquement:
    - Page créée avec ID unique
    - Code QR généré en PNG
    - Lien unique crée
5️⃣  Admin télécharge QR / copie le lien
6️⃣  Envoie au client
7️⃣  Client scanne ou entre le lien
8️⃣  Love page s'affiche automatiquement ✨
```

---

## 🚀 Installation & Démarrage

### Option 1: Windows (PowerShell)
```powershell
.\deploy.ps1
```

### Option 2: Linux/Mac (Terminal)
```bash
chmod +x deploy.sh
./deploy.sh
```

### Option 3: Manuel
```bash
npm install
npm start
```

---

## 💻 Utilisation - Créer une Love Page

### Pour l'Admin:

1. **Accédez à l'interface admin**
   ```
   http://localhost:3001/admin.html
   ```

2. **Connectez-vous**
   - Username: `nova`
   - Password: `Nov123@@@`

3. **Section "⚡ Créer Love Page Rapide"**
   - Nom du Client: `Jean & Marie`
   - Email: `client@example.com` (optionnel)
   - Téléphone: `+33...` (optionnel)
   - Message: `Écrivez la déclaration...`
   - Offre: Sélectionnez une offre

4. **Cliquez "✨ Créer Love Page"**

5. **Résultat:**
   - ✅ Page créée
   - 📥 Télécharger QR Code
   - 📋 Copier Lien

---

## 🔗 Endpoints Automatisés

### 1. Créer Love Page
```bash
POST /api/create-love-page
Content-Type: application/json

{
  "clientName": "Jean & Marie",
  "clientEmail": "client@example.com",
  "phoneNumber": "+33123456789",
  "message": "Je t'aime depuis le premier jour...",
  "offer": "2"
}
```

**Réponse:**
```json
{
  "success": true,
  "data": {
    "pageId": 1674580000,
    "clientName": "Jean & Marie",
    "pageLink": "http://localhost:3001/love-page.html?id=1674580000",
    "qrCodeUrl": "/api/qrcode/1674580000",
    "createdAt": "2026-01-28T10:30:00.000Z"
  }
}
```

### 2. Télécharger Code QR
```bash
GET /api/qrcode/:pageId
```

Télécharge une image PNG du QR code

### 3. Exporter Infos Client
```bash
GET /api/export-client/:pageId
```

Retourne tous les détails (lien, QR, client info, etc.)

---

## 📲 Accès Client

### Par Code QR:
- Admin télécharge le QR code
- Envoie au client (SMS, WhatsApp, email)
- Client scanne avec appareil photo ou QR reader
- Love page s'ouvre automatiquement ✨

### Par Lien Direct:
- Admin copie le lien: `http://tondomaine.com/love-page.html?id=1674580000`
- Envoie au client
- Client clique → Love page s'ouvre ✨

---

## 📁 Structure des Fichiers

```
NOVACOEUR/
├── server.js                 # API backend
├── package.json              # Dépendances
├── deploy.ps1               # Script déploiement Windows
├── deploy.sh                # Script déploiement Linux/Mac
├── admin.html               # Interface admin
├── love-page.html           # Template love page
├── index.html               # Accueil
├── boutique.html            # Boutique
├── data/
│   ├── pages.json           # Base de données pages
│   └── qrcodes/
│       ├── 1674580000.png   # QR codes générés
│       └── ...
└── assets/
    ├── css/
    ├── js/
    │   ├── config.js        # Configuration
    │   ├── admin.js         # Interface admin
    │   ├── auth.js          # Authentification
    │   ├── automation.js    # Formulaire auto (NOUVEAU)
    │   └── love-page.js     # Affichage love page
    └── images/
```

---

## 🔐 Sécurité

- Authentification admin requise
- Sessions 24 heures
- Validation des données serveur
- Headers de sécurité activés
- Pas de données sensibles en localStorage

---

## 🛠️ Troubleshooting

### ❌ `npm: command not found`
→ Installez Node.js depuis nodejs.org

### ❌ Port 3001 déjà utilisé
→ Changez le port:
```bash
PORT=3002 npm start
```

### ❌ QR Code ne se génère pas
→ Vérifiez les droits d'accès au dossier `data/qrcodes/`

### ❌ Love page ne s'affiche pas
→ Vérifiez l'ID dans l'URL: `?id=1234567890`

---

## 📞 Support

Pour questions ou problèmes:
- Email: bedelziregis@gmail.com
- WhatsApp: +225 0564896589

---

## ✨ Fonctionnalités Clés

✅ Création automatique de pages  
✅ Génération instantanée de QR codes  
✅ Lien unique par client  
✅ Interface admin simple et intuitive  
✅ Responsive design (mobile-friendly)  
✅ Base de données JSON  
✅ Export client automatisé  
✅ Logging détaillé  

---

**Dernière mise à jour:** 28 janvier 2026  
**Version:** 2.0 - Système Automatisé
