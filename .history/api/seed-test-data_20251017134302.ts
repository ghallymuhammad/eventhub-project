import { PrismaClient } from './src/generated/prisma';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedTestData() {
  console.log('🌱 Seeding test data for checkout testing...');

  try {
    // Create test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const testUser = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: hashedPassword,
        phoneNumber: '+1234567890',
        isEmailVerified: true,
        pointBalance: 1000,
        role: 'CUSTOMER'
      }
    });

    console.log('✅ Test user created:', testUser.email);

    // Create test organizer
    const testOrganizer = await prisma.user.upsert({
      where: { email: 'organizer@example.com' },
      update: {},
      create: {
        firstName: 'Event',
        lastName: 'Organizer',
        email: 'organizer@example.com',
        password: hashedPassword,
        phoneNumber: '+1234567891',
        isEmailVerified: true,
        pointBalance: 0,
        role: 'ORGANIZER'
      }
    });

    console.log('✅ Test organizer created:', testOrganizer.email);

    // Create test event
    const testEvent = await prisma.event.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: 'Tech Conference 2024',
        description: 'Annual technology conference with latest trends and innovations',
        category: 'Technology',
        location: 'Silicon Valley Convention Center',
        address: '123 Tech Street, Silicon Valley, CA',
        startDate: new Date('2024-03-15T09:00:00Z'),
        endDate: new Date('2024-03-15T18:00:00Z'),
        price: 50000,
        availableSeats: 500,
        organizerId: testOrganizer.id,
        imageUrl: 'https://example.com/tech-conference.jpg'
      }
    });

    console.log('✅ Test event created:', testEvent.name);

    // Create test tickets
    const regularTicket = await prisma.ticket.upsert({
      where: { id: 1 },
      update: {},
      create: {
        eventId: testEvent.id,
        name: 'Regular',
        description: 'Standard admission ticket',
        price: 50000,
        availableSeats: 300
      }
    });

    const vipTicket = await prisma.ticket.upsert({
      where: { id: 2 },
      update: {},
      create: {
        eventId: testEvent.id,
        name: 'VIP',
        description: 'VIP access with premium amenities',
        price: 100000,
        availableSeats: 50
      }
    });

    const earlyBirdTicket = await prisma.ticket.upsert({
      where: { id: 3 },
      update: {},
      create: {
        eventId: testEvent.id,
        name: 'Early Bird',
        description: 'Limited early bird tickets',
        price: 40000,
        availableSeats: 100
      }
    });

    console.log('✅ Test tickets created:', regularTicket.name, vipTicket.name, earlyBirdTicket.name);

    // Create test coupon
    const testCoupon = await prisma.coupon.upsert({
      where: { id: 1 },
      update: {},
      create: {
        userId: testUser.id,
        eventId: testEvent.id,
        code: 'DISCOUNT10',
        discount: 10,
        isPercentage: true,
        expiryDate: new Date('2024-12-31T23:59:59Z'),
        isUsed: false
      }
    });

    console.log('✅ Test coupon created:', testCoupon.code);

    // Create test promotion
    const testPromotion = await prisma.promotion.upsert({
      where: { id: 1 },
      update: {},
      create: {
        eventId: testEvent.id,
        name: 'Early Bird Special',
        description: '20% off for first 50 customers',
        discountPercentage: 20,
        startDate: new Date(),
        endDate: new Date('2024-02-15T23:59:59Z'),
        quota: 50,
        used: 0,
        isActive: true
      }
    });

    console.log('✅ Test promotion created:', testPromotion.name);

    console.log('\n🎉 Test data seeding completed!');
    console.log('\n📋 Test Credentials:');
    console.log('Customer Email: test@example.com');
    console.log('Organizer Email: organizer@example.com');
    console.log('Password: password123');
    console.log('Coupon Code: DISCOUNT10');
    console.log('\n🚀 You can now test the checkout API!');

  } catch (error) {
    console.error('❌ Error seeding test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedTestData();
