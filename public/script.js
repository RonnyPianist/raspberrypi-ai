class CarController {
    constructor() {
        this.socket = io();
        this.switches = {};
        this.isConnected = false;
        this.logEntries = [];
        
        this.initializeSocketEvents();
        this.initializeUI();
        this.startSystemClock();
        this.getClientIP();
    }

    initializeSocketEvents() {
        this.socket.on('connect', () => {
            this.isConnected = true;
            this.updateConnectionStatus();
            this.addLogEntry('Connected to server', 'success');
        });

        this.socket.on('disconnect', () => {
            this.isConnected = false;
            this.updateConnectionStatus();
            this.addLogEntry('Disconnected from server', 'error');
        });

        this.socket.on('initialSwitchStates', (switches) => {
            this.switches = switches;
            this.renderSwitches();
            this.updateActiveSwitchCount();
        });

        this.socket.on('switchStateChanged', (data) => {
            if (this.switches[data.switchId]) {
                this.switches[data.switchId].state = data.state;
                this.updateSwitchUI(data.switchId);
                this.updateActiveSwitchCount();
                
                const action = data.state ? 'turned ON' : 'turned OFF';
                const switchName = this.switches[data.switchId].config.name;
                this.addLogEntry(`${switchName} ${action}`, data.state ? 'success' : 'info');
                this.updateLastAction(`${switchName} ${action}`);
            }
        });

        this.socket.on('allSwitchesOff', () => {
            Object.keys(this.switches).forEach(switchId => {
                this.switches[switchId].state = false;
                this.updateSwitchUI(switchId);
            });
            this.updateActiveSwitchCount();
            this.addLogEntry('All switches turned OFF', 'warning');
            this.updateLastAction('All switches OFF');
        });
    }

    initializeUI() {
        // Emergency stop button
        document.getElementById('emergencyStop').addEventListener('click', () => {
            this.showConfirmModal(
                'Turn off ALL switches?',
                'This will immediately turn off all 12V switches.',
                () => this.allSwitchesOff()
            );
        });

        // Clear log button
        document.getElementById('clearLog').addEventListener('click', () => {
            this.clearLog();
        });

        // Modal event listeners
        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.hideConfirmModal();
        });

        document.getElementById('confirmBtn').addEventListener('click', () => {
            if (this.confirmCallback) {
                this.confirmCallback();
            }
            this.hideConfirmModal();
        });

        // Close modal when clicking outside
        document.getElementById('confirmModal').addEventListener('click', (e) => {
            if (e.target.id === 'confirmModal') {
                this.hideConfirmModal();
            }
        });
    }

    renderSwitches() {
        const switchesGrid = document.getElementById('switchesGrid');
        switchesGrid.innerHTML = '';

        Object.keys(this.switches).forEach(switchId => {
            const switchData = this.switches[switchId];
            const switchElement = this.createSwitchElement(switchId, switchData);
            switchesGrid.appendChild(switchElement);
        });
    }

    createSwitchElement(switchId, switchData) {
        const switchCard = document.createElement('div');
        switchCard.className = `switch-card ${switchData.state ? 'active' : ''}`;
        switchCard.id = `switch-${switchId}`;

        switchCard.innerHTML = `
            <div class="switch-header">
                <div class="switch-info">
                    <h3>${switchData.config.name}</h3>
                    <p>${switchData.config.description}</p>
                </div>
                <button class="switch-toggle ${switchData.state ? 'active' : ''}" 
                        data-switch-id="${switchId}">
                </button>
            </div>
            <div class="switch-status">
                <span class="status-badge ${switchData.state ? 'on' : 'off'}">
                    ${switchData.state ? 'ON' : 'OFF'}
                </span>
                <span class="pin-info">GPIO ${switchData.config.pin}</span>
            </div>
        `;

        // Add click event listener to the toggle button
        const toggleButton = switchCard.querySelector('.switch-toggle');
        toggleButton.addEventListener('click', () => {
            this.toggleSwitch(switchId);
        });

        return switchCard;
    }

    updateSwitchUI(switchId) {
        const switchCard = document.getElementById(`switch-${switchId}`);
        const toggleButton = switchCard.querySelector('.switch-toggle');
        const statusBadge = switchCard.querySelector('.status-badge');
        const switchData = this.switches[switchId];

        // Update card class
        if (switchData.state) {
            switchCard.classList.add('active');
            toggleButton.classList.add('active');
            statusBadge.className = 'status-badge on';
            statusBadge.textContent = 'ON';
        } else {
            switchCard.classList.remove('active');
            toggleButton.classList.remove('active');
            statusBadge.className = 'status-badge off';
            statusBadge.textContent = 'OFF';
        }
    }

    toggleSwitch(switchId) {
        if (this.isConnected) {
            this.socket.emit('toggleSwitch', { switchId });
        } else {
            this.addLogEntry('Cannot toggle switch: Not connected to server', 'error');
        }
    }

    allSwitchesOff() {
        if (this.isConnected) {
            fetch('/api/switches/all-off', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                console.log('All switches turned off:', data);
            })
            .catch(error => {
                console.error('Error turning off switches:', error);
                this.addLogEntry('Error turning off all switches', 'error');
            });
        } else {
            this.addLogEntry('Cannot turn off switches: Not connected to server', 'error');
        }
    }

    updateConnectionStatus() {
        const statusDot = document.getElementById('connectionStatus');
        const statusText = document.getElementById('connectionText');

        if (this.isConnected) {
            statusDot.classList.add('connected');
            statusText.textContent = 'Connected';
        } else {
            statusDot.classList.remove('connected');
            statusText.textContent = 'Disconnected';
        }
    }

    updateActiveSwitchCount() {
        const activeSwitches = Object.values(this.switches).filter(s => s.state).length;
        document.getElementById('activeSwitches').textContent = activeSwitches;
    }

    updateLastAction(action) {
        document.getElementById('lastAction').textContent = action;
    }

    addLogEntry(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = {
            message,
            type,
            timestamp
        };

        this.logEntries.unshift(logEntry);
        
        // Keep only last 50 entries
        if (this.logEntries.length > 50) {
            this.logEntries = this.logEntries.slice(0, 50);
        }

        this.renderLogEntries();
    }

    renderLogEntries() {
        const logContainer = document.getElementById('logContainer');
        
        if (this.logEntries.length === 0) {
            logContainer.innerHTML = '<p style="color: #7f8c8d; text-align: center; padding: 20px;">No activity yet</p>';
            return;
        }

        logContainer.innerHTML = this.logEntries.map(entry => `
            <div class="log-entry log-${entry.type}">
                <span class="log-message">${entry.message}</span>
                <span class="log-timestamp">${entry.timestamp}</span>
            </div>
        `).join('');
    }

    clearLog() {
        this.logEntries = [];
        this.renderLogEntries();
        this.addLogEntry('Log cleared', 'info');
    }

    showConfirmModal(title, message, callback) {
        document.getElementById('confirmMessage').textContent = message;
        document.getElementById('confirmModal').style.display = 'block';
        this.confirmCallback = callback;
    }

    hideConfirmModal() {
        document.getElementById('confirmModal').style.display = 'none';
        this.confirmCallback = null;
    }

    startSystemClock() {
        const updateClock = () => {
            const now = new Date();
            const timeString = now.toLocaleTimeString();
            document.getElementById('systemTime').textContent = timeString;
        };

        updateClock();
        setInterval(updateClock, 1000);
    }

    async getClientIP() {
        try {
            // Try to get local IP from WebRTC
            const pc = new RTCPeerConnection({
                iceServers: []
            });
            
            pc.createDataChannel('');
            pc.createOffer().then(offer => pc.setLocalDescription(offer));
            
            pc.onicecandidate = (ice) => {
                if (ice && ice.candidate && ice.candidate.candidate) {
                    const ipMatch = ice.candidate.candidate.match(/([0-9]{1,3}(\.[0-9]{1,3}){3})/);
                    if (ipMatch) {
                        const ip = ipMatch[1];
                        if (ip !== '127.0.0.1') {
                            document.getElementById('ipAddress').textContent = `IP: ${ip}`;
                            pc.close();
                        }
                    }
                }
            };
        } catch (error) {
            console.log('Could not get IP address:', error);
            document.getElementById('ipAddress').textContent = 'IP: Unknown';
        }
    }
}

// Initialize the car controller when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.carController = new CarController();
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl + Alt + A = All switches off
    if (e.ctrlKey && e.altKey && e.key === 'a') {
        e.preventDefault();
        window.carController.showConfirmModal(
            'Turn off ALL switches?',
            'Keyboard shortcut: Ctrl+Alt+A',
            () => window.carController.allSwitchesOff()
        );
    }
    
    // Number keys 1-8 to toggle switches
    if (e.key >= '1' && e.key <= '8') {
        e.preventDefault();
        const switchNumber = parseInt(e.key);
        const switchId = `switch${switchNumber}`;
        if (window.carController.switches[switchId]) {
            window.carController.toggleSwitch(switchId);
        }
    }
});

// Service Worker for offline functionality (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
