import { PrismaClient } from './src/generated/prisma';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function setupTestUsers() {
  try {
    console.log('🎭 Setting up test users for role testing...');
    
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Check if ghallymuhammad2@gmail.com exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'ghallymuhammad2@gmail.com' }
    });

    if (!existingUser) {
      // Create regular user
      const user = await prisma.user.create({
        data: {
          firstName: 'Ghally',
          lastName: 'Muhammad',
          email: 'ghallymuhammad2@gmail.com',
          password: hashedPassword,
          role: 'USER',
          isVerified: true,
          phoneNumber: '+62812345679',
          avatar: 'https://ui-avatars.com/api/?name=Ghally+Muhammad&background=10b981&color=fff',
          referralCode: 'GHALLY2024',
          pointBalance: 1000 // Give some initial points for testing
        }
      });

      console.log('✅ User created successfully!');
      console.log('📧 Email:', user.email);
      console.log('👤 Role:', user.role);
      console.log('💰 Points:', user.pointBalance);
    } else {
      console.log('ℹ️ User already exists, updating role and points...');
      await prisma.user.update({
        where: { email: 'ghallymuhammad2@gmail.com' },
        data: {
          role: 'USER',
          isVerified: true,
          pointBalance: 1000
        }
      });
    }

    // Check organizer exists and update if needed
    const existingOrganizer = await prisma.user.findUnique({
      where: { email: 'melindahidayatii@gmail.com' }
    });

    if (existingOrganizer) {
      await prisma.user.update({
        where: { email: 'melindahidayatii@gmail.com' },
        data: {
          role: 'ORGANIZER',
          isVerified: true
        }
      });
      console.log('✅ Organizer role confirmed for melindahidayatii@gmail.com');
    }

    // Create some test coupons for the user
    const events = await prisma.event.findMany({ take: 2 });
    
    if (events.length > 0 && !existingUser) {
      // Create a welcome coupon
      await prisma.coupon.create({
        data: {
          userId: existingUser ? existingUser.id : (await prisma.user.findUnique({ where: { email: 'ghallymuhammad2@gmail.com' } }))!.id,
          eventId: events[0].id,
          code: 'WELCOME25',
          type: 'DISCOUNT',
          name: 'Welcome Discount',
          description: '25% off your first event',
          discount: 25,
          isPercentage: true,
          isUsed: false,
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
        }
      });

      // Create a general discount coupon
      await prisma.coupon.create({
        data: {
          userId: existingUser ? existingUser.id : (await prisma.user.findUnique({ where: { email: 'ghallymuhammad2@gmail.com' } }))!.id,
          eventId: null, // System-wide coupon
          code: 'SAVE20',
          type: 'DISCOUNT',
          name: 'Save 20%',
          description: '20% off any event',
          discount: 20,
          isPercentage: true,
          isUsed: false,
          expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days from now
        }
      });

      console.log('🎫 Created test coupons for user');
    }

    // Add some point history for the user
    const userId = existingUser ? existingUser.id : (await prisma.user.findUnique({ where: { email: 'ghallymuhammad2@gmail.com' } }))!.id;
    
    await prisma.pointHistory.createMany({
      data: [
        {
          userId,
          points: 1000,
          description: 'Welcome bonus points'
        },
        {
          userId,
          points: 250,
          description: 'Referral bonus - Friend joined'
        },
        {
          userId,
          points: 300,
          description: 'Event attendance bonus - Tech Summit 2024'
        }
      ]
    });

    console.log('📊 Added point history for testing');

    console.log('\n🎉 Test users setup completed successfully!');
    console.log('\n📋 Test Account Summary:');
    console.log('\n👤 REGULAR USER:');
    console.log('📧 ghallymuhammad2@gmail.com');
    console.log('🔑 password123');
    console.log('💰 1000 points');
    console.log('🎫 2 available coupons');
    console.log('📊 Point history with bonuses');
    
    console.log('\n🎪 ORGANIZER:');
    console.log('📧 melindahidayatii@gmail.com');
    console.log('🔑 password123');
    console.log('✅ Verified organizer account');
    
    console.log('\n🧪 Testing Scenarios Available:');
    console.log('1. 👤 User Flow: Login → Browse Events → Purchase Tickets → Use Points/Coupons → Payment → Dashboard');
    console.log('2. 🎪 Organizer Flow: Login → Create Event → Manage Events → View Analytics → Settings');
    console.log('3. 🔄 Cross-role Testing: Switch between user and organizer accounts');

  } catch (error) {
    console.error('❌ Error setting up test users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupTestUsers();
