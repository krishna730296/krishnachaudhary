import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api' 
  : '/api';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [tasks, setTasks] = useState([]);
  const [authForm, setAuthForm] = useState({ email: '', password: '', username: '' });
  const [isRegister, setIsRegister] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) {
      fetchUser();
      fetchTasks();
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        logout();
      }
    } catch {
      logout();
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${API_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch {}
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const body = isRegister 
        ? authForm 
        : { email: authForm.email, password: authForm.password };
      
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
    } catch (err) {
      setError(err.message);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setTasks([]);
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    
    try {
      const res = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newTask)
      });
      const task = await res.json();
      setTasks([...tasks, task]);
      setNewTask({ title: '', description: '', priority: 'medium' });
    } catch {}
  };

  const toggleTask = async (id, completed) => {
    try {
      const res = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ completed: !completed })
      });
      const updated = await res.json();
      setTasks(tasks.map(t => t.id === id ? updated : t));
    } catch {}
  };

  const deleteTask = async (id) => {
    try {
      await fetch(`${API_URL}/tasks/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(tasks.filter(t => t.id !== id));
    } catch {}
  };

  if (!user) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h1>Project Alpha</h1>
          <p className="auth-subtitle">Task Manager</p>
          
          {error && <div className="error">{error}</div>}
          
          <form onSubmit={handleAuth}>
            {isRegister && (
              <input
                type="text"
                placeholder="Username"
                value={authForm.username}
                onChange={e => setAuthForm({...authForm, username: e.target.value})}
                required
              />
            )}
            <input
              type="email"
              placeholder="Email"
              value={authForm.email}
              onChange={e => setAuthForm({...authForm, email: e.target.value})}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={authForm.password}
              onChange={e => setAuthForm({...authForm, password: e.target.value})}
              required
            />
            <button type="submit" className="btn-primary">
              {isRegister ? 'Create Account' : 'Sign In'}
            </button>
          </form>
          
          <p className="auth-toggle">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}
            <button onClick={() => setIsRegister(!isRegister)}>
              {isRegister ? 'Sign In' : 'Register'}
            </button>
          </p>
        </div>
      </div>
    );
  }

  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1>Project Alpha</h1>
          <span className="task-count">{tasks.length} tasks, {completedCount} done</span>
        </div>
        <div className="header-right">
          <span className="user-name">{user.username || user.email}</span>
          <button onClick={logout} className="btn-logout">Logout</button>
        </div>
      </header>

      <main className="app-main">
        <form onSubmit={addTask} className="task-form">
          <input
            type="text"
            placeholder="What needs to be done?"
            value={newTask.title}
            onChange={e => setNewTask({...newTask, title: e.target.value})}
            className="task-input"
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={newTask.description}
            onChange={e => setNewTask({...newTask, description: e.target.value})}
            className="task-desc-input"
          />
          <select
            value={newTask.priority}
            onChange={e => setNewTask({...newTask, priority: e.target.value})}
            className="priority-select"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button type="submit" className="btn-add">Add</button>
        </form>

        <div className="task-list">
          {tasks.length === 0 ? (
            <div className="empty-state">
              <p>No tasks yet. Add one above!</p>
            </div>
          ) : (
            tasks.map(task => (
              <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                <button
                  className="task-checkbox"
                  onClick={() => toggleTask(task.id, task.completed)}
                >
                  {task.completed ? '✓' : ''}
                </button>
                <div className="task-content">
                  <span className="task-title">{task.title}</span>
                  {task.description && <span className="task-desc">{task.description}</span>}
                </div>
                <span className={`priority-badge ${task.priority}`}>{task.priority}</span>
                <button className="task-delete" onClick={() => deleteTask(task.id)}>×</button>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
