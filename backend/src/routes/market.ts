import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

export const marketRouter = Router();

// GET /api/market
marketRouter.get('/', async (req, res) => {
  try {
    const products = await prisma.marketProduct.findMany({
      where: { 
        status: 'active',
        expiryDate: { gte: new Date() }
      },
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
      sellingPrice, expiryDate, categoryId, images,
      village, district, state, pinCode, pickupAvailable, homeDelivery,
      contactPhone, contactEmail, contactWhatsApp
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
        village: village || null,
        district: district || null,
        state: state || null,
        pinCode: pinCode || null,
        pickupAvailable: pickupAvailable ?? true,
        homeDelivery: homeDelivery ?? false,
        contactPhone: contactPhone || null,
        contactEmail: contactEmail || null,
        contactWhatsApp: contactWhatsApp || null,
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

// PUT /api/market/:id
marketRouter.put('/:id', async (req, res) => {
  try {
    const { 
      title, description, quantity, unit, originalPrice, 
      sellingPrice, expiryDate, categoryId, images,
      village, district, state, pinCode, pickupAvailable, homeDelivery,
      contactPhone, contactEmail, contactWhatsApp, status
    } = req.body;
    
    // In a real app, verify that req.user.id === product.sellerId
    
    const product = await prisma.marketProduct.update({
      where: { id: req.params.id },
      data: {
        ...(categoryId && { categoryId }),
        ...(title && { title }),
        ...(description && { description }),
        ...(quantity !== undefined && { quantity: Number(quantity) }),
        ...(unit && { unit }),
        ...(originalPrice !== undefined && { originalPrice: Number(originalPrice) }),
        ...(sellingPrice !== undefined && { sellingPrice: Number(sellingPrice) }),
        ...(expiryDate && { expiryDate: new Date(expiryDate) }),
        ...(village !== undefined && { village: village || null }),
        ...(district !== undefined && { district: district || null }),
        ...(state !== undefined && { state: state || null }),
        ...(pinCode !== undefined && { pinCode: pinCode || null }),
        ...(pickupAvailable !== undefined && { pickupAvailable }),
        ...(homeDelivery !== undefined && { homeDelivery }),
        ...(contactPhone !== undefined && { contactPhone: contactPhone || null }),
        ...(contactEmail !== undefined && { contactEmail: contactEmail || null }),
        ...(contactWhatsApp !== undefined && { contactWhatsApp: contactWhatsApp || null }),
        ...(status !== undefined && { status }),
      }
    });
    
    // Handle images update if provided (simple version: delete old, create new)
    if (images && images.length > 0) {
      await prisma.marketImage.deleteMany({ where: { productId: req.params.id } });
      await prisma.marketImage.createMany({
        data: images.map((url: string, index: number) => ({
          productId: req.params.id,
          url,
          isPrimary: index === 0
        }))
      });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});
