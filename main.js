#!/usr/bin/env node

const readline = require('readline');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

class LocalAI {
    constructor() {
        this.name = "ALEX"; // AI Linux EXpert
        this.personality = "freundlich und hilfsbereit";
        this.memory = new Map();
        this.context = [];
        this.userName = process.env.USER || "Freund";
        this.dataDir = path.join(process.env.HOME, '.local-ai');
        
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: `${this.name}> `
        });
        
        this.commands = {
            'help': this.showHelp.bind(this),
            'system': this.systemInfo.bind(this),
            'files': this.listFiles.bind(this),
            'weather': this.getWeather.bind(this),
            'calc': this.calculate.bind(this),
            'remember': this.remember.bind(this),
            'recall': this.recall.bind(this),
            'joke': this.tellJoke.bind(this),
            'time': this.getTime.bind(this),
            'disk': this.diskUsage.bind(this),
            'process': this.processInfo.bind(this),
            'clear': this.clearScreen.bind(this),
            'exit': this.exit.bind(this),
            'quit': this.exit.bind(this)
        };
        
        this.init();
    }
    
    async init() {
        try {
            await fs.mkdir(this.dataDir, { recursive: true });
            await this.loadMemory();
            this.showWelcome();
            this.startChat();
        } catch (error) {
            console.error('Initialisierungsfehler:', error.message);
        }
    }
    
    showWelcome() {
        console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                     🤖 ${this.name} - Dein AI-Freund                    ║
║                   Lokaler Assistent für Linux                ║
╠═══════════════════════════════════════════════════════════════╣
║ Hallo ${this.userName}! Ich bin ${this.name}, dein persönlicher AI-Assistent.   ║
║ Ich laufe vollständig lokal auf deinem Linux-System.         ║
║                                                               ║
║ Tippe 'help' für eine Liste aller Befehle.                  ║
║ Tippe 'exit' oder 'quit' um mich zu beenden.                ║
╚═══════════════════════════════════════════════════════════════╝
`);
    }
    
    startChat() {
        this.rl.prompt();
        
        this.rl.on('line', async (input) => {
            const trimmed = input.trim();
            
            if (trimmed === '') {
                this.rl.prompt();
                return;
            }
            
            await this.processInput(trimmed);
            this.rl.prompt();
        });
        
        this.rl.on('close', () => {
            this.exit();
        });
    }
    
    async processInput(input) {
        const [command, ...args] = input.split(' ');
        const cmd = command.toLowerCase();
        
        // Kontext für bessere Antworten speichern
        this.context.push(input);
        if (this.context.length > 10) {
            this.context.shift();
        }
        
        if (this.commands[cmd]) {
            await this.commands[cmd](args);
        } else {
            await this.handleGeneralInput(input);
        }
    }
    
    async handleGeneralInput(input) {
        const responses = this.generateResponse(input);
        console.log(`\n💬 ${this.name}: ${responses}\n`);
    }
    
    generateResponse(input) {
        const lowerInput = input.toLowerCase();
        
        // Einfache Mustererkennung für verschiedene Eingaben
        if (lowerInput.includes('hallo') || lowerInput.includes('hi')) {
            return `Hallo ${this.userName}! Schön dich zu sehen. Wie kann ich dir heute helfen?`;
        }
        
        if (lowerInput.includes('wie geht') || lowerInput.includes('wie läuft')) {
            return `Mir geht es gut, danke! Ich bin bereit dir zu helfen. Dein System läuft stabil.`;
        }
        
        if (lowerInput.includes('danke') || lowerInput.includes('dankeschön')) {
            return `Gern geschehen! Ich bin immer da, wenn du Hilfe brauchst.`;
        }
        
        if (lowerInput.includes('wetter')) {
            return `Für Wetterinformationen verwende den Befehl 'weather [Stadt]'.`;
        }
        
        if (lowerInput.includes('rechnen') || lowerInput.includes('berechnen')) {
            return `Für Berechnungen verwende den Befehl 'calc [Ausdruck]'.`;
        }
        
        if (lowerInput.includes('datei') || lowerInput.includes('ordner')) {
            return `Für Dateiverwaltung verwende den Befehl 'files [Pfad]'.`;
        }
        
        if (lowerInput.includes('hilfe') || lowerInput.includes('help')) {
            return `Tippe 'help' für eine vollständige Liste meiner Befehle.`;
        }
        
        // Standardantworten
        const responses = [
            `Das ist interessant! Erzähl mir mehr darüber.`,
            `Ich verstehe. Wie kann ich dir dabei helfen?`,
            `Das klingt wichtig. Brauchst du Unterstützung damit?`,
            `Hmm, lass mich darüber nachdenken. Kannst du spezifischer sein?`,
            `Ich bin hier um zu helfen! Was genau möchtest du wissen?`
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    async showHelp() {
        console.log(`
📋 Verfügbare Befehle:

🔧 System-Befehle:
  system     - Zeigt Systeminformationen
  disk       - Zeigt Festplattenspeicher
  process    - Zeigt laufende Prozesse
  time       - Zeigt aktuelle Zeit
  
📁 Datei-Befehle:
  files [Pfad] - Listet Dateien auf (Standard: aktueller Ordner)
  
🧠 Gedächtnis-Befehle:
  remember [Text] - Speichert Information
  recall [Stichwort] - Ruft Information ab
  
🛠️ Utility-Befehle:
  calc [Ausdruck] - Rechnet mathematische Ausdrücke
  weather [Stadt] - Zeigt Wetter (benötigt curl)
  joke - Erzählt einen Witz
  
🎮 Interface-Befehle:
  clear - Löscht den Bildschirm
  help  - Zeigt diese Hilfe
  exit/quit - Beendet den Assistenten
  
💡 Du kannst auch einfach mit mir sprechen! Ich verstehe natürliche Sprache.
`);
    }
    
    async systemInfo() {
        try {
            const { stdout: hostname } = await execAsync('hostname');
            const { stdout: uptime } = await execAsync('uptime');
            const { stdout: memory } = await execAsync('free -h');
            const { stdout: cpu } = await execAsync('lscpu | grep "Model name" | cut -d: -f2');
            
            console.log(`
🖥️  System-Informationen:
━━━━━━━━━━━━━━━━━━━━━━━━
Hostname: ${hostname.trim()}
CPU: ${cpu.trim()}
Uptime: ${uptime.trim()}

💾 Arbeitsspeicher:
${memory}
`);
        } catch (error) {
            console.log(`❌ Fehler beim Abrufen der Systeminformationen: ${error.message}`);
        }
    }
    
    async listFiles(args) {
        const targetPath = args[0] || process.cwd();
        
        try {
            const { stdout } = await execAsync(`ls -la "${targetPath}"`);
            console.log(`\n📁 Dateien in ${targetPath}:\n${stdout}`);
        } catch (error) {
            console.log(`❌ Fehler beim Auflisten der Dateien: ${error.message}`);
        }
    }
    
    async getWeather(args) {
        const city = args[0] || 'Kiel';
        
        try {
            const { stdout } = await execAsync(`curl -s "wttr.in/${city}?format=3"`);
            console.log(`\n🌤️  Wetter für ${city}: ${stdout.trim()}`);
        } catch (error) {
            console.log(`❌ Wetter kann nicht abgerufen werden. Ist curl installiert?`);
        }
    }
    
    async calculate(args) {
        const expression = args.join(' ');
        
        if (!expression) {
            console.log('📊 Verwendung: calc [mathematischer Ausdruck]');
            return;
        }
        
        try {
            // Einfache Berechnung mit node -e
            const { stdout } = await execAsync(`node -e "console.log(${expression})"`);
            console.log(`\n🔢 Ergebnis: ${expression} = ${stdout.trim()}`);
        } catch (error) {
            console.log(`❌ Fehler bei der Berechnung: ${error.message}`);
        }
    }
    
    async remember(args) {
        const text = args.join(' ');
        
        if (!text) {
            console.log('🧠 Verwendung: remember [Text zum Merken]');
            return;
        }
        
        const timestamp = new Date().toISOString();
        const key = `memory_${Date.now()}`;
        
        this.memory.set(key, {
            text,
            timestamp,
            keywords: text.toLowerCase().split(' ')
        });
        
        await this.saveMemory();
        console.log(`\n✅ Gespeichert! Ich werde mir das merken.`);
    }
    
    async recall(args) {
        const keyword = args.join(' ').toLowerCase();
        
        if (!keyword) {
            console.log('🔍 Verwendung: recall [Stichwort]');
            return;
        }
        
        const matches = [];
        for (const [key, value] of this.memory.entries()) {
            if (value.keywords.some(k => k.includes(keyword))) {
                matches.push(value);
            }
        }
        
        if (matches.length === 0) {
            console.log(`\n🤔 Ich kann mich nicht an "${keyword}" erinnern.`);
        } else {
            console.log(`\n🧠 Erinnerungen zu "${keyword}":`);
            matches.forEach((match, i) => {
                console.log(`${i + 1}. ${match.text} (${new Date(match.timestamp).toLocaleString()})`);
            });
        }
    }
    
    async tellJoke() {
        const jokes = [
            "Warum nehmen Programmierer immer eine Leiter mit? Weil sie auf höherer Ebene arbeiten wollen! 😄",
            "Was ist der Unterschied zwischen einem Informatiker und einem normalen Menschen? Der Informatiker denkt, 1 KB sind 1024 Byte! 🤓",
            "Warum mögen Programmierer keine Natur? Zu viele Bugs! 🐛",
            "Was sagt ein großer Stift zum kleinen Stift? Wachs-mal-stift! 😅",
            "Warum können Geister so schlecht lügen? Weil man durch sie hindurchsehen kann! 👻"
        ];
        
        const joke = jokes[Math.floor(Math.random() * jokes.length)];
        console.log(`\n😄 ${joke}\n`);
    }
    
    async getTime() {
        const now = new Date();
        console.log(`\n🕐 Aktuelle Zeit: ${now.toLocaleString('de-DE')}`);
        console.log(`📅 Datum: ${now.toLocaleDateString('de-DE')}`);
    }
    
    async diskUsage() {
        try {
            const { stdout } = await execAsync('df -h');
            console.log(`\n💿 Festplattenspeicher:\n${stdout}`);
        } catch (error) {
            console.log(`❌ Fehler beim Abrufen der Speicherinformationen: ${error.message}`);
        }
    }
    
    async processInfo() {
        try {
            const { stdout } = await execAsync('ps aux --sort=-%cpu | head -10');
            console.log(`\n⚡ Top-Prozesse (CPU-Nutzung):\n${stdout}`);
        } catch (error) {
            console.log(`❌ Fehler beim Abrufen der Prozessinformationen: ${error.message}`);
        }
    }
    
    clearScreen() {
        console.clear();
        this.showWelcome();
    }
    
    async loadMemory() {
        try {
            const memoryFile = path.join(this.dataDir, 'memory.json');
            const data = await fs.readFile(memoryFile, 'utf8');
            const memoryArray = JSON.parse(data);
            this.memory = new Map(memoryArray);
        } catch (error) {
            // Datei existiert nicht oder ist beschädigt - erstelle neue
            this.memory = new Map();
        }
    }
    
    async saveMemory() {
        try {
            const memoryFile = path.join(this.dataDir, 'memory.json');
            const memoryArray = Array.from(this.memory.entries());
            await fs.writeFile(memoryFile, JSON.stringify(memoryArray, null, 2));
        } catch (error) {
            console.log(`⚠️  Warnung: Gedächtnis konnte nicht gespeichert werden: ${error.message}`);
        }
    }
    
    async exit() {
        console.log(`\n👋 Auf Wiedersehen ${this.userName}! Bis zum nächsten Mal!`);
        await this.saveMemory();
        process.exit(0);
    }
}

// Starte den AI-Assistenten
if (require.main === module) {
    new LocalAI();
}

module.exports = LocalAI;