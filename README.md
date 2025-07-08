# 🤖 Lokaler AI-Assistent

Ein freundlicher, lokaler AI-Assistent für Linux x64 Systeme, der vollständig in Node.js geschrieben ist und ohne externe APIs funktioniert.

## ✨ Features

- **Vollständig lokal**: Keine Internetverbindung für Basisfunktionen nötig
- **Freundliche Persönlichkeit**: Natürliche Konversation auf Deutsch
- **Systeminformationen**: CPU, RAM, Festplatte, Prozesse
- **Dateiverwaltung**: Datei-Listing und Navigation
- **Gedächtnis**: Kann sich Informationen merken und abrufen
- **Utilities**: Taschenrechner, Uhrzeit, Witze
- **Wetter**: Wetterabfrage (benötigt curl)
- **Erweiterbar**: Einfach neue Befehle hinzufügen

## 🚀 Installation

### Voraussetzungen

- Linux x64 System
- Node.js 12.x oder höher
- npm (meist mit Node.js installiert)

### Automatische Installation

```bash
# 1. Installationsskript herunterladen und ausführen
curl -o install.sh https://raw.githubusercontent.com/yourusername/local-ai-assistant/main/install.sh
chmod +x install.sh
./install.sh

# 2. Oder manuell:
mkdir -p ~/local-ai-assistant
cd ~/local-ai-assistant
# Kopiere ai-assistant.js in diesen Ordner
node ai-assistant.js
```

### Manuelle Installation

```bash
# 1. Projektordner erstellen
mkdir -p ~/local-ai-assistant
cd ~/local-ai-assistant

# 2. Dateien kopieren
# Kopiere den Code aus der Artifact in ai-assistant.js

# 3. Ausführbar machen
chmod +x ai-assistant.js

# 4. Starten
node ai-assistant.js
```

## 🎮 Verwendung

### Start

```bash
cd ~/local-ai-assistant
./ai-assistant.js
```

### Verfügbare Befehle

| Befehl | Beschreibung |
|--------|--------------|
| `help` | Zeigt alle verfügbaren Befehle |
| `system` | Systeminformationen anzeigen |
| `disk` | Festplattenspeicher anzeigen |
| `process` | Laufende Prozesse anzeigen |
| `files [Pfad]` | Dateien auflisten |
| `calc [Ausdruck]` | Mathematische Berechnung |
| `remember [Text]` | Information speichern |
| `recall [Stichwort]` | Information abrufen |
| `weather [Stadt]` | Wetter abfragen |
| `time` | Aktuelle Zeit anzeigen |
| `joke` | Witz erzählen |
| `clear` | Bildschirm löschen |
| `exit/quit` | Assistent beenden |

### Beispiele

```bash
# Natürliche Konversation
> Hallo ALEX!
💬 ALEX: Hallo! Schön dich zu sehen. Wie kann ich dir heute helfen?

# Systeminformationen
> system
🖥️  System-Informationen:
━━━━━━━━━━━━━━━━━━━━━━━━
Hostname: mein-linux-pc
CPU: Intel(R) Core(TM) i7-8700K
...

# Berechnung
> calc 2 + 2 * 3
🔢 Ergebnis: 2 + 2 * 3 = 8

# Gedächtnis
> remember Mein Lieblingsprogramm ist vim
✅ Gespeichert! Ich werde mir das merken.

> recall vim
🧠 Erinnerungen zu "vim":
1. Mein Lieblingsprogramm ist vim (08.07.2025, 14:30:15)
```

## 🔧 Konfiguration

### Globale Installation (optional)

```bash
cd ~/local-ai-assistant
npm run install-global
```

Danach kannst du überall im System `alex` eingeben.

### Datenverzeichnis

- Gedächtnis wird gespeichert in: `~/.local-ai/memory.json`
- Automatische Erstellung bei erstem Start

## 🛠️ Entwicklung

### Neue Befehle hinzufügen

```javascript
// In der LocalAI Klasse
this.commands['meinbefehl'] = this.meinBefehl.bind(this);

async meinBefehl(args) {
    const parameter = args[0];
    console.log(`Mein neuer Befehl mit Parameter: ${parameter}`);
}
```

### Erweiterte Antworten

```javascript
// In generateResponse() Methode
if (lowerInput.includes('mein stichwort')) {
    return `Antwort auf mein Stichwort`;
}
```

## 📋 Systemanforderungen

- **Betriebssystem**: Linux x64 (getestet auf Ubuntu, Debian, Fedora, Arch)
- **Node.js**: Version 12.x oder höher
- **RAM**: Mindestens 256 MB für den Assistenten
- **Festplatte**: ~1 MB für Installation
- **Optional**: `curl` für Wetterfunktion

## 🔒 Datenschutz

- **Vollständig lokal**: Keine Daten verlassen dein System
- **Keine Telemetrie**: Keine Sammlung von Nutzungsdaten
- **Gedächtnis**: Wird nur lokal in `~/.local-ai/` gespeichert
- **Open Source**: Du kannst den Code komplett einsehen

## 🐛 Fehlerbehebung

### Node.js Installation prüfen

```bash
node --version  # Sollte v12.x.x oder höher zeigen
npm --version   # Sollte eine Version anzeigen
```

### Berechtigungen

```bash
# Falls Berechtigungsfehler auftreten
chmod +x ai-assistant.js
```

### Gedächtnis zurücksetzen

```bash
rm -rf ~/.local-ai/memory.json
```

## 🚀 Geplante Features

- [ ] Plugin-System für Erweiterungen
- [ ] Bessere NLP-Verarbeitung
- [ ] Sprachausgabe (TTS)
- [ ] GUI-Interface
- [ ] Cron-Integration für Erinnerungen
- [ ] Mehr Systemintegration

## 🤝 Beitragen

Verbesserungen sind willkommen! Öffne ein Issue oder erstelle einen Pull Request.

## 📄 Lizenz

MIT License - Du kannst den Code frei verwenden und modifizieren.

## 📞 Support

Bei Problemen:
1. Prüfe die Systemanforderungen
2. Schaue in die Fehlerbehebung
3. Öffne ein GitHub Issue

---

**Viel Spaß mit deinem lokalen AI-Assistenten!** 🎉
