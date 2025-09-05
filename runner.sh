#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
CLIENT_DIR="$ROOT_DIR/client"
PRIMARY_DIR="$ROOT_DIR/servers/primary-node"
COMPOSE_FILE="$ROOT_DIR/docker-compose.yml"

INFO()    { printf "\033[36m[INFO]\033[0m %s\n" "$*"; }
SUCCESS() { printf "\033[32m[SUCCESS]\033[0m %s\n" "$*"; }
WARN()    { printf "\033[33m[WARNING]\033[0m %s\n" "$*"; }
ERR()     { printf "\033[31m[ERROR]\033[0m %s\n" "$*"; }
STEP()    { printf "\033[35m[STEP]\033[0m %s\n" "$*"; }

banner() {
  echo
  printf "\033[36m  ╔══════════════════════════════════════════════════════════════╗\033[0m\n"
  printf "\033[36m  ║                                                              ║\033[0m\n"
  printf "\033[32m  ║                        P H A R M E T R I X                   ║\033[0m\n"
  printf "\033[36m  ║                                                              ║\033[0m\n"
  printf "\033[37m  ║   Smart Pharmaceutical Inventory System (Pharmetrix)         ║\033[0m\n"
  printf "\033[36m  ║                                                              ║\033[0m\n"
  printf "\033[90m  ║                       by Prakhar Tripathi                     ║\033[0m\n"
  printf "\033[36m  ║                                                              ║\033[0m\n"
  printf "\033[36m  ╚══════════════════════════════════════════════════════════════╝\033[0m\n"
  echo
}

need_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then ERR "$1 not found in PATH"; return 1; fi
}

compose() {
  if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
    docker compose "$@"
  elif command -v docker-compose >/dev/null 2>&1; then
    docker-compose "$@"
  else
    ERR "Docker Compose not available. Install Docker Desktop or docker-compose."
    return 1
  fi
}

ensure_deps() {
  local dir="$1"
  if [ ! -d "$dir" ]; then ERR "Path not found: $dir"; return 1; fi
  if [ ! -d "$dir/node_modules" ]; then
    STEP "Installing dependencies in $dir"
    (cd "$dir" && npm install)
  fi
}

build_docker() {
  need_cmd docker || return 1
  INFO "Building Docker services..."
  if compose -f "$COMPOSE_FILE" build; then
    SUCCESS "Docker images built successfully."
  else
    ERR "Docker build failed."
    return 1
  fi
}

build_react() {
  need_cmd node || return 1
  need_cmd npm || return 1
  ensure_deps "$CLIENT_DIR" || return 1
  INFO "Building React app..."
  if (cd "$CLIENT_DIR" && npm run build); then
    SUCCESS "React build successful (dist/)."
  else
    ERR "React build failed."
    return 1
  fi
}

build_primary() {
  need_cmd node || return 1
  need_cmd npm || return 1
  ensure_deps "$PRIMARY_DIR" || return 1
  INFO "Building Primary Node (TypeScript -> JS)..."
  if (cd "$PRIMARY_DIR" && npm run build); then
    SUCCESS "Primary Node build successful."
  else
    ERR "Primary Node build failed."
    return 1
  fi
}

build_all() {
  local ok=true
  build_primary || ok=false
  build_react || ok=false
  if $ok; then SUCCESS "All builds completed successfully."; else ERR "One or more builds failed."; return 1; fi
}

start_prod() {
  need_cmd docker || return 1
  INFO "Stopping existing containers..."; compose -f "$COMPOSE_FILE" down || true
  INFO "Starting containers..."
  if compose -f "$COMPOSE_FILE" up -d; then
    SUCCESS "Containers started."
    echo
    INFO "APPLICATION URLS:"
    echo "  Frontend: http://localhost:5000"
    echo "  Backend:  http://localhost:4200"
    echo
    compose -f "$COMPOSE_FILE" ps || true
  else
    ERR "Failed to start containers."
    return 1
  fi
}

start_dev() {
  need_cmd node || return 1
  need_cmd npm || return 1
  ensure_deps "$PRIMARY_DIR" || return 1
  ensure_deps "$CLIENT_DIR" || return 1

  INFO "Starting Primary Backend (http://localhost:4200)..."
  (cd "$PRIMARY_DIR" && npm start) &
  sleep 1

  INFO "Starting Client (http://localhost:5000)..."
  (cd "$CLIENT_DIR" \
    && PRIMARY_BACKEND_URL="${PRIMARY_BACKEND_URL:-http://localhost:4200}" \
    && DEPLOYED_BACKEND_URL="${DEPLOYED_BACKEND_URL:-http://localhost:4200}" \
    npm run dev) &

  SUCCESS "Development services launched (background)."
  if command -v open >/dev/null 2>&1; then open http://localhost:5000 || true; fi
}

menu() {
  echo "  [1] 🐳 Production Mode (Docker Up)"
  echo "  [2] 🛠️  Development Mode (Local Dev)"
  echo "  [3] 🐳 Docker Build (All Services)"
  echo "  [4] ⚛️  React Build (client)"
  echo "  [5] 🧩 Primary Node Build (tsc)"
  echo "  [6] 📦 Build All (Primary + React)"
  echo "  [7] ❌ Exit"
  printf "\nEnter your choice (1-7): "
}

main() {
  banner
  local mode="${1:-}"
  case "$mode" in
    prod|production) start_prod ;;
    dev|development) start_dev ;;
    docker-build)    build_docker ;;
    react-build|client-build) build_react ;;
    primary-build|api-build|server-build) build_primary ;;
    build-all)       build_all ;;
    *)
      menu
      read -r choice
      case "$choice" in
        1) start_prod ;;
        2) start_dev ;;
        3) build_docker ;;
        4) build_react ;;
        5) build_primary ;;
        6) build_all ;;
        7) INFO "Exiting..." ;;
        *) ERR "Invalid choice" ;;
      esac
      ;;
  esac
}

main "$@"