import prisma from './src/config/prisma.js';

async function testCourtCreation() {
  try {
    console.log('🏗️ Testing court creation for venue 6...\n');

    const courtData = {
      venueId: 6,
      name: 'Test Badminton Court',
      sportType: 'badminton',
      pricePerHour: 500.0,
      photos: [],
      amenities: ['lighting', 'nets'],
      isActive: true,
    };

    console.log('📝 Creating court with data:', courtData);

    const court = await prisma.court.create({
      data: courtData,
    });

    console.log('✅ Court created successfully:', court);

    // Verify the court was created
    const verifyCount = await prisma.court.count();
    console.log(`\n📊 Total courts in database: ${verifyCount}`);
  } catch (error) {
    console.error('❌ Error creating court:', error);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

testCourtCreation();
