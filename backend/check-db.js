import prisma from './src/config/prisma.js';

async function checkDatabase() {
  try {
    console.log('🔍 Checking database contents...\n');

    // Check venues
    const venues = await prisma.venue.findMany({
      select: {
        id: true,
        name: true,
        ownerId: true,
        isApproved: true,
      },
    });
    console.log('📍 Venues in database:', venues);

    // Check courts
    const courts = await prisma.court.findMany({
      select: {
        id: true,
        name: true,
        venueId: true,
        sportType: true,
        isActive: true,
      },
    });
    console.log('\n🏟️ Courts in database:', courts);

    // Check courts for venue 6 specifically
    const venue6Courts = await prisma.court.findMany({
      where: { venueId: 6 },
      select: {
        id: true,
        name: true,
        venueId: true,
        sportType: true,
        isActive: true,
      },
    });
    console.log('\n🎯 Courts for venue 6:', venue6Courts);

    // Check all courts for venue 6 (including inactive)
    const allVenue6Courts = await prisma.court.findMany({
      where: { venueId: 6 },
    });
    console.log('\n📋 All courts for venue 6 (including inactive):', allVenue6Courts);
  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

checkDatabase();
