import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { register, login, me } from './controllers/auth.controller';
import { getTasks, createTask, updateTask, deleteTask } from './controllers/task.controller';
import { authenticateToken } from './middleware/auth.middleware';

import prisma from './db';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for simplicity, can be locked down in production
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Public health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Authentication routes
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);
app.get('/api/auth/me', authenticateToken, me);

// Task CRUD routes
app.get('/api/tasks', authenticateToken, getTasks);
app.post('/api/tasks', authenticateToken, createTask);
app.put('/api/tasks/:id', authenticateToken, updateTask);
app.delete('/api/tasks/:id', authenticateToken, deleteTask);

// 404 Route Not Found
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Global Error]', err);
  if (err instanceof SyntaxError && 'status' in err && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Malformed JSON request body' });
  }
  return res.status(500).json({ error: 'Internal Server Error' });
});

// Verify DB Connection and Start Server
async function startServer() {
  try {
    console.log('Connecting to database...');
    await prisma.$connect();
    console.log('✓ Database connection successful.');
  } catch (error) {
    console.error('✗ Database connection failed. Running in degraded state:');
    console.error(error);
  }

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer();
