import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { memoryStore } from '../lib/memoryStore.js';

export const authRouter = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'freshvision-secret-key-enterprise-2026';

// Register User
authRouter.post('/register', async (req, res): Promise<void> => {
  try {
    const { email, password, name, role } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const hash = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID ? crypto.randomUUID() : `usr_${Date.now()}`;

    // Try Prisma
    try {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        res.status(400).json({ error: 'User with this email already exists.' });
        return;
      }

      const user = await prisma.user.create({
        data: {
          email,
          password: hash,
          name: name || 'Operator',
          role: role || 'Quality Inspector',
        }
      });

      memoryStore.upsertUser({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      });

      const token = jwt.sign({ id: user.id, email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          verifiedAt: user.createdAt,
        },
      });
      return;
    } catch (dbErr) {
      console.warn('Prisma register error, using memory store fallback:', (dbErr as Error).message);
    }

    // Fallback to memory store
    const memUser = memoryStore.upsertUser({
      id: userId,
      email,
      name: name || 'Operator',
      role: role || 'Quality Inspector',
      password: hash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const token = jwt.sign({ id: memUser.id, email, role: memUser.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({
      token,
      user: {
        id: memUser.id,
        email: memUser.email,
        name: memUser.name,
        role: memUser.role,
        verifiedAt: memUser.createdAt,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Login User
authRouter.post('/login', async (req, res): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        const isValid = await bcrypt.compare(password, user.password);
        if (isValid) {
          const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
          res.json({
            token,
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              verifiedAt: user.createdAt,
            },
          });
          return;
        }
      }
    } catch (dbErr) {
      console.warn('Prisma login error, using memory store fallback:', (dbErr as Error).message);
    }

    const memUser = memoryStore.getUserByEmail(email);
    if (memUser) {
      const token = jwt.sign({ id: memUser.id, email: memUser.email, role: memUser.role }, JWT_SECRET, { expiresIn: '24h' });
      res.json({
        token,
        user: {
          id: memUser.id,
          email: memUser.email,
          name: memUser.name,
          role: memUser.role,
          verifiedAt: memUser.createdAt,
        },
      });
      return;
    }

    res.status(401).json({ error: 'Invalid credentials.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// OTP Login (for bridging the frontend prototype UI with the backend JWT system)
authRouter.post('/otp-login', async (req, res): Promise<void> => {
  try {
    const { email, name, role } = req.body;
    if (!email) {
      res.status(400).json({ error: 'Email is required.' });
      return;
    }

    // Try DB first
    try {
      let user = await prisma.user.findUnique({ where: { email } });
      
      if (!user) {
        const hash = await bcrypt.hash(Math.random().toString(36), 10);
        user = await prisma.user.create({
          data: {
            email,
            password: hash,
            name: name || 'Operator',
            role: role || 'Quality Inspector',
          }
        });
      }

      memoryStore.upsertUser({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      });

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          verifiedAt: user.createdAt,
        },
      });
      return;
    } catch (dbErr) {
      console.warn('Prisma otp-login error, using memory store fallback:', (dbErr as Error).message);
    }

    // Fallback to in-memory store
    let memUser = memoryStore.getUserByEmail(email);
    if (!memUser) {
      memUser = memoryStore.upsertUser({
        id: `usr_${Date.now()}`,
        email,
        name: name || 'Operator',
        role: role || 'Quality Inspector',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    const token = jwt.sign({ id: memUser.id, email: memUser.email, role: memUser.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({
      token,
      user: {
        id: memUser.id,
        email: memUser.email,
        name: memUser.name,
        role: memUser.role,
        verifiedAt: memUser.createdAt,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

authRouter.get('/me', async (req, res): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };

    try {
      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
      if (user) {
        res.json({
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          verifiedAt: user.createdAt,
        });
        return;
      }
    } catch (dbErr) {
      console.warn('Prisma /me error, checking memory store:', (dbErr as Error).message);
    }

    const memUser = memoryStore.getUserById(decoded.id) || memoryStore.getUserByEmail(decoded.email);
    if (memUser) {
      res.json({
        id: memUser.id,
        email: memUser.email,
        name: memUser.name,
        role: memUser.role,
        verifiedAt: memUser.createdAt,
      });
      return;
    }

    res.status(401).json({ error: 'User not found.' });
  } catch (err: any) {
    res.status(401).json({ error: 'Invalid token.' });
  }
});
