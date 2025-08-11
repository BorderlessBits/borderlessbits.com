#!/bin/bash

# BorderlessBits.com - Uptime Robot Configuration Script
# Automates the setup of uptime monitoring via Uptime Robot API

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
API_KEY=""
DRY_RUN="false"
LIST_MONITORS="false"

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
Uptime Robot Setup Script for BorderlessBits.com

Usage: $0 [OPTIONS]

OPTIONS:
    -k, --api-key KEY       Uptime Robot API key (required)
    -l, --list             List existing monitors
    -d, --dry-run          Show what would be created without creating
    -h, --help             Show this help message

EXAMPLES:
    $0 -k ur123456-abcdef                # Setup monitors with API key
    $0 -k ur123456-abcdef -l             # List existing monitors
    $0 -k ur123456-abcdef -d             # Dry run to see what would be created

ENVIRONMENT VARIABLES:
    UPTIMEROBOT_API_KEY                  # Uptime Robot API key

MONITORING SETUP:
    - Production site (https://borderlessbits.com)
    - Production contact page
    - Staging site (if available)
    - Backup site (if available)
    - 5-minute intervals for critical endpoints
    - 15-minute intervals for non-critical endpoints
    - Email alerts on downtime

EOF
}

parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -k|--api-key)
                API_KEY="$2"
                shift 2
                ;;
            -l|--list)
                LIST_MONITORS="true"
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

validate_api_key() {
    if [ -z "$API_KEY" ]; then
        if [ -n "${UPTIMEROBOT_API_KEY:-}" ]; then
            API_KEY="$UPTIMEROBOT_API_KEY"
        else
            log_error "API key is required. Use -k or set UPTIMEROBOT_API_KEY environment variable."
            exit 1
        fi
    fi
    
    # Validate API key format
    if [[ ! $API_KEY =~ ^u[0-9]+-[a-f0-9]+$ ]]; then
        log_error "Invalid API key format. Expected format: u123456-abcdef..."
        exit 1
    fi
    
    log_success "API key validated"
}

check_dependencies() {
    local missing_deps=()
    
    if ! command -v curl &> /dev/null; then
        missing_deps+=("curl")
    fi
    
    if ! command -v jq &> /dev/null; then
        missing_deps+=("jq")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        log_error "Missing required dependencies: ${missing_deps[*]}"
        exit 1
    fi
    
    log_success "All dependencies available"
}

# ==========================================
# Uptime Robot API Functions
# ==========================================

uptimerobot_api_call() {
    local endpoint="$1"
    local method="${2:-GET}"
    local data="${3:-}"
    
    local url="https://api.uptimerobot.com/v2/$endpoint"
    local response
    
    if [ "$method" = "POST" ]; then
        response=$(curl -s -X POST \
            -H "Content-Type: application/x-www-form-urlencoded" \
            -d "api_key=$API_KEY$data" \
            "$url")
    else
        response=$(curl -s \
            -d "api_key=$API_KEY$data" \
            "$url")
    fi
    
    echo "$response"
}

list_existing_monitors() {
    log_info "Fetching existing monitors..."
    
    local response
    response=$(uptimerobot_api_call "getMonitors" "GET" "&format=json")
    
    local status
    status=$(echo "$response" | jq -r '.stat')
    
    if [ "$status" != "ok" ]; then
        log_error "API call failed: $(echo "$response" | jq -r '.error.message // "Unknown error"')"
        exit 1
    fi
    
    local monitors
    monitors=$(echo "$response" | jq -r '.monitors[]?')
    
    if [ -z "$monitors" ]; then
        log_info "No existing monitors found"
        return 0
    fi
    
    echo ""
    echo "┌─────────────────────────────────────────────────┬───────────┬─────────┬─────────────┐"
    echo "│ Monitor Name                                    │ Type      │ Status  │ URL         │"
    echo "├─────────────────────────────────────────────────┼───────────┼─────────┼─────────────┤"
    
    echo "$response" | jq -r '.monitors[]? | [.friendly_name, .type, .status, .url] | @tsv' | while IFS=$'\t' read -r name type status url; do
        local type_name=""
        case "$type" in
            1) type_name="HTTP(S)" ;;
            2) type_name="Keyword" ;;
            3) type_name="Ping" ;;
            *) type_name="Unknown" ;;
        esac
        
        local status_name=""
        case "$status" in
            0) status_name="⏸️ Paused" ;;
            1) status_name="❌ Down" ;;
            2) status_name="✅ Up" ;;
            *) status_name="❓ Unknown" ;;
        esac
        
        # Truncate URL if too long
        local short_url="$url"
        if [ ${#url} -gt 40 ]; then
            short_url="${url:0:37}..."
        fi
        
        printf "│ %-47s │ %-9s │ %-7s │ %-11s │\n" \
            "${name:0:47}" "$type_name" "$status_name" "$short_url"
    done
    
    echo "└─────────────────────────────────────────────────┴───────────┴─────────┴─────────────┘"
    echo ""
}

create_monitor() {
    local name="$1"
    local url="$2"
    local interval="$3"
    local critical="${4:-true}"
    
    if [ "$DRY_RUN" = "true" ]; then
        log_info "DRY RUN: Would create monitor '$name' for $url (interval: ${interval}min)"
        return 0
    fi
    
    log_info "Creating monitor: $name"
    
    local data="&friendly_name=$(echo "$name" | sed 's/ /%20/g')&url=$url&type=1&interval=$((interval * 60))"
    
    local response
    response=$(uptimerobot_api_call "newMonitor" "POST" "$data")
    
    local status
    status=$(echo "$response" | jq -r '.stat')
    
    if [ "$status" = "ok" ]; then
        local monitor_id
        monitor_id=$(echo "$response" | jq -r '.monitor.id')
        log_success "Monitor created successfully (ID: $monitor_id)"
        
        # Add alert contact if critical
        if [ "$critical" = "true" ]; then
            log_info "Monitor marked as critical - ensure alert contacts are configured"
        fi
        
        return 0
    else
        local error_message
        error_message=$(echo "$response" | jq -r '.error.message // "Unknown error"')
        
        # Check if monitor already exists
        if echo "$error_message" | grep -qi "already exists"; then
            log_warning "Monitor '$name' already exists"
            return 0
        else
            log_error "Failed to create monitor '$name': $error_message"
            return 1
        fi
    fi
}

# ==========================================
# Monitor Definitions
# ==========================================

setup_monitors() {
    log_info "Setting up monitoring for BorderlessBits.com..."
    
    # Define monitors
    local monitors=(
        # Production monitors (critical)
        "BorderlessBits - Production Home|https://borderlessbits.com|5|true"
        "BorderlessBits - Production Contact|https://borderlessbits.com/contact|5|true"
        "BorderlessBits - Production About|https://borderlessbits.com/about|15|false"
        
        # Staging monitors (non-critical)
        "BorderlessBits - Staging Home|https://staging.borderlessbits.com|15|false"
        
        # Backup monitors (non-critical)
        "BorderlessBits - Backup Site|https://backup.borderlessbits.com|15|false"
        
        # API endpoints (if applicable)
        # "BorderlessBits - API Health|https://borderlessbits.com/api/health|10|true"
    )
    
    local success_count=0
    local total_count=${#monitors[@]}
    
    for monitor_def in "${monitors[@]}"; do
        IFS='|' read -r name url interval critical <<< "$monitor_def"
        
        if create_monitor "$name" "$url" "$interval" "$critical"; then
            ((success_count++))
        fi
    done
    
    echo ""
    log_info "Monitor setup summary:"
    log_info "- Total monitors: $total_count"
    log_info "- Successfully created/verified: $success_count"
    
    if [ $success_count -eq $total_count ]; then
        log_success "All monitors configured successfully"
    else
        log_warning "Some monitors failed to configure ($success_count/$total_count successful)"
    fi
}

# ==========================================
# Configuration Recommendations
# ==========================================

show_configuration_tips() {
    cat << EOF

📋 CONFIGURATION RECOMMENDATIONS:

1. Alert Contacts:
   - Add email alerts in Uptime Robot dashboard
   - Consider SMS alerts for critical monitors
   - Set up Slack/Discord webhooks for team notifications

2. Monitor Settings:
   - Critical monitors: 5-minute intervals
   - Non-critical monitors: 15-minute intervals
   - Enable SSL certificate monitoring
   - Set up keyword monitoring for specific content

3. Escalation Policy:
   - Immediate alerts for production downtime
   - Delayed alerts for staging issues (30-60 seconds)
   - Different notification channels for different severity levels

4. Dashboard Setup:
   - Create public status page (optional)
   - Set up custom dashboard for internal use
   - Configure maintenance windows for planned downtime

5. Integration:
   - Connect to GitHub Actions for deployment correlation
   - Set up Webhook notifications for automated incident response
   - Consider integration with PagerDuty for on-call management

6. Testing:
   - Test alert notifications regularly
   - Verify monitoring during maintenance windows
   - Review and adjust thresholds based on false positive rates

For more configuration options, visit: https://uptimerobot.com/

EOF
}

# ==========================================
# Main Execution
# ==========================================

main() {
    echo "🔍 Uptime Robot Setup for BorderlessBits.com"
    echo "=============================================="
    echo ""
    
    parse_arguments "$@"
    check_dependencies
    validate_api_key
    
    if [ "$LIST_MONITORS" = "true" ]; then
        list_existing_monitors
        exit 0
    fi
    
    if [ "$DRY_RUN" = "true" ]; then
        log_info "DRY RUN MODE - No actual monitors will be created"
        echo ""
    fi
    
    setup_monitors
    show_configuration_tips
    
    log_success "Uptime Robot setup completed!"
}

# Execute main function with all arguments
main "$@"