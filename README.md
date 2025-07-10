# Raspberry Pi Car - 12V Switch Controller

A modern web interface for controlling 12V switches on your Raspberry Pi car project. This application provides a responsive, real-time control panel accessible from any device on your network.

## Features

- **8 Configurable 12V Switches** - Control lights, horn, auxiliary devices
- **Real-time Control** - Instant feedback using WebSockets
- **Responsive Design** - Works on desktop, tablet, and mobile devices
- **Safety Features** - Emergency stop button and confirmation dialogs
- **Activity Logging** - Track all switch operations
- **GPIO Control** - Direct Raspberry Pi GPIO pin control
- **Multi-device Support** - Multiple users can connect simultaneously

## Hardware Requirements

- Raspberry Pi (3B+ or newer recommended)
- 12V relay modules (8-channel recommended)
- 12V power supply for devices
- Jumper wires for GPIO connections

## GPIO Pin Configuration

| Switch | GPIO Pin | Default Function |
|--------|----------|-----------------|
| Switch 1 | GPIO 18 | Front Lights |
| Switch 2 | GPIO 19 | Rear Lights |
| Switch 3 | GPIO 20 | Left Signal |
| Switch 4 | GPIO 21 | Right Signal |
| Switch 5 | GPIO 22 | Horn/Buzzer |
| Switch 6 | GPIO 23 | Auxiliary 1 |
| Switch 7 | GPIO 24 | Auxiliary 2 |
| Switch 8 | GPIO 25 | Emergency |

## Software Installation

### Windows Development Setup (PowerShell)

Für die Entwicklung auf Windows mit PowerShell:

1. **Install Node.js (v14 or newer):**
   - Download von [nodejs.org](https://nodejs.org/)
   - Oder mit Chocolatey in PowerShell (als Administrator):
   ```powershell
   Set-ExecutionPolicy Bypass -Scope Process -Force
   iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
   choco install nodejs
   ```

2. **Navigiere zum Projektordner und installiere Dependencies:**
   ```powershell
   # Navigiere zum Projektordner
   Set-Location "C:\Users\Ronny\Daten\Programmier Projekte\raspberrypi-car\raspberrypi-car"
   
   # Installiere Dependencies (pigpio wird automatisch übersprungen auf Windows)
   npm install
   ```

3. **Starte die Anwendung (Development Mode):**
   ```powershell
   # Normale Ausführung
   node main.js
   
   # Oder mit npm script
   npm start
   ```
   
   Für Auto-Restart während der Entwicklung:
   ```powershell
   # Erst nodemon installieren (falls nicht vorhanden)
   npm install -g nodemon
   
   # Dann mit Auto-Restart starten
   npm run dev
   ```

4. **Web-Interface öffnen:**
   ```powershell
   # Browser automatisch öffnen
   Start-Process "http://localhost:3000"
   ```

   **✅ Windows Features:**
   - Mock-GPIO Implementierung - keine echte Hardware nötig
   - Alle Switch-Operationen werden in der PowerShell-Konsole angezeigt
   - Vollständige Web-Interface Funktionalität zum Testen
   - Automatische Plattform-Erkennung

### Raspberry Pi Deployment

Für den Einsatz auf dem Raspberry Pi:

1. **Enable GPIO on Raspberry Pi:**
   ```bash
   sudo raspi-config
   # Navigate to Interfacing Options > GPIO > Enable
   ```

2. **Install Node.js (v14 or newer):**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Install pigpio library:**
   ```bash
   sudo apt-get update
   sudo apt-get install pigpio
   ```

4. **Transfer project to Raspberry Pi:**
   ```powershell
   # Von Windows aus mit SCP (OpenSSH Client muss installiert sein)
   scp -r "C:\Users\Ronny\Daten\Programmier Projekte\raspberrypi-car\raspberrypi-car" pi@[PI-IP-ADDRESS]:~/
   
   # Oder mit PowerShell Copy-Item über SMB
   Copy-Item -Path "C:\Users\Ronny\Daten\Programmier Projekte\raspberrypi-car\raspberrypi-car" -Destination "\\[PI-IP]\home\pi\" -Recurse
   
   # Alternative: ZIP erstellen und übertragen
   Compress-Archive -Path "C:\Users\Ronny\Daten\Programmier Projekte\raspberrypi-car\raspberrypi-car\*" -DestinationPath "C:\Users\Ronny\Desktop\raspberrypi-car.zip"
   ```

5. **On Raspberry Pi - Install dependencies:**
   ```bash
   cd ~/raspberrypi-car
   npm install
   ```

6. **Start the pigpio daemon:**
   ```bash
   sudo pigpiod
   ```

7. **Run the application:**
   ```bash
   sudo node main.js
   ```

   Or for development with auto-restart:
   ```bash
   sudo npm run dev
   ```

## Quick Start für Windows

**Methode 1: Automatisches Startup-Script (Empfohlen)**

Doppelklick auf eine der folgenden Dateien:
- `start-windows.bat` - Einfacher Start ohne PowerShell-Probleme
- `start-windows.ps1` - Erweiterte PowerShell-Version mit mehr Features

**Methode 2: Manuell in PowerShell:**

```powershell
# 1. Zum Projektordner navigieren
Set-Location "C:\Users\Ronny\Daten\Programmier Projekte\raspberrypi-car\raspberrypi-car"

# 2. Dependencies installieren
npm install

# 3. Anwendung starten
npm start

# 4. Browser öffnen
Start-Process "http://localhost:3000"
```

**Methode 3: Über npm Scripts:**

```powershell
# Alles in einem Befehl
npm run quick-start

# Oder separat
npm install
npm start
npm run open  # Öffnet Browser
```

**✅ Das sollten Sie sehen:**
- PowerShell-Konsole zeigt: "🚗 Raspberry Pi Car Control Server running on port 3000"
- Browser öffnet die Web-Oberfläche mit 8 Switch-Kontrollen
- Alle Switch-Operationen werden in der Konsole als "Mock GPIO" angezeigt

## Usage

### Windows Development

1. **Starten Sie die Anwendung:**
   ```powershell
   npm start
   ```

2. **Zugriff auf die Web-Oberfläche:**
   - Browser öffnen und zu `http://localhost:3000` gehen
   - Die Mock-GPIO Implementierung zeigt Konsolenausgaben für alle Switch-Operationen

3. **Testen der Oberfläche:**
   - Klicken Sie auf die Toggle-Switches um Geräte ein/auszuschalten
   - Verwenden Sie den "ALL OFF" Button für den Notaus
   - Überwachen Sie die Aktivitäten im Log-Bereich

### Raspberry Pi Production

1. **Access the web interface:**
   - Open a browser and go to `http://[your-pi-ip]:3000`
   - Or locally: `http://localhost:3000`

2. **Control switches:**
   - Click the toggle switches to turn devices on/off
   - Use the "ALL OFF" button for emergency stop
   - Monitor activity in the log section

3. **Keyboard shortcuts:**
   - Numbers 1-8: Toggle switches 1-8
   - Ctrl+Alt+A: Emergency stop (all switches off)

## Configuration

### Customizing Switches

Edit the `SWITCH_CONFIG` object in `main.js` to modify:
- GPIO pin assignments
- Switch names and descriptions
- Add or remove switches

```javascript
const SWITCH_CONFIG = {
  switch1: { pin: 18, name: 'Your Device', description: 'Device description' },
  // ... add more switches
};
```

### Network Settings

- **Port**: Change `PORT` environment variable or modify line in `main.js`
- **Access**: Server binds to `0.0.0.0` for network access

## Running as a Service

To automatically start on boot:

1. **Install PM2:**
   ```bash
   sudo npm install -g pm2
   ```

2. **Start with PM2:**
   ```bash
   sudo pm2 start main.js --name "car-controller"
   sudo pm2 startup
   sudo pm2 save
   ```

## Safety Considerations

⚠️ **Important Safety Notes:**

- Always test switches without load first
- Use appropriate relays for 12V devices
- Ensure proper electrical isolation
- Double-check wiring before powering on
- The emergency stop feature turns off all switches immediately

## Troubleshooting

### Windows Development Issues

1. **PowerShell Execution Policy:**
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

2. **Port bereits belegt:**
   ```powershell
   # Port 3000 prüfen
   netstat -ano | findstr :3000
   # Prozess beenden (ersetze PID mit der gefundenen Prozess-ID)
   taskkill /PID [PID] /F
   ```

3. **Node.js/npm Probleme:**
   ```powershell
   # Node Version prüfen
   node --version
   npm --version
   
   # Cache löschen
   npm cache clean --force
   ```

### Raspberry Pi Issues

1. **Permission Denied (GPIO):**
   - Run with `sudo` or add user to gpio group:
   ```bash
   sudo usermod -a -G gpio $USER
   ```

2. **pigpio not found:**
   - Install pigpio: `sudo apt-get install pigpio`
   - Start daemon: `sudo pigpiod`

3. **Can't access from other devices:**
   - Check firewall settings
   - Ensure server binds to `0.0.0.0` (not `localhost`)

4. **Switches not responding:**
   - Verify GPIO pin connections
   - Check relay module power supply
   - Test GPIO pins with `gpio readall`

## API Endpoints

- `GET /` - Web interface
- `GET /api/switches` - Get all switch states
- `POST /api/switch/:id/toggle` - Toggle specific switch
- `POST /api/switches/all-off` - Turn off all switches

## Development

### Project Structure
```
raspberrypi-car/
├── main.js              # Main server file
├── package.json         # Dependencies
├── public/              # Web interface files
│   ├── index.html       # Main HTML page
│   ├── styles.css       # Styling
│   ├── script.js        # Client-side JavaScript
│   └── sw.js           # Service Worker
└── README.md           # This file
```

### Windows Development Workflow

1. **Entwicklung auf Windows:**
   ```powershell
   # Projekt starten
   npm start
   
   # Oder mit Auto-Reload
   npm run dev
   
   # Testen im Browser: http://localhost:3000
   ```

2. **Deployment zum Raspberry Pi:**
   ```powershell
   # SCP für Dateitransfer (benötigt SSH-Client)
   scp -r . pi@[PI-IP]:/home/pi/raspberrypi-car/
   
   # Oder mit rsync (falls verfügbar)
   rsync -avz --exclude node_modules . pi@[PI-IP]:/home/pi/raspberrypi-car/
   ```

3. **Remote-Debugging:**
   ```powershell
   # SSH Verbindung zum Pi
   ssh pi@[PI-IP]
   
   # Logs anzeigen
   sudo journalctl -u car-controller -f
   ```

### Adding Features

1. **New switches**: Modify `SWITCH_CONFIG` in `main.js`
2. **UI changes**: Edit files in `public/` directory
3. **API endpoints**: Add routes in `main.js`

### Mock vs. Real GPIO

Die Anwendung erkennt automatisch, ob sie auf einem Raspberry Pi läuft:
- **Windows/Mac/Linux (ohne pigpio)**: Mock GPIO mit Konsolenausgabe
- **Raspberry Pi (mit pigpio)**: Echte GPIO-Kontrolle

## License

MIT License - Feel free to modify and use for your projects!

## Support

For issues or questions:
1. Check the troubleshooting section
2. Verify hardware connections
3. Check GPIO pin assignments
4. Review console logs for errors

---

**Enjoy building your Raspberry Pi car! 🚗⚡**