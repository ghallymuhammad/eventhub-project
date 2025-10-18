const { PrismaClient } = require('./src/generated/prisma');

const prisma = new PrismaClient();

async function updateUserRole() {
  try {
    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email: 'melindahidayatii@gmail.com' }
    });
    
    if (user) {
      // Update role to ORGANIZER
      const updatedUser = await prisma.user.update({
        where: { email: 'melindahidayatii@gmail.com' },
        data: { 
          role: 'ORGANIZER',
          isVerified: true // Make sure they're verified too
        }
      });
      console.log('✅ User role updated successfully:', updatedUser.email, '- Role:', updatedUser.role);
    } else {
      console.log('❌ User not found. Creating new organizer account...');
      
      // Create new organizer account
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      const newUser = await prisma.user.create({
        data: {
          email: 'melindahidayatii@gmail.com',
          firstName: 'Melinda',
          lastName: 'Hidayatii',
          password: hashedPassword,
          role: 'ORGANIZER',
          isVerified: true,
          phoneNumber: '+6281234567890'
        }
      });
      
      console.log('✅ New organizer account created:', newUser.email, '- Role:', newUser.role);
      console.log('🔑 Password: password123');
    }
    
    // List all users
    const users = await prisma.user.findMany({
      select: { email: true, role: true, firstName: true, lastName: true }
    });
    console.log('\n📋 All users in database:');
    users.forEach(u => {
      console.log(`- ${u.email} (${u.firstName} ${u.lastName}) - Role: ${u.role}`);
    });
    
  } catch (error) {
    console.error('Error updating user role:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUserRole();
