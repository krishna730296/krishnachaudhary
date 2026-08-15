# Project Alpha

A full-stack task management application built with React, Node.js, and Express.

## Features

- User registration and JWT authentication
- Create, read, update, and delete tasks
- Priority levels (low, medium, high)
- Task completion tracking
- Clean, dark-themed dashboard
- Responsive design

## Tech Stack

- **Frontend:** React 18, CSS3
- **Backend:** Node.js, Express
- **Auth:** JWT (JSON Web Tokens), bcryptjs
- **Storage:** In-memory (easily swappable to MongoDB)

## Getting Started

### Prerequisites

- Node.js 16+ installed

### Installation

```bash
# Install server dependencies
npm install

# Install client dependencies
cd client && npm install && cd ..
```

### Running

```bash
# Start the server
npm start

# In another terminal, start the client (development)
cd client && npm start
```

The app will be available at:
- Frontend: http://localhost:3000
- API: http://localhost:5000

### Building for Production

```bash
cd client && npm run build
```

The built files will be in `client/build/` and served by the Express server.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register a new user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| GET | /api/tasks | List tasks |
| POST | /api/tasks | Create task |
| PUT | /api/tasks/:id | Update task |
| DELETE | /api/tasks/:id | Delete task |

## License

MIT
