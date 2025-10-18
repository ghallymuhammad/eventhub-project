import prisma from '../src/libs/prisma';

async function updateUserRole() {
  try {
    const updatedUser = await prisma.user.update({
      where: {
        email: 'melindahidayatii@gmail.com'
      },
      data: {
        role: 'ORGANIZER',
        isVerified: true
      }
    });
    
    console.log('User updated successfully:', updatedUser);
    console.log('Role changed to:', updatedUser.role);
    console.log('Verified status:', updatedUser.isVerified);
  } catch (error) {
    console.error('Error updating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUserRole();
