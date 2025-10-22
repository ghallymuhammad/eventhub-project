import { PrismaClient } from './src/generated/prisma';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function addOrganizer() {
  try {
    console.log('🎪 Adding new organizer...');
    
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const organizer = await prisma.user.create({
      data: {
        fullName: 'Melinda Hidayati',
        email: 'melindahidayatii@gmail.com',
        password: hashedPassword,
        role: 'ORGANIZER',
        isVerified: true,
        phoneNumber: '+62812345678',
        avatar: 'https://ui-avatars.com/api/?name=Melinda+Hidayati&background=6366f1&color=fff',
        referralCode: 'MELINDA2024',
        points: 0
      }
    });

    console.log('✅ Organizer created successfully!');
    console.log('📧 Email:', organizer.email);
    console.log('🔑 Password: password123');
    console.log('👤 Role:', organizer.role);
    console.log('✨ Status: Verified');
    
  } catch (error) {
    console.error('❌ Error adding organizer:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addOrganizer();
