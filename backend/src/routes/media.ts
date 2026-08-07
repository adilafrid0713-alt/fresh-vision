import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

export const mediaRouter = Router();

// GET /api/media
mediaRouter.get('/', async (req, res) => {
  try {
    const media = await prisma.mediaLibrary.findMany({
      where: { isDeleted: false },
      include: {
        folder: true,
        tags: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(media);
  } catch (error) {
    console.error('Error fetching media:', error);
    res.status(500).json({ error: 'Failed to fetch media' });
  }
});

// POST /api/media
// (This will be hooked up to multer later)
mediaRouter.post('/', async (req, res) => {
  try {
    // Basic mock implementation for now
    const { userId, url, filename, sizeBytes, mimeType } = req.body;
    
    const media = await prisma.mediaLibrary.create({
      data: {
        userId,
        url,
        filename,
        sizeBytes,
        mimeType
      }
    });
    
    res.status(201).json(media);
  } catch (error) {
    console.error('Error creating media:', error);
    res.status(500).json({ error: 'Failed to create media entry' });
  }
});
