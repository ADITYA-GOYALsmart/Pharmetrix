#!/bin/bash

set -e

echo "=== Pharmetrix Project Setup Assistant (Cross-Platform) ==="
echo ""

echo "Select your OS:"
echo "1) Windows"
echo "2) macOS"
echo "3) Debian/Ubuntu"
echo "4) Arch Linux"
read -p "Enter choice [1-4]: " choice

# ==========================
# Helpers
# ==========================
ask_yes_no() {
  local question=$1
  local default=$2
  local prompt="[y/N]"
  [ "$default" = "y" ] && prompt="[Y/n]"

  while true; do
    read -p "$question $prompt: " ans
    ans=$(echo "$ans" | tr '[:upper:]' '[:lower:]')
    if [ -z "$ans" ]; then
      [ "$default" = "y" ] && return 0 || return 1
    fi
    case $ans in
      y|yes) return 0 ;;
      n|no) return 1 ;;
    esac
    echo "[WARN] Please answer y or n."
  done
}

run_npm_install() {
  local dir=$1
  if [ -f "$dir/package.json" ]; then
    if ask_yes_no "Run npm install in '$dir'?" "y"; then
      echo "[INFO] Installing dependencies in $dir..."
      (cd "$dir" && npm install)
      echo "[SUCCESS] npm install completed in $dir."
    else
      echo "[WARN] Skipped npm install in $dir."
    fi
  fi
}

install_common_deps() {
  local os=$1
  echo ""
  echo "[INFO] Installing core dependencies (Git, Node.js, npm)..."
  echo ""

  case $os in
    "macOS")
      # Ensure Homebrew
      if ! command -v brew &>/dev/null; then
        echo "[INFO] Homebrew not found. Installing Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        eval "$(/opt/homebrew/bin/brew shellenv)" 2>/dev/null || true
        eval "$(/usr/local/bin/brew shellenv)" 2>/dev/null || true
      fi
      brew update
      brew install git node
      ;;
    "Debian")
      sudo apt update
      sudo apt install -y git nodejs npm
      ;;
    "Arch")
      sudo pacman -Sy --noconfirm git nodejs npm
      ;;
  esac

  echo "[SUCCESS] Core dependencies installed."

  # Optional: Docker
  if ! command -v docker &>/dev/null; then
    if ask_yes_no "Docker not found. Install Docker?" "y"; then
      case $os in
        "macOS") brew install --cask docker ;;
        "Debian") sudo apt install -y docker.io ;;
        "Arch") sudo pacman -Sy --noconfirm docker ;;
      esac
    fi
  else
    echo "[INFO] Docker: $(docker --version)"
  fi

  # Optional: Python 3.11
  if ! command -v python3.11 &>/dev/null; then
    if ask_yes_no "Install Python 3.11 (optional)?" "n"; then
      case $os in
        "macOS")
          if ! brew install python@3.11; then
            echo "[WARN] Python 3.11 not available via Homebrew. Installing latest python3..."
            brew install python
          fi
          ;;
        "Debian")
          if ! sudo apt install -y python3.11; then
            echo "[WARN] Python 3.11 not found in default repos. Adding deadsnakes PPA..."
            sudo apt-get install -y software-properties-common
            sudo add-apt-repository -y ppa:deadsnakes/ppa
            sudo apt update
            if ! sudo apt install -y python3.11; then
              echo "[WARN] Python 3.11 still unavailable. Installing default python3..."
              sudo apt install -y python3
            fi
          fi
          ;;
        "Arch")
          if ! sudo pacman -Sy --noconfirm python3.11; then
            echo "[WARN] Python 3.11 not available in Arch repos. Installing latest python..."
            sudo pacman -Sy --noconfirm python
          fi
          ;;
      esac
    fi
  else
    echo "[INFO] Python: $(python3.11 --version 2>/dev/null || python3 --version)"
  fi
}

# ==========================
# Main
# ==========================
case $choice in
  1)
    echo "[INFO] Running Windows setup via PowerShell..."
    if command -v pwsh &>/dev/null; then
      pwsh -ExecutionPolicy Bypass -File "./setup.ps1"
    else
      powershell -ExecutionPolicy Bypass -File "./setup.ps1"
    fi
    exit 0
    ;;
  2) install_common_deps "macOS" ;;
  3) install_common_deps "Debian" ;;
  4) install_common_deps "Arch" ;;
  *) echo "[ERROR] Invalid choice. Exiting."; exit 1 ;;
esac

# ==========================
# npm installs
# ==========================
run_npm_install "./servers/primary-node"
run_npm_install "./client"
run_npm_install "./servers/streaming-node"

# Python deps for edge-py
if [ -f "./servers/edge-py/requirements.txt" ]; then
  if ask_yes_no "Install Python deps in './servers/edge-py' via requirements.txt?" "y"; then
    echo "[INFO] Installing Python dependencies (pip)..."
    (cd "./servers/edge-py" && python3 -m pip install -r requirements.txt || python -m pip install -r requirements.txt)
    echo "[SUCCESS] pip install completed in edge-py."
  else
    echo "[WARN] Skipped pip install in edge-py."
  fi
fi

echo ""
echo "[SUCCESS] Setup completed."
echo "[INFO] You may need to restart your terminal for PATH changes to take effect."
