import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const prisma = new PrismaClient();
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  socket.on('join_execution', (executionId) => {
    socket.join(executionId);
  });
});

app.use(cors());
app.use(express.json());

// Proxy requests to the Python AI Engine
app.use('/engine', createProxyMiddleware({
  target: `http://localhost:${process.env.ENGINE_PORT || 8000}`,
  changeOrigin: true,
  pathRewrite: { '^/engine': '' },
}));

// Real-time Redis integration
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redisSubscriber = createClient({ url: redisUrl });

redisSubscriber.on('error', err => console.error('Redis Client Error', err));

(async () => {
  await redisSubscriber.connect();
  console.log('Connected to Redis Sub');
  
  await redisSubscriber.subscribe('pipeline_updates', (message) => {
    try {
      const data = JSON.parse(message);
      // Broadcast execution updates ONLY to the specific user/room
      io.to(data.execution_id).emit('execution_update', data);
    } catch (e) {
      console.error('Error parsing redis message', e);
    }
  });
})();

// Ensure Default User Exists for MVP
const DEFAULT_USER_ID = "default_user";
(async () => {
  try {
    const hashedPassword = await bcrypt.hash('password123', 10);
    await prisma.user.upsert({
      where: { id: DEFAULT_USER_ID },
      update: {},
      create: {
        id: DEFAULT_USER_ID,
        email: 'admin@flowgraphs.io',
        passwordHash: hashedPassword,
        name: 'Admin'
      }
    });
    console.log('Default user initialized.');
  } catch (err) {
    console.error('Failed to init default user:', err);
  }
})();

// JWT Middleware
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_flowgraphs_key_123!';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Forbidden' });
    req.user = user;
    next();
  });
};

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'gateway' }));

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'Email already exists' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, passwordHash }
    });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CRUD Pipelines (Protected)
app.get('/api/pipelines', authenticateToken, async (req, res) => {
  try {
    const pipelines = await prisma.pipeline.findMany({
      where: { userId: req.user.id },
      orderBy: { updatedAt: 'desc' }
    });
    res.json(pipelines);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/pipelines/:id', authenticateToken, async (req, res) => {
  try {
    const pipeline = await prisma.pipeline.findUnique({
      where: { id: req.params.id }
    });
    if (!pipeline || pipeline.userId !== req.user.id) return res.status(404).json({ error: 'Not found' });
    res.json(pipeline);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/pipelines', authenticateToken, async (req, res) => {
  try {
    const { name, description, nodes, edges, nodeIDs } = req.body;
    const pipeline = await prisma.pipeline.create({
      data: {
        userId: req.user.id,
        name: name || 'Untitled Pipeline',
        description: description || '',
        nodes: nodes || [],
        edges: edges || [],
        nodeIDs: nodeIDs || {}
      }
    });
    res.json(pipeline);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/pipelines/:id', authenticateToken, async (req, res) => {
  try {
    const { name, description, nodes, edges, nodeIDs } = req.body;
    const existing = await prisma.pipeline.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.userId !== req.user.id) return res.status(404).json({ error: 'Not found' });

    const pipeline = await prisma.pipeline.update({
      where: { id: req.params.id },
      data: {
        name,
        description,
        nodes,
        edges,
        nodeIDs
      }
    });
    res.json(pipeline);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/pipelines/:id', authenticateToken, async (req, res) => {
  try {
    const existing = await prisma.pipeline.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.userId !== req.user.id) return res.status(404).json({ error: 'Not found' });

    await prisma.pipeline.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/pipelines/execute', authenticateToken, async (req, res) => {
  try {
    const pythonEngineUrl = process.env.ENGINE_URL || 'http://127.0.0.1:8000';
    
    // Proxy the request to the Python Engine
    const response = await fetch(`${pythonEngineUrl}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        execution_id: req.body.execution_id || `exec_${Date.now()}`,
        nodes: req.body.nodes,
        edges: req.body.edges
      })
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Execute Error:', error);
    res.status(500).json({ error: 'Failed to connect to Python Engine' });
  }
});

// Socket.IO Hub for real-time execution streaming
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Clients can join rooms for specific execution IDs
  socket.on('join_execution', (executionId) => {
    socket.join(executionId);
    console.log(`Socket ${socket.id} joined execution ${executionId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Gateway running on port ${PORT}`);
});
