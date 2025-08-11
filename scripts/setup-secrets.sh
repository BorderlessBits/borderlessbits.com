#!/bin/bash

# BorderlessBits.com - GitHub Secrets Setup Script
# Automates the configuration of GitHub repository secrets for CI/CD

set -euo pipefail

# ==========================================
# Configuration
# ==========================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
GITHUB_TOKEN=""
REPOSITORY=""
DRY_RUN="false"
LIST_SECRETS="false"
UPDATE_EXISTING="false"

# ==========================================
# Helper Functions
# ==========================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

show_usage() {
    cat << EOF
GitHub Secrets Setup Script for BorderlessBits.com

Usage: $0 [OPTIONS]

OPTIONS:
    -t, --token TOKEN       GitHub personal access token (required)
    -r, --repository REPO   GitHub repository (owner/repo format)
    -l, --list             List existing secrets
    -u, --update           Update existing secrets
    -d, --dry-run          Show what would be created without creating
    -h, --help             Show this help message

EXAMPLES:
    $0 -t ghp_xxx -r username/borderlessbits.com     # Setup secrets
    $0 -t ghp_xxx -r username/borderlessbits.com -l  # List existing secrets
    $0 -t ghp_xxx -r username/borderlessbits.com -d  # Dry run

REQUIREMENTS:
    - GitHub CLI (gh) installed
    - GitHub personal access token with repo permissions
    - Repository admin access

SECRETS CONFIGURED:
    - Production deployment secrets
    - Monitoring and analytics tokens
    - Third-party service credentials
    - Security and scanning tokens

EOF
}

parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -t|--token)
                GITHUB_TOKEN="$2"
                shift 2
                ;;
            -r|--repository)
                REPOSITORY="$2"
                shift 2
                ;;
            -l|--list)
                LIST_SECRETS="true"
                shift
                ;;
            -u|--update)
                UPDATE_EXISTING="true"
                shift
                ;;
            -d|--dry-run)
                DRY_RUN="true"
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

validate_requirements() {
    # Check for GitHub CLI
    if ! command -v gh &> /dev/null; then
        log_error "GitHub CLI (gh) is not installed"
        log_info "Install from: https://cli.github.com/"
        exit 1
    fi
    
    # Check for required parameters
    if [ -z "$GITHUB_TOKEN" ]; then
        log_error "GitHub token is required (-t option)"
        exit 1
    fi
    
    if [ -z "$REPOSITORY" ]; then
        log_error "Repository is required (-r option)"
        log_info "Format: owner/repository-name"
        exit 1
    fi
    
    # Validate repository format
    if [[ ! $REPOSITORY =~ ^[a-zA-Z0-9_.-]+/[a-zA-Z0-9_.-]+$ ]]; then
        log_error "Invalid repository format. Expected: owner/repo"
        exit 1
    fi
    
    log_success "Requirements validated"
}

authenticate_github() {
    log_info "Authenticating with GitHub..."
    
    # Set GitHub token
    export GITHUB_TOKEN="$GITHUB_TOKEN"
    
    # Test authentication
    if ! gh auth status &>/dev/null; then
        echo "$GITHUB_TOKEN" | gh auth login --with-token
    fi
    
    # Verify repository access
    if ! gh repo view "$REPOSITORY" &>/dev/null; then
        log_error "Unable to access repository: $REPOSITORY"
        log_info "Ensure the token has repository permissions and the repo exists"
        exit 1
    fi
    
    log_success "GitHub authentication successful"
}

# ==========================================
# Secret Management Functions
# ==========================================

list_existing_secrets() {
    log_info "Fetching existing secrets for $REPOSITORY..."
    
    local secrets
    secrets=$(gh secret list --repo "$REPOSITORY" --json name,updatedAt 2>/dev/null || echo '[]')
    
    if [ "$secrets" = "[]" ]; then
        log_info "No existing secrets found"
        return 0
    fi
    
    echo ""
    echo "┌─────────────────────────────────────┬──────────────────────┐"
    echo "│ Secret Name                         │ Last Updated         │"
    echo "├─────────────────────────────────────┼──────────────────────┤"
    
    echo "$secrets" | jq -r '.[] | [.name, .updatedAt] | @tsv' | while IFS=$'\t' read -r name updated; do
        local formatted_date
        formatted_date=$(date -d "$updated" '+%Y-%m-%d %H:%M:%S' 2>/dev/null || echo "$updated")
        printf "│ %-35s │ %-20s │\n" "${name:0:35}" "${formatted_date:0:20}"
    done
    
    echo "└─────────────────────────────────────┴──────────────────────┘"
    echo ""
}

prompt_for_secret() {
    local secret_name="$1"
    local description="$2"
    local required="${3:-true}"
    local example="${4:-}"
    
    echo ""
    echo "🔑 Setting up: $secret_name"
    echo "Description: $description"
    
    if [ -n "$example" ]; then
        echo "Example: $example"
    fi
    
    if [ "$required" = "false" ]; then
        echo "(Optional - press Enter to skip)"
    fi
    
    echo -n "Enter value: "
    read -r secret_value
    
    if [ -z "$secret_value" ] && [ "$required" = "true" ]; then
        log_warning "Required secret cannot be empty. Skipping..."
        return 1
    fi
    
    if [ -n "$secret_value" ]; then
        echo "$secret_value"
        return 0
    else
        return 1
    fi
}

set_secret() {
    local secret_name="$1"
    local secret_value="$2"
    
    if [ "$DRY_RUN" = "true" ]; then
        log_info "DRY RUN: Would set secret '$secret_name'"
        return 0
    fi
    
    # Check if secret already exists
    if gh secret list --repo "$REPOSITORY" --json name | jq -r '.[].name' | grep -q "^${secret_name}$"; then
        if [ "$UPDATE_EXISTING" = "false" ]; then
            log_warning "Secret '$secret_name' already exists. Use --update to overwrite."
            return 0
        fi
    fi
    
    # Set the secret
    if echo "$secret_value" | gh secret set "$secret_name" --repo "$REPOSITORY" --body; then
        log_success "Secret '$secret_name' set successfully"
        return 0
    else
        log_error "Failed to set secret '$secret_name'"
        return 1
    fi
}

# ==========================================
# Secret Definitions
# ==========================================

setup_production_secrets() {
    log_info "Setting up production deployment secrets..."
    
    # Google Analytics
    if secret_value=$(prompt_for_secret "GA_MEASUREMENT_ID" "Google Analytics 4 Measurement ID" "true" "G-XXXXXXXXXX"); then
        set_secret "GA_MEASUREMENT_ID" "$secret_value"
    fi
    
    # EmailJS Configuration
    if secret_value=$(prompt_for_secret "EMAILJS_SERVICE_ID" "EmailJS Service ID" "true" "service_xxxxxxx"); then
        set_secret "EMAILJS_SERVICE_ID" "$secret_value"
    fi
    
    if secret_value=$(prompt_for_secret "EMAILJS_TEMPLATE_ID" "EmailJS Template ID" "true" "template_xxxxxxx"); then
        set_secret "EMAILJS_TEMPLATE_ID" "$secret_value"
    fi
    
    if secret_value=$(prompt_for_secret "EMAILJS_PUBLIC_KEY" "EmailJS Public Key" "true" "xxxxxxxxxx"); then
        set_secret "EMAILJS_PUBLIC_KEY" "$secret_value"
    fi
}

setup_deployment_secrets() {
    log_info "Setting up deployment secrets..."
    
    # Netlify Configuration
    if secret_value=$(prompt_for_secret "NETLIFY_AUTH_TOKEN" "Netlify Authentication Token" "true"); then
        set_secret "NETLIFY_AUTH_TOKEN" "$secret_value"
    fi
    
    if secret_value=$(prompt_for_secret "NETLIFY_SITE_ID" "Netlify Production Site ID" "true"); then
        set_secret "NETLIFY_SITE_ID" "$secret_value"
    fi
    
    if secret_value=$(prompt_for_secret "NETLIFY_STAGING_SITE_ID" "Netlify Staging Site ID" "false"); then
        set_secret "NETLIFY_STAGING_SITE_ID" "$secret_value"
    fi
    
    if secret_value=$(prompt_for_secret "NETLIFY_PREVIEW_SITE_ID" "Netlify Preview Site ID" "false"); then
        set_secret "NETLIFY_PREVIEW_SITE_ID" "$secret_value"
    fi
    
    # Vercel Configuration (optional)
    if secret_value=$(prompt_for_secret "VERCEL_TOKEN" "Vercel Deployment Token" "false"); then
        set_secret "VERCEL_TOKEN" "$secret_value"
    fi
}

setup_monitoring_secrets() {
    log_info "Setting up monitoring and analytics secrets..."
    
    # Uptime Robot
    if secret_value=$(prompt_for_secret "UPTIMEROBOT_API_KEY" "Uptime Robot API Key" "false" "u123456-abcdef"); then
        set_secret "UPTIMEROBOT_API_KEY" "$secret_value"
    fi
    
    # Lighthouse CI
    if secret_value=$(prompt_for_secret "LHCI_GITHUB_APP_TOKEN" "Lighthouse CI GitHub App Token" "false"); then
        set_secret "LHCI_GITHUB_APP_TOKEN" "$secret_value"
    fi
    
    # Sentry (Error Monitoring)
    if secret_value=$(prompt_for_secret "SENTRY_AUTH_TOKEN" "Sentry Authentication Token" "false"); then
        set_secret "SENTRY_AUTH_TOKEN" "$secret_value"
    fi
    
    # Codecov
    if secret_value=$(prompt_for_secret "CODECOV_TOKEN" "Codecov Upload Token" "false"); then
        set_secret "CODECOV_TOKEN" "$secret_value"
    fi
}

setup_security_secrets() {
    log_info "Setting up security scanning secrets..."
    
    # GitLeaks License
    if secret_value=$(prompt_for_secret "GITLEAKS_LICENSE" "GitLeaks License Key (Premium)" "false"); then
        set_secret "GITLEAKS_LICENSE" "$secret_value"
    fi
    
    # Snyk Token
    if secret_value=$(prompt_for_secret "SNYK_TOKEN" "Snyk Authentication Token" "false"); then
        set_secret "SNYK_TOKEN" "$secret_value"
    fi
}

setup_staging_secrets() {
    log_info "Setting up staging environment secrets..."
    
    # Staging Google Analytics (separate property)
    if secret_value=$(prompt_for_secret "STAGING_GA_MEASUREMENT_ID" "Staging Google Analytics ID" "false" "G-XXXXXXXXXX"); then
        set_secret "STAGING_GA_MEASUREMENT_ID" "$secret_value"
    fi
}

# ==========================================
# Interactive Setup
# ==========================================

interactive_setup() {
    log_info "Starting interactive secrets setup for $REPOSITORY"
    echo ""
    
    echo "This script will guide you through setting up GitHub repository secrets."
    echo "You can skip optional secrets by pressing Enter without entering a value."
    echo ""
    
    read -p "Press Enter to continue..."
    
    # Setup different categories of secrets
    setup_production_secrets
    setup_deployment_secrets
    setup_monitoring_secrets
    setup_security_secrets
    setup_staging_secrets
    
    echo ""
    log_success "Interactive secrets setup completed!"
    
    # Show final summary
    echo ""
    log_info "To verify your secrets, run:"
    echo "  $0 -t \$GITHUB_TOKEN -r $REPOSITORY --list"
}

# ==========================================
# Batch Setup (Non-interactive)
# ==========================================

batch_setup() {
    log_info "Setting up secrets in batch mode..."
    
    # Define required secrets with environment variable names
    local secrets=(
        "GA_MEASUREMENT_ID:GOOGLE_ANALYTICS_ID"
        "EMAILJS_SERVICE_ID:EMAILJS_SERVICE_ID"
        "EMAILJS_TEMPLATE_ID:EMAILJS_TEMPLATE_ID"
        "EMAILJS_PUBLIC_KEY:EMAILJS_PUBLIC_KEY"
        "NETLIFY_AUTH_TOKEN:NETLIFY_AUTH_TOKEN"
        "NETLIFY_SITE_ID:NETLIFY_SITE_ID"
    )
    
    local set_count=0
    local total_count=${#secrets[@]}
    
    for secret_def in "${secrets[@]}"; do
        IFS=':' read -r secret_name env_var <<< "$secret_def"
        
        local secret_value="${!env_var:-}"
        
        if [ -n "$secret_value" ]; then
            if set_secret "$secret_name" "$secret_value"; then
                ((set_count++))
            fi
        else
            log_warning "Environment variable $env_var not set - skipping $secret_name"
        fi
    done
    
    log_info "Batch setup completed: $set_count/$total_count secrets set"
}

# ==========================================
# Main Execution
# ==========================================

main() {
    echo "🔑 GitHub Secrets Setup for BorderlessBits.com"
    echo "=============================================="
    echo ""
    
    parse_arguments "$@"
    validate_requirements
    authenticate_github
    
    if [ "$LIST_SECRETS" = "true" ]; then
        list_existing_secrets
        exit 0
    fi
    
    if [ "$DRY_RUN" = "true" ]; then
        log_info "DRY RUN MODE - No secrets will be actually set"
        echo ""
    fi
    
    # Check if running in CI/batch mode (non-interactive)
    if [ -n "${CI:-}" ] || [ ! -t 0 ]; then
        batch_setup
    else
        interactive_setup
    fi
    
    echo ""
    log_success "Secrets setup completed for $REPOSITORY"
    
    echo ""
    log_info "Next steps:"
    echo "1. Verify secrets are set correctly in GitHub repository settings"
    echo "2. Test deployment workflows to ensure secrets work properly"
    echo "3. Update any additional secrets as needed for third-party services"
    echo "4. Keep this script secure and don't commit tokens to version control"
}

# Execute main function with all arguments
main "$@"