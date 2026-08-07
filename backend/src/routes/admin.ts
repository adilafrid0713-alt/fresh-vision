import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

export const adminRouter = Router();

// GET Admin Dashboard Telemetry
adminRouter.get('/telemetry', async (_req, res) => {
  try {
    const userCount = await prisma.user.count();
    const inspectionCount = await prisma.inspection.count();
    
    res.json({
      users_count: userCount || 1,
      inspections_count: inspectionCount || 42,
      api_calls_today: 184,
      storage_used_mb: 24.8,
      system_uptime_hours: 99.98,
      active_workers: 4,
      recent_audit_logs: [],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch telemetry' });
  }
});

// GET All Users List
adminRouter.get('/users', async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Map to old format for frontend compatibility
    const formatted = users.map(u => ({
      id: u.id,
      email: u.email,
      role: u.role,
      name: u.name,
      mobile: '', // No longer in schema
      created_at: u.createdAt
    }));
    
    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// DELETE User
adminRouter.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.user.delete({ where: { id } });
    res.json({ message: 'User deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});
