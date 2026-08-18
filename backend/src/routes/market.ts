import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, AuthRequest } from '../lib/auth.js';
import { uploadImageToSupabase } from '../lib/supabase.js';
import { memoryStore } from '../lib/memoryStore.js';

export const marketRouter = Router();

// GET /api/market
marketRouter.get('/', async (_req, res): Promise<void> => {
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

    if (products && products.length > 0) {
      res.json(products);
      return;
    }
  } catch (error) {
    console.warn('Prisma market fetch error, using resilient memory store:', (error as Error).message);
  }

  // Fallback to memory store
  res.json(memoryStore.getProducts());
});

// GET /api/market/:id
marketRouter.get('/:id', async (req, res): Promise<void> => {
  const productId = req.params.id as string;
  try {
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
    
    if (product) {
      res.json(product);
      return;
    }
  } catch (error) {
    console.warn('Prisma product fetch error, using resilient memory store:', (error as Error).message);
  }

  const memProduct = memoryStore.getProductById(productId);
  if (memProduct) {
    res.json(memProduct);
    return;
  }

  res.status(404).json({ error: 'Product not found' });
});

// POST /api/market (Protected)
marketRouter.post('/', authenticate, async (req: AuthRequest, res): Promise<void> => {
  try {
    const { 
      title, description, quantity, unit, originalPrice, 
      sellingPrice, expiryDate, categoryId, images,
      village, district, state, pinCode, pickupAvailable, homeDelivery,
      contactPhone, contactEmail, contactWhatsApp
    } = req.body;
    
    if (!req.user?.id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const sellerId = req.user.id;
    
    // Process image uploads - upload to Supabase if configured, otherwise retain URL/dataURL
    const processedImageUrls: string[] = [];
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        if (typeof img === 'string') {
          if (img.startsWith('data:image')) {
            try {
              const fileName = `market/${Date.now()}-${sellerId}-${i}.jpg`;
              const url = await uploadImageToSupabase(img, fileName);
              processedImageUrls.push(url);
            } catch (uploadErr) {
              // Fallback to storing the image directly so image is never lost
              processedImageUrls.push(img);
            }
          } else {
            processedImageUrls.push(img);
          }
        }
      }
    }
    
    const productPayload = {
      sellerId,
      categoryId: categoryId || 'veg-1',
      title: title || 'Fresh Produce',
      description: description || '',
      quantity: Number(quantity) || 0,
      unit: unit || 'kg',
      originalPrice: Number(originalPrice) || 0,
      sellingPrice: Number(sellingPrice) || 0,
      expiryDate: expiryDate ? new Date(expiryDate) : new Date(Date.now() + 48 * 3600 * 1000),
      village: village || null,
      district: district || null,
      state: state || null,
      pinCode: pinCode || null,
      pickupAvailable: pickupAvailable ?? true,
      homeDelivery: homeDelivery ?? false,
      contactPhone: contactPhone || null,
      contactEmail: contactEmail || req.user.email || null,
      contactWhatsApp: contactWhatsApp || null,
    };

    // Try database insertion
    try {
      // Ensure category exists in DB if DB is accessible
      try {
        await prisma.marketCategory.upsert({
          where: { id: productPayload.categoryId },
          update: {},
          create: { id: productPayload.categoryId, name: productPayload.categoryId.includes('fruit') ? 'Fruits' : 'Vegetables' }
        });
      } catch (catErr) {
        // ignore category upsert failure
      }

      const product = await prisma.marketProduct.create({
        data: {
          ...productPayload,
          ...(processedImageUrls.length > 0 ? {
            images: {
              create: processedImageUrls.map((url: string, index: number) => ({
                url,
                isPrimary: index === 0
              }))
            }
          } : {})
        },
        include: {
          seller: { select: { name: true, email: true } },
          category: true,
          images: true
        }
      });
      
      // Also cache in memory store
      memoryStore.createProduct({
        ...productPayload,
        id: product.id,
        images: processedImageUrls
      });

      res.status(201).json(product);
      return;
    } catch (dbError) {
      console.warn('Prisma DB insert error, falling back to memory store:', (dbError as Error).message);
      
      const memProduct = memoryStore.createProduct({
        ...productPayload,
        images: processedImageUrls
      });

      res.status(201).json(memProduct);
      return;
    }
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// PUT /api/market/:id (Protected)
marketRouter.put('/:id', authenticate, async (req: AuthRequest, res): Promise<void> => {
  try {
    const productId = req.params.id as string;
    const { 
      title, description, quantity, unit, originalPrice, 
      sellingPrice, expiryDate, categoryId, images,
      village, district, state, pinCode, pickupAvailable, homeDelivery,
      contactPhone, contactEmail, contactWhatsApp, status
    } = req.body;
    
    if (!req.user?.id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Process image uploads
    const processedImageUrls: string[] = [];
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        if (typeof img === 'string') {
          if (img.startsWith('data:image')) {
            try {
              const fileName = `market/${Date.now()}-${req.user.id}-${i}.jpg`;
              const url = await uploadImageToSupabase(img, fileName);
              processedImageUrls.push(url);
            } catch (uploadErr) {
              processedImageUrls.push(img);
            }
          } else {
            processedImageUrls.push(img);
          }
        }
      }
    }
    
    const updateData = {
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
      images: processedImageUrls.length > 0 ? processedImageUrls : undefined
    };

    try {
      const existingProduct = await prisma.marketProduct.findUnique({
        where: { id: productId }
      });

      if (existingProduct) {
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
        
        if (processedImageUrls.length > 0) {
          await prisma.marketImage.deleteMany({ where: { productId: productId } });
          await prisma.marketImage.createMany({
            data: processedImageUrls.map((url: string, index: number) => ({
              productId: productId,
              url,
              isPrimary: index === 0
            }))
          });
        }

        memoryStore.updateProduct(productId, updateData);
        res.json(product);
        return;
      }
    } catch (dbErr) {
      console.warn('Prisma DB update error, falling back to memory store:', (dbErr as Error).message);
    }

    const updated = memoryStore.updateProduct(productId, updateData);
    if (updated) {
      res.json(updated);
      return;
    }

    res.status(404).json({ error: 'Product not found' });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});
