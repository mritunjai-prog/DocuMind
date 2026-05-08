param(
    [switch]$Reload,
    [int]$Port = 8000
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

$venvPython = Join-Path $root ".venv\Scripts\python.exe"
if (-not (Test-Path $venvPython)) {
    Write-Host "Creating virtual environment at .venv ..."
    py -3 -m venv .venv
}

function Invoke-PythonOrThrow {
    param([string[]]$CommandArgs)
    & $venvPython @CommandArgs
    if ($LASTEXITCODE -ne 0) {
        throw "Python command failed: $($CommandArgs -join ' ')"
    }
}

Write-Host "Installing backend dependencies (lightweight local set) ..."
Invoke-PythonOrThrow -CommandArgs @("-m", "pip", "install", "--upgrade", "pip")

# psycopg2-binary may fail on some local Python versions (e.g. 3.13 on Windows).
# If that happens, retry with a filtered requirements list for local SQLite-only runs.
& $venvPython -m pip install -r "backend\requirements.render.txt"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Retrying dependency install without psycopg2-binary for local SQLite mode..."
    $tempReq = Join-Path $env:TEMP "requirements.render.local.txt"
    Get-Content "backend\requirements.render.txt" |
        Where-Object { $_ -notmatch '^\s*psycopg2-binary' } |
        Set-Content $tempReq
    Invoke-PythonOrThrow -CommandArgs @("-m", "pip", "install", "-r", $tempReq)
}

# Default to local SQLite if no database URL is provided.
if (-not $env:DATABASE_URL -and -not $env:DATABASE_URI) {
    $env:DATABASE_URL = "sqlite:///./local_test.db"
}

if (-not $env:ALLOWED_ORIGINS) {
    $env:ALLOWED_ORIGINS = "http://localhost:8080,http://localhost:5173,http://localhost:3000,http://127.0.0.1:8080"
}

if (-not $env:GOOGLE_API_KEY) {
    Write-Host "Warning: GOOGLE_API_KEY is not set. Some AI features may be limited."
}

$uvicornArgs = @("-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "$Port")
if ($Reload) {
    $uvicornArgs += "--reload"
}

Push-Location "backend"
try {
    Write-Host "Starting backend on http://localhost:$Port ..."
    & $venvPython @uvicornArgs
}
finally {
    Pop-Location
}
