import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, AuthRequest } from '../lib/auth.js';
import { uploadImageToSupabase } from '../lib/supabase.js';

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
    const productId = req.params.id as string;
    const product = await prisma.marketProduct.findUnique({
      where: { id: productId },
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

// POST /api/market (Protected)
marketRouter.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { 
      title, description, quantity, unit, originalPrice, 
      sellingPrice, expiryDate, categoryId, images,
      village, district, state, pinCode, pickupAvailable, homeDelivery,
      contactPhone, contactEmail, contactWhatsApp
    } = req.body;
    
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const sellerId = req.user.id;
    
    // Upload images to Supabase if any exist
    const uploadedImageUrls: string[] = [];
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        // Only upload base64 images, leave normal URLs alone
        if (images[i].startsWith('data:image')) {
          const fileName = `market/${Date.now()}-${sellerId}-${i}.jpg`;
          const url = await uploadImageToSupabase(images[i], fileName);
          uploadedImageUrls.push(url);
        } else {
          uploadedImageUrls.push(images[i]);
        }
      }
    }
    
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
        ...(uploadedImageUrls.length > 0 ? {
          images: {
            create: uploadedImageUrls.map((url: string, index: number) => ({
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

// PUT /api/market/:id (Protected)
marketRouter.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const productId = req.params.id as string;
    const { 
      title, description, quantity, unit, originalPrice, 
      sellingPrice, expiryDate, categoryId, images,
      village, district, state, pinCode, pickupAvailable, homeDelivery,
      contactPhone, contactEmail, contactWhatsApp, status
    } = req.body;
    
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify ownership
    const existingProduct = await prisma.marketProduct.findUnique({
      where: { id: productId }
    });

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    if (existingProduct.sellerId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: You do not own this product' });
    }
    
    // Process image uploads
    const uploadedImageUrls: string[] = [];
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        if (images[i].startsWith('data:image')) {
          const fileName = `market/${Date.now()}-${req.user.id}-${i}.jpg`;
          const url = await uploadImageToSupabase(images[i], fileName);
          uploadedImageUrls.push(url);
        } else {
          uploadedImageUrls.push(images[i]);
        }
      }
    }
    
    const product = await prisma.marketProduct.update({
      where: { id: productId },
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
    
    if (uploadedImageUrls.length > 0) {
      await prisma.marketImage.deleteMany({ where: { productId: productId } });
      await prisma.marketImage.createMany({
        data: uploadedImageUrls.map((url: string, index: number) => ({
          productId: productId,
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
