# Lexsy Deployment Guide

This guide covers deploying the Lexsy platform to a GCP VM with automatic SSL certificate management.

## Prerequisites

### Local Machine
- Git installed
- SSH access to your GCP VM

### GCP VM Requirements
- Ubuntu 20.04 or later
- At least 2GB RAM (4GB recommended)
- Docker and Docker Compose installed
- Nginx installed
- Certbot installed
- Domain name pointing to your VM's IP address

## Quick Start

### 1. Install Prerequisites on GCP VM

SSH into your GCP VM and run:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Nginx
sudo apt install nginx -y

# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Enable and start Nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

**Important:** Log out and log back in for Docker group changes to take effect.

### 2. Configure DNS

Point your domain to your GCP VM's external IP address:

```
A Record: lexsy.yourdomain.com -> YOUR_VM_IP
```

Wait for DNS propagation (can take a few minutes to hours).

### 3. Clone Repository on VM

```bash
cd ~
git clone https://github.com/yourusername/lexsy-test.git
cd lexsy-test
```

### 4. Configure Environment

Edit the deployment script to set your domain and email:

```bash
nano deploy.sh
```

Update these lines:
```bash
DOMAIN="lexsy.yourdomain.com"  # Your actual domain
EMAIL="your-email@example.com"  # Your email for SSL certificates
```

Create your `.env` file:

```bash
cp .env.example .env
nano .env
```

Set the required environment variables:
```env
OPENAI_API_KEY=sk-your-actual-openai-api-key
JWT_SECRET=your-secure-jwt-secret-at-least-32-characters-long
```

### 5. Deploy

Run the deployment script:

```bash
./deploy.sh
```

The script will:
1. ✅ Check prerequisites (Docker, Docker Compose, Nginx, Certbot)
2. ✅ Validate environment variables
3. ✅ Build and start Docker containers
4. ✅ Wait for services to be healthy
5. ✅ Configure Nginx reverse proxy
6. ✅ Request SSL certificate from Let's Encrypt
7. ✅ Verify deployment

### 6. Access Your Application

Once deployment is complete, access your application at:
- **Frontend:** https://lexsy.yourdomain.com
- **Backend API:** https://lexsy.yourdomain.com/api
- **Health Check:** https://lexsy.yourdomain.com/health

**Demo Credentials:**
- Email: `demo@lexsy.com`
- Password: `Demo123!`

## Deployment Modes

### Local Mode (Development)

For local development without nginx/SSL:

```bash
DEPLOY_MODE=local ./deploy.sh
```

This will:
- Skip Nginx configuration
- Skip SSL certificate setup
- Run services on localhost ports

Access at:
- Frontend: http://localhost:5175
- Backend: http://localhost:5001

### VM Mode (Production)

For production deployment with nginx and SSL:

```bash
DEPLOY_MODE=vm ./deploy.sh
```

Or simply:
```bash
./deploy.sh
```

The script auto-detects if nginx and certbot are installed and switches to VM mode automatically.

## Configuration Options

### Environment Variables

You can customize ports using environment variables:

```bash
FRONTEND_PORT=8080 BACKEND_PORT=8081 ./deploy.sh
```

### Docker Compose Override

To customize Docker Compose configuration, create a `docker-compose.override.yml` file.

## Updating Your Deployment

To deploy changes:

```bash
# SSH into your VM
ssh user@your-vm-ip

# Navigate to project directory
cd ~/lexsy-test

# Pull latest changes
git pull origin main

# Redeploy
./deploy.sh
```

The script will:
- Stop existing containers
- Rebuild images with new code
- Start updated containers
- Reload Nginx configuration

## Monitoring and Maintenance

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f database

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Check Service Status

```bash
# Docker containers
docker-compose ps

# Nginx
sudo systemctl status nginx

# View running containers
docker ps
```

### Database Management

```bash
# Connect to database
docker exec -it lexsy-postgres psql -U lexsy_user -d lexsy

# Backup database
docker exec lexsy-postgres pg_dump -U lexsy_user lexsy > backup_$(date +%Y%m%d).sql

# Restore database
cat backup.sql | docker exec -i lexsy-postgres psql -U lexsy_user -d lexsy
```

### SSL Certificate Renewal

Certbot automatically renews certificates. To manually renew:

```bash
sudo certbot renew
sudo systemctl reload nginx
```

Test automatic renewal:
```bash
sudo certbot renew --dry-run
```

## Troubleshooting

### Services Won't Start

```bash
# Check Docker logs
docker-compose logs

# Check if ports are in use
sudo netstat -tulpn | grep -E '5001|5175|5432'

# Restart services
docker-compose restart
```

### SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Database Connection Issues

```bash
# Check database health
docker exec lexsy-postgres pg_isready -U lexsy_user

# View database logs
docker-compose logs database

# Restart database
docker-compose restart database
```

### Frontend Not Loading

```bash
# Check frontend logs
docker-compose logs frontend

# Verify frontend is running
curl http://localhost:5175

# Check Nginx proxy configuration
sudo nginx -t
```

### Backend API Errors

```bash
# Check backend logs
docker-compose logs backend

# Verify backend health
curl http://localhost:5001/health

# Check environment variables
docker exec lexsy-backend env | grep -E 'OPENAI|JWT|DATABASE'
```

## Security Best Practices

1. **Change Default Credentials:** Update demo user password in production
2. **Secure JWT Secret:** Use a strong, random JWT_SECRET (32+ characters)
3. **Firewall Configuration:** Only allow ports 80, 443, and 22
4. **Regular Updates:** Keep system and Docker images updated
5. **Backup Database:** Schedule regular database backups
6. **Monitor Logs:** Set up log monitoring and alerts

### GCP Firewall Rules

Ensure these ports are open in GCP firewall:
- Port 22 (SSH)
- Port 80 (HTTP)
- Port 443 (HTTPS)

## Performance Optimization

### Database Optimization

```bash
# Increase shared_buffers for better performance
docker exec -it lexsy-postgres bash
# Edit postgresql.conf and increase shared_buffers
```

### Docker Resource Limits

Edit `docker-compose.yml` to add resource limits:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
```

## Backup and Recovery

### Automated Backups

Create a backup script:

```bash
#!/bin/bash
# backup.sh
BACKUP_DIR="/home/$USER/backups"
mkdir -p $BACKUP_DIR
docker exec lexsy-postgres pg_dump -U lexsy_user lexsy > $BACKUP_DIR/lexsy_$(date +%Y%m%d_%H%M%S).sql
# Keep only last 7 days of backups
find $BACKUP_DIR -name "lexsy_*.sql" -mtime +7 -delete
```

Add to crontab:
```bash
crontab -e
# Add: 0 2 * * * /home/$USER/backup.sh
```

## Support

For issues or questions:
- Check the [main README](README.md)
- Review [troubleshooting section](#troubleshooting)
- Check Docker logs
- Review Nginx error logs

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
