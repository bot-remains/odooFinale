import prisma from '../src/config/prisma.js';

const checkDatabase = async () => {
  try {
    console.log('🔍 Checking database connection...');

    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Check if tables exist
    const userCount = await prisma.user.count();
    const venueCount = await prisma.venue.count();
    const bookingCount = await prisma.booking.count();

    console.log('📊 Database Status:');
    console.log(`   Users: ${userCount}`);
    console.log(`   Venues: ${venueCount}`);
    console.log(`   Bookings: ${bookingCount}`);

    if (userCount === 0) {
      console.log('⚠️  No users found. Run "npm run db:init" to create sample data.');
    }

    console.log('✅ Database health check completed');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

checkDatabase();
