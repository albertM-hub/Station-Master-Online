╔════════════════════════════════════════════════════════════════════════════╗
║           🚀 STATION MASTER ONLINE V2 — QUICK REFERENCE CARD               ║
║                    Albert ON5AM | hamanalyst.org                            ║
╚════════════════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 PROJECT STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Status:         ✅ PRODUCTION READY
Version:        v2.0.0
Release Date:   June 19, 2026
License:        MIT
Repository:     github.com/albertM-hub/Station-Master-Online

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚙️ TECH STACK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BACKEND                    FRONTEND                 INFRA
─────────────────────────────────────────────────────────────
Express.js 4.18            React 18.2              Docker Compose
Node.js 18+                React Router 6          PostgreSQL 15
PostgreSQL 15              Tailwind CSS            Nginx
JWT Auth                   Axios                   Ubuntu 22.04
bcryptjs (hashing)         React Hooks
Multer (file upload)       Context API

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 DESIGN PALETTE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Primary:    #FF6B35 (Orange vif - accent radioamateur)
Dark:       #1a1a2e (Fond principal - OLED-friendly)
Light:      #ffffff (Texte clair)
Secondary:  #2d2d44 (Surfaces secondaires)
Danger:     #da3633 (Actions destructives)

Typography: Consolas, Courier New (monospace - tech vibe)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📁 FILES DELIVERED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. backend-server.js              Express API (600 lines)
2. frontend-app.jsx               React app + all components (1000+ lines)
3. docker-compose.yml             Full stack orchestration
4. backend-files.txt              Dockerfile + package.json
5. frontend-files.txt             Dockerfile + package.json + configs
6. V2-README-INSTALLATION.md      Installation guide
7. SESSION-MEMO-V2.md             Development notes (THIS SESSION)
8. GITHUB-CI-CD-SETUP.md          GitHub Actions + deployment
9. QUICK-REFERENCE.md             This file!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 QUICK START (5 MIN)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Clone repo
   $ git clone https://github.com/albertM-hub/Station-Master-Online.git
   $ cd Station-Master-Online

2. Start with Docker
   $ docker-compose up -d

3. Wait 10 seconds, then open
   Frontend:  http://localhost:5173
   API:       http://localhost:3000
   DB:        localhost:5432

4. Create test account
   Email:     on5am@test.com
   Password:  TestPassword123
   Callsign:  ON5AM

5. Test features
   ✓ Create QSO (20m FT8)
   ✓ View in Logbook
   ✓ See Dashboard stats
   ✓ Import ADIF file

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔌 ESSENTIAL COMMANDS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Docker Commands:
  docker-compose up -d              ▶️  Start services (background)
  docker-compose up                 ▶️  Start + watch logs
  docker-compose down               ⛔ Stop all services
  docker-compose logs -f            📊 View logs (follow)
  docker-compose logs backend       📊 Backend logs only
  docker-compose ps                 📋 List running containers
  docker-compose restart backend    🔄 Restart backend

Development:
  cd backend && npm run dev         🔙 Backend (port 3000)
  cd frontend && npm run dev        🎨 Frontend (port 5173)
  npm run build                     📦 Build for production

Database:
  docker-compose exec db psql -U postgres
  SELECT * FROM users;
  SELECT * FROM qsos WHERE user_id = 1;

Git:
  git status
  git add .
  git commit -m "message"
  git push origin main
  git tag v2.0.1 && git push origin v2.0.1

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 API ENDPOINTS (Quick Reference)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Auth (no token needed):
  POST   /api/auth/register
  POST   /api/auth/login

QSOs (all need Bearer token):
  GET    /api/qsos?band=20m&limit=100
  POST   /api/qsos
  PUT    /api/qsos/:id
  DELETE /api/qsos/:id
  POST   /api/qsos/import (multipart file)

Stats:
  GET    /api/stats
  GET    /api/stats/daily?days=30

Header required:
  Authorization: Bearer <jwt_token>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔐 SECURITY CHECKLIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Before Production:
  ☐ Change JWT_SECRET (openssl rand -base64 32)
  ☐ Change DB password (strong, 16+ chars)
  ☐ Enable HTTPS (Let's Encrypt)
  ☐ Configure CORS origin (your domain)
  ☐ Setup rate limiting
  ☐ Add security headers (Nginx)
  ☐ Enable PostgreSQL backups
  ☐ Monitor logs & errors
  ☐ Test ADIF import with real data
  ☐ Verify auth flows

After Production:
  ☐ Setup monitoring (Datadog, New Relic)
  ☐ Configure alerting
  ☐ Create backups schedule
  ☐ Document incident response
  ☐ Setup log aggregation (ELK)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚢 DEPLOYMENT OPTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Option 1: Railway (⭐ RECOMMENDED)
  Cost:       $5-20/month
  Setup:      5 minutes (GitHub integration)
  Database:   PostgreSQL included
  SSL:        Automatic
  Features:   Auto-deploy, monitoring, environment variables

Option 2: VPS (Hetzner/DigitalOcean)
  Cost:       $5-10/month
  Setup:      30 minutes
  Control:    Full
  Database:   You manage
  SSL:        certbot + Let's Encrypt

Option 3: Keep O2Switch + Separate VPS
  Cost:       $16 (hamanalyst.org) + $5 (SMO)
  Benefit:    Isolate projects
  Risk:       More infrastructure to manage

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📈 PERFORMANCE TARGETS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Page Load:        < 2 seconds
API Response:     < 200ms
Dashboard render: < 1 second
Logbook search:   < 300ms
ADIF import:      < 5s per 1000 QSOs
Database:         1000+ QSOs = no slowdown

Optimization already done:
  ✓ PostgreSQL indexes
  ✓ API pagination
  ✓ Frontend code-splitting (Vite)
  ✓ CSS minification (Tailwind)
  ✓ Gzip compression (Nginx)

Next improvements (V2.1):
  - Add Redis caching
  - Database query optimization
  - Frontend lazy-loading
  - Image optimization

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🐛 TROUBLESHOOTING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Problem:           Solution:
─────────────────────────────────────────────────────────────────
Can't login        ✓ Check backend logs: docker-compose logs backend
                   ✓ Verify DB is running: docker-compose ps
                   ✓ Clear browser cache

CORS error         ✓ Edit backend/server.js CORS origin
                   ✓ Restart backend: docker-compose restart backend

API 500 error      ✓ Check logs: docker-compose logs backend
                   ✓ Verify JWT_SECRET in .env

Database error     ✓ Restart DB: docker-compose restart db
                   ✓ Check disk space: df -h

Slow import        ✓ Large ADIF files: optimize in V2.1
                   ✓ Check CPU: docker stats

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📖 DOCUMENTATION LINKS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Setup Guide:     ./V2-README-INSTALLATION.md
Session Notes:   ./SESSION-MEMO-V2.md
CI/CD Setup:     ./GITHUB-CI-CD-SETUP.md
This Card:       ./QUICK-REFERENCE.md

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ WHAT'S INCLUDED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ User Authentication
   - Secure registration & login
   - JWT tokens (30-day expiry)
   - Password hashing (bcryptjs)

✅ QSO Management
   - Create, read, update, delete
   - Full CRUD with validation
   - Filtering by date/band/call
   - Pagination support

✅ Data Import
   - ADIF file parser
   - Bulk import with error handling
   - Support for all standard ADIF fields

✅ Dashboard
   - Live statistics
   - Band distribution charts
   - Mode distribution
   - Recent QSOs list
   - Last contact date

✅ Responsive Design
   - Mobile-first approach
   - Desktop optimized
   - Dark mode by default
   - Touch-friendly UI

✅ Infrastructure
   - Docker containerization
   - PostgreSQL database
   - Nginx reverse proxy
   - CI/CD ready

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 WHAT'S NOT INCLUDED (Coming Soon)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Planned for V2.1:
  - Leaflet maps with QSO locations
  - Heatmaps showing gridsquare coverage
  - Advanced statistics & analytics
  - Mobile PWA features

Planned for V2.2:
  - QRZ.com API integration
  - eQSL upload support
  - LoTW export format
  - Advanced filtering & search

Planned for V2.3:
  - Offline mode (Service Workers)
  - Cloud sync (multi-device)
  - Real-time notifications

Planned for V3.0:
  - Native mobile app (React Native)
  - WebSocket real-time updates
  - Collaboration features

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📞 SUPPORT & CONTACT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Author:         Albert (ON5AM)
Location:       Wallonia, Belgium
Website:        https://hamanalyst.org
Repository:     https://github.com/albertM-hub/Station-Master-Online
Issues:         GitHub Issues page

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎓 KEY LEARNING NOTES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Architecture:
  • Monolithic (not microservices) — simpler, easier to deploy
  • Context API (not Redux) — less boilerplate
  • PostgreSQL (not MongoDB) — relational data, ACID transactions
  • Docker Compose — dev/prod parity

Code Quality:
  • Fully commented in French
  • Clean file structure
  • Reusable components
  • Error handling included
  • Ready for production

Performance:
  • DB indexes on key columns
  • API pagination built-in
  • CSS minification (Tailwind)
  • Gzip compression (Nginx)
  • Static asset caching

Security:
  • JWT authentication
  • Password hashing (bcryptjs)
  • SQL injection prevention (parameterized queries)
  • CORS configured
  • Rate limiting ready (express-rate-limit)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                    Happy hacking! 🚀📡
                    
                    73 — Albert ON5AM

╚════════════════════════════════════════════════════════════════════════════╝
