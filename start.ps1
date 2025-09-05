# Pharmetrix Application Runner
param([string]$Mode = "")

# ==========================
# Utility: Styled Output
# ==========================
function Write-Success { param([string]$Text) Write-Host "[SUCCESS] $Text" -ForegroundColor Green }
function Write-Info    { param([string]$Text) Write-Host "[INFO] $Text"    -ForegroundColor Cyan }
function Write-Warning { param([string]$Text) Write-Host "[WARNING] $Text" -ForegroundColor Yellow }
function Write-Error   { param([string]$Text) Write-Host "[ERROR] $Text"   -ForegroundColor Red }
function Write-Step    { param([string]$Text) Write-Host "[STEP] $Text"    -ForegroundColor Magenta }

function Show-Loading {
    param([string]$Text = "Loading", [int]$Duration = 2)
    $spinner = @('|', '/', '-', '\\')
    $counter = 0
    $endTime = (Get-Date).AddSeconds($Duration)
    Write-Host -NoNewline "$Text "
    while ((Get-Date) -lt $endTime) {
        Write-Host -NoNewline "`r$Text $($spinner[$counter % 4])" -ForegroundColor Yellow
        Start-Sleep -Milliseconds 150
        $counter++
    }
    Write-Host -NoNewline "`r$Text " -ForegroundColor Green
    Write-Host "✓" -ForegroundColor Green
}

function Show-ProgressBar {
    param([string]$Activity, [int]$PercentComplete)
    $barLength = 40
    $completed = [math]::Floor($barLength * $PercentComplete / 100)
    $remaining = $barLength - $completed
    $progressBar = "█" * $completed + "░" * $remaining
    Write-Host -NoNewline "`r$Activity [" -ForegroundColor Cyan
    Write-Host -NoNewline $progressBar -ForegroundColor Green
    Write-Host -NoNewline "] $PercentComplete%" -ForegroundColor Cyan
    if ($PercentComplete -eq 100) { Write-Host " ✓" -ForegroundColor Green } else { Write-Host "" }
}

# ==========================
# UI Elements
# ==========================
function Show-Banner {
    $bannerColor = "Cyan"
    $accentColor = "Green"
    $authorColor = "DarkGray"
    Write-Host ""
    Write-Host "  ╔══════════════════════════════════════════════════════════════╗" -ForegroundColor $bannerColor
    Write-Host "  ║                                                              ║" -ForegroundColor $bannerColor
    Write-Host "  ║   ██████╗ ██╗  ██╗ █████╗ ██████╗ ███╗   ███╗██████╗ ██████╗  ║" -ForegroundColor $accentColor
    Write-Host "  ║   ██╔══██╗██║  ██║██╔══██╗██╔══██╗████╗ ████║██╔══██╗██╔══██╗ ║" -ForegroundColor $accentColor
    Write-Host "  ║   ██████╔╝███████║███████║██████╔╝██╔████╔██║██████╔╝██████╔╝ ║" -ForegroundColor $accentColor
    Write-Host "  ║   ██╔═══╝ ██╔══██║██╔══██║██╔══██╗██║╚██╔╝██║██╔══██╗██╔══██╗ ║" -ForegroundColor $accentColor
    Write-Host "  ║   ██║     ██║  ██║██║  ██║██║  ██║██║ ╚═╝ ██║██████╔╝██║  ██║ ║" -ForegroundColor $accentColor
    Write-Host "  ║   ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝╚═════╝ ╚═╝  ╚═╝ ║" -ForegroundColor $accentColor
    Write-Host "  ║                                                              ║" -ForegroundColor $bannerColor
    Write-Host "  ║   Smart Pharmaceutical Inventory System (Pharmetrix)         ║" -ForegroundColor White
    Write-Host "  ║                                                              ║" -ForegroundColor $bannerColor
    Write-Host "  ║                     by Prakhar Tripathi                      ║" -ForegroundColor $authorColor
    Write-Host "  ║                                                              ║" -ForegroundColor $bannerColor
    Write-Host "  ╚══════════════════════════════════════════════════════════════╝" -ForegroundColor $bannerColor
    Write-Host ""
}

function Show-Menu {
    Write-Host ""
    Write-Host "  ╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "  ║                      SELECT LAUNCH MODE                   ║" -ForegroundColor White
    Write-Host "  ╠════════════════════════════════════════════════════════════╣" -ForegroundColor Cyan
    Write-Host "  ║                                                            ║" -ForegroundColor Cyan
    Write-Host "  ║  [1] 🐳 Production Mode                                   ║" -ForegroundColor Cyan
    Write-Host "  ║      └─ Docker containers with optimized builds           ║" -ForegroundColor DarkGray
    Write-Host "  ║                                                            ║" -ForegroundColor Cyan
    Write-Host "  ║  [2] 🛠️  Development Mode                                  ║" -ForegroundColor Cyan
    Write-Host "  ║      └─ Local servers with hot reload                     ║" -ForegroundColor DarkGray
    Write-Host "  ║                                                            ║" -ForegroundColor Cyan
    Write-Host "  ║  [3] ❌ Exit                                               ║" -ForegroundColor Cyan
    Write-Host "  ║      └─ Close the application launcher                    ║" -ForegroundColor DarkGray
    Write-Host "  ║                                                            ║" -ForegroundColor Cyan
    Write-Host "  ╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

function Get-UserChoice {
    do {
        Write-Host "  💡 " -NoNewline -ForegroundColor Yellow
        Write-Host "Enter your choice " -NoNewline -ForegroundColor White
        Write-Host "(1-3): " -NoNewline -ForegroundColor Cyan
        $choice = Read-Host
        if ($choice -match '^[1-3]$') { return $choice }
        Write-Host "  ❌ Invalid choice! Please enter 1, 2, or 3." -ForegroundColor Red
        Write-Host ""
    } while ($true)
}

# ==========================
# Environment Checks
# ==========================
function Test-Docker {
    try { docker version | Out-Null; return $true } catch { return $false }
}

function Test-Node {
    try { node --version | Out-Null; return $true } catch { return $false }
}

function Test-Npm {
    try { npm --version | Out-Null; return $true } catch { return $false }
}

function Test-DockerComposeV2 { try { & docker compose version | Out-Null; $true } catch { $false } }
function Test-DockerComposeV1 { try { & docker-compose version | Out-Null; $true } catch { $false } }

function Invoke-Compose {
    param([string[]]$Args)
    if (Test-DockerComposeV2) { & docker compose @Args }
    elseif (Test-DockerComposeV1) { & docker-compose @Args }
    else { throw "Docker Compose not available. Install Docker Desktop (with Compose)." }
}

function Ensure-Dependencies {
    param([string]$Path)
    if (-not (Test-Path -Path $Path)) { throw "Path not found: $Path" }
    $nodeModules = Join-Path $Path "node_modules"
    if (-not (Test-Path -Path $nodeModules)) {
        Write-Step "Installing dependencies in $Path"
        Push-Location $Path
        try { npm install } finally { Pop-Location }
    }
}

# ==========================
# Start: Production (Docker)
# ==========================
function Start-Production {
    Write-Host ""
    Write-Host "  ╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "  ║                    🐳 PRODUCTION MODE                      ║" -ForegroundColor White
    Write-Host "  ║                   Docker Deployment                        ║" -ForegroundColor Green
    Write-Host "  ╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""

    Write-Info "Checking Docker availability..."; Show-ProgressBar "Docker Check" 30
    if (-not (Test-Docker)) { Write-Error "Docker is not running! Please start Docker Desktop."; return }
    Show-ProgressBar "Docker Check" 100

    $composeFile = "a:\My Projects and Code\FYP-Pharmetrix\docker-compose.yml"

    Write-Info "Stopping existing containers..."; Show-ProgressBar "Cleanup" 40
    try { Invoke-Compose @("-f", $composeFile, "down") | Out-Null } catch { }
    Show-ProgressBar "Cleanup" 100

    Write-Info "Building and starting containers..."; $startTime = Get-Date
    Show-ProgressBar "Building Images" 25; Start-Sleep 0.5
    Show-ProgressBar "Building Images" 60; Start-Sleep 0.5

    Invoke-Compose @("-f", $composeFile, "up", "-d")
    if ($LASTEXITCODE -ne 0) { Write-Error "Failed to start containers."; return }

    Show-ProgressBar "Starting Services" 100
    $duration = ((Get-Date) - $startTime).TotalSeconds

    Write-Host ""
    Write-Host "  ╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "  ║                    🎉 SUCCESS!                            ║" -ForegroundColor White
    Write-Host ("  ║          Application started in {0:N2} seconds!                    ║" -f $duration) -ForegroundColor Green
    Write-Host "  ╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""

    Write-Info "APPLICATION URLS:"
    Write-Host "     Frontend: " -NoNewline -ForegroundColor DarkGray; Write-Host "http://localhost:5000" -ForegroundColor Cyan
    Write-Host "     Backend:  " -NoNewline -ForegroundColor DarkGray; Write-Host "http://localhost:4200" -ForegroundColor Cyan
    Write-Host ""

    Write-Info "Container Status:"
    try { Invoke-Compose @("-f", $composeFile, "ps") } catch { }

    Write-Host ""
    Write-Warning "Useful Commands:"
    Write-Host "     docker compose -f `"$composeFile`" logs -f    " -NoNewline -ForegroundColor DarkGray; Write-Host "(view logs)" -ForegroundColor Gray
    Write-Host "     docker compose -f `"$composeFile`" down       " -NoNewline -ForegroundColor DarkGray; Write-Host "(stop app)" -ForegroundColor Gray
    Write-Host "     docker compose -f `"$composeFile`" restart    " -NoNewline -ForegroundColor DarkGray; Write-Host "(restart)" -ForegroundColor Gray
}

# ==========================
# Start: Development (Local)
# ==========================
function Start-Development {
    Write-Host ""
    Write-Host "  ╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "  ║                    🛠️  DEVELOPMENT MODE                    ║" -ForegroundColor White
    Write-Host "  ║                Local servers with hot reload               ║" -ForegroundColor Cyan
    Write-Host "  ╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""

    if (-not (Test-Node)) { Write-Error "Node.js is not installed or not on PATH."; return }
    if (-not (Test-Npm))  { Write-Error "npm is not installed or not on PATH."; return }

    $root = "a:\My Projects and Code\FYP-Pharmetrix"
    $clientDir = Join-Path $root "client"
    $primaryDir = Join-Path $root "servers\primary-node"

    # Ensure dependencies
    try {
        Ensure-Dependencies -Path $primaryDir
        Ensure-Dependencies -Path $clientDir
    } catch {
        Write-Error $_; return
    }

    # Start Primary Node (API)
    Write-Info "Starting Primary Backend (http://localhost:4200)..."
    $apiCmd = "Set-Location `"$primaryDir`"; npm start"
    Start-Process pwsh -ArgumentList '-NoExit','-Command', $apiCmd | Out-Null

    Start-Sleep 1

    # Start Client (Vite dev on 5000) with default env passthrough
    Write-Info "Starting Client (http://localhost:5000)..."
    $clientCmd = @(
        "Set-Location `"$clientDir`";",
        # Provide defaults if not set in current environment or .env
        "$env:PRIMARY_BACKEND_URL = $env:PRIMARY_BACKEND_URL ?? 'http://localhost:4200';",
        "$env:DEPLOYED_BACKEND_URL = $env:DEPLOYED_BACKEND_URL ?? 'http://localhost:4200';",
        "npm run dev"
    ) -join ' '
    Start-Process pwsh -ArgumentList '-NoExit','-Command', $clientCmd | Out-Null

    # Optional: open browser to client
    try { Start-Process "http://localhost:5000" | Out-Null } catch { }

    Write-Success "Development services launched in separate terminals."
    Write-Host ""
    Write-Info "If ports are busy, close previous terminals or change ports in config."
}

# ==========================
# Main
# ==========================
Show-Banner

switch -Regex ($Mode.ToLower()) {
    '^(prod|production)$'     { Start-Production; break }
    '^(dev|development)$'     { Start-Development; break }
    default {
        Show-Menu
        $choice = Get-UserChoice
        switch ($choice) {
            '1' { Start-Production }
            '2' { Start-Development }
            '3' { Write-Info "Exiting..." }
        }
    }
}