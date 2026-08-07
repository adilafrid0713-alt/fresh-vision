import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

export const marketRouter = Router();

// GET /api/market
marketRouter.get('/', async (req, res) => {
  try {
    const products = await prisma.marketProduct.findMany({
      where: { status: 'active' },
      include: {
        seller: {
          select: { name: true }
        },
        category: true,
        images: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(products);
  } catch (error) {
    console.error('Error fetching market products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /api/market/:id
marketRouter.get('/:id', async (req, res) => {
  try {
    const product = await prisma.marketProduct.findUnique({
      where: { id: req.params.id },
      include: {
        seller: {
          select: { name: true, email: true }
        },
        category: true,
        images: true
      }
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// POST /api/market
marketRouter.post('/', async (req, res) => {
  try {
    const { 
      sellerId, title, description, quantity, unit, originalPrice, 
      sellingPrice, expiryDate, categoryId, images
    } = req.body;
    
    // In a real app, verify that req.user.id === sellerId
    
    const product = await prisma.marketProduct.create({
      data: {
        sellerId,
        categoryId,
        title,
        description,
        quantity: Number(quantity),
        unit,
        originalPrice: Number(originalPrice),
        sellingPrice: Number(sellingPrice),
        expiryDate: new Date(expiryDate),
        ...(images && images.length > 0 ? {
          images: {
            create: images.map((url: string, index: number) => ({
              url,
              isPrimary: index === 0
            }))
          }
        } : {})
      }
    });
    
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});
