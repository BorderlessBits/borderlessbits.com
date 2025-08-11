#!/bin/bash

# BorderlessBits.com - Emergency Rollback Script
# Quick rollback to previous working deployment

set -euo pipefail

# ==========================================
# Configuration
# ==========================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="${PROJECT_ROOT}/backups"
ROLLBACK_LOG="${PROJECT_ROOT}/logs/rollback.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT="production"
TARGET="all"
BACKUP_NAME=""
LIST_BACKUPS="false"
CONFIRM="true"

# ==========================================
# Logging Functions
# ==========================================

setup_logging() {
    mkdir -p "$(dirname "$ROLLBACK_LOG")"
    exec 1> >(tee -a "$ROLLBACK_LOG")
    exec 2> >(tee -a "$ROLLBACK_LOG" >&2)
    echo "$(date '+%Y-%m-%d %H:%M:%S') - Rollback started" | tee -a "$ROLLBACK_LOG"
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$ROLLBACK_LOG"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$ROLLBACK_LOG"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$ROLLBACK_LOG"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$ROLLBACK_LOG"
}

# ==========================================
# Helper Functions
# ==========================================

show_usage() {
    cat << EOF
BorderlessBits.com Emergency Rollback Script

Usage: $0 [OPTIONS]

OPTIONS:
    -e, --environment ENV    Target environment (production|staging) [default: production]
    -t, --target TARGET      Rollback target (github|netlify|vercel|all) [default: all]
    -b, --backup NAME        Specific backup to restore (default: latest)
    -l, --list-backups      List available backups
    -y, --yes               Skip confirmation prompts
    -h, --help              Show this help message

EXAMPLES:
    $0                                    # Rollback production to latest backup
    $0 -e staging                        # Rollback staging environment
    $0 -b backup-20231201-143022         # Rollback to specific backup
    $0 -l                                # List available backups
    $0 -y                                # Rollback without confirmation

ENVIRONMENT VARIABLES:
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
            -b|--backup)
                BACKUP_NAME="$2"
                shift 2
                ;;
            -l|--list-backups)
                LIST_BACKUPS="true"
                shift
                ;;
            -y|--yes)
                CONFIRM="false"
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

list_available_backups() {
    log_info "Available backups:"
    echo ""
    
    if [ ! -d "$BACKUP_DIR" ]; then
        log_warning "No backup directory found"
        return 0
    fi
    
    local backups=($(ls -1t "$BACKUP_DIR" | grep "^backup-" || true))
    
    if [ ${#backups[@]} -eq 0 ]; then
        log_warning "No backups found"
        return 0
    fi
    
    local latest_backup=""
    if [ -f "$BACKUP_DIR/latest" ]; then
        latest_backup=$(cat "$BACKUP_DIR/latest")
    fi
    
    echo "┌─────────────────────────────┬──────────────────────┬────────────┬─────────┐"
    echo "│ Backup Name                 │ Date Created         │ Size       │ Status  │"
    echo "├─────────────────────────────┼──────────────────────┼────────────┼─────────┤"
    
    for backup in "${backups[@]}"; do
        if [ -d "$BACKUP_DIR/$backup" ]; then
            local backup_date=$(echo "$backup" | sed 's/backup-\([0-9]\{8\}\)-\([0-9]\{6\}\).*/\1 \2/' | sed 's/\(.\{4\}\)\(.\{2\}\)\(.\{2\}\) \(.\{2\}\)\(.\{2\}\)\(.\{2\}\)/\1-\2-\3 \4:\5:\6/')
            local backup_size=$(du -sh "$BACKUP_DIR/$backup" 2>/dev/null | cut -f1 || echo "N/A")
            local status=""
            
            if [ "$backup" = "$latest_backup" ]; then
                status="LATEST"
            else
                status=""
            fi
            
            printf "│ %-27s │ %-20s │ %-10s │ %-7s │\n" "$backup" "$backup_date" "$backup_size" "$status"
        fi
    done
    
    echo "└─────────────────────────────┴──────────────────────┴────────────┴─────────┘"
    echo ""
    
    if [ -n "$latest_backup" ]; then
        log_info "Latest backup: $latest_backup"
    fi
}

get_backup_to_restore() {
    if [ -n "$BACKUP_NAME" ]; then
        if [ ! -d "$BACKUP_DIR/$BACKUP_NAME" ]; then
            log_error "Specified backup not found: $BACKUP_NAME"
            exit 1
        fi
        echo "$BACKUP_NAME"
        return 0
    fi
    
    # Use latest backup
    if [ -f "$BACKUP_DIR/latest" ]; then
        local latest_backup=$(cat "$BACKUP_DIR/latest")
        if [ -d "$BACKUP_DIR/$latest_backup" ]; then
            echo "$latest_backup"
            return 0
        fi
    fi
    
    # Fallback to most recent backup
    local recent_backup=$(ls -1t "$BACKUP_DIR" | grep "^backup-" | head -n1 || true)
    if [ -n "$recent_backup" ] && [ -d "$BACKUP_DIR/$recent_backup" ]; then
        echo "$recent_backup"
        return 0
    fi
    
    log_error "No suitable backup found for rollback"
    exit 1
}

confirm_rollback() {
    if [ "$CONFIRM" = "false" ]; then
        return 0
    fi
    
    local backup_to_restore="$1"
    
    echo ""
    log_warning "⚠️  ROLLBACK CONFIRMATION ⚠️"
    echo ""
    echo "Environment: $ENVIRONMENT"
    echo "Target: $TARGET"
    echo "Backup: $backup_to_restore"
    echo ""
    echo "This will:"
    echo "- Replace the current deployment with the selected backup"
    echo "- Potentially lose any changes made since the backup"
    echo "- Affect live users if rolling back production"
    echo ""
    
    read -p "Are you sure you want to continue? (yes/no): " -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        log_info "Rollback cancelled by user"
        exit 0
    fi
}

# ==========================================
# Rollback Functions
# ==========================================

restore_backup() {
    local backup_name="$1"
    local backup_path="$BACKUP_DIR/$backup_name"
    
    log_info "Restoring backup: $backup_name"
    
    # Create current state backup before rollback
    local pre_rollback_backup="pre-rollback-$(date '+%Y%m%d-%H%M%S')"
    if [ -d "$PROJECT_ROOT/out" ]; then
        cp -r "$PROJECT_ROOT/out" "$BACKUP_DIR/$pre_rollback_backup"
        log_info "Current state backed up as: $pre_rollback_backup"
    fi
    
    # Restore the backup
    rm -rf "$PROJECT_ROOT/out"
    cp -r "$backup_path" "$PROJECT_ROOT/out"
    
    log_success "Backup restored successfully"
}

deploy_rollback_to_github() {
    log_info "Rolling back GitHub Pages..."
    
    if [ -z "${GITHUB_TOKEN:-}" ]; then
        log_warning "GITHUB_TOKEN not set - manual GitHub Pages rollback required"
        return 1
    fi
    
    # For GitHub Pages, we need to trigger a new deployment
    # This typically requires pushing to the repository or using API
    log_warning "GitHub Pages rollback requires repository push or GitHub Actions trigger"
    return 1
}

deploy_rollback_to_netlify() {
    log_info "Rolling back Netlify deployment..."
    
    if [ -z "${NETLIFY_AUTH_TOKEN:-}" ]; then
        log_error "NETLIFY_AUTH_TOKEN not set"
        return 1
    fi
    
    # Install Netlify CLI if not available
    if ! command -v netlify &> /dev/null; then
        log_info "Installing Netlify CLI..."
        npm install -g netlify-cli
    fi
    
    # Deploy rollback to Netlify
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
        --message="Rollback deployment $(date '+%Y-%m-%d %H:%M:%S')"
    
    log_success "Netlify rollback completed"
}

deploy_rollback_to_vercel() {
    log_info "Rolling back Vercel deployment..."
    
    if [ -z "${VERCEL_TOKEN:-}" ]; then
        log_error "VERCEL_TOKEN not set"
        return 1
    fi
    
    # Install Vercel CLI if not available
    if ! command -v vercel &> /dev/null; then
        log_info "Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    # Deploy rollback to Vercel
    cd "$PROJECT_ROOT"
    vercel --token="$VERCEL_TOKEN" --prod --yes out/
    
    log_success "Vercel rollback completed"
}

validate_rollback() {
    log_info "Validating rollback..."
    
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
    
    # Wait a bit for deployment to propagate
    log_info "Waiting for deployment propagation..."
    sleep 30
    
    for url in "${urls[@]}"; do
        log_info "Checking $url..."
        
        local attempt=1
        local max_attempts=3
        local success=false
        
        while [ $attempt -le $max_attempts ] && [ "$success" = false ]; do
            if curl -f -s -o /dev/null -w "%{http_code}" "$url" | grep -q "200"; then
                log_success "$url is responding correctly"
                success=true
            else
                log_warning "Attempt $attempt/$max_attempts failed for $url"
                sleep 15
                ((attempt++))
            fi
        done
        
        if [ "$success" = false ]; then
            failed_urls+=("$url")
        fi
    done
    
    if [ ${#failed_urls[@]} -ne 0 ]; then
        log_error "Rollback validation failed for URLs: ${failed_urls[*]}"
        return 1
    fi
    
    log_success "Rollback validation completed successfully"
    return 0
}

# ==========================================
# Main Execution
# ==========================================

main() {
    setup_logging
    parse_arguments "$@"
    
    if [ "$LIST_BACKUPS" = "true" ]; then
        list_available_backups
        exit 0
    fi
    
    log_info "Starting rollback process..."
    log_info "Environment: $ENVIRONMENT"
    log_info "Target: $TARGET"
    
    # Check if backup directory exists
    if [ ! -d "$BACKUP_DIR" ]; then
        log_error "Backup directory not found: $BACKUP_DIR"
        exit 1
    fi
    
    # Get backup to restore
    local backup_to_restore
    backup_to_restore=$(get_backup_to_restore)
    
    log_info "Selected backup: $backup_to_restore"
    
    # Confirm rollback
    confirm_rollback "$backup_to_restore"
    
    # Restore backup
    restore_backup "$backup_to_restore"
    
    # Deploy rollback based on target
    local rollback_errors=()
    
    case "$TARGET" in
        github|all)
            deploy_rollback_to_github || rollback_errors+=("GitHub Pages")
            ;;
    esac
    
    case "$TARGET" in
        netlify|all)
            deploy_rollback_to_netlify || rollback_errors+=("Netlify")
            ;;
    esac
    
    case "$TARGET" in
        vercel|all)
            deploy_rollback_to_vercel || rollback_errors+=("Vercel")
            ;;
    esac
    
    # Check for rollback errors
    if [ ${#rollback_errors[@]} -ne 0 ]; then
        log_error "Rollback failed for: ${rollback_errors[*]}"
        exit 1
    fi
    
    # Validate rollback
    if ! validate_rollback; then
        log_error "Rollback validation failed - manual intervention may be required"
        exit 1
    fi
    
    log_success "Rollback completed successfully!"
    log_info "Environment: $ENVIRONMENT"
    log_info "Restored backup: $backup_to_restore"
    log_info "Rollback time: $(date)"
    
    echo ""
    log_info "Next steps:"
    echo "1. Monitor the application for proper functionality"
    echo "2. Investigate the root cause of the issue that triggered the rollback"
    echo "3. Fix the issue and prepare a new deployment"
    echo "4. Consider implementing additional monitoring to prevent similar issues"
}

# Execute main function with all arguments
main "$@"