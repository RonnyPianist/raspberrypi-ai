const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

// GPIO control (using pigpio for better performance)
let Gpio;
try {
  Gpio = require('pigpio').Gpio;
} catch (error) {
  console.log('pigpio not available (likely not on Raspberry Pi), using mock GPIO');
  // Mock GPIO for development on non-Pi systems
  Gpio = class {
    constructor(pin, options) {
      this.pin = pin;
      this.state = 0;
      console.log(`Mock GPIO: Pin ${pin} initialized`);
    }
    digitalWrite(value) {
      this.state = value;
      console.log(`Mock GPIO: Pin ${this.pin} set to ${value}`);
    }
    digitalRead() {
      return this.state;
    }
  };
}

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Configuration for 12V switches
const SWITCH_CONFIG = {
  switch1: { pin: 18, name: 'Front Lights', description: 'Main headlights' },
  switch2: { pin: 19, name: 'Rear Lights', description: 'Tail/brake lights' },
  switch3: { pin: 20, name: 'Left Signal', description: 'Left turn signal' },
  switch4: { pin: 21, name: 'Right Signal', description: 'Right turn signal' },
  switch5: { pin: 22, name: 'Horn/Buzzer', description: 'Audio alert' },
  switch6: { pin: 23, name: 'Auxiliary 1', description: 'Extra switch 1' },
  switch7: { pin: 24, name: 'Auxiliary 2', description: 'Extra switch 2' },
  switch8: { pin: 25, name: 'Emergency', description: 'Emergency flashers' }
};

// Initialize GPIO pins
const switches = {};
Object.keys(SWITCH_CONFIG).forEach(switchId => {
  const config = SWITCH_CONFIG[switchId];
  switches[switchId] = {
    gpio: new Gpio(config.pin, { mode: Gpio.OUTPUT }),
    state: false,
    config: config
  };
  // Initialize all switches to OFF
  switches[switchId].gpio.digitalWrite(0);
});

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/switches', (req, res) => {
  const switchStates = {};
  Object.keys(switches).forEach(switchId => {
    switchStates[switchId] = {
      state: switches[switchId].state,
      config: switches[switchId].config
    };
  });
  res.json(switchStates);
});

app.post('/api/switch/:id/toggle', (req, res) => {
  const switchId = req.params.id;
  
  if (!switches[switchId]) {
    return res.status(404).json({ error: 'Switch not found' });
  }
  
  // Toggle switch state
  switches[switchId].state = !switches[switchId].state;
  const newState = switches[switchId].state ? 1 : 0;
  
  // Control GPIO
  switches[switchId].gpio.digitalWrite(newState);
  
  // Emit state change to all connected clients
  io.emit('switchStateChanged', {
    switchId: switchId,
    state: switches[switchId].state,
    timestamp: new Date().toISOString()
  });
  
  console.log(`Switch ${switchId} (${switches[switchId].config.name}) turned ${switches[switchId].state ? 'ON' : 'OFF'}`);
  
  res.json({
    switchId: switchId,
    state: switches[switchId].state,
    name: switches[switchId].config.name
  });
});

app.post('/api/switches/all-off', (req, res) => {
  Object.keys(switches).forEach(switchId => {
    switches[switchId].state = false;
    switches[switchId].gpio.digitalWrite(0);
  });
  
  io.emit('allSwitchesOff', { timestamp: new Date().toISOString() });
  console.log('All switches turned OFF');
  
  res.json({ message: 'All switches turned off' });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Send current switch states to new client
  const switchStates = {};
  Object.keys(switches).forEach(switchId => {
    switchStates[switchId] = {
      state: switches[switchId].state,
      config: switches[switchId].config
    };
  });
  socket.emit('initialSwitchStates', switchStates);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
  
  socket.on('toggleSwitch', (data) => {
    const { switchId } = data;
    if (switches[switchId]) {
      // Toggle switch state
      switches[switchId].state = !switches[switchId].state;
      const newState = switches[switchId].state ? 1 : 0;
      
      // Control GPIO
      switches[switchId].gpio.digitalWrite(newState);
      
      // Emit state change to all connected clients
      io.emit('switchStateChanged', {
        switchId: switchId,
        state: switches[switchId].state,
        timestamp: new Date().toISOString()
      });
      
      console.log(`Switch ${switchId} (${switches[switchId].config.name}) turned ${switches[switchId].state ? 'ON' : 'OFF'}`);
    }
  });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  
  // Turn off all switches
  Object.keys(switches).forEach(switchId => {
    switches[switchId].gpio.digitalWrite(0);
  });
  
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚗 Raspberry Pi Car Control Server running on port ${PORT}`);
  console.log(`🌐 Access the web interface at: http://localhost:${PORT}`);
  console.log(`📱 Or from another device at: http://[your-pi-ip]:${PORT}`);
});