# Pharmetrix Project Setup Assistant (Windows PowerShell)
# Purpose: Interactive setup for dependencies and project packages
# - Checks for Git, Node.js, npm (core)
# - Optionally installs Docker Desktop, Python 3.11, and VS Build Tools (for node-gyp)
# - Optionally runs npm install in project packages
# - Optionally sets execution policy for current user

[CmdletBinding()]
param(
    [switch]$YesToAll
)

# ==========================
# Styled Output Helpers
# ==========================
function Write-Success { param([string]$Text) Write-Host "[SUCCESS] $Text" -ForegroundColor Green }
function Write-Info    { param([string]$Text) Write-Host "[INFO]    $Text" -ForegroundColor Cyan }
function Write-Warn    { param([string]$Text) Write-Host "[WARN]    $Text" -ForegroundColor Yellow }
function Write-Err     { param([string]$Text) Write-Host "[ERROR]   $Text" -ForegroundColor Red }

function Ask-YesNo {
    param(
        [Parameter(Mandatory=$true)][string]$Question,
        [bool]$Default = $true
    )
    if ($YesToAll) { return $true }
    $suffix = if ($Default) { "[Y/n]" } else { "[y/N]" }
    while ($true) {
        Write-Host -NoNewline "${Question} ${suffix}: " -ForegroundColor White
        $ans = (Read-Host).Trim().ToLower()
        if ([string]::IsNullOrWhiteSpace($ans)) { return $Default }
        if ($ans -in @('y','yes')) { return $true }
        if ($ans -in @('n','no'))  { return $false }
        Write-Warn "Please answer y or n."
    }
}

function Test-Command {
    param([Parameter(Mandatory=$true)][string]$Name)
    return [bool](Get-Command $Name -ErrorAction SilentlyContinue)
}

function Refresh-Path-InSession {
    try {
        $machine = [System.Environment]::GetEnvironmentVariable('Path','Machine')
        $user    = [System.Environment]::GetEnvironmentVariable('Path','User')
        if ($machine -and $user) { $env:Path = "$machine;$user" }
    } catch { }
}

function Ensure-ExecutionPolicy {
    $current = $null
    try { $current = Get-ExecutionPolicy -Scope CurrentUser -ErrorAction SilentlyContinue } catch { }
    if ($current -and $current -in @('RemoteSigned','Unrestricted','Bypass')) {
        Write-Info "ExecutionPolicy (CurrentUser) is $current"
        return
    }
    if (Ask-YesNo "Set PowerShell ExecutionPolicy to RemoteSigned for CurrentUser?") {
        try {
            Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force
            Write-Success "ExecutionPolicy set to RemoteSigned (CurrentUser)."
        } catch { Write-Err ("Failed to set ExecutionPolicy: {0}" -f $_) }
    } else {
        Write-Warn "Skipped changing ExecutionPolicy. You may need it to run local scripts."
    }
}

function Ensure-Winget {
    if (Test-Command 'winget') { return $true }
    Write-Warn "winget not found. Install apps manually from official installers."
    return $false
}

function Install-WithWinget {
    param(
        [Parameter(Mandatory=$true)][string]$Id,
        [Parameter(Mandatory=$true)][string]$Display
    )
    if (-not (Ensure-Winget)) { return $false }
    Write-Info "Installing $Display via winget..."
    try {
        $args = @('install','--silent','--accept-source-agreements','--accept-package-agreements','--id',$Id)
        $p = Start-Process -FilePath 'winget' -ArgumentList $args -Wait -PassThru -NoNewWindow
        if ($p.ExitCode -ne 0) { throw "winget exit code $($p.ExitCode)" }
        Refresh-Path-InSession
        Write-Success "$Display installed."
        return $true
    } catch {
        Write-Err ("Failed installing {0}: {1}" -f $Display, $_)
        return $false
    }
}

function Configure-UTF8AndEmoji {
    try {
        # Configure current session encodings (helps immediately)
        [Console]::InputEncoding  = [System.Text.UTF8Encoding]::new()
        [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
        $OutputEncoding = [System.Text.UTF8Encoding]::new()
        try { $PSStyle.OutputRendering = 'Ansi' } catch { }
        try { chcp 65001 | Out-Null } catch { }
        Write-Info "Configured current session for UTF-8 and ANSI rendering."
    } catch {
        Write-Warn ("Failed to set current session UTF-8: {0}" -f $_)
    }

    # Persist settings into user profiles for both Windows PowerShell (5.x) and PowerShell 7+ (pwsh)
    $marker = 'Pharmetrix UTF-8 + Emoji config'
    $block = @"
# >>> $marker (auto-added by setup.ps1)
try {
    [Console]::InputEncoding  = [System.Text.UTF8Encoding]::new()
    [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
    # For external processes launched from PowerShell
    $OutputEncoding = [System.Text.UTF8Encoding]::new()
} catch { }
try { $PSStyle.OutputRendering = 'Ansi' } catch { }
# Keep legacy console code page on UTF-8
try { chcp 65001 | Out-Null } catch { }
# <<< $marker
"@

    $targets = @(
        (Join-Path $HOME 'Documents\WindowsPowerShell\Profile.ps1'),
        (Join-Path $HOME 'Documents\PowerShell\Profile.ps1')
    )

    foreach ($p in $targets) {
        try {
            $dir = Split-Path $p -Parent
            if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
            if (-not (Test-Path $p)) { New-Item -ItemType File -Path $p -Force | Out-Null }
            $existing = Get-Content -Path $p -Raw -ErrorAction SilentlyContinue
            if ($existing -notmatch [regex]::Escape($marker)) {
                Add-Content -Path $p -Value "`r`n$block`r`n"
                Write-Success "Updated profile: $p"
            } else {
                Write-Info "Profile already configured: $p"
            }
        } catch {
            Write-Warn ("Failed updating profile {0}: {1}" -f $p, $_)
        }
    }
}

# ==========================
# Begin
# ==========================
Write-Host ""; Write-Host "=== Pharmetrix Project Setup Assistant ===" -ForegroundColor Magenta; Write-Host ""

# Resolve repo paths relative to this script
$RepoRoot   = $PSScriptRoot
$ClientDir  = Join-Path $RepoRoot 'client'
$PrimaryDir = Join-Path $RepoRoot 'servers\primary-node'
$StreamDir  = Join-Path $RepoRoot 'servers\streaming-node'
$EdgeDir    = Join-Path $RepoRoot 'servers\edge-py'

# 1) Execution Policy
Ensure-ExecutionPolicy

# Configure UTF-8/Emoji for current and future sessions
Configure-UTF8AndEmoji

# 2) Core Dependencies: Git, Node, npm
$needGit  = -not (Test-Command 'git')
$needNode = -not (Test-Command 'node')
$needNpm  = -not (Test-Command 'npm')

if (-not $needGit)  { Write-Info  "Git: $(git --version)" } else { Write-Warn "Git: not found" }
if (-not $needNode) { Write-Info  "Node: $(node --version)" } else { Write-Warn "Node: not found" }
if (-not $needNpm)  { Write-Info  "npm:  $(npm --version)" } else { Write-Warn "npm: not found" }

if ($needGit) {
    if (Ask-YesNo "Git is missing. Install Git now?") { Install-WithWinget -Id 'Git.Git' -Display 'Git' | Out-Null }
}
if ($needNode) {
    if (Ask-YesNo "Node.js is missing. Install Node.js LTS now?") {
        if (Install-WithWinget -Id 'OpenJS.NodeJS.LTS' -Display 'Node.js LTS') {
            $needNpm = -not (Test-Command 'npm') # npm typically comes with Node
        }
    }
}
if ($needNpm) {
    Write-Warn "npm still not available. It usually comes with Node.js."
}

# Ensure PowerShell 7 (pwsh)
$needPwsh = -not (Test-Command 'pwsh')
if (-not $needPwsh) {
    Write-Info "pwsh: $(pwsh -NoLogo -NoProfile -Command '$PSVersionTable.PSVersion.ToString()')"
} else {
    Write-Warn "pwsh (PowerShell 7+): not found"
}
if ($needPwsh) {
    if (Ask-YesNo "PowerShell 7 (pwsh) is missing. Install it now?") {
        if (Install-WithWinget -Id 'Microsoft.PowerShell' -Display 'PowerShell 7') {
            Refresh-Path-InSession
            if (Test-Command 'pwsh') {
                Write-Success "pwsh installed: $(pwsh -NoLogo -NoProfile -Command '$PSVersionTable.PSVersion.ToString()')"
            } else {
                Write-Warn "pwsh not detected on PATH yet. You may need to restart your terminal."
            }
        }
    }
}

# 3) Optional dependencies
$hasDocker = Test-Command 'docker'
$hasCompose = $false
if ($hasDocker) { try { & docker compose version | Out-Null; $hasCompose = $true } catch { $hasCompose = $false } }
$hasPython = Test-Command 'python'

if (-not $hasDocker) { Write-Warn "Docker Desktop: not found" } else { Write-Info "Docker: $(docker --version)" }
if (-not $hasCompose) { Write-Warn "Docker Compose v2: not found" } else { Write-Info "Docker Compose v2: available" }
if (-not $hasPython) { Write-Warn "Python: not found" } else { try { Write-Info "Python: $(python --version)" } catch {} }

if (-not $hasDocker) {
    if (Ask-YesNo "Install Docker Desktop (required for production mode)?") {
        Install-WithWinget -Id 'Docker.DockerDesktop' -Display 'Docker Desktop' | Out-Null
    }
}
if (-not $hasPython) {
    if (Ask-YesNo "Install Python 3.11 (optional, for edge Python services)?") {
        Install-WithWinget -Id 'Python.Python.3.11' -Display 'Python 3.11' | Out-Null
    }
}

# Optional: Build tools for native modules (bcrypt/node-gyp)
# if (Ask-YesNo "Install Visual Studio 2022 Build Tools (optional, for node-gyp/native deps)?" $false) {
#     Install-WithWinget -Id 'Microsoft.VisualStudio.2022.BuildTools' -Display 'VS 2022 Build Tools' | Out-Null
# }

# 4) Install project dependencies
function Npm-Install {
    param([Parameter(Mandatory=$true)][string]$Dir)
    if (-not (Test-Path $Dir)) { return }
    $pkg = Join-Path $Dir 'package.json'
    if (-not (Test-Path $pkg)) { return }
    $name = Split-Path $Dir -Leaf
    if (Ask-YesNo "Run npm install in '$name'?") {
        Push-Location $Dir
        try {
            Write-Info "Installing dependencies in $name..."
            $p = Start-Process -FilePath 'npm' -ArgumentList @('install') -Wait -PassThru -NoNewWindow
            if ($p.ExitCode -ne 0) { throw "npm install failed in $name (exit $($p.ExitCode))" }
            Write-Success "npm install completed in $name."
        } catch {
            Write-Err $_
        } finally { Pop-Location }
    } else {
        Write-Warn "Skipped npm install in $name."
    }
}

function Pip-Install {
    param([Parameter(Mandatory=$true)][string]$Dir)
    $req = Join-Path $Dir 'requirements.txt'
    if (Test-Path $req) {
        if (Ask-YesNo "Install Python deps in 'edge-py' via requirements.txt?") {
            Push-Location $Dir
            try {
                Write-Info "Installing Python dependencies (pip)..."
                $p = Start-Process -FilePath 'python' -ArgumentList @('-m','pip','install','-r','requirements.txt') -Wait -PassThru -NoNewWindow
                if ($p.ExitCode -ne 0) { throw "pip install failed in edge-py (exit $($p.ExitCode))" }
                Write-Success "pip install completed in edge-py."
            } catch {
                Write-Err $_
            } finally { Pop-Location }
        } else {
            Write-Warn "Skipped pip install in edge-py."
        }
    }
}

Npm-Install -Dir $PrimaryDir
Npm-Install -Dir $ClientDir
Npm-Install -Dir $StreamDir # only runs if package.json exists
Pip-Install -Dir $EdgeDir    # only runs if requirements.txt exists

Write-Host ""; Write-Success "Setup completed."
Write-Info "If you installed new tools, you may need to reopen your terminal for PATH changes to take effect."
