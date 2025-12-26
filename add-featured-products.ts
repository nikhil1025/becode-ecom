import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Get first product
  const products = await prisma.product.findMany({
    where: { status: 'PUBLISHED' },
    take: 5,
  });

  console.log(`Found ${products.length} products`);

  // Add to featured products
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    try {
      await prisma.featuredProduct.upsert({
        where: { productId: product.id },
        update: { priority: i + 1, isActive: true },
        create: {
          productId: product.id,
          priority: i + 1,
          isActive: true,
        },
      });
      console.log(`✓ Added ${product.name} to featured products`);
    } catch (e) {
      console.log(`✗ Failed to add ${product.name}: ${e.message}`);
    }
  }

  // Add to popular products
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    try {
      await prisma.popularProduct.upsert({
        where: { productId: product.id },
        update: { priority: i + 1, isActive: true },
        create: {
          productId: product.id,
          priority: i + 1,
          isActive: true,
        },
      });
      console.log(`✓ Added ${product.name} to popular products`);
    } catch (e) {
      console.log(`✗ Failed to add ${product.name}: ${e.message}`);
    }
  }

  console.log('\nDone!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
