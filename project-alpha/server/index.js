const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory data store (works without MongoDB)
const store = {
  users: [],
  tasks: []
};

// Auth middleware
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Access denied' });

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Auth routes
app.post('/api/auth/register', (req, res) => {
  const { username, email, password } = req.body;

  if (store.users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'User already exists' });
  }

  const bcrypt = require('bcryptjs');
  const jwt = require('jsonwebtoken');

  const hashedPassword = bcrypt.hashSync(password, 10);
  const user = {
    id: Date.now().toString(),
    username,
    email,
    password: hashedPassword,
    createdAt: new Date()
  };

  store.users.push(user);

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, username, email } });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const bcrypt = require('bcryptjs');
  const jwt = require('jsonwebtoken');

  const user = store.users.find(u => u.email === email);
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });

  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, username: user.username, email } });
});

app.get('/api/auth/me', auth, (req, res) => {
  const user = store.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ id: user.id, username: user.username, email: user.email });
});

// Task routes
app.get('/api/tasks', auth, (req, res) => {
  const tasks = store.tasks.filter(t => t.userId === req.user.id);
  res.json(tasks);
});

app.post('/api/tasks', auth, (req, res) => {
  const { title, description, priority } = req.body;
  const task = {
    id: Date.now().toString(),
    userId: req.user.id,
    title,
    description: description || '',
    priority: priority || 'medium',
    completed: false,
    createdAt: new Date()
  };
  store.tasks.push(task);
  res.json(task);
});

app.put('/api/tasks/:id', auth, (req, res) => {
  const task = store.tasks.find(t => t.id === req.params.id && t.userId === req.user.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  Object.assign(task, req.body);
  res.json(task);
});

app.delete('/api/tasks/:id', auth, (req, res) => {
  const index = store.tasks.findIndex(t => t.id === req.params.id && t.userId === req.user.id);
  if (index === -1) return res.status(404).json({ error: 'Task not found' });

  store.tasks.splice(index, 1);
  res.json({ message: 'Task deleted' });
});

// Serve static files in production
app.use(express.static(path.join(__dirname, '../client/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Project Alpha server running on port ${PORT}`);
});
