const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateUserRole() {
  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
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
      console.log('❌ User not found with email: melindahidayatii@gmail.com');
      
      // List all users
      const users = await prisma.user.findMany({
        select: { email: true, role: true, firstName: true, lastName: true }
      });
      console.log('\nExisting users:');
      users.forEach(u => {
        console.log(`- ${u.email} (${u.firstName} ${u.lastName}) - Role: ${u.role}`);
      });
    }
  } catch (error) {
    console.error('Error updating user role:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUserRole();
