# 🗄️ GUIDE MONGODB - NOVACOEUR v3

## 📋 Configuration MongoDB Atlas

### **Étape 1: Créer un compte**
1. Va sur: https://www.mongodb.com/cloud/atlas
2. Clique "Try Free"
3. Inscris-toi avec email/mot de passe

### **Étape 2: Créer un cluster**
1. Clique "Build a Cluster"
2. Sélectionne:
   - Provider: AWS
   - Region: (le plus proche de toi)
   - Cluster Tier: FREE (M0)
3. Clique "Create Deployment"

### **Étape 3: Créer un utilisateur**
1. Dans "Database Access" → "Add New Database User"
2. Remplis:
   - Username: `novacoeur`
   - Password: (crée un mot de passe fort)
3. Clique "Add User"

### **Étape 4: Obtenir la connection string**
1. Va dans "Clusters"
2. Clique "Connect"
3. Sélectionne "Drivers"
4. Choisis "Node.js" version 4.4 ou plus
5. Copie la connection string

Format:
```
mongodb+srv://novacoeur:PASSWORD@cluster.mongodb.net/novacoeur?retryWrites=true&w=majority
```

Remplace:
- `PASSWORD` → le mot de passe de l'utilisateur
- `cluster` → ton nom de cluster (visible dans l'URL)

---

## 🚀 Installation Locale

### **1. Installer MongoDB localement (optionnel)**

Si tu veux tester en local sans compte MongoDB:

**Windows:**
```bash
# Télécharge depuis:
# https://www.mongodb.com/try/download/community

# Puis lance le service MongoDB
```

**Linux/Mac:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### **2. Mettre à jour .env**

Ouvre `.env`:
```env
MONGODB_URI=mongodb+srv://novacoeur:PASSWORD@cluster.mongodb.net/novacoeur
NODE_ENV=development
PORT=3001
DOMAIN=http://localhost:3001
ADMIN_USERNAME=nova
ADMIN_PASSWORD=Nov123@@@
```

Remplace les identifiants!

### **3. Lancer avec MongoDB**

```bash
npm start:mongodb
```

Ou en développement:
```bash
npm run dev:mongodb
```

---

## ✅ Tester la Connexion

```bash
# Tester l'API
curl http://localhost:3001/api/health

# Réponse:
{
  "status": "OK",
  "message": "NOVACOEUR API is running",
  "database": "connected",
  "timestamp": "2026-01-29T..."
}
```

---

## 📊 Avantages MongoDB vs JSON

| Feature | JSON | MongoDB |
|---------|------|---------|
| **Persistance** | ❌ Perte données Render | ✅ Cloud persistant |
| **Performance** | ⚠️ Fichier texte | ✅ Base de données |
| **Scalabilité** | ❌ Limité | ✅ Illimité |
| **Requêtes** | ⚠️ Tout charger | ✅ Requêtes complexes |
| **Coût** | ✅ Gratuit | ✅ Gratuit (Atlas) |

---

## 🌐 Déploiement Render + MongoDB Atlas

### **Sur Render:**

Variables d'environnement:
```
MONGODB_URI=mongodb+srv://novacoeur:PASSWORD@cluster.mongodb.net/novacoeur
NODE_ENV=production
PORT=3001
DOMAIN=https://novacoeur-api.onrender.com
ADMIN_USERNAME=nova
ADMIN_PASSWORD=Nov123@@@
```

Start command:
```bash
npm start:mongodb
```

### **Sur Netlify:**

Mets à jour `config.js`:
```javascript
let API_BASE_URL = isLocalhost 
    ? 'http://localhost:3001'
    : 'https://novacoeur-api.onrender.com';  // ← Ton domaine Render
```

---

## 🔧 Commandes Utiles

```bash
# Lancer avec MongoDB
npm start:mongodb

# Développement
npm run dev:mongodb

# Vérifier les logs
npm start:mongodb 2>&1 | grep MongoDB

# Tester health check
curl http://localhost:3001/api/health
```

---

## ⚠️ Troubleshooting

### **"Unable to connect to MongoDB"**
- Vérifie la connection string dans `.env`
- Vérifie le nom d'utilisateur/password
- Vérifie que MongoDB Atlas est activé

### **"ECONNREFUSED" en local**
- Lance le service MongoDB: `mongod`
- Ou utilise MongoDB Atlas (cloud)

### **Port 3001 occupé**
```bash
PORT=3002 npm start:mongodb
```

---

## 📝 Notes

- ✅ `.env` est ignoré par Git (.gitignore)
- ✅ `.env.example` sert de template
- ⚠️ Ne commit JAMAIS `.env` avec les vrais credentials
- ✅ Sur Render/production, les variables se définissent dans le dashboard

---

**Prêt à utiliser MongoDB?** 🎉

Crée ton compte Atlas et mets à jour `.env`!
