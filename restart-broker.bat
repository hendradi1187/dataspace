@echo off
setlocal enabledelayedexpansion

echo 🛑 Killing all node processes...
taskkill /F /IM node.exe 2>nul || echo.

timeout /t 2 /nobreak

echo 🚀 Starting Broker Service...
cd /d "D:\BMAD-METHOD\dataspace\services\cts\broker"
start cmd /k "npm run dev"

timeout /t 5 /nobreak

echo 🔍 Checking broker health...
curl http://localhost:3001/health

echo.
echo ✅ Services should be starting...
