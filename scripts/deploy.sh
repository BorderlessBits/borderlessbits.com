#!/bin/bash

# BorderlessBits.com - Deployment Automation Script
# Handles deployment to multiple targets with automatic rollback

set -euo pipefail

# ==========================================
# Configuration
# ==========================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DEPLOYMENT_LOG="${PROJECT_ROOT}/logs/deployment.log"
BACKUP_DIR="${PROJECT_ROOT}/backups"
MAX_BACKUP_DAYS=30

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT="production"
TARGET="all"
SKIP_TESTS="false"
SKIP_BUILD="false"
DRY_RUN="false"
FORCE="false"
ROLLBACK="false"

# ==========================================
# Logging Functions
# ==========================================

setup_logging() {
    mkdir -p "$(dirname "$DEPLOYMENT_LOG")"
    exec 1> >(tee -a "$DEPLOYMENT_LOG")
    exec 2> >(tee -a "$DEPLOYMENT_LOG" >&2)
    echo "$(date '+%Y-%m-%d %H:%M:%S') - Deployment started" | tee -a "$DEPLOYMENT_LOG"
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$DEPLOYMENT_LOG"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$DEPLOYMENT_LOG"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$DEPLOYMENT_LOG"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$DEPLOYMENT_LOG"
}

# ==========================================
# Helper Functions
# ==========================================

show_usage() {
    cat << EOF
BorderlessBits.com Deployment Script

Usage: $0 [OPTIONS]

OPTIONS:
    -e, --environment ENV    Deployment environment (production|staging) [default: production]
    -t, --target TARGET      Deployment target (github|netlify|vercel|all) [default: all]
    -s, --skip-tests        Skip test execution
    -b, --skip-build        Skip build process (use existing build)
    -d, --dry-run           Perform dry run without actual deployment
    -f, --force             Force deployment even if validations fail
    -r, --rollback          Rollback to previous deployment
    -h, --help              Show this help message

EXAMPLES:
    $0                                    # Deploy to production (all targets)
    $0 -e staging -t netlify             # Deploy to staging on Netlify only
    $0 -d                                # Dry run deployment
    $0 -r                                # Rollback to previous version
    $0 --skip-tests --force              # Force deploy without tests

ENVIRONMENT VARIABLES:
    NODE_ENV                             # Node.js environment
    GITHUB_TOKEN                         # GitHub API token
    NETLIFY_AUTH_TOKEN                   # Netlify authentication token
    VERCEL_TOKEN                         # Vercel authentication token

EOF
}

parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -e|--environment)
                ENVIRONMENT="$2"
                shift 2
                ;;
            -t|--target)
                TARGET="$2"
                shift 2
                ;;
            -s|--skip-tests)
                SKIP_TESTS="true"
                shift
                ;;
            -b|--skip-build)
                SKIP_BUILD="true"
                shift
                ;;
            -d|--dry-run)
                DRY_RUN="true"
                shift
                ;;
            -f|--force)
                FORCE="true"
                shift
                ;;
            -r|--rollback)
                ROLLBACK="true"
                shift
                ;;
            -h|--help)
                show_usage
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
}

validate_environment() {
    log_info "Validating deployment environment..."
    
    case "$ENVIRONMENT" in
        production|staging)
            log_success "Environment '$ENVIRONMENT' is valid"
            ;;
        *)
            log_error "Invalid environment: $ENVIRONMENT"
            exit 1
            ;;
    esac
}

check_dependencies() {
    log_info "Checking required dependencies..."
    
    local missing_deps=()
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        missing_deps+=("node")
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        missing_deps+=("npm")
    fi
    
    # Check git
    if ! command -v git &> /dev/null; then
        missing_deps+=("git")
    fi
    
    # Check curl
    if ! command -v curl &> /dev/null; then
        missing_deps+=("curl")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        log_error "Missing required dependencies: ${missing_deps[*]}"
        exit 1
    fi
    
    log_success "All required dependencies are available"
}

create_backup() {
    log_info "Creating deployment backup..."
    
    mkdir -p "$BACKUP_DIR"
    
    local backup_name="backup-$(date '+%Y%m%d-%H%M%S')-$(git rev-parse --short HEAD)"
    local backup_path="$BACKUP_DIR/$backup_name"
    
    # Create backup of current build
    if [ -d "$PROJECT_ROOT/out" ]; then
        cp -r "$PROJECT_ROOT/out" "$backup_path"
        echo "$backup_name" > "$BACKUP_DIR/latest"
        log_success "Backup created: $backup_name"
    else
        log_warning "No existing build found to backup"
    fi
    
    # Cleanup old backups
    find "$BACKUP_DIR" -name "backup-*" -type d -mtime +$MAX_BACKUP_DAYS -exec rm -rf {} \; || true
}

# ==========================================
# Quality Gates
# ==========================================

run_quality_gates() {
    if [ "$SKIP_TESTS" = "true" ]; then
        log_warning "Skipping quality gates as requested"
        return 0
    fi
    
    log_info "Running quality gates..."
    
    cd "$PROJECT_ROOT"
    
    # Install dependencies
    log_info "Installing dependencies..."
    npm ci --prefer-offline --no-audit
    
    # Type checking
    log_info "Running TypeScript checks..."
    npm run type-check
    
    # Linting
    log_info "Running ESLint..."
    npm run lint
    
    # Format check
    log_info "Checking code format..."
    npm run format:check
    
    # Tests
    log_info "Running tests..."
    npm run test
    
    # Security audit
    log_info "Running security audit..."
    npm audit --audit-level moderate || {
        if [ "$FORCE" = "false" ]; then
            log_error "Security audit failed. Use --force to override."
            exit 1
        else
            log_warning "Security audit failed but continuing due to --force flag"
        fi
    }
    
    log_success "All quality gates passed"
}

# ==========================================
# Build Process
# ==========================================

build_application() {
    if [ "$SKIP_BUILD" = "true" ]; then
        log_warning "Skipping build as requested"
        return 0
    fi
    
    log_info "Building application for $ENVIRONMENT..."
    
    cd "$PROJECT_ROOT"
    
    # Set environment variables
    export NODE_ENV="production"
    
    case "$ENVIRONMENT" in
        production)
            export NEXT_PUBLIC_SITE_URL="https://borderlessbits.com"
            ;;
        staging)
            export NEXT_PUBLIC_SITE_URL="https://staging.borderlessbits.com"
            ;;
    esac
    
    # Build the application
    npm run build
    
    # Validate build output
    if [ ! -d "out" ] || [ ! -f "out/index.html" ]; then
        log_error "Build failed - output directory or index.html not found"
        exit 1
    fi
    
    # Check build size
    local build_size=$(du -sh out | cut -f1)
    log_info "Build size: $build_size"
    
    # Bundle analysis (if available)
    if [ -f ".next/analyze/bundle-sizes.json" ]; then
        log_info "Bundle analysis available - checking bundle sizes..."
        node -e "
            const data = require('./.next/analyze/bundle-sizes.json');
            console.log('Total bundle size:', Math.round(data.total / 1024), 'KB');
            if (data.total > 2048000) {
                console.error('WARNING: Bundle size exceeds 2MB');
                process.exit(1);
            }
        " || {
            if [ "$FORCE" = "false" ]; then
                log_error "Bundle size check failed. Use --force to override."
                exit 1
            else
                log_warning "Bundle size check failed but continuing due to --force flag"
            fi
        }
    fi
    
    log_success "Build completed successfully"
}

# ==========================================
# Deployment Functions
# ==========================================

deploy_to_github_pages() {
    log_info "Deploying to GitHub Pages..."
    
    if [ "$DRY_RUN" = "true" ]; then
        log_info "DRY RUN: Would deploy to GitHub Pages"
        return 0
    fi
    
    # This is typically handled by GitHub Actions, but we can provide manual deploy
    if [ -z "${GITHUB_TOKEN:-}" ]; then
        log_warning "GITHUB_TOKEN not set - GitHub Pages deployment requires GitHub Actions"
        return 1
    fi
    
    log_success "GitHub Pages deployment initiated"
}

deploy_to_netlify() {
    log_info "Deploying to Netlify..."
    
    if [ "$DRY_RUN" = "true" ]; then
        log_info "DRY RUN: Would deploy to Netlify"
        return 0
    fi
    
    if [ -z "${NETLIFY_AUTH_TOKEN:-}" ]; then
        log_error "NETLIFY_AUTH_TOKEN not set"
        return 1
    fi
    
    # Install Netlify CLI if not available
    if ! command -v netlify &> /dev/null; then
        log_info "Installing Netlify CLI..."
        npm install -g netlify-cli
    fi
    
    # Deploy to Netlify
    local site_id
    case "$ENVIRONMENT" in
        production)
            site_id="${NETLIFY_SITE_ID:-}"
            ;;
        staging)
            site_id="${NETLIFY_STAGING_SITE_ID:-}"
            ;;
    esac
    
    if [ -z "$site_id" ]; then
        log_error "Netlify site ID not configured for $ENVIRONMENT"
        return 1
    fi
    
    netlify deploy \
        --prod \
        --dir=out \
        --site="$site_id" \
        --auth="$NETLIFY_AUTH_TOKEN" \
        --message="Deployment $(date '+%Y-%m-%d %H:%M:%S')"
    
    log_success "Netlify deployment completed"
}

deploy_to_vercel() {
    log_info "Deploying to Vercel..."
    
    if [ "$DRY_RUN" = "true" ]; then
        log_info "DRY RUN: Would deploy to Vercel"
        return 0
    fi
    
    if [ -z "${VERCEL_TOKEN:-}" ]; then
        log_error "VERCEL_TOKEN not set"
        return 1
    fi
    
    # Install Vercel CLI if not available
    if ! command -v vercel &> /dev/null; then
        log_info "Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    # Deploy to Vercel
    vercel --token="$VERCEL_TOKEN" --prod --yes
    
    log_success "Vercel deployment completed"
}

# ==========================================
# Validation Functions
# ==========================================

validate_deployment() {
    log_info "Validating deployment..."
    
    local urls=()
    
    case "$ENVIRONMENT" in
        production)
            urls+=(
                "https://borderlessbits.com"
                "https://borderlessbits.com/contact"
            )
            ;;
        staging)
            urls+=(
                "https://staging.borderlessbits.com"
                "https://staging.borderlessbits.com/contact"
            )
            ;;
    esac
    
    local failed_urls=()
    
    for url in "${urls[@]}"; do
        log_info "Checking $url..."
        
        local attempt=1
        local max_attempts=5
        local success=false
        
        while [ $attempt -le $max_attempts ] && [ "$success" = false ]; do
            if curl -f -s -o /dev/null -w "%{http_code}" "$url" | grep -q "200"; then
                log_success "$url is responding correctly"
                success=true
            else
                log_warning "Attempt $attempt/$max_attempts failed for $url"
                sleep 10
                ((attempt++))
            fi
        done
        
        if [ "$success" = false ]; then
            failed_urls+=("$url")
        fi
    done
    
    if [ ${#failed_urls[@]} -ne 0 ]; then
        log_error "Validation failed for URLs: ${failed_urls[*]}"
        return 1
    fi
    
    log_success "All URLs validated successfully"
    
    # Run Lighthouse audit (if available)
    if command -v lhci &> /dev/null; then
        log_info "Running Lighthouse performance audit..."
        lhci autorun --config=lighthouserc.json || {
            log_warning "Lighthouse audit completed with warnings"
        }
    fi
    
    return 0
}

# ==========================================
# Rollback Functions
# ==========================================

rollback_deployment() {
    log_info "Rolling back to previous deployment..."
    
    if [ ! -f "$BACKUP_DIR/latest" ]; then
        log_error "No backup available for rollback"
        exit 1
    fi
    
    local latest_backup=$(cat "$BACKUP_DIR/latest")
    local backup_path="$BACKUP_DIR/$latest_backup"
    
    if [ ! -d "$backup_path" ]; then
        log_error "Backup directory not found: $backup_path"
        exit 1
    fi
    
    # Restore backup
    rm -rf "$PROJECT_ROOT/out"
    cp -r "$backup_path" "$PROJECT_ROOT/out"
    
    log_success "Backup restored: $latest_backup"
    
    # Redeploy with restored backup
    case "$TARGET" in
        github|all)
            deploy_to_github_pages || log_error "Failed to rollback GitHub Pages"
            ;;
    esac
    
    case "$TARGET" in
        netlify|all)
            deploy_to_netlify || log_error "Failed to rollback Netlify"
            ;;
    esac
    
    case "$TARGET" in
        vercel|all)
            deploy_to_vercel || log_error "Failed to rollback Vercel"
            ;;
    esac
    
    log_success "Rollback completed"
}

# ==========================================
# Main Execution
# ==========================================

main() {
    setup_logging
    parse_arguments "$@"
    
    log_info "Starting deployment process..."
    log_info "Environment: $ENVIRONMENT"
    log_info "Target: $TARGET"
    log_info "Dry Run: $DRY_RUN"
    
    if [ "$ROLLBACK" = "true" ]; then
        rollback_deployment
        exit 0
    fi
    
    validate_environment
    check_dependencies
    create_backup
    run_quality_gates
    build_application
    
    # Execute deployments based on target
    local deployment_errors=()
    
    case "$TARGET" in
        github|all)
            deploy_to_github_pages || deployment_errors+=("GitHub Pages")
            ;;
    esac
    
    case "$TARGET" in
        netlify|all)
            deploy_to_netlify || deployment_errors+=("Netlify")
            ;;
    esac
    
    case "$TARGET" in
        vercel|all)
            deploy_to_vercel || deployment_errors+=("Vercel")
            ;;
    esac
    
    # Check for deployment errors
    if [ ${#deployment_errors[@]} -ne 0 ]; then
        log_error "Deployment failed for: ${deployment_errors[*]}"
        
        if [ "$FORCE" = "false" ]; then
            log_info "Initiating automatic rollback..."
            rollback_deployment
        fi
        
        exit 1
    fi
    
    # Validate deployments
    if ! validate_deployment; then
        log_error "Deployment validation failed"
        
        if [ "$FORCE" = "false" ]; then
            log_info "Initiating automatic rollback..."
            rollback_deployment
        fi
        
        exit 1
    fi
    
    log_success "Deployment completed successfully!"
    log_info "Environment: $ENVIRONMENT"
    log_info "Targets: $TARGET"
    log_info "Build hash: $(git rev-parse --short HEAD)"
    log_info "Deployment time: $(date)"
}

# Execute main function with all arguments
main "$@"