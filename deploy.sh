#!/usr/bin/env bash
# ==============================================================================
# Cockpit Adwaita Suite — Unified Installer & Deployer
# Harmonized Modern Linux Desktop Theme & Custom Plugins for Cockpit
# Author: Yurii Bishchuk (astellias)
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ANSI Colors
BLUE='\033[0;34m'
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color
BOLD='\033[1m'

log_info()    { echo -e "${CYAN}[INFO]${NC} $*"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $*"; }
log_warn()    { echo -e "${YELLOW}[WARN]${NC} $*"; }
log_error()   { echo -e "${RED}[ERROR]${NC} $*"; }

print_banner() {
    cat << "EOF"
  ____           _             _ _        _       _          _ _        
 / ___|___   ___| | ___ __ (_) |_     / \   __| |_      __ _(_) |_ __ _ 
| |   / _ \ / __| |/ / '_ \| | __|   / _ \ / _` \ \ /\ / / _` | | __/ _` |
| |__| (_) | (__|   <| |_) | | |_   / ___ \ (_| |\ V  V / (_| | | || (_| |
 \____\___/ \___|_|\_\ .__/|_|\__| /_/   \_\__,_| \_/\_/ \__,_|_|\__\__,_|
                     |_|                                                  
              Unified Desktop Suite (Files, Sensors & Theme)
EOF
    echo ""
}

show_help() {
    print_banner
    echo -e "${BOLD}Usage:${NC}"
    echo "  ./deploy.sh [OPTIONS]"
    echo ""
    echo -e "${BOLD}Options:${NC}"
    echo "  -a, --all             Deploy all components (Theme, Navigator, Sensors) [Default]"
    echo "  -t, --theme           Deploy only the global Adwaita Dark theme"
    echo "  -n, --navigator       Deploy only the Files manager (cockpit-navigator)"
    echo "  -s, --sensors         Deploy only the Sensors monitor (cockpit-sensors)"
    echo "  -r, --remote USER@HOST Deploy to a remote server over SSH/SCP"
    echo "  -h, --help            Show this help message"
    echo ""
    echo -e "${BOLD}Examples:${NC}"
    echo "  ./deploy.sh                         # Install everything locally"
    echo "  ./deploy.sh --remote astellias@192.168.0.11"
    echo "  ./deploy.sh --theme --remote astellias@192.168.0.11"
    echo ""
}

TARGET_ALL=true
TARGET_THEME=false
TARGET_NAVIGATOR=false
TARGET_SENSORS=false
REMOTE_HOST=""

while [[ $# -gt 0 ]]; do
    case "$1" in
        -a|--all)
            TARGET_ALL=true
            shift
            ;;
        -t|--theme)
            TARGET_ALL=false
            TARGET_THEME=true
            shift
            ;;
        -n|--navigator)
            TARGET_ALL=false
            TARGET_NAVIGATOR=true
            shift
            ;;
        -s|--sensors)
            TARGET_ALL=false
            TARGET_SENSORS=true
            shift
            ;;
        -r|--remote)
            REMOTE_HOST="$2"
            shift 2
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

if [[ "$TARGET_ALL" == true ]]; then
    TARGET_THEME=true
    TARGET_NAVIGATOR=true
    TARGET_SENSORS=true
fi

deploy_local() {
    log_info "Starting local deployment..."

    # 1. Global Theme
    if [[ "$TARGET_THEME" == true ]]; then
        log_info "Installing global Cockpit Adwaita theme..."
        local THEME_DEST="/usr/local/share/cockpit"
        
        # Check permissions
        if [[ ! -w "$THEME_DEST" ]] && [[ $EUID -ne 0 ]]; then
            log_warn "$THEME_DEST is not writable. Attempting with sudo..."
            sudo mkdir -p "$THEME_DEST/branding/suse" "$THEME_DEST/static"
            sudo cp "$SCRIPT_DIR/theme/css-overrides.css" "$THEME_DEST/branding/suse/css-overrides.css"
            sudo cp "$SCRIPT_DIR/theme/css-overrides.css" "$THEME_DEST/branding/suse/branding.css"
            sudo cp "$SCRIPT_DIR/theme/css-overrides.css" "$THEME_DEST/static/css-overrides.css"
        else
            mkdir -p "$THEME_DEST/branding/suse" "$THEME_DEST/static"
            cp "$SCRIPT_DIR/theme/css-overrides.css" "$THEME_DEST/branding/suse/css-overrides.css"
            cp "$SCRIPT_DIR/theme/css-overrides.css" "$THEME_DEST/branding/suse/branding.css"
            cp "$SCRIPT_DIR/theme/css-overrides.css" "$THEME_DEST/static/css-overrides.css"
        fi
        log_success "Global theme overrides installed."
    fi

    # 2. Files (cockpit-navigator)
    if [[ "$TARGET_NAVIGATOR" == true ]]; then
        log_info "Installing Files (cockpit-navigator)..."
        local NAV_DEST="$HOME/.local/share/cockpit/navigator"
        mkdir -p "$NAV_DEST"
        rsync -a --delete --exclude='*.git*' "$SCRIPT_DIR/navigator/" "$NAV_DEST/"
        log_success "Files (cockpit-navigator) deployed to $NAV_DEST."
    fi

    # 3. Sensors (cockpit-sensors)
    if [[ "$TARGET_SENSORS" == true ]]; then
        log_info "Installing Sensors (cockpit-sensors)..."
        local SENS_DEST="$HOME/.local/share/cockpit/sensors"
        mkdir -p "$SENS_DEST"
        rsync -a --delete --exclude='*.git*' "$SCRIPT_DIR/sensors/" "$SENS_DEST/"
        log_success "Sensors (cockpit-sensors) deployed to $SENS_DEST."
    fi

    # 4. Restart Cockpit if possible
    if command -v systemctl &>/dev/null; then
        log_info "Restarting Cockpit service to refresh assets..."
        if sudo -n systemctl restart cockpit.service 2>/dev/null; then
            log_success "Cockpit web service reloaded."
        else
            log_warn "Could not restart cockpit.service without password. Run: sudo systemctl restart cockpit.service"
        fi
    fi

    log_success "Local deployment complete! Refresh Cockpit in your browser (Ctrl+Shift+R)."
}

deploy_remote() {
    log_info "Deploying to remote target: ${BOLD}$REMOTE_HOST${NC}..."

    # Ensure remote base directories exist
    ssh "$REMOTE_HOST" "mkdir -p ~/.local/share/cockpit/navigator ~/.local/share/cockpit/sensors"

    # 1. Global Theme
    if [[ "$TARGET_THEME" == true ]]; then
        log_info "Deploying global Adwaita theme to remote /usr/local/share/cockpit/..."
        ssh "$REMOTE_HOST" "mkdir -p /usr/local/share/cockpit/branding/suse /usr/local/share/cockpit/static 2>/dev/null || sudo mkdir -p /usr/local/share/cockpit/branding/suse /usr/local/share/cockpit/static"
        
        scp "$SCRIPT_DIR/theme/css-overrides.css" "$REMOTE_HOST:/tmp/css-overrides.css"
        ssh "$REMOTE_HOST" "
            if [[ -w /usr/local/share/cockpit ]]; then
                cp /tmp/css-overrides.css /usr/local/share/cockpit/branding/suse/css-overrides.css
                cp /tmp/css-overrides.css /usr/local/share/cockpit/branding/suse/branding.css
                cp /tmp/css-overrides.css /usr/local/share/cockpit/static/css-overrides.css
            else
                sudo cp /tmp/css-overrides.css /usr/local/share/cockpit/branding/suse/css-overrides.css
                sudo cp /tmp/css-overrides.css /usr/local/share/cockpit/branding/suse/branding.css
                sudo cp /tmp/css-overrides.css /usr/local/share/cockpit/static/css-overrides.css
            fi
            rm -f /tmp/css-overrides.css
        "
        log_success "Remote theme files updated."
    fi

    # 2. Files (cockpit-navigator)
    if [[ "$TARGET_NAVIGATOR" == true ]]; then
        log_info "Syncing Files (cockpit-navigator) to remote..."
        rsync -avz --delete --exclude='*.git*' "$SCRIPT_DIR/navigator/" "$REMOTE_HOST:~/.local/share/cockpit/navigator/"
        log_success "Files package synced."
    fi

    # 3. Sensors (cockpit-sensors)
    if [[ "$TARGET_SENSORS" == true ]]; then
        log_info "Syncing Sensors (cockpit-sensors) to remote..."
        rsync -avz --delete --exclude='*.git*' "$SCRIPT_DIR/sensors/" "$REMOTE_HOST:~/.local/share/cockpit/sensors/"
        log_success "Sensors package synced."
    fi

    # 4. Restart Cockpit on remote
    log_info "Reloading Cockpit service on remote host..."
    ssh "$REMOTE_HOST" "sudo -n systemctl restart cockpit.service 2>/dev/null || echo '[INFO] Cockpit will refresh automatically on next connection'"
    
    log_success "Remote deployment to $REMOTE_HOST finished successfully!"
    echo -e "${CYAN}Press ${BOLD}Ctrl + Shift + R${NC}${CYAN} in your browser to load updated styles.${NC}"
}

print_banner

if [[ -n "$REMOTE_HOST" ]]; then
    deploy_remote
else
    deploy_local
fi
