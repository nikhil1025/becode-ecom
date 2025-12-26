import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkVariants() {
  const productCount = await prisma.product.count();
  const variantCount = await prisma.productVariant.count();
  const productsWithoutVariants = await prisma.product.count({
    where: { variants: { none: {} } },
  });

  console.log('Database Status:');
  console.log(`  Products: ${productCount}`);
  console.log(`  Variants: ${variantCount}`);
  console.log(`  Products without variants: ${productsWithoutVariants}`);

  if (productsWithoutVariants > 0) {
    console.log('\n⚠️  Some products need variants created');
  } else {
    console.log('\n✅ All products have variants (or no products exist)');
  }

  await prisma.$disconnect();
}

checkVariants();
