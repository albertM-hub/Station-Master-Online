# ========== .github/workflows/deploy.yml ==========
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_DB: station_master_test
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install Backend Dependencies
        run: cd backend && npm ci

      - name: Install Frontend Dependencies
        run: cd frontend && npm ci

      - name: Lint Backend
        run: cd backend && npm run lint --if-present

      - name: Lint Frontend
        run: cd frontend && npm run lint --if-present

      - name: Build Frontend
        run: cd frontend && npm run build

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and Push Backend
        uses: docker/build-push-action@v4
        with:
          context: ./backend
          push: true
          tags: ${{ secrets.DOCKER_USERNAME }}/smo-backend:latest

      - name: Build and Push Frontend
        uses: docker/build-push-action@v4
        with:
          context: ./frontend
          push: true
          tags: ${{ secrets.DOCKER_USERNAME }}/smo-frontend:latest

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Production
        env:
          DEPLOY_KEY: ${{ secrets.DEPLOY_KEY }}
          DEPLOY_HOST: ${{ secrets.DEPLOY_HOST }}
          DEPLOY_USER: ${{ secrets.DEPLOY_USER }}
        run: |
          mkdir -p ~/.ssh
          echo "$DEPLOY_KEY" > ~/.ssh/id_rsa
          chmod 600 ~/.ssh/id_rsa
          ssh-keyscan -H $DEPLOY_HOST >> ~/.ssh/known_hosts
          
          ssh $DEPLOY_USER@$DEPLOY_HOST << 'EOF'
          cd /app/Station-Master-Online
          git pull origin main
          docker-compose down
          docker-compose up -d
          EOF

---

# ========== .gitignore ==========
# Dependencies
node_modules/
npm-debug.log
yarn-error.log

# Environment
.env
.env.local
.env.*.local

# Build
/backend/dist
/frontend/dist
/frontend/.vite

# OS
.DS_Store
.env.local
*.swp
*.swo

# Logs
*.log
logs/

# Docker
.dockerignore

# IDE
.vscode/
.idea/
*.sublime-project
*.sublime-workspace

# Database
postgres_data/
*.sql.bak

---

# ========== .env.example (complete) ==========

# ========== Backend ==========
NODE_ENV=development
PORT=3000

# Database
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=db
DB_PORT=5432
DB_NAME=station_master

# JWT
JWT_SECRET=your-super-secret-key-change-in-production

# CORS
CORS_ORIGIN=http://localhost:5173

# API Rate Limiting (optional)
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# Email (for future notifications)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-password

---

# ========== Git Setup Commands ==========

# 1. Initialize repo
git init

# 2. Add all files
git add .

# 3. Initial commit
git commit -m "v2.0: Full-stack React + Express + PostgreSQL logbook

- Backend: Express.js API with JWT auth
- Frontend: React 18 with Tailwind CSS
- Database: PostgreSQL with auto-init
- Features: CRUD QSOs, ADIF import, stats, auth
- Deployment: Docker Compose ready"

# 4. Add remote
git remote add origin https://github.com/albertM-hub/Station-Master-Online.git

# 5. Push
git branch -M main
git push -u origin main

# 6. Create GitHub release
git tag -a v2.0.0 -m "Station Master Online v2.0 Production Release"
git push origin v2.0.0

---

# ========== GitHub Actions Secrets (à configurer) ==========

# Pour CI/CD automatique, ajouter dans GitHub repo Settings → Secrets:

DOCKER_USERNAME=your-docker-username
DOCKER_PASSWORD=your-docker-password

# Pour déploiement SSH:
DEPLOY_KEY=<contenu de ~/.ssh/id_rsa>
DEPLOY_HOST=your-vps.com
DEPLOY_USER=root

---

# ========== Makefile (optional, pour faciliter dev) ==========

.PHONY: help install dev test build deploy clean

help:
	@echo "Station Master Online - Make Commands"
	@echo ""
	@echo "  make install    - Install dependencies"
	@echo "  make dev        - Start development (Docker)"
	@echo "  make test       - Run tests"
	@echo "  make build      - Build for production"
	@echo "  make deploy     - Deploy to production"
	@echo "  make clean      - Clean all containers & volumes"

install:
	docker-compose build

dev:
	docker-compose up -d
	@echo "✅ Services running:"
	@echo "   Frontend: http://localhost:5173"
	@echo "   API: http://localhost:3000"

test:
	docker-compose exec backend npm test
	docker-compose exec frontend npm test

build:
	docker-compose build --no-cache

deploy:
	git push origin main
	@echo "✅ Pushing to GitHub - GitHub Actions will deploy"

clean:
	docker-compose down -v
	docker system prune -f

logs:
	docker-compose logs -f

---

# ========== Production Deployment Script (deploy.sh) ==========

#!/bin/bash

# Deploy Station Master Online to Production

set -e

echo "🚀 Deploying Station Master Online v2..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
  echo "❌ Please run as root (or with sudo)"
  exit 1
fi

# Pull latest
echo "📥 Pulling latest code..."
cd /app/Station-Master-Online
git pull origin main

# Stop old containers
echo "⛔ Stopping old containers..."
docker-compose down

# Build new images
echo "🏗️  Building images..."
docker-compose build --no-cache

# Start new containers
echo "🚀 Starting new containers..."
docker-compose up -d

# Wait for DB
echo "⏳ Waiting for PostgreSQL..."
sleep 10

# Check health
echo "🔍 Checking health..."
docker-compose ps

echo "✅ Deployment complete!"
echo "📊 Frontend: https://yourdomain.com"
echo "📡 API: https://yourdomain.com/api"

---

# ========== Nginx Config (production reverse proxy) ==========

upstream backend {
    server backend:3000;
}

upstream frontend {
    server frontend:5173;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Certificates (Let's Encrypt)
    ssl_certificate /etc/nginx/certs/cert.pem;
    ssl_certificate_key /etc/nginx/certs/key.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API
    location /api/ {
        proxy_pass http://backend/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts for long requests
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static caching
    location ~* \.(?:jpg|jpeg|png|gif|ico|css|js)$ {
        expires 1h;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_types text/plain text/css text/xml text/javascript application/json;
}

---

# ========== Manual Deployment (without GitHub Actions) ==========

# SSH into VPS
ssh root@yourvps.com

# Clone repository
git clone https://github.com/albertM-hub/Station-Master-Online.git /app/Station-Master-Online
cd /app/Station-Master-Online

# Setup environment
cp backend/.env.example backend/.env
nano backend/.env  # Edit with production values

# Install Docker Compose
apt-get update
apt-get install -y docker.io docker-compose

# Start services
docker-compose up -d

# Setup SSL with Let's Encrypt
apt-get install -y certbot python3-certbot-nginx
certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
# Copy certs to ./certs/

# Reload Nginx
docker-compose restart nginx

# Check logs
docker-compose logs -f

echo "✅ Production deployment complete!"
echo "Visit: https://yourdomain.com"
