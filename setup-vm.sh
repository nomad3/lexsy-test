#!/bin/bash
set -euo pipefail

# GCP VM Setup Script for Lexsy Platform
# This script installs all prerequisites needed for deployment

info() { echo "[setup] $1"; }
error() { echo "[setup] ERROR: $1" >&2; }

info "Starting GCP VM setup for Lexsy platform..."

# Check if running as root
if [ "$EUID" -eq 0 ]; then
  error "Please do not run this script as root"
  error "Run as a regular user with sudo privileges"
  exit 1
fi

# --- 1. Update system ---
info "Updating system packages..."
sudo apt update
sudo apt upgrade -y

# --- 2. Install Docker ---
if command -v docker >/dev/null 2>&1; then
  info "Docker is already installed ($(docker --version))"
else
  info "Installing Docker..."
  curl -fsSL https://get.docker.com -o get-docker.sh
  sudo sh get-docker.sh
  rm get-docker.sh

  # Add current user to docker group
  info "Adding $USER to docker group..."
  sudo usermod -aG docker $USER

  info "✓ Docker installed successfully"
  info "⚠️  You need to log out and log back in for docker group changes to take effect"
fi

# --- 3. Install Docker Compose ---
if command -v docker-compose >/dev/null 2>&1; then
  info "Docker Compose is already installed ($(docker-compose --version))"
else
  info "Installing Docker Compose..."
  sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  sudo chmod +x /usr/local/bin/docker-compose

  # Verify installation
  if docker-compose --version >/dev/null 2>&1; then
    info "✓ Docker Compose installed successfully"
  else
    error "Docker Compose installation failed"
    exit 1
  fi
fi

# --- 4. Install Nginx ---
if command -v nginx >/dev/null 2>&1; then
  info "Nginx is already installed ($(nginx -v 2>&1))"
else
  info "Installing Nginx..."
  sudo apt install nginx -y

  # Enable and start Nginx
  sudo systemctl enable nginx
  sudo systemctl start nginx

  info "✓ Nginx installed and started"
fi

# --- 5. Install Certbot ---
if command -v certbot >/dev/null 2>&1; then
  info "Certbot is already installed ($(certbot --version))"
else
  info "Installing Certbot..."
  sudo apt install certbot python3-certbot-nginx -y

  info "✓ Certbot installed successfully"
fi

# --- 6. Install additional utilities ---
info "Installing additional utilities..."
sudo apt install -y \
  git \
  curl \
  wget \
  vim \
  htop \
  net-tools \
  ufw

# --- 7. Configure firewall ---
info "Configuring firewall..."
if command -v ufw >/dev/null 2>&1; then
  # Allow SSH, HTTP, and HTTPS
  sudo ufw allow 22/tcp comment 'SSH'
  sudo ufw allow 80/tcp comment 'HTTP'
  sudo ufw allow 443/tcp comment 'HTTPS'

  # Enable firewall (only if not already enabled)
  if ! sudo ufw status | grep -q "Status: active"; then
    info "Enabling firewall..."
    echo "y" | sudo ufw enable
  fi

  info "✓ Firewall configured"
  sudo ufw status
fi

# --- 8. Verify installations ---
echo ""
info "Verifying installations..."
echo ""

VERIFICATION_PASSED=true

# Check Docker
if docker --version >/dev/null 2>&1; then
  echo "✓ Docker: $(docker --version)"
else
  echo "✗ Docker: Not installed or not accessible"
  VERIFICATION_PASSED=false
fi

# Check Docker Compose
if docker-compose --version >/dev/null 2>&1; then
  echo "✓ Docker Compose: $(docker-compose --version)"
else
  echo "✗ Docker Compose: Not installed"
  VERIFICATION_PASSED=false
fi

# Check Nginx
if nginx -v >/dev/null 2>&1; then
  echo "✓ Nginx: $(nginx -v 2>&1)"
else
  echo "✗ Nginx: Not installed"
  VERIFICATION_PASSED=false
fi

# Check Certbot
if certbot --version >/dev/null 2>&1; then
  echo "✓ Certbot: $(certbot --version)"
else
  echo "✗ Certbot: Not installed"
  VERIFICATION_PASSED=false
fi

# Check Git
if git --version >/dev/null 2>&1; then
  echo "✓ Git: $(git --version)"
else
  echo "✗ Git: Not installed"
  VERIFICATION_PASSED=false
fi

echo ""

if [ "$VERIFICATION_PASSED" = true ]; then
  echo "==========================================="
  echo "✓ GCP VM Setup Complete!"
  echo "==========================================="
  echo ""
  echo "Next Steps:"
  echo ""
  echo "1. Log out and log back in for Docker group changes to take effect:"
  echo "   exit"
  echo "   ssh user@your-vm-ip"
  echo ""
  echo "2. Clone the Lexsy repository:"
  echo "   git clone https://github.com/yourusername/lexsy-test.git"
  echo "   cd lexsy-test"
  echo ""
  echo "3. Configure your domain in deploy.sh:"
  echo "   nano deploy.sh"
  echo "   # Update DOMAIN and EMAIL variables"
  echo ""
  echo "4. Create .env file:"
  echo "   cp .env.example .env"
  echo "   nano .env"
  echo "   # Set OPENAI_API_KEY and JWT_SECRET"
  echo ""
  echo "5. Run deployment:"
  echo "   ./deploy.sh"
  echo ""
  echo "For detailed instructions, see DEPLOYMENT.md"
  echo ""
else
  error "Some installations failed. Please check the output above."
  exit 1
fi
