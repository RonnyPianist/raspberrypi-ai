@echo off
echo.
echo 🚗 Raspberry Pi Car Controller - Windows Startup
echo ================================================
echo.

REM Prüfe ob Node.js installiert ist
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js ist nicht installiert!
    echo Bitte installieren Sie Node.js von https://nodejs.org/
    pause
    exit /b 1
)

REM Zeige Node.js Version
echo ✅ Node.js Version:
node --version

REM Wechsle zum Projektverzeichnis
cd /d "C:\Users\Ronny\Daten\Programmier Projekte\raspberrypi-car\raspberrypi-car"
if %errorlevel% neq 0 (
    echo ❌ Konnte nicht zum Projektverzeichnis wechseln!
    pause
    exit /b 1
)

echo ✅ Verzeichnis: %cd%

REM Prüfe ob package.json existiert
if not exist "package.json" (
    echo ❌ package.json nicht gefunden!
    echo Bitte stellen Sie sicher, dass Sie im richtigen Projektverzeichnis sind.
    pause
    exit /b 1
)

REM Installiere Dependencies falls nötig
if not exist "node_modules" (
    echo 📦 Dependencies werden installiert...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Fehler beim Installieren der Dependencies!
        pause
        exit /b 1
    )
    echo ✅ Dependencies erfolgreich installiert!
)

echo.
echo 🚀 Starte Raspberry Pi Car Controller...
echo 🌐 Web-Interface wird unter http://localhost:3000 verfügbar sein
echo.
echo 💡 Tipps:
echo    - Drücken Sie Ctrl+C um den Server zu stoppen
echo    - Alle Switch-Operationen werden in der Konsole angezeigt
echo    - Dies ist die Mock-Version für Windows (keine echte GPIO)
echo.

REM Warte 2 Sekunden
timeout /t 2 /nobreak >nul

REM Öffne Browser
start http://localhost:3000

REM Starte Server
node main.js

pause
