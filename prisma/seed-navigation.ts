import { NavigationType, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding navigation tabs for dashboard CMS pages...');

  const cmsNavigation = [
    {
      type: NavigationType.PAGE,
      label: 'Dashboard',
      url: '/dashboard/overview',
      order: 0,
      isActive: true,
      description: 'Dashboard Overview',
    },
    {
      type: NavigationType.PAGE,
      label: 'Products',
      url: '/dashboard/products',
      order: 1,
      isActive: true,
      description: 'Manage Products',
    },
    {
      type: NavigationType.PAGE,
      label: 'Categories',
      url: '/dashboard/categories',
      order: 2,
      isActive: true,
      description: 'Manage Categories',
    },
    {
      type: NavigationType.PAGE,
      label: 'Orders',
      url: '/dashboard/orders',
      order: 3,
      isActive: true,
      description: 'Manage Orders',
    },
    {
      type: NavigationType.PAGE,
      label: 'Returns',
      url: '/dashboard/returns',
      order: 4,
      isActive: true,
      description: 'Manage Returns',
    },
    {
      type: NavigationType.PAGE,
      label: 'Refunds',
      url: '/dashboard/refunds',
      order: 5,
      isActive: true,
      description: 'Pending Refunds',
    },
    {
      type: NavigationType.PAGE,
      label: 'CMS - Featured Products',
      url: '/dashboard/cms/featured-products',
      order: 10,
      isActive: true,
      description: 'Manage Featured Products',
    },
    {
      type: NavigationType.PAGE,
      label: 'CMS - Popular Products',
      url: '/dashboard/cms/popular-products',
      order: 11,
      isActive: true,
      description: 'Manage Popular Products',
    },
    {
      type: NavigationType.PAGE,
      label: 'CMS - Featured Categories',
      url: '/dashboard/cms/featured-categories',
      order: 12,
      isActive: true,
      description: 'Manage Featured Categories',
    },
    {
      type: NavigationType.PAGE,
      label: 'CMS - Navigation',
      url: '/dashboard/cms/navigation',
      order: 13,
      isActive: true,
      description: 'Manage Navigation Tabs',
    },
    {
      type: NavigationType.PAGE,
      label: 'CMS - Newsletter',
      url: '/dashboard/cms/newsletter',
      order: 14,
      isActive: true,
      description: 'Manage Newsletter Subscribers',
    },
    {
      type: NavigationType.PAGE,
      label: 'CMS - Community',
      url: '/dashboard/cms/community',
      order: 15,
      isActive: true,
      description: 'Manage Community Members',
    },
    {
      type: NavigationType.PAGE,
      label: 'CMS - Homepage Config',
      url: '/dashboard/cms/homepage-config',
      order: 16,
      isActive: true,
      description: 'Homepage Configuration',
    },
    {
      type: NavigationType.PAGE,
      label: 'Site Content',
      url: '/dashboard/site-content',
      order: 17,
      isActive: true,
      description: 'Manage Site Content',
    },
  ];

  for (const nav of cmsNavigation) {
    await prisma.navigationTab.upsert({
      where: { id: `seed-${nav.order}` },
      update: nav,
      create: {
        id: `seed-${nav.order}`,
        ...nav,
      },
    });
  }

  console.log('✅ Navigation tabs seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding navigation:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
