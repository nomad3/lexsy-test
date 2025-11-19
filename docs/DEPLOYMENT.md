# Lexsy Deployment Guide

This guide covers deploying the Lexsy platform in various environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start with Docker](#quick-start-with-docker)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Production Deployment](#production-deployment)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- **Docker** & **Docker Compose**: Latest version
- **OpenAI API Key**: [Get one here](https://platform.openai.com)
- **Domain** (for production): Optional but recommended

---

## Quick Start with Docker

### 1. Clone and Configure

```bash
# Clone repository
git clone https://github.com/yourusername/lexsy.git
cd lexsy

# Copy environment file
cp .env.example .env

# Edit .env with your credentials
nano .env
```

### 2. Set Required Environment Variables

Edit `.env`:

```env
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
JWT_SECRET=generate-a-secure-random-string-at-least-32-characters
```

Generate a secure JWT secret:

```bash
openssl rand -base64 32
```

### 3. Start All Services

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Check service status
docker-compose ps
```

### 4. Verify Deployment

```bash
# Test health endpoint
curl http://localhost:5000/health

# Expected response:
# {"success":true,"data":{"status":"healthy",...}}

# Test with demo user
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@lexsy.com","password":"Demo123!"}'
```

The API will be available at **http://localhost:5000**

---

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key | `sk-proj-...` |
| `JWT_SECRET` | JWT signing secret (32+ chars) | `your-secure-secret` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` |
| `PORT` | Backend port | `5000` |
| `DATABASE_URL` | PostgreSQL connection | Auto-configured |
| `JWT_EXPIRES_IN` | Token expiration | `24h` |
| `MAX_FILE_SIZE` | Upload limit (bytes) | `10485760` (10MB) |
| `RATE_LIMIT_MAX_REQUESTS` | API rate limit | `100` |

---

## Database Setup

### Automatic Migration (Docker)

Migrations run automatically when the backend container starts:

```bash
docker-compose up -d backend
```

### Manual Migration

```bash
# Enter backend container
docker-compose exec backend sh

# Run migrations
npm run migrate:latest

# Seed database (optional)
npm run seed

# Check migration status
npm run migrate:status
```

### Database Backup

```bash
# Backup
docker-compose exec database pg_dump -U lexsy_user lexsy > backup.sql

# Restore
docker-compose exec -T database psql -U lexsy_user lexsy < backup.sql
```

---

## Production Deployment

### 1. Server Requirements

**Minimum:**
- 2 CPU cores
- 4 GB RAM
- 20 GB storage
- Ubuntu 22.04 or similar

**Recommended:**
- 4 CPU cores
- 8 GB RAM
- 50 GB SSD storage

### 2. Install Docker

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh

# Install Docker Compose
sudo apt install docker-compose -y

# Add user to docker group
sudo usermod -aG docker $USER
```

### 3. Clone and Configure

```bash
# Clone repository
git clone https://github.com/yourusername/lexsy.git
cd lexsy

# Copy and edit environment
cp .env.example .env
nano .env
```

### 4. Production Environment Variables

```env
NODE_ENV=production
OPENAI_API_KEY=your-production-key
JWT_SECRET=your-production-secret-minimum-32-characters
DATABASE_URL=postgresql://lexsy_user:strong_password@database:5432/lexsy
```

### 5. Deploy

```bash
# Build and start in detached mode
docker-compose up -d --build

# View logs
docker-compose logs -f backend

# Verify all services are healthy
docker-compose ps
```

### 6. Setup Nginx Reverse Proxy (Optional)

```nginx
# /etc/nginx/sites-available/lexsy
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    client_max_body_size 11M;
}
```

Enable and restart:

```bash
sudo ln -s /etc/nginx/sites-available/lexsy /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 7. Setup SSL with Let's Encrypt

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is configured automatically
sudo certbot renew --dry-run
```

---

## Monitoring

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f database

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Resource Usage

```bash
# Container stats
docker stats

# Disk usage
docker system df
```

### Health Checks

```bash
# Backend health
curl http://localhost:5000/health

# Database health
docker-compose exec database pg_isready -U lexsy_user
```

### Database Monitoring

```bash
# Connect to database
docker-compose exec database psql -U lexsy_user lexsy

# Check active connections
SELECT count(*) FROM pg_stat_activity;

# Check table sizes
SELECT
    tablename,
    pg_size_pretty(pg_total_relation_size(tablename::text)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(tablename::text) DESC;

# Check AI task statistics
SELECT
    status,
    COUNT(*)
FROM ai_tasks
GROUP BY status;
```

---

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs backend

# Rebuild from scratch
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Database Connection Errors

```bash
# Verify database is running
docker-compose ps database

# Check database logs
docker-compose logs database

# Verify connection string
docker-compose exec backend env | grep DATABASE_URL

# Test connection manually
docker-compose exec database psql -U lexsy_user -d lexsy -c "SELECT 1;"
```

### Migration Errors

```bash
# Check migration status
docker-compose exec backend npm run migrate:status

# Rollback last migration
docker-compose exec backend npm run migrate:rollback

# Run migrations again
docker-compose exec backend npm run migrate:latest
```

### OpenAI API Errors

```bash
# Verify API key is set
docker-compose exec backend env | grep OPENAI_API_KEY

# Test API key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Check AI task logs
docker-compose exec backend npm run migrate:latest
docker-compose exec database psql -U lexsy_user lexsy \
  -c "SELECT * FROM ai_tasks ORDER BY created_at DESC LIMIT 10;"
```

### High Memory Usage

```bash
# Check resource usage
docker stats

# Restart backend
docker-compose restart backend

# Scale down (if needed)
docker-compose down
# Edit docker-compose.yml to add resource limits
docker-compose up -d
```

Add to `docker-compose.yml`:

```yaml
backend:
  # ... existing config
  deploy:
    resources:
      limits:
        cpus: '2'
        memory: 2G
      reservations:
        memory: 1G
```

### File Upload Issues

```bash
# Check upload directory permissions
docker-compose exec backend ls -la /app/uploads

# Create if missing
docker-compose exec backend mkdir -p /app/uploads
docker-compose exec backend chmod 755 /app/uploads
```

### Port Already in Use

```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>

# Or change port in docker-compose.yml
```

---

## Updating Lexsy

### Pull Latest Changes

```bash
# Pull updates
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up -d --build

# Run new migrations if any
docker-compose exec backend npm run migrate:latest
```

### Zero-Downtime Updates

```bash
# Pull updates
git pull origin main

# Build new image
docker-compose build backend

# Scale up new version
docker-compose up -d --no-deps --scale backend=2 backend

# Wait for new container to be healthy
sleep 30

# Remove old container
docker-compose up -d --no-deps --scale backend=1 backend
```

---

## Security Best Practices

1. **Use Strong Secrets**
   ```bash
   # Generate secure secrets
   openssl rand -base64 32
   ```

2. **Keep Dependencies Updated**
   ```bash
   cd backend
   npm audit
   npm audit fix
   ```

3. **Regular Backups**
   ```bash
   # Setup cron job for daily backups
   0 2 * * * cd /path/to/lexsy && docker-compose exec -T database pg_dump -U lexsy_user lexsy > backups/$(date +\%Y\%m\%d).sql
   ```

4. **Monitor Logs**
   ```bash
   # Setup log rotation
   # Configure in docker-compose.yml
   logging:
     driver: "json-file"
     options:
       max-size: "10m"
       max-file: "3"
   ```

5. **Firewall Rules**
   ```bash
   # Allow only necessary ports
   sudo ufw allow 22/tcp  # SSH
   sudo ufw allow 80/tcp  # HTTP
   sudo ufw allow 443/tcp # HTTPS
   sudo ufw enable
   ```

---

## Support

- **Documentation**: [docs/](../)
- **Issues**: [GitHub Issues](https://github.com/yourusername/lexsy/issues)
- **Email**: support@lexsy.com

---

**Last Updated**: 2025-11-18
