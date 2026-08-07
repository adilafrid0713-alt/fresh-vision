import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding data...');

  // Create test user (seller)
  const user = await prisma.user.upsert({
    where: { email: 'seller@freshvision.ai' },
    update: {},
    create: {
      id: 'cm0p4q6z0000008lc6a8f1n2d',
      email: 'seller@freshvision.ai',
      name: 'Farm Fresh Co.',
      role: 'seller',
      password: 'dummy_hash',
    },
  });

  // Create Category
  const catVeg = await prisma.marketCategory.upsert({
    where: { id: 'veg-1' },
    update: {},
    create: { id: 'veg-1', name: 'Vegetables' }
  });

  const catFruit = await prisma.marketCategory.upsert({
    where: { id: 'fruit-1' },
    update: {},
    create: { id: 'fruit-1', name: 'Fruits' }
  });

  // Create Products
  const product1 = await prisma.marketProduct.create({
    data: {
      sellerId: user.id,
      categoryId: catVeg.id,
      title: 'Organic Tomatoes (50kg)',
      description: 'Freshly harvested organic tomatoes. Premium quality suitable for retail or sauce production. Grown without synthetic pesticides.',
      quantity: 50,
      unit: 'kg',
      originalPrice: 40,
      sellingPrice: 25,
      expiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // +10 days
      freshnessScore: 98,
      qualityGrade: 'A',
      village: 'Pune District',
      state: 'Maharashtra',
      pickupAvailable: true,
      homeDelivery: true,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&q=80', isPrimary: true }
        ]
      }
    }
  });

  const product2 = await prisma.marketProduct.create({
    data: {
      sellerId: user.id,
      categoryId: catFruit.id,
      title: 'Fuji Apples Surplus',
      description: 'Slightly undersized but perfectly sweet Fuji apples. Need to sell fast to make room for new harvest.',
      quantity: 200,
      unit: 'kg',
      originalPrice: 120,
      sellingPrice: 60,
      expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // +5 days
      freshnessScore: 85,
      village: 'Nashik',
      state: 'Maharashtra',
      pickupAvailable: true,
      homeDelivery: false,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1560155016-bd4879ae8f21?w=800&q=80', isPrimary: true }
        ]
      }
    }
  });

  console.log('Seeded products:', product1.id, product2.id);
  
  // Seed Media
  await prisma.mediaLibrary.create({
    data: {
      userId: user.id,
      url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&q=80',
      filename: 'batch_104_tomato.jpg',
      sizeBytes: 1048576,
      mimeType: 'image/jpeg',
      source: 'inspection',
      freshnessScore: 98,
      aiGrade: 'A',
    }
  });
  
  await prisma.mediaLibrary.create({
    data: {
      userId: user.id,
      url: 'https://images.unsplash.com/photo-1560155016-bd4879ae8f21?w=800&q=80',
      filename: 'invoice_scan_44.png',
      sizeBytes: 524288,
      mimeType: 'image/png',
      source: 'upload',
      ocrText: 'Invoice #1044...',
    }
  });

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
