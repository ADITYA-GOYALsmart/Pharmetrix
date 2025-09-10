#!/bin/bash
# Pharmetrix Application Runner

MODE="$(echo "$1" | tr '[:upper:]' '[:lower:]')"  # lowercase input (portable)

# ==========================
# Resolve repo root relative to this script
# ==========================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$SCRIPT_DIR"
CLIENT_DIR="$REPO_ROOT/client"
PRIMARY_DIR="$REPO_ROOT/servers/primary-node"
STREAM_DIR="$REPO_ROOT/servers/streaming-node"
EDGE_DIR="$REPO_ROOT/servers/edge-py"
COMPOSE_FILE="$REPO_ROOT/docker-compose.yml"

# ==========================
# Utility: Styled Output
# ==========================
write_success() { echo -e "\033[32m[SUCCESS] $1\033[0m"; }
write_info()    { echo -e "\033[36m[INFO] $1\033[0m"; }
write_warning() { echo -e "\033[33m[WARNING] $1\033[0m"; }
write_error()   { echo -e "\033[31m[ERROR] $1\033[0m"; }
write_step()    { echo -e "\033[35m[STEP] $1\033[0m"; }

show_progressbar() {
    local activity="$1"
    local percent="$2"
    local barLength=40
    local completed=$((barLength * percent / 100))
    local remaining=$((barLength - completed))
    local progressBar
    progressBar="$(printf '█%.0s' $(seq 1 $completed))$(printf '░%.0s' $(seq 1 $remaining))"
    echo -ne "\r$activity [\033[32m$progressBar\033[0m] $percent%"
    if [ "$percent" -eq 100 ]; then echo " ✓"; else echo -n ""; fi
}

# ==========================
# UI Elements
# ==========================
show_banner() {
    echo ""
    echo "  ╔══════════════════════════════════════════════════════════════╗"
    echo "  ║                                                              ║"
    echo "  ║                     P H A R M E T R I X                      ║"
    echo "  ║                                                              ║"
    echo "  ║           A Smart Pharmaceutical Inventory System            ║"
    echo "  ║                                                              ║"
    echo "  ╚══════════════════════════════════════════════════════════════╝"
    echo ""
}

show_menu() {
    echo ""
    echo "  ╔══════════════════════════════════════════════════════════════╗"
    echo "  ║                      SELECT LAUNCH MODE                      ║"
    echo "  ╠══════════════════════════════════════════════════════════════╣"
    echo "  ║ [1] Production Mode (Docker Up)                              ║"
    echo "  ║ [2] Development Mode (Local Dev)                             ║"
    echo "  ║ [3] Docker Build (All Services)                              ║"
    echo "  ║ [4] React Build (client)                                     ║"
    echo "  ║ [5] Primary Node Build (tsc)                                 ║"
    echo "  ║ [6] Streaming Node Build (tsc)                               ║"
    echo "  ║ [7] Build All (Primary + React + Streaming)                  ║"
    echo "  ║ [8] Exit                                                     ║"
    echo "  ╚══════════════════════════════════════════════════════════════╝"
    echo ""
}

get_user_choice() {
    local choice
    while true; do
        read -p "  💡 Enter your choice (1-8): " choice
        if [[ "$choice" =~ ^[1-8]$ ]]; then
            echo "$choice"
            return
        fi
        echo -e "\033[31m  ❌ Invalid choice! Please enter 1-8.\033[0m"
        echo ""
    done
}

# ==========================
# Environment Checks
# ==========================
test_docker() { docker version &>/dev/null; }
test_node()   { node --version &>/dev/null; }
test_npm()    { npm --version &>/dev/null; }

invoke_compose() {
    if docker compose version &>/dev/null; then
        docker compose "$@"
    elif docker-compose version &>/dev/null; then
        docker-compose "$@"
    else
        write_error "Docker Compose not available. Install Docker Desktop (with Compose)."
        exit 1
    fi
}

ensure_dependencies() {
    local path="$1"
    if [ ! -d "$path" ]; then
        write_error "Path not found: $path"
        exit 1
    fi
    if [ ! -d "$path/node_modules" ]; then
        write_step "Installing dependencies in $path"
        (cd "$path" && npm install)
    fi
}

# ==========================
# Build Helpers
# ==========================
build_docker() {
    if ! test_docker; then write_error "Docker is not running."; return 1; fi
    write_info "Building Docker services..."
    invoke_compose -f "$COMPOSE_FILE" build || { write_error "Docker build failed"; return 1; }
    write_success "Docker images built successfully."
}

build_react() {
    ensure_dependencies "$CLIENT_DIR"
    write_info "Building React app..."
    (cd "$CLIENT_DIR" && npm run build) || { write_error "React build failed"; return 1; }
    write_success "React build successful."
}

build_primary() {
    ensure_dependencies "$PRIMARY_DIR"
    write_info "Building Primary Node (TypeScript -> JS)..."
    (cd "$PRIMARY_DIR" && npm run build) || { write_error "Primary Node build failed"; return 1; }
    write_success "Primary Node build successful."
}

build_streaming() {
    ensure_dependencies "$STREAM_DIR"
    write_info "Building Streaming Node (TypeScript -> JS)..."
    (cd "$STREAM_DIR" && npm run build) || { write_error "Streaming Node build failed"; return 1; }
    write_success "Streaming Node build successful."
}

build_all() {
    build_primary && build_react && build_streaming && write_success "All builds completed successfully." || write_error "One or more builds failed."
}

# ==========================
# Start: Production (Docker)
# ==========================
start_production() {
    echo ""
    echo "  ╔════════════════════════════════════════════════════════════╗"
    echo "  ║                      PRODUCTION MODE                       ║"
    echo "  ║                     Docker Deployment                      ║"
    echo "  ╚════════════════════════════════════════════════════════════╝"
    echo ""

    write_info "Checking Docker availability..."
    show_progressbar "Docker Check" 30
    if ! test_docker; then write_error "Docker is not running!"; return; fi
    show_progressbar "Docker Check" 100

    write_info "Stopping existing containers..."
    show_progressbar "Cleanup" 40
    invoke_compose -f "$COMPOSE_FILE" down || true
    show_progressbar "Cleanup" 100

    write_info "Building and starting containers..."
    show_progressbar "Building Images" 25; sleep 0.5
    show_progressbar "Building Images" 60; sleep 0.5

    invoke_compose -f "$COMPOSE_FILE" up -d || { write_error "Failed to start containers."; return; }

    show_progressbar "Starting Services" 100
    echo ""
    echo "  ╔════════════════════════════════════════════════════════════╗"
    echo "  ║                         SUCCESS!                           ║"
    echo "  ╚════════════════════════════════════════════════════════════╝"
    echo ""
    write_info "APPLICATION URLS:"
    echo "     Frontend:  http://localhost:5000"
    echo "     API:       http://localhost:4200"
    echo "     Edge:      http://localhost:8000"
    echo "     Streaming: http://localhost:4000"
    echo ""
}

# ==========================
# Start: Development (Local)
# ==========================
start_development() {
    echo ""
    echo "  ╔════════════════════════════════════════════════════════════╗"
    echo "  ║                       DEVELOPMENT MODE                     ║"
    echo "  ║                Local servers with hot reload               ║"
    echo "  ╚════════════════════════════════════════════════════════════╝"
    echo ""

    if ! test_node; then write_error "Node.js not installed."; return; fi
    if ! test_npm; then write_error "npm not installed."; return; fi

    ensure_dependencies "$PRIMARY_DIR"
    ensure_dependencies "$CLIENT_DIR"

    write_info "Starting Primary Backend (http://localhost:4200)..."
    cd "$PRIMARY_DIR" && npm start & 
    cd "$REPO_ROOT" || exit 1

    sleep 1

    write_info "Starting Client (http://localhost:5000)..."
    cd "$CLIENT_DIR" && PRIMARY_BACKEND_URL="http://localhost:4200" DEPLOYED_BACKEND_URL="http://localhost:4200" npm run dev &
    cd "$REPO_ROOT" || exit 1

    # Start Streaming Node (dev)
    if [ -f "$STREAM_DIR/package.json" ]; then
        write_info "Starting Streaming Backend (TypeScript, dev)..."
        cd "$STREAM_DIR" && npm start &
        cd "$REPO_ROOT" || exit 1
    else
        write_warning "Streaming Node package.json not found, skipping."
    fi

    # Start Edge Python (uvicorn dev)
    if [ -f "$EDGE_DIR/requirements.txt" ]; then
        write_info "Starting Edge Python (FastAPI) on http://localhost:8000..."
        cd "$EDGE_DIR" && uvicorn src.server:app --host 0.0.0.0 --port 8000 --reload &
        cd "$REPO_ROOT" || exit 1
    else
        write_warning "Edge Python requirements.txt not found, skipping."
    fi

    write_success "Development services launched (background processes)."
    write_info "Check logs in this terminal or run 'ps' to manage."
}

# ==========================
# Main
# ==========================
show_banner

case "$MODE" in
    prod|production) start_production ;;
    dev|development) start_development ;;
    docker-build)    build_docker ;;
    react-build|client-build) build_react ;;
    primary-build|api-build|server-build) build_primary ;;
    streaming-build) build_streaming ;;
    build-all)       build_all ;;
    *) show_menu; choice=$(get_user_choice); case "$choice" in
        1) start_production ;;
        2) start_development ;;
        3) build_docker ;;
        4) build_react ;;
        5) build_primary ;;
        6) build_streaming ;;
        7) build_all ;;
        8) write_info "Exiting..." ;;
    esac ;;
esac
