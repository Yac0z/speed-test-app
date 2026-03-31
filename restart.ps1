# Restart Speed Test App
# Kills any process using port 3000 (Next.js) and port 8969 (Spotlight), then starts both servers

Write-Host "🔄 Restarting Speed Test App..." -ForegroundColor Cyan

# Kill process on port 3000 (Next.js)
Write-Host "🔍 Checking port 3000..." -ForegroundColor Yellow
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($port3000) {
    $pid = $port3000.OwningProcess | Select-Object -Unique
    Write-Host "⏹  Killing process $pid on port 3000..." -ForegroundColor Yellow
    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    Start-Sleep -Milliseconds 500
    Write-Host "✅ Port 3000 cleared" -ForegroundColor Green
} else {
    Write-Host "✅ Port 3000 is free" -ForegroundColor Green
}

# Kill process on port 8969 (Spotlight)
Write-Host "🔍 Checking port 8969..." -ForegroundColor Yellow
$port8969 = Get-NetTCPConnection -LocalPort 8969 -ErrorAction SilentlyContinue
if ($port8969) {
    $pid = $port8969.OwningProcess | Select-Object -Unique
    Write-Host "⏹  Killing process $pid on port 8969..." -ForegroundColor Yellow
    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    Start-Sleep -Milliseconds 500
    Write-Host "✅ Port 8969 cleared" -ForegroundColor Green
} else {
    Write-Host "✅ Port 8969 is free" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 Starting servers..." -ForegroundColor Cyan
Write-Host "   - Next.js: http://localhost:3000" -ForegroundColor White
Write-Host "   - Spotlight: http://localhost:8969" -ForegroundColor White
Write-Host ""

# Start both servers
npm run dev
