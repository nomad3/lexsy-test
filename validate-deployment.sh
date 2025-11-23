#!/bin/bash
# Deployment Setup Validation Script
# This script validates that all deployment files are in place and properly configured

set -euo pipefail

info() { echo "✓ $1"; }
warn() { echo "⚠️  $1"; }
error() { echo "✗ $1"; }

echo "=========================================="
echo "Lexsy Deployment Setup Validation"
echo "=========================================="
echo ""

VALIDATION_PASSED=true

# Check deployment scripts
echo "Checking deployment scripts..."
if [ -f "deploy.sh" ] && [ -x "deploy.sh" ]; then
  info "deploy.sh exists and is executable"
else
  error "deploy.sh is missing or not executable"
  VALIDATION_PASSED=false
fi

if [ -f "setup-vm.sh" ] && [ -x "setup-vm.sh" ]; then
  info "setup-vm.sh exists and is executable"
else
  error "setup-vm.sh is missing or not executable"
  VALIDATION_PASSED=false
fi

# Check Docker Compose files
echo ""
echo "Checking Docker Compose files..."
if [ -f "docker-compose.yml" ]; then
  info "docker-compose.yml exists (development)"
else
  error "docker-compose.yml is missing"
  VALIDATION_PASSED=false
fi

if [ -f "docker-compose.prod.yml" ]; then
  info "docker-compose.prod.yml exists (production)"
else
  error "docker-compose.prod.yml is missing"
  VALIDATION_PASSED=false
fi

# Check frontend production files
echo ""
echo "Checking frontend production files..."
if [ -f "frontend/Dockerfile" ]; then
  info "frontend/Dockerfile exists"
else
  error "frontend/Dockerfile is missing"
  VALIDATION_PASSED=false
fi

if [ -f "frontend/nginx.conf" ]; then
  info "frontend/nginx.conf exists"
else
  error "frontend/nginx.conf is missing"
  VALIDATION_PASSED=false
fi

# Check documentation
echo ""
echo "Checking documentation..."
if [ -f "DEPLOYMENT.md" ]; then
  info "DEPLOYMENT.md exists"
else
  error "DEPLOYMENT.md is missing"
  VALIDATION_PASSED=false
fi

if [ -f "DEPLOY-REFERENCE.md" ]; then
  info "DEPLOY-REFERENCE.md exists"
else
  error "DEPLOY-REFERENCE.md is missing"
  VALIDATION_PASSED=false
fi

if [ -f "DEPLOYMENT-SUMMARY.md" ]; then
  info "DEPLOYMENT-SUMMARY.md exists"
else
  error "DEPLOYMENT-SUMMARY.md is missing"
  VALIDATION_PASSED=false
fi

# Check environment configuration
echo ""
echo "Checking environment configuration..."
if [ -f ".env.example" ]; then
  info ".env.example exists"
else
  warn ".env.example is missing"
fi

if [ -f ".env" ]; then
  info ".env exists"

  # Check for required variables
  if grep -q "OPENAI_API_KEY=" .env; then
    if grep -q "OPENAI_API_KEY=sk-" .env; then
      info "OPENAI_API_KEY is set in .env"
    else
      warn "OPENAI_API_KEY in .env needs to be updated"
    fi
  else
    warn "OPENAI_API_KEY not found in .env"
  fi

  if grep -q "JWT_SECRET=" .env; then
    JWT_SECRET=$(grep "JWT_SECRET=" .env | cut -d'=' -f2)
    if [ ${#JWT_SECRET} -ge 32 ]; then
      info "JWT_SECRET is set and has sufficient length"
    else
      warn "JWT_SECRET should be at least 32 characters long"
    fi
  else
    warn "JWT_SECRET not found in .env"
  fi
else
  warn ".env file not found (create from .env.example)"
fi

# Check deploy.sh configuration
echo ""
echo "Checking deploy.sh configuration..."
if grep -q 'DOMAIN="lexsy.yourdomain.com"' deploy.sh; then
  warn "DOMAIN in deploy.sh needs to be updated to your actual domain"
else
  info "DOMAIN in deploy.sh has been customized"
fi

if grep -q 'EMAIL="your-email@example.com"' deploy.sh; then
  warn "EMAIL in deploy.sh needs to be updated to your actual email"
else
  info "EMAIL in deploy.sh has been customized"
fi

# Validate bash syntax
echo ""
echo "Validating script syntax..."
if bash -n deploy.sh 2>/dev/null; then
  info "deploy.sh syntax is valid"
else
  error "deploy.sh has syntax errors"
  VALIDATION_PASSED=false
fi

if bash -n setup-vm.sh 2>/dev/null; then
  info "setup-vm.sh syntax is valid"
else
  error "setup-vm.sh has syntax errors"
  VALIDATION_PASSED=false
fi

# Check Docker Compose syntax
echo ""
echo "Validating Docker Compose syntax..."
if command -v docker-compose >/dev/null 2>&1; then
  if docker-compose -f docker-compose.yml config >/dev/null 2>&1; then
    info "docker-compose.yml syntax is valid"
  else
    error "docker-compose.yml has syntax errors"
    VALIDATION_PASSED=false
  fi

  if docker-compose -f docker-compose.prod.yml config >/dev/null 2>&1; then
    info "docker-compose.prod.yml syntax is valid"
  else
    error "docker-compose.prod.yml has syntax errors"
    VALIDATION_PASSED=false
  fi
else
  warn "docker-compose not installed, skipping syntax validation"
fi

# Summary
echo ""
echo "=========================================="
if [ "$VALIDATION_PASSED" = true ]; then
  echo "✅ All validation checks passed!"
  echo "=========================================="
  echo ""
  echo "Next steps:"
  echo "1. Update DOMAIN and EMAIL in deploy.sh"
  echo "2. Create/update .env file with OPENAI_API_KEY and JWT_SECRET"
  echo "3. Test locally: DEPLOY_MODE=local ./deploy.sh"
  echo "4. Deploy to GCP VM: ./deploy.sh"
  echo ""
  echo "For detailed instructions, see DEPLOYMENT.md"
else
  echo "❌ Some validation checks failed"
  echo "=========================================="
  echo ""
  echo "Please fix the issues above before deploying."
fi
echo ""
