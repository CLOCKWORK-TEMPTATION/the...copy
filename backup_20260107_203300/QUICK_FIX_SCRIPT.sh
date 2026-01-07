#!/bin/bash
# Quick Fix Script for Critical Security Issues
# النسخة - The Copy
# ⚠️ Run this script IMMEDIATELY before any production deployment

set -e  # Exit on error

echo "=================================================="
echo "🔒 The Copy - Critical Security Fixes"
echo "=================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored messages
print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "ℹ️  $1"
}

# Check if running in the correct directory
if [ ! -f "package.json" ]; then
    print_error "Error: Must run from project root directory"
    exit 1
fi

print_info "Starting security fixes..."
echo ""

# ============================================
# Step 1: Backup current state
# ============================================
echo "Step 1: Creating backup..."
BACKUP_DIR="backups/security-fix-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup .env files
if [ -f "backend/.env" ]; then
    cp backend/.env "$BACKUP_DIR/backend.env.backup"
    print_success "Backed up backend/.env"
fi

if [ -f "frontend/.env" ]; then
    cp frontend/.env "$BACKUP_DIR/frontend.env.backup"
    print_success "Backed up frontend/.env"
fi

# Backup database
if [ -f "backend/dev.db" ]; then
    cp backend/dev.db "$BACKUP_DIR/dev.db.backup"
    print_success "Backed up SQLite database"
fi

print_success "Backup created at: $BACKUP_DIR"
echo ""

# ============================================
# Step 2: Update .gitignore
# ============================================
echo "Step 2: Updating .gitignore..."

cat >> .gitignore << 'EOF'

# ============================================
# Security: Environment Variables
# ============================================
.env
.env.local
.env.development
.env.production
.env.test
backend/.env
backend/.env.local
backend/.env.production
frontend/.env
frontend/.env.local
frontend/.env.production

# Security: Secrets
secrets/
*.key
*.pem
*.p12
*.pfx

# Security: Backups
backups/
*.backup
*.bak

# Security: Logs with sensitive data
*.log
logs/
EOF

git add .gitignore
print_success ".gitignore updated"
echo ""

# ============================================
# Step 3: Remove sensitive files from Git
# ============================================
echo "Step 3: Removing sensitive files from Git..."

# Remove from staging
git rm --cached backend/.env 2>/dev/null || true
git rm --cached frontend/.env 2>/dev/null || true
git rm --cached .env 2>/dev/null || true

print_success "Sensitive files removed from Git staging"
echo ""

# ============================================
# Step 4: Create .env.example templates
# ============================================
echo "Step 4: Creating .env.example templates..."

# Backend .env.example
cat > backend/.env.example << 'EOF'
# ===================================================================
# Backend Environment Configuration Template
# ===================================================================
# IMPORTANT: Copy this file to .env and fill in the values
# NEVER commit .env to version control
# ===================================================================

# Runtime Environment
NODE_ENV=development
PORT=3001

# AI/ML Services - Gemini API
# Get your API key from: https://makersuite.google.com/app/apikey
GOOGLE_GENAI_API_KEY=your_api_key_here
GEMINI_API_KEY=your_api_key_here

# Security - Authentication
# Generate with: openssl rand -base64 64
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# Database Configuration
# PostgreSQL (Production): postgresql://user:password@host:5432/dbname
# SQLite (Development): sqlite://./dev.db
DATABASE_URL=postgresql://user:password@host:5432/dbname

# CORS Configuration
CORS_ORIGIN=http://localhost:5000,http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
# Or use Redis URL: redis://default:password@host:6379

# Sentry Configuration (Optional)
SENTRY_DSN=
SENTRY_ORG=
SENTRY_PROJECT=
EOF

print_success "Created backend/.env.example"

# Frontend .env.example
cat > frontend/.env.example << 'EOF'
# ===================================================================
# Frontend Environment Configuration Template
# ===================================================================
# IMPORTANT: Copy this file to .env.local and fill in the values
# NEVER commit .env.local to version control
# ===================================================================

# Runtime Environment
NODE_ENV=development
NEXT_PUBLIC_APP_ENV=development

# AI/ML Services - Gemini API
# Get your API keys from: https://makersuite.google.com/app/apikey
GEMINI_API_KEY_STAGING=your_staging_api_key_here
GEMINI_API_KEY_PROD=your_production_api_key_here

# Error Tracking - Sentry
SENTRY_DSN=
SENTRY_ORG=
SENTRY_PROJECT=
SENTRY_AUTH_TOKEN=
NEXT_PUBLIC_SENTRY_DSN=

# CDN Configuration (Optional)
NEXT_PUBLIC_CDN_URL=
NEXT_PUBLIC_ENABLE_CDN=false

# Redis Cache Configuration (Optional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
# Or use Redis URL: redis://default:password@host:6379
EOF

print_success "Created frontend/.env.example"
echo ""

# ============================================
# Step 5: Generate new secrets
# ============================================
echo "Step 5: Generating new secrets..."

# Generate JWT Secret
NEW_JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
print_success "Generated new JWT Secret (64 bytes)"

# Save to temporary file
mkdir -p "$BACKUP_DIR/new-secrets"
echo "JWT_SECRET=$NEW_JWT_SECRET" > "$BACKUP_DIR/new-secrets/jwt-secret.txt"

print_warning "New JWT Secret saved to: $BACKUP_DIR/new-secrets/jwt-secret.txt"
print_warning "⚠️  IMPORTANT: Copy this secret to your environment variables"
print_warning "⚠️  DO NOT commit this file to Git"
echo ""

# ============================================
# Step 6: Create production checklist
# ============================================
echo "Step 6: Creating production checklist..."

cat > SECURITY_CHECKLIST.md << 'EOF'
# Security Checklist - Before Production Deployment

## 🔴 Critical (Must Do)

### API Keys
- [ ] Revoke exposed API keys from Google Cloud Console
- [ ] Generate new API keys (Development + Production)
- [ ] Add API keys to environment variables (NOT in .env files)
- [ ] Test API keys work correctly

### JWT Secret
- [ ] Generate new JWT Secret (64+ bytes)
- [ ] Add JWT Secret to environment variables
- [ ] Invalidate all existing tokens
- [ ] Test authentication works

### Database
- [ ] Setup PostgreSQL (Neon/Supabase/Railway)
- [ ] Migrate data from SQLite to PostgreSQL
- [ ] Update DATABASE_URL in environment variables
- [ ] Test database connection
- [ ] Setup automated backups

### Git Security
- [ ] Remove .env files from Git history
- [ ] Update .gitignore
- [ ] Verify no secrets in Git
- [ ] Force push cleaned history

## 🟡 High Priority (Should Do)

### Redis
- [ ] Setup Redis Cloud (or alternative)
- [ ] Update REDIS_URL in environment variables
- [ ] Test Redis connection
- [ ] Verify BullMQ works

### Monitoring
- [ ] Setup Sentry error tracking
- [ ] Configure Prometheus metrics
- [ ] Setup health checks
- [ ] Configure alerts

### Testing
- [ ] Fix failing tests (30 tests)
- [ ] Run full test suite
- [ ] Verify 80%+ coverage
- [ ] Run E2E tests

## 🟢 Medium Priority (Nice to Have)

### Performance
- [ ] Enable Redis caching
- [ ] Optimize database queries
- [ ] Setup CDN for static assets
- [ ] Run performance tests

### Documentation
- [ ] Update deployment documentation
- [ ] Document environment variables
- [ ] Create runbooks
- [ ] Update README

## ✅ Verification

### Before Deployment
- [ ] All secrets in environment variables
- [ ] No secrets in Git
- [ ] PostgreSQL working
- [ ] Redis working (optional)
- [ ] All tests passing
- [ ] Security scan passed

### After Deployment
- [ ] Health check returns 200
- [ ] Authentication works
- [ ] Database queries work
- [ ] Redis caching works (if enabled)
- [ ] Monitoring active
- [ ] No errors in logs

---

**Last Updated**: $(date +%Y-%m-%d)
**Status**: ⚠️ IN PROGRESS
EOF

print_success "Created SECURITY_CHECKLIST.md"
echo ""

# ============================================
# Step 7: Create environment setup script
# ============================================
echo "Step 7: Creating environment setup script..."

cat > setup-env.sh << 'EOF'
#!/bin/bash
# Environment Setup Script
# Run this to create .env files from templates

set -e

echo "🔧 Setting up environment files..."

# Backend
if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env from template"
    echo "⚠️  Please edit backend/.env and fill in your values"
else
    echo "ℹ️  backend/.env already exists (skipping)"
fi

# Frontend
if [ ! -f "frontend/.env.local" ]; then
    cp frontend/.env.example frontend/.env.local
    echo "✅ Created frontend/.env.local from template"
    echo "⚠️  Please edit frontend/.env.local and fill in your values"
else
    echo "ℹ️  frontend/.env.local already exists (skipping)"
fi

echo ""
echo "📝 Next steps:"
echo "1. Edit backend/.env and add your secrets"
echo "2. Edit frontend/.env.local and add your secrets"
echo "3. Never commit these files to Git"
echo ""
EOF

chmod +x setup-env.sh
print_success "Created setup-env.sh"
echo ""

# ============================================
# Step 8: Commit changes
# ============================================
echo "Step 8: Committing security fixes..."

git add .gitignore
git add backend/.env.example
git add frontend/.env.example
git add SECURITY_CHECKLIST.md
git add setup-env.sh

git commit -m "security: implement critical security fixes

- Update .gitignore to prevent secret leaks
- Remove .env files from Git
- Create .env.example templates
- Generate new JWT secret
- Add security checklist
- Add environment setup script

BREAKING CHANGE: All environment variables must be reconfigured
" || print_warning "No changes to commit (already committed?)"

print_success "Changes committed"
echo ""

# ============================================
# Summary
# ============================================
echo "=================================================="
echo "✅ Security Fixes Applied Successfully"
echo "=================================================="
echo ""
print_success "Backup created at: $BACKUP_DIR"
print_success "New JWT Secret: $BACKUP_DIR/new-secrets/jwt-secret.txt"
echo ""
print_warning "⚠️  NEXT STEPS (CRITICAL):"
echo ""
echo "1. 🔴 Revoke exposed API keys:"
echo "   - Visit: https://console.cloud.google.com/apis/credentials"
echo "   - Revoke: AIzaSyB4qAmF6qTG3rUl27hDrLrRr8h_vjU8PmA"
echo ""
echo "2. 🔴 Generate new API keys:"
echo "   - Create separate keys for Development and Production"
echo "   - Add restrictions (HTTP referrers or IP addresses)"
echo ""
echo "3. 🔴 Setup PostgreSQL:"
echo "   - Visit: https://neon.tech (recommended)"
echo "   - Create new database"
echo "   - Update DATABASE_URL in environment variables"
echo ""
echo "4. 🔴 Clean Git history:"
echo "   - Run: git filter-branch (see CRITICAL_SECURITY_FIXES.md)"
echo "   - Force push: git push origin --force --all"
echo ""
echo "5. 🟡 Setup Redis (optional but recommended):"
echo "   - Visit: https://redis.com/try-free/"
echo "   - Create database"
echo "   - Update REDIS_URL in environment variables"
echo ""
echo "6. ✅ Review SECURITY_CHECKLIST.md"
echo "7. ✅ Run: ./setup-env.sh"
echo "8. ✅ Fill in your secrets in .env files"
echo ""
print_warning "⚠️  DO NOT DEPLOY TO PRODUCTION UNTIL ALL STEPS ARE COMPLETE"
echo ""
echo "For detailed instructions, see:"
echo "- CRITICAL_SECURITY_FIXES.md"
echo "- PRODUCTION_DEPLOYMENT_REPORT.md"
echo ""
echo "=================================================="
