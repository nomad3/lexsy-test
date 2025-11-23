# Lexsy Deployment Quick Reference

## Initial Setup on GCP VM

```bash
# 1. Run setup script to install prerequisites
curl -fsSL https://raw.githubusercontent.com/yourusername/lexsy-test/main/setup-vm.sh | bash

# 2. Log out and back in for Docker group changes
exit
ssh user@your-vm-ip

# 3. Clone repository
git clone https://github.com/yourusername/lexsy-test.git
cd lexsy-test

# 4. Configure deployment
nano deploy.sh  # Update DOMAIN and EMAIL
cp .env.example .env
nano .env  # Set OPENAI_API_KEY and JWT_SECRET

# 5. Deploy
./deploy.sh
```

## Common Commands

### Deployment
```bash
# Deploy/redeploy application
./deploy.sh

# Deploy in local mode (no nginx/SSL)
DEPLOY_MODE=local ./deploy.sh

# Deploy with custom ports
FRONTEND_PORT=8080 BACKEND_PORT=8081 ./deploy.sh
```

### Service Management
```bash
# Start services
docker-compose -f docker-compose.prod.yml up -d

# Stop services
docker-compose -f docker-compose.prod.yml down

# Restart services
docker-compose -f docker-compose.prod.yml restart

# Restart specific service
docker-compose -f docker-compose.prod.yml restart backend

# View service status
docker-compose -f docker-compose.prod.yml ps
```

### Logs
```bash
# View all logs
docker-compose -f docker-compose.prod.yml logs -f

# View specific service logs
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
docker-compose -f docker-compose.prod.yml logs -f database

# View last 100 lines
docker-compose -f docker-compose.prod.yml logs --tail=100 backend

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Database Management
```bash
# Connect to database
docker exec -it lexsy-postgres psql -U lexsy_user -d lexsy

# Backup database
docker exec lexsy-postgres pg_dump -U lexsy_user lexsy > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore database
cat backup.sql | docker exec -i lexsy-postgres psql -U lexsy_user -d lexsy

# Run migrations
docker exec lexsy-backend npm run migrate:latest

# Rollback migration
docker exec lexsy-backend npm run migrate:rollback
```

### Nginx Management
```bash
# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx

# Restart nginx
sudo systemctl restart nginx

# View status
sudo systemctl status nginx
```

### SSL Certificates
```bash
# Renew certificates
sudo certbot renew

# Renew and reload nginx
sudo certbot renew && sudo systemctl reload nginx

# Test renewal (dry run)
sudo certbot renew --dry-run

# View certificate info
sudo certbot certificates
```

### Monitoring
```bash
# View running containers
docker ps

# View container resource usage
docker stats

# Check disk usage
docker system df

# View service health
curl http://localhost:5001/health  # Backend
curl http://localhost:5175/health  # Frontend
```

### Updates
```bash
# Pull latest code
git pull origin main

# Rebuild and restart
./deploy.sh

# Or manually:
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up --build -d
```

### Cleanup
```bash
# Remove stopped containers
docker-compose -f docker-compose.prod.yml down

# Remove containers and volumes (⚠️ deletes data)
docker-compose -f docker-compose.prod.yml down -v

# Clean up unused Docker resources
docker system prune -a

# Clean up volumes (⚠️ deletes data)
docker volume prune
```

### Troubleshooting
```bash
# Check if ports are in use
sudo netstat -tulpn | grep -E '5001|5175|5432|80|443'

# View Docker events
docker events

# Inspect container
docker inspect lexsy-backend

# Execute command in container
docker exec -it lexsy-backend sh

# View environment variables
docker exec lexsy-backend env

# Check database connection
docker exec lexsy-backend node -e "const knex = require('knex')(require('./knexfile.cjs')); knex.raw('SELECT 1').then(() => console.log('Connected')).catch(console.error).finally(() => process.exit())"
```

### Performance
```bash
# View container logs with timestamps
docker-compose -f docker-compose.prod.yml logs -f -t

# Monitor container resource usage
docker stats lexsy-backend lexsy-frontend lexsy-postgres

# Check database size
docker exec lexsy-postgres psql -U lexsy_user -d lexsy -c "SELECT pg_size_pretty(pg_database_size('lexsy'));"
```

## Environment Variables

### Required
```env
OPENAI_API_KEY=sk-your-api-key
JWT_SECRET=your-secure-secret-32-chars-min
```

### Optional
```env
# Database
POSTGRES_USER=lexsy_user
POSTGRES_PASSWORD=lexsy_password
POSTGRES_DB=lexsy

# Ports
FRONTEND_PORT=5175
BACKEND_PORT=5001

# Backend
JWT_EXPIRES_IN=24h
MAX_FILE_SIZE=10485760
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
FRONTEND_URL=http://localhost:5175

# Frontend
VITE_API_URL=http://localhost:5001/api
```

## Health Check Endpoints

```bash
# Backend health
curl http://localhost:5001/health
curl https://lexsy.yourdomain.com/health

# Frontend health
curl http://localhost:5175/health

# Database health
docker exec lexsy-postgres pg_isready -U lexsy_user
```

## Backup Strategy

### Automated Daily Backups
```bash
# Create backup script
cat > ~/backup-lexsy.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="$HOME/lexsy-backups"
mkdir -p $BACKUP_DIR
docker exec lexsy-postgres pg_dump -U lexsy_user lexsy > $BACKUP_DIR/lexsy_$(date +%Y%m%d_%H%M%S).sql
find $BACKUP_DIR -name "lexsy_*.sql" -mtime +7 -delete
EOF

chmod +x ~/backup-lexsy.sh

# Add to crontab (runs daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * $HOME/backup-lexsy.sh") | crontab -
```

## Security Checklist

- [ ] Changed DOMAIN and EMAIL in deploy.sh
- [ ] Set strong JWT_SECRET (32+ characters)
- [ ] Set strong POSTGRES_PASSWORD
- [ ] Configured GCP firewall (ports 22, 80, 443)
- [ ] SSL certificate obtained and auto-renewal configured
- [ ] Changed demo user password
- [ ] Regular backups configured
- [ ] Monitoring and alerts set up

## Support

For detailed documentation, see:
- [DEPLOYMENT.md](DEPLOYMENT.md) - Full deployment guide
- [README.md](README.md) - Application documentation
