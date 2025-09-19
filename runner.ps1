# Pharmetrix Application Runner
param([string]$Mode = "")

# Resolve repo root relative to this script so it can run from anywhere
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot  = Resolve-Path (Join-Path $ScriptDir '.')
$ReactDir = Join-Path $RepoRoot 'clients\react'
$AngularDir = Join-Path $RepoRoot 'clients\angular'
$PrimaryDir = Join-Path $RepoRoot 'servers\primary-node'
$StreamDir = Join-Path $RepoRoot 'servers\streaming-node'
$EdgeDir = Join-Path $RepoRoot 'servers\edge-py'
$ComposeFile = Join-Path $RepoRoot 'docker-compose.yml'

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
    Write-Host "  ║                     P H A R M E T R I X                      ║" -ForegroundColor $accentColor
    Write-Host "  ║                                                              ║" -ForegroundColor $bannerColor
    Write-Host "  ║           A Smart Pharmaceutical Inventory System            ║" -ForegroundColor White
    Write-Host "  ║                                                              ║" -ForegroundColor $bannerColor
    Write-Host "  ║                                                              ║" -ForegroundColor $authorColor
    Write-Host "  ║                                                              ║" -ForegroundColor $bannerColor
    Write-Host "  ╚══════════════════════════════════════════════════════════════╝" -ForegroundColor $bannerColor
    Write-Host ""
}

function Show-Menu {
    Write-Host ""
    Write-Host "  ╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "  ║                      SELECT LAUNCH MODE                      ║" -ForegroundColor White
    Write-Host "  ╠══════════════════════════════════════════════════════════════╣" -ForegroundColor Cyan
    Write-Host "  ║                                                              ║" -ForegroundColor Cyan
    Write-Host "  ║ [1] Production Mode (Docker Up)                              ║" -ForegroundColor Cyan
    Write-Host "  ║ [2] Development Mode (Local Dev)                             ║" -ForegroundColor Cyan
    Write-Host "  ║ [3] Docker Build (All Services)                              ║" -ForegroundColor Cyan
    Write-Host "  ║ [4] React Build (clients/react)                              ║" -ForegroundColor Cyan
    Write-Host "  ║ [5] Angular Build (clients/angular)                          ║" -ForegroundColor Cyan
    Write-Host "  ║ [6] Primary Node Build (tsc)                                 ║" -ForegroundColor Cyan
    Write-Host "  ║ [7] Streaming Node Build (tsc)                               ║" -ForegroundColor Cyan
    Write-Host "  ║ [8] Build All (Primary + React + Angular + Streaming)        ║" -ForegroundColor Cyan
    Write-Host "  ║ [9] Exit                                                     ║" -ForegroundColor Cyan
    Write-Host "  ║                                                              ║" -ForegroundColor Cyan
    Write-Host "  ╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

function Get-UserChoice {
    do {
        Write-Host "  💡 " -NoNewline -ForegroundColor Yellow
        Write-Host "Enter your choice " -NoNewline -ForegroundColor White
        Write-Host "(1-9): " -NoNewline -ForegroundColor Cyan
        $choice = Read-Host
        if ($choice -match '^[1-9]$') { return $choice }
        Write-Host "  ❌ Invalid choice! Please enter 1-9." -ForegroundColor Red
        Write-Host ""
    } while ($true)
}

# ==========================
# Environment Checks
# ==========================
function Test-Docker {
    try { docker version | Out-Null; return $true } catch { return $false }
}

function Test-Node { try { node --version | Out-Null; $true } catch { $false } }
function Test-Npm  { try { npm --version  | Out-Null; $true } catch { $false } }

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
    $pkgJson = Join-Path $Path 'package.json'
    if (Test-Path $pkgJson) {
        $nodeModules = Join-Path $Path "node_modules"
        if (-not (Test-Path -Path $nodeModules)) {
            Write-Step "Installing npm dependencies in $Path"
            Push-Location $Path
            try { npm install } finally { Pop-Location }
        }
    }
}

# ==========================
# Build Helpers (return $true/$false)
# ==========================
function Build-Docker {
    $composeFile = $ComposeFile
    if (-not (Test-Docker)) { Write-Error "Docker is not running."; return $false }
    Write-Info "Building Docker services..."
    try {
        Invoke-Compose @("-f", $composeFile, "build")
        if ($LASTEXITCODE -ne 0) { throw "docker compose build failed." }
        Write-Success "Docker images built successfully."
        return $true
    } catch {
        Write-Error ("Docker build error: {0}" -f $_)
        return $false
    }
}

function Build-React {
    $reactDir = $ReactDir
    try { Ensure-Dependencies $reactDir } catch { Write-Error $_; return $false }
    Write-Info "Building React app..."
    Push-Location $reactDir
    try {
        npm run build
        if ($LASTEXITCODE -ne 0) { throw "npm run build failed." }
        Write-Success "React build successful (dist/)."
        return $true
    } catch {
        Write-Error ("React build error: {0}" -f $_)
        return $false
    } finally { Pop-Location }
}

function Build-Angular {
    $angularDir = $AngularDir
    try { Ensure-Dependencies $angularDir } catch { Write-Error $_; return $false }
    Write-Info "Building Angular app..."
    Push-Location $angularDir
    try {
        npm run build
        if ($LASTEXITCODE -ne 0) { throw "npm run build failed." }
        Write-Success "Angular build successful (dist/client)."
        return $true
    } catch {
        Write-Error ("Angular build error: {0}" -f $_)
        return $false
    } finally { Pop-Location }
}

function Build-Primary {
    $primaryDir = $PrimaryDir
    try { Ensure-Dependencies $primaryDir } catch { Write-Error $_; return $false }
    Write-Info "Building Primary Node (TypeScript -> JS)..."
    Push-Location $primaryDir
    try {
        npm run build
        if ($LASTEXITCODE -ne 0) { throw "npm run build failed." }
        Write-Success "Primary Node build successful."
        return $true
    } catch {
        Write-Error ("Primary Node build error: {0}" -f $_)
        return $false
    } finally { Pop-Location }
}

function Build-Streaming {
    $streamDir = $StreamDir
    try { Ensure-Dependencies $streamDir } catch { Write-Error $_; return $false }
    Write-Info "Building Streaming Node (TypeScript -> JS)..."
    Push-Location $streamDir
    try {
        npm run build
        if ($LASTEXITCODE -ne 0) { throw "npm run build failed." }
        Write-Success "Streaming Node build successful."
        return $true
    } catch {
        Write-Error ("Streaming Node build error: {0}" -f $_)
        return $false
    } finally { Pop-Location }
}

function Build-All {
    $ok1 = Build-Primary
    $ok2 = Build-React
    $ok3 = Build-Angular
    $ok4 = Build-Streaming
    if ($ok1 -and $ok2 -and $ok3 -and $ok4) {
        Write-Success "All builds completed successfully."
        return $true
    }
    Write-Error "One or more builds failed."
    return $false
}

# ==========================
# Start: Production (Docker)
# ==========================
function Start-Production {
    Write-Host ""
    Write-Host "  ╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "  ║                      PRODUCTION MODE                       ║" -ForegroundColor White
    Write-Host "  ║                     Docker Deployment                      ║" -ForegroundColor Green
    Write-Host "  ╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""

    Write-Info "Checking Docker availability..."; Show-ProgressBar "Docker Check" 30
    if (-not (Test-Docker)) { Write-Error "Docker is not running! Please start Docker Desktop."; return }
    Show-ProgressBar "Docker Check" 100

    $composeFile = $ComposeFile

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
    Write-Host "  ║                         SUCCESS!                           ║" -ForegroundColor White
    Write-Host (" ║           Application started in {0:N2} seconds!           ║" -f $duration) -ForegroundColor Green
    Write-Host "  ╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""

    Write-Info "APPLICATION URLS:"
    Write-Host "     React Frontend:    " -NoNewline -ForegroundColor DarkGray; Write-Host "http://localhost:5000" -ForegroundColor Cyan
    Write-Host "     Angular Frontend:  " -NoNewline -ForegroundColor DarkGray; Write-Host "http://localhost:5100" -ForegroundColor Cyan
    Write-Host "     API (Primary):     " -NoNewline -ForegroundColor DarkGray; Write-Host "http://localhost:4200" -ForegroundColor Cyan
    Write-Host "     Edge (Python):     " -NoNewline -ForegroundColor DarkGray; Write-Host "http://localhost:8000" -ForegroundColor Cyan
    Write-Host "     Streaming:         " -NoNewline -ForegroundColor DarkGray; Write-Host "http://localhost:4000" -ForegroundColor Cyan
    Write-Host ""

    Write-Info "Container Status:"
    try { Invoke-Compose @("-f", $composeFile, "ps") } catch { }

    Write-Host ""
    Write-Warning "Useful Commands:"
    Write-Host "     docker compose -f `"$ComposeFile`" logs -f    " -NoNewline -ForegroundColor DarkGray; Write-Host "(view logs)" -ForegroundColor Gray
    Write-Host "     docker compose -f `"$ComposeFile`" down       " -NoNewline -ForegroundColor DarkGray; Write-Host "(stop app)" -ForegroundColor Gray
    Write-Host "     docker compose -f `"$ComposeFile`" restart    " -NoNewline -ForegroundColor DarkGray; Write-Host "(restart)" -ForegroundColor Gray
}

# ==========================
# Start: Development (Local)
# ==========================
function Start-Development {
    Write-Host ""
    Write-Host "  ╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "  ║                       DEVELOPMENT MODE                     ║" -ForegroundColor White
    Write-Host "  ║                Local servers with hot reload               ║" -ForegroundColor Cyan
    Write-Host "  ╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""

    if (-not (Test-Node)) { Write-Error "Node.js is not installed or not on PATH."; return }
    if (-not (Test-Npm))  { Write-Error "npm is not installed or not on PATH."; return }

    $root = $RepoRoot
    $primaryDir = $PrimaryDir

    # Ensure dependencies
    try {
        Ensure-Dependencies -Path $primaryDir
        Ensure-Dependencies -Path $ReactDir
        Ensure-Dependencies -Path $AngularDir
    } catch {
        Write-Error $_; return
    }

    # Start Primary Node (API)
    Write-Info "Starting Primary Backend (http://localhost:4200)..."
    # Use WorkingDirectory to avoid quoting issues with spaces in paths
    Start-Process pwsh -WorkingDirectory $primaryDir -ArgumentList '-NoExit','-Command','npm start' | Out-Null

    Start-Sleep 1

    # Prepare environment for client (defaults if not set)
    $primaryUrl  = if ($env:PRIMARY_BACKEND_URL) { $env:PRIMARY_BACKEND_URL } else { 'http://localhost:4200' }
    $deployedUrl = if ($env:DEPLOYED_BACKEND_URL) { $env:DEPLOYED_BACKEND_URL } else { 'http://localhost:4200' }

    # Start React Client (Vite dev on 5000)
    Write-Info "Starting React Client (http://localhost:5000)..."
    Start-Process pwsh -WorkingDirectory $ReactDir -ArgumentList '-NoExit','-Command','npm run dev -- --port 5000 --host 0.0.0.0' -Environment @{ PRIMARY_BACKEND_URL = $primaryUrl; DEPLOYED_BACKEND_URL = $deployedUrl } | Out-Null

    Start-Sleep 1

    # Start Angular Client (ng serve on 5100)
    if (Test-Path (Join-Path $AngularDir 'package.json')) {
        Write-Info "Starting Angular Client (http://localhost:5100)..."
        $ngCommand = 'npx ng serve --port 5100 --host 0.0.0.0'
        Start-Process pwsh -WorkingDirectory $AngularDir -ArgumentList '-NoExit','-Command', $ngCommand | Out-Null
    } else {
        Write-Warning "Angular package.json not found, skipping."
    }

    Start-Sleep 1

    # Start Streaming Node (dev)
    if (Test-Path (Join-Path $StreamDir 'package.json')) {
        Write-Info "Starting Streaming Backend (TypeScript, dev)... (http://localhost:4000)"
        Start-Process pwsh -WorkingDirectory $StreamDir -ArgumentList '-NoExit','-Command','npm start' | Out-Null
    } else {
        Write-Warning "Streaming Node package.json not found, skipping."
    }

    # Start Edge Python (uvicorn dev)
    if (Test-Path (Join-Path $EdgeDir 'requirements.txt')) {
        Write-Info "Starting Edge Python (FastAPI) on http://localhost:8000..."
        $edgeCmd = 'uvicorn src.server:app --host 0.0.0.0 --port 8000 --reload'
        Start-Process pwsh -WorkingDirectory $EdgeDir -ArgumentList '-NoExit','-Command', $edgeCmd | Out-Null
    } else {
        Write-Warning "Edge Python requirements.txt not found, skipping."
    }

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
    '^(docker-?build)$'       { Build-Docker | Out-Null; break }
    '^(react-?build|client-?build)$' { Build-React | Out-Null; break }
    '^(angular-?build)$'      { Build-Angular | Out-Null; break }
    '^(primary-?build|api-?build|server-?build)$' { Build-Primary | Out-Null; break }
    '^(streaming-?build)$'     { Build-Streaming | Out-Null; break }
    '^(build-?all)$'          { Build-All | Out-Null; break }
    default {
        Show-Menu
        $choice = Get-UserChoice
            switch ($choice) {
            '1' { Start-Production }
            '2' { Start-Development }
            '3' { Build-Docker | Out-Null }
            '4' { Build-React | Out-Null }
            '5' { Build-Angular | Out-Null }
            '6' { Build-Primary | Out-Null }
            '7' { Build-Streaming | Out-Null }
            '8' { Build-All | Out-Null }
            '9' { Write-Info "Exiting..." }
        }
    }
}