import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial database content...');

  // Create Users
  const studentUser = await prisma.user.upsert({
    where: { email: 'student@college.ac.in' },
    update: {},
    create: {
      email: 'student@college.ac.in',
      name: 'Rahul V.',
      role: 'STUDENT',
    },
  });

  const vendorUser = await prisma.user.upsert({
    where: { email: 'vendor@enjipuli.com' },
    update: {},
    create: {
      email: 'vendor@enjipuli.com',
      name: 'Enjipuli Vendor',
      role: 'VENDOR',
    },
  });

  console.log('Seeded Users:', { studentUser, vendorUser });

  // Initial Menu Items with Malayalam names & English descriptions
  const menuItemsData = [
    {
      name: 'Pazham Pori (പഴംപൊരി)',
      description: 'Crispy golden banana fritters served hot.',
      price: 15,
      category: 'Snacks',
      photoUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Egg Puffs (മുട്ട പഫ്സ്)',
      description: 'Layered flaky puff pastry stuffed with spiced boiled egg.',
      price: 25,
      category: 'Snacks',
      photoUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Chicken Cutlet (ചിക്കൻ കട്ലറ്റ്)',
      description: 'Deep fried spicy minced chicken patty.',
      price: 20,
      category: 'Snacks',
      photoUrl: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Kulukki Sarbath (കുലുക്കി സർബത്ത്)',
      description: 'Shaken sweet & sour lemon syrup drink with chia seeds and green chili accent.',
      price: 30,
      category: 'Soft Drinks',
      photoUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Special Malabar Chaya (ചായ)',
      description: 'Authentic Kerala boiled tea froth-poured to perfection.',
      price: 12,
      category: 'Tea & Snacks',
      photoUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Chukku Kappi (ചുക്ക് കാപ്പി)',
      description: 'Traditional spiced dry ginger herbal coffee.',
      price: 15,
      category: 'Tea & Snacks',
      photoUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Mango Kulfi Bar (മാങ്കോ കുൽഫി)',
      description: 'Rich creamy authentic mango kulfi bar on a stick.',
      price: 40,
      category: 'Ice Creams',
      photoUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Unnakaya (ഉന്നക്കായ)',
      description: 'Mashed plantain stuffed with sweet coconut & cashew filling.',
      price: 18,
      category: 'Bakery',
      photoUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80',
    },
  ];

  const todayStr = new Date().toISOString().split('T')[0];

  for (const item of menuItemsData) {
    const existing = await prisma.menuItem.findFirst({
      where: { name: item.name },
    });

    let menuItem = existing;
    if (!menuItem) {
      menuItem = await prisma.menuItem.create({
        data: item,
      });
    }

    // Seed DailyStock for today
    await prisma.dailyStock.upsert({
      where: {
        menuItemId_date: {
          menuItemId: menuItem.id,
          date: todayStr,
        },
      },
      update: {
        quantityAvailable: 25,
      },
      create: {
        menuItemId: menuItem.id,
        date: todayStr,
        quantityAvailable: 25,
        quantityReserved: 0,
      },
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
