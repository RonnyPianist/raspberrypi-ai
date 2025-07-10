# Raspberry Pi Car Controller - Windows Startup Script
# Dieses Script startet die Anwendung automatisch in PowerShell

Write-Host "🚗 Raspberry Pi Car Controller - Windows Startup" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

# Prüfe ob Node.js installiert ist
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js ist nicht installiert!" -ForegroundColor Red
    Write-Host "Bitte installieren Sie Node.js von https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Drücken Sie Enter zum Beenden"
    exit 1
}

# Zeige Node.js Version
$nodeVersion = node --version
Write-Host "✅ Node.js Version: $nodeVersion" -ForegroundColor Green

# Prüfe ob im richtigen Verzeichnis
$currentPath = Get-Location
$expectedPath = "C:\Users\Ronny\Daten\Programmier Projekte\raspberrypi-car\raspberrypi-car"

if ($currentPath.Path -ne $expectedPath) {
    Write-Host "📁 Wechsle zum Projektverzeichnis..." -ForegroundColor Yellow
    try {
        Set-Location $expectedPath
        Write-Host "✅ Verzeichnis gewechselt zu: $expectedPath" -ForegroundColor Green
    } catch {
        Write-Host "❌ Konnte nicht zum Projektverzeichnis wechseln!" -ForegroundColor Red
        Write-Host "Bitte stellen Sie sicher, dass das Projekt im richtigen Ordner liegt." -ForegroundColor Yellow
        Read-Host "Drücken Sie Enter zum Beenden"
        exit 1
    }
}

# Prüfe ob package.json existiert
if (!(Test-Path "package.json")) {
    Write-Host "❌ package.json nicht gefunden!" -ForegroundColor Red
    Write-Host "Bitte stellen Sie sicher, dass Sie im richtigen Projektverzeichnis sind." -ForegroundColor Yellow
    Read-Host "Drücken Sie Enter zum Beenden"
    exit 1
}

# Prüfe ob node_modules existiert, falls nicht: npm install
if (!(Test-Path "node_modules")) {
    Write-Host "📦 Dependencies werden installiert..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Fehler beim Installieren der Dependencies!" -ForegroundColor Red
        Read-Host "Drücken Sie Enter zum Beenden"
        exit 1
    }
    Write-Host "✅ Dependencies erfolgreich installiert!" -ForegroundColor Green
}

# Prüfe ob Port 3000 verfügbar ist
$portInUse = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($portInUse) {
    Write-Host "⚠️  Port 3000 ist bereits belegt!" -ForegroundColor Yellow
    Write-Host "Der Server läuft möglicherweise bereits." -ForegroundColor Yellow
    $choice = Read-Host "Trotzdem starten? (y/N)"
    if ($choice -ne "y" -and $choice -ne "Y") {
        Write-Host "Abgebrochen." -ForegroundColor Yellow
        Read-Host "Drücken Sie Enter zum Beenden"
        exit 0
    }
}

Write-Host ""
Write-Host "🚀 Starte Raspberry Pi Car Controller..." -ForegroundColor Green
Write-Host "🌐 Web-Interface wird unter http://localhost:3000 verfügbar sein" -ForegroundColor Cyan
Write-Host "📱 Von anderen Geräten erreichbar unter http://[Ihre-IP]:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Tipps:" -ForegroundColor Yellow
Write-Host "   - Drücken Sie Ctrl+C um den Server zu stoppen" -ForegroundColor White
Write-Host "   - Alle Switch-Operationen werden in der Konsole angezeigt" -ForegroundColor White
Write-Host "   - Dies ist die Mock-Version für Windows (keine echte GPIO)" -ForegroundColor White
Write-Host ""

# Warte 2 Sekunden, dann starte Server
Start-Sleep -Seconds 2

# Starte Server und öffne Browser
Start-Process "http://localhost:3000"
node main.js
