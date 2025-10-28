# Load environment variables from .env.backend
if (Test-Path .\.env.backend) {
    Write-Host "Loading environment variables from .env.backend..." -ForegroundColor Green
    $envFile = Get-Content .\.env.backend
    foreach ($line in $envFile) {
        if ($line -and -not $line.StartsWith("#")) {
            $parts = $line -split "=", 2
            if ($parts.Count -eq 2) {
                $key = $parts[0].Trim()
                $value = $parts[1].Trim()
                [Environment]::SetEnvironmentVariable($key, $value, "Process")
                Write-Host "✅ Set $key" -ForegroundColor Green
            }
        }
    }
}

# Verify token is set
$token = $env:HF_API_TOKEN
if ($token) {
    Write-Host "✅ HF_API_TOKEN is set (length: $($token.Length))" -ForegroundColor Green
} else {
    Write-Host "❌ HF_API_TOKEN is NOT set" -ForegroundColor Red
}

# Start the backend
Write-Host "`n🚀 Starting backend..." -ForegroundColor Cyan
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --log-level info
