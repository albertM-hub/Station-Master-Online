# 🚀 Station Master Online V2 — Installation & Setup

## Prérequis

- **Docker & Docker Compose** (recommandé pour dev/prod facile)
- OU **Node.js 18+** + **PostgreSQL 14+** (setup manuel)
- **Git**

---

## 🏃 Quick Start (avec Docker)

```bash
# 1. Cloner le repo
git clone https://github.com/albertM-hub/Station-Master-Online.git
cd Station-Master-Online

# 2. Configurer les variables d'env
cp backend/.env.example backend/.env
# Éditer backend/.env si nécessaire

# 3. Lancer la stack
docker-compose up -d

# 4. Créer les tables (auto-init au démarrage)
# Le backend initialise la DB automatiquement

# 5. Accéder à l'app
# Frontend: http://localhost:5173
# API: http://localhost:3000
```

### Logs
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Arrêter
```bash
docker-compose down
```

---

## 🛠️ Setup Manuel (sans Docker)

### Backend

```bash
cd backend
npm install

# Créer .env
cp .env.example .env

# Éditer .env avec tes credentials PostgreSQL
nano .env

# Lancer le serveur
npm run dev
# Écoute sur http://localhost:3000
```

### Frontend

```bash
cd frontend
npm install

# Lancer Vite dev server
npm run dev
# Ouvre http://localhost:5173
```

### PostgreSQL

```bash
# Créer la DB
createdb station_master

# Charger le schema
psql station_master < backend/db/schema.sql

# Ou laisser le backend la créer automatiquement
```

---

## 📁 Structure du Projet

```
Station-Master-Online/
├── backend/
│   ├── server.js              # Express API
│   ├── package.json
│   ├── Dockerfile
│   ├── .env.example
│   └── db/
│       └── schema.sql
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.css
│   │   ├── context/           # Auth, Qso context
│   │   ├── pages/             # Dashboard, Logbook, etc
│   │   └── components/        # Réutilisables
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── package.json
│   └── Dockerfile
├── nginx.conf                  # Reverse proxy (optionnel)
├── docker-compose.yml
└── README.md
```

---

## 🔐 Authentification

### Créer un compte

```
POST /api/auth/register
{
  "email": "on5am@example.com",
  "password": "secure-password",
  "callsign": "ON5AM"
}

Response:
{
  "user": { "id": 1, "email": "...", "callsign": "ON5AM" },
  "token": "eyJhbGc..."
}
```

### Se connecter

```
POST /api/auth/login
{
  "email": "on5am@example.com",
  "password": "secure-password"
}
```

Stocker le token en localStorage → Utiliser pour les requêtes:
```
Authorization: Bearer <token>
```

---

## 📡 API Endpoints

### QSOs
```
GET    /api/qsos?band=20m&mode=FT8&limit=100
POST   /api/qsos
PUT    /api/qsos/:id
DELETE /api/qsos/:id
```

### Import
```
POST /api/qsos/import (multipart: fichier ADIF)
```

### Stats
```
GET /api/stats
GET /api/stats/daily?days=30
```

### Auth
```
POST /api/auth/register
POST /api/auth/login
```

---

## 🛡️ Sécurité (Production)

### Avant de déployer:

1. **Changer JWT_SECRET**
   ```bash
   # Générer une clé forte
   openssl rand -base64 32
   # Mettre dans backend/.env
   ```

2. **PostgreSQL Password**
   ```bash
   # Changer le mot de passe dans docker-compose.yml & backend/.env
   ```

3. **CORS**
   ```javascript
   // Dans backend/server.js
   app.use(cors({
     origin: 'https://yourdomain.com',
     credentials: true
   }));
   ```

4. **HTTPS/SSL**
   ```bash
   # Utiliser Nginx + Let's Encrypt (voir nginx.conf)
   ```

5. **Rate Limiting**
   ```bash
   npm install express-rate-limit
   ```

---

## 📦 Production Deployment

### Option 1: VPS (Hetzner/DigitalOcean)

```bash
# SSH into VPS
ssh root@your-vps.com

# Clone repo
git clone https://github.com/albertM-hub/Station-Master-Online.git
cd Station-Master-Online

# Configurer .env pour production
nano backend/.env
# NODE_ENV=production
# JWT_SECRET=<strong-secret>
# DB_PASSWORD=<strong-password>

# Lancer avec Docker
docker-compose up -d

# Setup Nginx + SSL
# Voir nginx.conf pour config reverse proxy
```

### Option 2: Heroku / Railway

```bash
# Avec Railway (recommandé pour Albert):
# 1. Créer un projet Railway
# 2. Connecter le repo GitHub
# 3. Railway détecte le docker-compose.yml
# 4. Auto-déploie !

# PostgreSQL est inclu dans Railway
# Juste mettre les vars d'env:
# - JWT_SECRET
# - NODE_ENV=production
```

### Option 3: Self-hosted (O2Switch compatible)

Si tu veux garder hamanalyst.org sur O2Switch:
- Utiliser une VPS séparée pour Station Master (5€/mois)
- Ou migrer vers un VPS all-in-one (hamanalyst.org + SMO)

---

## 🔄 Mise à jour

```bash
# Pull latest code
git pull origin main

# Rebuild images
docker-compose build --no-cache

# Redémarrer
docker-compose up -d
```

---

## 🐛 Troubleshooting

### "Erreur de connexion à la DB"

```bash
# Vérifier que PostgreSQL est up
docker-compose ps

# Vérifier les logs
docker-compose logs db

# Restart
docker-compose restart db backend
```

### "CORS error"

Edit `backend/server.js`:
```javascript
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
}));
```

### "Frontend ne se connecte pas au backend"

Vérifier le proxy dans `vite.config.js`:
```javascript
proxy: {
  '/api': {
    target: 'http://backend:3000', // Ou http://localhost:3000 en local
    changeOrigin: true
  }
}
```

---

## 📊 Backups

### Sauvegarder la DB

```bash
# Dump PostgreSQL
docker-compose exec db pg_dump -U postgres station_master > backup.sql

# Restaurer
docker-compose exec -T db psql -U postgres station_master < backup.sql
```

---

## 🚀 Prochaines Étapes

- ✅ Features V2.0: Auth, CRUD, Import ADIF, Stats de base
- ⬜ V2.1: Maps (Leaflet), heatmaps gridsquares
- ⬜ V2.2: QRZ/eQSL/LoTW API integration
- ⬜ V2.3: PWA offline mode, sync cloud
- ⬜ V3.0: Mobile app native (React Native)

---

## 📄 License

MIT — Librement adaptable

## 🔗 GitHub

https://github.com/albertM-hub/Station-Master-Online

## 💬 Support

Retrouvez Albert (ON5AM) sur:
- 🌐 https://hamanalyst.org
- 📡 Réseau radioamateur belge

---

## 📝 Session Memo (Next Developer)

**Project**: Station Master Online v2.0
**Last Updated**: June 19, 2026
**Status**: ✅ Production-ready, Docker setup validated

**Key Files**:
- `backend/server.js` — Express API (600 lines)
- `frontend/src/App.jsx` — React app + all components (1000+ lines)
- `docker-compose.yml` — Full stack orchestration
- `backend/package.json`, `frontend/package.json` — Dependencies

**Architecture**:
- PostgreSQL (user auth, QSO storage)
- Express.js + JWT (REST API)
- React + Tailwind (modern frontend)
- Docker (dev/prod consistency)

**Next Session Priorities**:
1. Deploy to production (VPS/Railway)
2. Add Maps + Leaflet (V2.1)
3. QRZ API integration
4. Performance optimization (pagination, caching)
5. Mobile PWA improvements

**Known Limitations**:
- No offline mode yet (PWA coming V2.3)
- No direct LoTW/eQSL upload (V2.2)
- Stats are basic (advanced analytics V2.1)

**Testing**:
- Create test account: test@example.com / test-pwd / ON5AM
- Import sample ADIF file from N1MM+
- Verify all CRUD operations
- Check pagination with 1000+ QSOs

**Performance Notes**:
- PostgreSQL indexes on (user_id, date, band, call)
- React Context for state (no Redux yet)
- Lazy load maps only on /stats page
- Nginx caching for static assets
