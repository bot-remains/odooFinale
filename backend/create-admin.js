import prisma from './src/config/prisma.js';
import bcrypt from 'bcryptjs';

async function createAdmin() {
  try {
    console.log('🔍 Checking for existing admin...');

    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: {
        OR: [{ email: 'admin@quickcourt.com' }, { role: 'admin' }],
      },
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists:', existingAdmin.email);
      return existingAdmin;
    }

    console.log('👤 Creating admin user...');

    // Hash password
    const hashedPassword = await bcrypt.hash('Admin123!', 10);

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@quickcourt.com',
        password: hashedPassword,
        role: 'admin',
        isVerified: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@quickcourt.com');
    console.log('🔑 Password: Admin123!');
    console.log('👑 Role: admin');

    return adminUser;
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin()
  .then(() => {
    console.log('🎉 Admin creation completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Failed to create admin:', error.message);
    process.exit(1);
  });
