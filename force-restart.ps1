# PowerShell script to force kill services and restart

Write-Host "🛑 Stopping dataspace services..." -ForegroundColor Red

# Kill only dataspace service processes by checking working directory
# This avoids killing Claude CLI and other Node.js processes
Get-Process node -ErrorAction SilentlyContinue | Where-Object {
    $_.Path -like "*BMAD-METHOD\dataspace\*"
} | Stop-Process -Force

# Alternative: Kill by port if PID file exists
$portsToKill = @(3000, 3001, 3002, 3003, 3004, 3005, 3006, 3007, 3008, 3009)
foreach ($port in $portsToKill) {
    $connections = netstat -ano | Select-String ":$port " | Select-String "LISTENING"
    foreach ($conn in $connections) {
        $pid = ($conn -split '\s+')[-1]
        if ($pid -and $pid -ne "0") {
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        }
    }
}

Start-Sleep -Seconds 2

Write-Host "✅ Services stopped" -ForegroundColor Green

# Start broker service
Write-Host "🚀 Starting Broker Service..." -ForegroundColor Cyan
cd "D:\BMAD-METHOD\dataspace\services\cts\broker"

# Start in background
$job = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -NoNewWindow -PassThru
Start-Sleep -Seconds 5

Write-Host "🔍 Checking broker health..." -ForegroundColor Yellow
$health = Invoke-WebRequest -Uri "http://localhost:3001/health" -ErrorAction SilentlyContinue
if ($health.StatusCode -eq 200) {
    Write-Host "✅ Broker is healthy!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Service Started:" -ForegroundColor Cyan
    Write-Host "  API: http://localhost:3001"
    Write-Host "  Participants: http://localhost:3001/participants"
} else {
    Write-Host "⚠️  Broker may not be responding" -ForegroundColor Yellow
}
