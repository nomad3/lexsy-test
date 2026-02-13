#!/bin/bash
set -euo pipefail

# Deployment Configuration
DOMAIN="smartdocs.agentprovision.com"
EMAIL="${CERTBOT_EMAIL:-your-email@example.com}"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="$PROJECT_ROOT/docker-compose.prod.yml"
FRONTEND_PORT=${FRONTEND_PORT:-5175}
BACKEND_PORT=${BACKEND_PORT:-5001}

# Detect deployment mode: local or vm
DEPLOY_MODE=${DEPLOY_MODE:-auto}
if [ "$DEPLOY_MODE" = "auto" ]; then
  # Auto-detect: if nginx and certbot are installed, assume VM deployment
  if command -v nginx >/dev/null 2>&1 && command -v certbot >/dev/null 2>&1; then
    DEPLOY_MODE="vm"
  else
    DEPLOY_MODE="local"
  fi
fi

info() { echo "[deploy] $1"; }
error() { echo "[deploy] ERROR: $1" >&2; }

info "Deployment Mode: $DEPLOY_MODE"
if [ "$DEPLOY_MODE" = "vm" ]; then
  info "Starting VM deployment for $DOMAIN"
else
  info "Starting local deployment (no nginx/SSL configuration)"
fi

# --- 1. Prerequisite checks ---
if [ "$DEPLOY_MODE" = "vm" ]; then
  REQUIRED_CMDS=(docker docker-compose nginx certbot)
else
  REQUIRED_CMDS=(docker docker-compose)
fi

missing_cmds=()
for cmd in "${REQUIRED_CMDS[@]}"; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    missing_cmds+=("$cmd")
  fi
done

if [ ${#missing_cmds[@]} -ne 0 ]; then
  error "Missing prerequisites: ${missing_cmds[*]}"
  error "Install required tools before running deployment."
  exit 1
fi

info "Prerequisites verified: ${REQUIRED_CMDS[*]}"

# --- 2. Environment validation ---
if [ ! -f "$PROJECT_ROOT/.env" ]; then
  error ".env file not found in project root"
  error "Please create a .env file based on .env.example"
  exit 1
fi

# Check for required environment variables
source "$PROJECT_ROOT/.env"
if [ -z "${OPENAI_API_KEY:-}" ]; then
  error "OPENAI_API_KEY not set in .env file"
  exit 1
fi

if [ -z "${JWT_SECRET:-}" ]; then
  error "JWT_SECRET not set in .env file"
  exit 1
fi

info "Environment variables validated"

# --- 3. Export runtime variables ---
export FRONTEND_PORT
export BACKEND_PORT

info "Resolved configuration:"
info "  FRONTEND_PORT=$FRONTEND_PORT"
info "  BACKEND_PORT=$BACKEND_PORT"
info "  DOMAIN=$DOMAIN"

# --- 4. Stop existing services ---
info "Stopping existing Docker Compose stack"
docker-compose -f "$COMPOSE_FILE" down --remove-orphans || true

# --- 5. Build & start services ---
info "Building and starting services"
docker-compose -f "$COMPOSE_FILE" up --build -d

info "Docker services running. Current status:"
docker ps --filter "name=smartdocs" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# --- 6. Wait for services to be healthy ---
info "Waiting for services to be healthy..."
sleep 5

# Check database health
MAX_RETRIES=30
RETRY_COUNT=0
DB_HEALTHY=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  if docker exec smartdocs-postgres pg_isready -U smartdocs_user >/dev/null 2>&1; then
    DB_HEALTHY=true
    info "✓ Database is healthy"
    break
  fi
  RETRY_COUNT=$((RETRY_COUNT + 1))
  info "Waiting for database... (attempt $RETRY_COUNT/$MAX_RETRIES)"
  sleep 2
done

if [ "$DB_HEALTHY" = false ]; then
  error "Database failed to become healthy"
  error "Check logs with: docker-compose logs database"
  exit 1
fi

# Check backend health
RETRY_COUNT=0
BACKEND_HEALTHY=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$BACKEND_PORT/health" || echo "000")
  if [ "$HTTP_CODE" = "200" ]; then
    BACKEND_HEALTHY=true
    info "✓ Backend is healthy"
    break
  fi
  RETRY_COUNT=$((RETRY_COUNT + 1))
  info "Waiting for backend... (attempt $RETRY_COUNT/$MAX_RETRIES, got HTTP $HTTP_CODE)"
  sleep 2
done

if [ "$BACKEND_HEALTHY" = false ]; then
  error "Backend failed to become healthy"
  error "Check logs with: docker-compose logs backend"
  exit 1
fi

# --- 7. Configure host Nginx (VM mode only) ---
if [ "$DEPLOY_MODE" != "vm" ]; then
  info "Skipping Nginx/SSL configuration (local mode)"
  info "Deployment complete (local mode)"
  info "Services available at:"
  info "  - Frontend: http://localhost:$FRONTEND_PORT"
  info "  - Backend API: http://localhost:$BACKEND_PORT"
  info "  - Database: localhost:5432"
  exit 0
fi

# --- 8. Configure Nginx ---
NGINX_CONF_PATH="/etc/nginx/sites-available/$DOMAIN"

info "Writing Nginx configuration to $NGINX_CONF_PATH"

# Check if SSL certificates exist
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
  info "SSL certificates found for $DOMAIN, configuring with HTTPS"
  sudo bash -c "cat > $NGINX_CONF_PATH" <<EOF
server {
    listen 80;
    server_name $DOMAIN;
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN;

    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Security headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Frontend (React SPA)
    location / {
        proxy_pass http://127.0.0.1:$FRONTEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;

        # Increase timeouts for AI operations
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://127.0.0.1:$BACKEND_PORT/health;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        access_log off;
    }

    # File upload size limit (for document uploads)
    client_max_body_size 10M;
}
EOF
else
  info "No SSL certificates found for $DOMAIN, configuring HTTP only (will upgrade after certbot)"
  sudo bash -c "cat > $NGINX_CONF_PATH" <<EOF
server {
    listen 80;
    server_name $DOMAIN;

    # Frontend (React SPA)
    location / {
        proxy_pass http://127.0.0.1:$FRONTEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;

        # Increase timeouts for AI operations
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://127.0.0.1:$BACKEND_PORT/health;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        access_log off;
    }

    # File upload size limit (for document uploads)
    client_max_body_size 10M;
}
EOF
fi

# Enable the site
if [ ! -L "/etc/nginx/sites-enabled/$DOMAIN" ]; then
  info "Enabling site in Nginx"
  sudo ln -s "$NGINX_CONF_PATH" "/etc/nginx/sites-enabled/$DOMAIN"
fi

# Test nginx configuration
info "Testing Nginx configuration"
sudo nginx -t

# Reload nginx
info "Reloading Nginx"
sudo systemctl reload nginx

# --- 9. Issue / renew SSL certificates ---
info "Requesting/renewing SSL certificate for $DOMAIN"
sudo certbot --nginx -d "$DOMAIN" --email "$EMAIL" --agree-tos --non-interactive || true

# Update config to HTTPS after getting certificate
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
  info "Updating $DOMAIN to use HTTPS"
  sudo bash -c "cat > $NGINX_CONF_PATH" <<EOF
server {
    listen 80;
    server_name $DOMAIN;
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN;

    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Security headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Frontend (React SPA)
    location / {
        proxy_pass http://127.0.0.1:$FRONTEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;

        # Increase timeouts for AI operations
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://127.0.0.1:$BACKEND_PORT/health;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        access_log off;
    }

    # File upload size limit (for document uploads)
    client_max_body_size 10M;
}
EOF

  info "Reloading Nginx after SSL configuration"
  sudo systemctl reload nginx
fi

# --- 10. Verify deployment ---
info "Waiting for site to be ready..."
sleep 2

MAX_RETRIES=10
RETRY_COUNT=0
SITE_READY=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN" || echo "000")
  if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "304" ]; then
    SITE_READY=true
    info "✓ Site is ready and responding!"
    break
  fi
  RETRY_COUNT=$((RETRY_COUNT + 1))
  info "Waiting for site... (attempt $RETRY_COUNT/$MAX_RETRIES, got HTTP $HTTP_CODE)"
  sleep 2
done

if [ "$SITE_READY" = false ]; then
  info "⚠️  WARNING: Site did not respond with HTTP 200 within expected time"
  info "You may need to check the Nginx logs: sudo tail -f /var/log/nginx/error.log"
  info "Or check Docker logs: docker-compose logs -f"
fi

# --- 11. Post-deployment summary ---
echo ""
echo "==========================================="
echo "✓ SmartDocs Deployment Complete!"
echo "==========================================="
info "Site available at https://$DOMAIN"
echo ""
echo "Services:"
echo "  - Frontend: https://$DOMAIN"
echo "  - Backend API: https://$DOMAIN/api"
echo "  - Health Check: https://$DOMAIN/health"
echo ""
echo "Demo Credentials:"
echo "  - Email: demo@smartdocs.com"
echo "  - Password: Demo123!"
echo ""
echo "Useful Commands:"
echo "  - View all logs: docker-compose logs -f"
echo "  - View backend logs: docker-compose logs -f backend"
echo "  - View frontend logs: docker-compose logs -f frontend"
echo "  - View database logs: docker-compose logs -f database"
echo "  - View Nginx access logs: sudo tail -f /var/log/nginx/access.log"
echo "  - View Nginx error logs: sudo tail -f /var/log/nginx/error.log"
echo "  - Test Nginx config: sudo nginx -t"
echo "  - Reload Nginx: sudo systemctl reload nginx"
echo "  - Restart services: docker-compose restart"
echo "  - Renew SSL certificate: sudo certbot renew"
echo "  - Check service status: docker-compose ps"
echo ""
echo "Database Access:"
echo "  - Connect: docker exec -it smartdocs-postgres psql -U smartdocs_user -d smartdocs"
echo "  - Backup: docker exec smartdocs-postgres pg_dump -U smartdocs_user smartdocs > backup.sql"
echo ""
echo "To redeploy after making changes:"
echo "  1. Make your changes to the source code"
echo "  2. Run: ./deploy.sh"
echo ""
