#!/bin/bash
set -euo pipefail

# GCP VM Deployment Script for Lexsy (SmartDocs)
# This script will:
# 1. Create /opt/agency directory
# 2. Clone the repository using SSH
# 3. Configure environment
# 4. Run deployment

info() { echo "[deploy-vm] $1"; }
error() { echo "[deploy-vm] ERROR: $1" >&2; }

info "Starting deployment to GCP VM..."

# Configuration
PROJECT_DIR="/opt/agency/lexsy-test"
REPO_URL="git@github.com:yourusername/lexsy-test.git"  # UPDATE THIS
DOMAIN="smartdocs.agentprovision.com"
EMAIL="saguilera1608@gmail.com"

# --- 1. Check if running on GCP VM ---
if [ ! -d "/opt" ]; then
  error "This script should be run on the GCP VM"
  exit 1
fi

# --- 2. Create /opt/agency directory ---
info "Creating /opt/agency directory..."
if [ ! -d "/opt/agency" ]; then
  sudo mkdir -p /opt/agency
  sudo chown $USER:$USER /opt/agency
  info "✓ Created /opt/agency"
else
  info "✓ /opt/agency already exists"
fi

# --- 3. Check SSH key ---
info "Checking SSH key for GitHub..."
if [ ! -f "$HOME/.ssh/id_rsa" ] && [ ! -f "$HOME/.ssh/id_ed25519" ]; then
  error "No SSH key found. Please ensure SSH keys are configured for GitHub."
  exit 1
fi

# Test SSH connection to GitHub
if ssh -T git@github.com 2>&1 | grep -q "successfully authenticated"; then
  info "✓ SSH connection to GitHub verified"
else
  warn "⚠️  Could not verify GitHub SSH connection, but continuing..."
fi

# --- 4. Clone or update repository ---
if [ -d "$PROJECT_DIR" ]; then
  info "Repository already exists, pulling latest changes..."
  cd "$PROJECT_DIR"
  git pull origin main || git pull origin master
else
  info "Cloning repository to $PROJECT_DIR..."
  git clone "$REPO_URL" "$PROJECT_DIR"
  cd "$PROJECT_DIR"
fi

info "✓ Repository ready at $PROJECT_DIR"

# --- 5. Check environment file ---
if [ ! -f "$PROJECT_DIR/.env" ]; then
  info "Creating .env file from example..."
  cp "$PROJECT_DIR/.env.example" "$PROJECT_DIR/.env"

  error ".env file created but needs configuration!"
  error "Please edit $PROJECT_DIR/.env and set:"
  error "  - OPENAI_API_KEY=sk-your-actual-key"
  error "  - JWT_SECRET=your-secure-secret-32-chars-minimum"
  error ""
  error "Then run this script again or run: cd $PROJECT_DIR && ./deploy.sh"
  exit 1
else
  info "✓ .env file exists"

  # Validate required variables
  source "$PROJECT_DIR/.env"
  if [ -z "${OPENAI_API_KEY:-}" ] || [ "${OPENAI_API_KEY}" = "your_openai_api_key_here" ]; then
    error "OPENAI_API_KEY not properly set in .env"
    error "Please edit $PROJECT_DIR/.env and set a valid OpenAI API key"
    exit 1
  fi

  if [ -z "${JWT_SECRET:-}" ] || [ "${JWT_SECRET}" = "your_secure_jwt_secret_here_at_least_32_characters_long" ]; then
    error "JWT_SECRET not properly set in .env"
    error "Please edit $PROJECT_DIR/.env and set a secure JWT secret (32+ chars)"
    exit 1
  fi

  info "✓ Environment variables validated"
fi

# --- 6. Verify deploy.sh configuration ---
if grep -q "DOMAIN=\"smartdocs.agentprovision.com\"" "$PROJECT_DIR/deploy.sh"; then
  info "✓ Domain configured correctly in deploy.sh"
else
  warn "⚠️  Domain might not be configured correctly in deploy.sh"
fi

# --- 7. Make scripts executable ---
info "Making scripts executable..."
chmod +x "$PROJECT_DIR/deploy.sh"
chmod +x "$PROJECT_DIR/setup-vm.sh"
chmod +x "$PROJECT_DIR/validate-deployment.sh"

# --- 8. Run validation ---
info "Running deployment validation..."
cd "$PROJECT_DIR"
./validate-deployment.sh

# --- 9. Run deployment ---
info ""
info "=========================================="
info "Ready to deploy!"
info "=========================================="
info "Domain: $DOMAIN"
info "Project: $PROJECT_DIR"
info ""
read -p "Proceed with deployment? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  info "Starting deployment..."
  cd "$PROJECT_DIR"
  ./deploy.sh
else
  info "Deployment cancelled."
  info "To deploy manually, run: cd $PROJECT_DIR && ./deploy.sh"
  exit 0
fi
