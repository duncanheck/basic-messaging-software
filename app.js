const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = 3000;

let loggedInUsers = [];
let users = {}; // Simulated user database (in-memory)

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  // Simulating a basic username/password check
  if (users[username] && users[username].password === password) {
    // Add the user to the list of logged-in users
    loggedInUsers.push(username);
    res.redirect('/chat');
  } else {
    res.send('Invalid username or password');
  }
});

app.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!users[username]) {
    // Create a new user if the username doesn't exist
    users[username] = { username, password };
    res.redirect('/');
  } else {
    res.send('Username already exists');
  }
});

app.get('/chat', (req, res) => {
  // Check if user is logged in
  if (loggedInUsers.includes('user')) {
    res.sendFile(path.join(__dirname, 'public', 'chat.html'));
  } else {
    res.redirect('/');
  }
});

io.on('connection', (socket) => {
  console.log('A user connected');

  // Event: 'chat message'
  socket.on('chat message', (msg, callback) => {
    io.emit('chat message', msg);
    if (typeof callback === 'function') {
      callback('Message received!');
    }
  });

  // Event: 'disconnect'
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

