#!/bin/bash
# ============================================================
# Script de déploiement — Institut Rayhanah ERP
# Serveur : 154.124.230.227 | Domaine : rayhanah.duckdns.org
# Usage : bash deploy.sh
# ============================================================

set -e  # Arrêter en cas d'erreur

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║      Institut Rayhanah ERP — Déploiement Serveur     ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# ─── Variables ───────────────────────────────────────────────
APP_DIR="/var/www/rayhanah"
DOMAIN="rayhanah.duckdns.org"
REPO="https://github.com/dallha/Institut-Rayhanah.git"

# ─── 1. Mise à jour du système ────────────────────────────────
echo "📦 [1/8] Mise à jour des paquets système..."
apt-get update -y && apt-get upgrade -y

# ─── 2. Installation Node.js 20 ───────────────────────────────
echo "🟢 [2/8] Installation de Node.js 20..."
if ! command -v node &>/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
echo "   Node.js $(node -v) ✓"
echo "   npm $(npm -v) ✓"

# ─── 3. Installation Nginx ────────────────────────────────────
echo "🌐 [3/8] Installation de Nginx..."
if ! command -v nginx &>/dev/null; then
  apt-get install -y nginx
fi
systemctl enable nginx
echo "   Nginx ✓"

# ─── 4. Installation PM2 ─────────────────────────────────────
echo "⚙️  [4/8] Installation de PM2..."
npm install -g pm2
pm2 startup systemd -u root --hp /root || true
echo "   PM2 ✓"

# ─── 5. Clone ou mise à jour du dépôt ────────────────────────
echo "📁 [5/8] Récupération du code source..."
if [ -d "$APP_DIR" ]; then
  cd "$APP_DIR"
  git pull origin main
else
  git clone "$REPO" "$APP_DIR"
  cd "$APP_DIR"
fi

# ─── 6. Installation des dépendances + Build ──────────────────
echo "🔨 [6/8] Installation des dépendances..."
npm install

echo "   Configuration .env..."
if [ ! -f .env ]; then
  cp .env.example .env
  echo ""
  echo "⚠️  ATTENTION: Remplissez le fichier .env avant de continuer !"
  echo "   nano $APP_DIR/.env"
  echo ""
fi

echo "🏗️  Build du frontend..."
npm run build

# ─── 7. Configuration Nginx ───────────────────────────────────
echo "🌐 [7/8] Configuration Nginx..."
cat > /etc/nginx/sites-available/rayhanah << 'NGINX'
server {
    listen 80;
    server_name rayhanah.duckdns.org 154.124.230.227;

    # Logs
    access_log /var/log/nginx/rayhanah_access.log;
    error_log  /var/log/nginx/rayhanah_error.log;

    # Frontend — fichiers statiques (dist/)
    root /var/www/rayhanah/dist;
    index index.html;

    # SPA fallback — toutes les routes → index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API — proxy vers Express (port 3001)
    location /api/ {
        proxy_pass         http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 90;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    gzip_min_length 256;

    # Cache des assets statiques
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
NGINX

# Activer le site
ln -sf /etc/nginx/sites-available/rayhanah /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Vérifier la config Nginx
nginx -t
systemctl reload nginx
echo "   Nginx configuré ✓"

# ─── 8. Démarrage du backend avec PM2 ────────────────────────
echo "🚀 [8/8] Démarrage du backend Express..."
cd "$APP_DIR"
pm2 delete rayhanah-api 2>/dev/null || true
pm2 start ecosystem.config.cjs --env production
pm2 save
echo "   PM2 démarré ✓"

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║  ✅ Déploiement terminé !                            ║"
echo "║  🌐 http://rayhanah.duckdns.org                     ║"
echo "║  🔧 Backend  : http://127.0.0.1:3001                ║"
echo "║  📊 PM2 status: pm2 status                          ║"
echo "║  📋 Logs    : pm2 logs rayhanah-api                 ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
