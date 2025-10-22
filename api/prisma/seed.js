"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../src/generated/prisma");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new prisma_1.PrismaClient();
async function main() {
    console.log('🌱 Starting PostgreSQL database seed...');
    // Clear existing data (in proper order to respect foreign key constraints)
    await prisma.attendee.deleteMany();
    await prisma.transactionTicket.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.pointHistory.deleteMany();
    await prisma.coupon.deleteMany();
    await prisma.promotion.deleteMany();
    await prisma.ticket.deleteMany();
    await prisma.review.deleteMany();
    await prisma.event.deleteMany();
    await prisma.user.deleteMany();
    console.log('✅ Cleared existing data');
    // Hash password for all accounts
    const hashedPassword = await bcrypt_1.default.hash('password123', 10);
    // Create Test Users (Attendees/Customers)
    const attendee1 = await prisma.user.create({
        data: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@gmail.com',
            password: hashedPassword,
            phoneNumber: '+1234567890',
            role: prisma_1.Role.USER,
            isVerified: true,
            pointBalance: 500,
            referralCode: 'JOHN2024',
            avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
        }
    });
    const attendee2 = await prisma.user.create({
        data: {
            firstName: 'Sarah',
            lastName: 'Johnson',
            email: 'sarah.johnson@gmail.com',
            password: hashedPassword,
            phoneNumber: '+1234567891',
            role: prisma_1.Role.USER,
            isVerified: false,
            pointBalance: 1000,
            referralCode: 'SARAH2024',
            referredBy: 'JOHN2024',
            avatar: 'https://randomuser.me/api/portraits/women/1.jpg'
        }
    });
    const attendee3 = await prisma.user.create({
        data: {
            firstName: 'Michael',
            lastName: 'Chen',
            email: 'michael.chen@gmail.com',
            password: hashedPassword,
            phoneNumber: '+1234567892',
            role: prisma_1.Role.USER,
            isVerified: true,
            pointBalance: 250,
            referralCode: 'MIKE2024',
            avatar: 'https://randomuser.me/api/portraits/men/2.jpg'
        }
    });
    // Create Event Organizers
    const organizer1 = await prisma.user.create({
        data: {
            firstName: 'Emily',
            lastName: 'Rodriguez',
            email: 'emily.organizer@gmail.com',
            password: hashedPassword,
            phoneNumber: '+1234567893',
            role: prisma_1.Role.ORGANIZER,
            isVerified: true,
            pointBalance: 0,
            referralCode: 'EMILY2024',
            avatar: 'https://randomuser.me/api/portraits/women/2.jpg'
        }
    });
    const organizer2 = await prisma.user.create({
        data: {
            firstName: 'David',
            lastName: 'Wilson',
            email: 'david.organizer@gmail.com',
            password: hashedPassword,
            phoneNumber: '+1234567894',
            role: prisma_1.Role.ORGANIZER,
            isVerified: true,
            pointBalance: 0,
            referralCode: 'DAVID2024',
            avatar: 'https://randomuser.me/api/portraits/men/3.jpg'
        }
    });
    // Create Admin User
    const admin = await prisma.user.create({
        data: {
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@eventhub.com',
            password: hashedPassword,
            phoneNumber: '+1234567895',
            role: prisma_1.Role.ADMIN,
            isVerified: true,
            pointBalance: 0,
            referralCode: 'ADMIN2024',
            avatar: 'https://randomuser.me/api/portraits/men/4.jpg'
        }
    });
    console.log('✅ Created users (3 attendees, 2 organizers, 1 admin)');
    // Create Events
    const techEvent = await prisma.event.create({
        data: {
            name: 'Tech Innovation Summit 2024',
            description: 'Join us for a comprehensive technology summit featuring the latest innovations in AI, blockchain, and cloud computing. Network with industry leaders and discover emerging trends that will shape the future of technology.',
            category: prisma_1.EventCategory.TECHNOLOGY,
            location: 'Silicon Valley Convention Center',
            address: '2701 Mission College Blvd, Santa Clara, CA 95054',
            startDate: new Date('2024-11-15T09:00:00Z'),
            endDate: new Date('2024-11-15T18:00:00Z'),
            price: 75000,
            availableSeats: 300,
            totalSeats: 300,
            organizerId: organizer1.id,
            imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
            isActive: true
        }
    });
    const musicEvent = await prisma.event.create({
        data: {
            name: 'Summer Music Festival 2024',
            description: 'Experience an unforgettable night of music with top artists from around the world. Food trucks, art installations, and non-stop entertainment in a beautiful outdoor setting.',
            category: prisma_1.EventCategory.MUSIC,
            location: 'Golden Gate Park',
            address: 'Golden Gate Park, San Francisco, CA 94122',
            startDate: new Date('2024-12-01T16:00:00Z'),
            endDate: new Date('2024-12-01T23:00:00Z'),
            price: 50000,
            availableSeats: 500,
            totalSeats: 500,
            organizerId: organizer2.id,
            imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
            isActive: true
        }
    });
    const businessEvent = await prisma.event.create({
        data: {
            name: 'Startup Pitch Competition',
            description: 'Watch promising startups pitch their innovative ideas to a panel of venture capitalists and industry experts. Network with entrepreneurs, investors, and fellow business enthusiasts.',
            category: prisma_1.EventCategory.BUSINESS,
            location: 'Downtown Convention Center',
            address: '747 Howard St, San Francisco, CA 94103',
            startDate: new Date('2024-11-30T10:00:00Z'),
            endDate: new Date('2024-11-30T17:00:00Z'),
            price: 25000,
            availableSeats: 150,
            totalSeats: 150,
            organizerId: organizer1.id,
            imageUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800',
            isActive: true
        }
    });
    console.log('✅ Created events (Tech Summit, Music Festival, Startup Pitch)');
    // Create Tickets for each event
    // Tech Event Tickets
    await prisma.ticket.createMany({
        data: [
            {
                eventId: techEvent.id,
                type: prisma_1.TicketType.EARLY_BIRD,
                name: 'Early Bird',
                description: 'Limited early bird pricing - Save 30%! Includes all sessions and networking lunch.',
                price: 52500,
                availableSeats: 50
            },
            {
                eventId: techEvent.id,
                type: prisma_1.TicketType.REGULAR,
                name: 'General Admission',
                description: 'Standard conference access with all sessions, networking breaks, and conference materials.',
                price: 75000,
                availableSeats: 200
            },
            {
                eventId: techEvent.id,
                type: prisma_1.TicketType.VIP,
                name: 'VIP Access',
                description: 'Premium access with VIP networking lounge, priority seating, welcome gift, and exclusive meet & greet.',
                price: 125000,
                availableSeats: 50
            }
        ]
    });
    // Music Event Tickets
    await prisma.ticket.createMany({
        data: [
            {
                eventId: musicEvent.id,
                type: prisma_1.TicketType.REGULAR,
                name: 'General Admission',
                description: 'Access to all stages and performances, food truck area, and art installations.',
                price: 50000,
                availableSeats: 400
            },
            {
                eventId: musicEvent.id,
                type: prisma_1.TicketType.VIP,
                name: 'VIP Experience',
                description: 'Front stage access, VIP lounge with complimentary drinks, artist meet & greet, and exclusive merchandise.',
                price: 100000,
                availableSeats: 100
            }
        ]
    });
    // Business Event Tickets
    await prisma.ticket.createMany({
        data: [
            {
                eventId: businessEvent.id,
                type: prisma_1.TicketType.STUDENT,
                name: 'Student Pass',
                description: 'Special pricing for students and recent graduates (Student ID required at entry).',
                price: 15000,
                availableSeats: 50
            },
            {
                eventId: businessEvent.id,
                type: prisma_1.TicketType.REGULAR,
                name: 'Professional Pass',
                description: 'Full access to all pitch presentations, networking sessions, and investor meetups.',
                price: 25000,
                availableSeats: 100
            }
        ]
    });
    console.log('✅ Created tickets for all events');
    // Create Coupons
    await prisma.coupon.createMany({
        data: [
            {
                userId: attendee1.id,
                eventId: techEvent.id,
                code: 'TECH20',
                type: prisma_1.CouponType.VOUCHER,
                name: '20% Tech Summit Discount',
                description: 'Special discount for Tech Innovation Summit',
                discount: 20,
                isPercentage: true,
                expiryDate: new Date('2024-11-14T23:59:59Z'),
                isUsed: false
            },
            {
                userId: attendee2.id,
                code: 'WELCOME10',
                type: prisma_1.CouponType.REWARD,
                name: 'Welcome Reward',
                description: '10% discount on your first event purchase',
                discount: 10,
                isPercentage: true,
                expiryDate: new Date('2024-12-31T23:59:59Z'),
                isUsed: false
            },
            {
                userId: attendee1.id,
                code: 'REFER15',
                type: prisma_1.CouponType.REFERRAL,
                name: 'Referral Bonus',
                description: '15% discount for referring a friend to EventHub',
                discount: 15,
                isPercentage: true,
                expiryDate: new Date('2024-12-31T23:59:59Z'),
                isUsed: false
            }
        ]
    });
    // Create Promotions
    await prisma.promotion.createMany({
        data: [
            {
                eventId: techEvent.id,
                code: 'EARLYTECH',
                name: 'Early Bird Special',
                description: 'Limited time early bird discount for tech conference',
                discount: 30,
                isPercentage: true,
                maxUses: 100,
                usedCount: 25,
                startDate: new Date('2024-10-01T00:00:00Z'),
                endDate: new Date('2024-11-01T23:59:59Z'),
                isActive: true
            },
            {
                eventId: musicEvent.id,
                code: 'MUSICLOVER',
                name: 'Music Lover Discount',
                description: '25% off for music enthusiasts and early supporters',
                discount: 25,
                isPercentage: true,
                maxUses: 50,
                usedCount: 10,
                startDate: new Date('2024-10-15T00:00:00Z'),
                endDate: new Date('2024-11-30T23:59:59Z'),
                isActive: true
            }
        ]
    });
    // Create Point History
    await prisma.pointHistory.createMany({
        data: [
            {
                userId: attendee1.id,
                points: 500,
                description: 'Welcome bonus points for joining EventHub'
            },
            {
                userId: attendee2.id,
                points: 1000,
                description: 'Referral bonus points from friend invitation'
            },
            {
                userId: attendee3.id,
                points: 250,
                description: 'Event purchase reward points'
            }
        ]
    });
    console.log('✅ Created coupons, promotions, and point history');
    console.log('\n🎉 PostgreSQL database seeding completed successfully!');
    console.log('\n📋 Test Accounts Created:');
    console.log('\n👥 ATTENDEES/USERS:');
    console.log('📧 john.doe@gmail.com (Verified, 500 points, has TECH20 & REFER15 coupons)');
    console.log('📧 sarah.johnson@gmail.com (Unverified, 1000 points, has WELCOME10 coupon)');
    console.log('📧 michael.chen@gmail.com (Verified, 250 points)');
    console.log('\n🎪 ORGANIZERS:');
    console.log('📧 emily.organizer@gmail.com (Tech Summit & Startup Pitch organizer)');
    console.log('📧 david.organizer@gmail.com (Music Festival organizer)');
    console.log('\n🛡️ ADMIN:');
    console.log('📧 admin@eventhub.com');
    console.log('\n🔑 Password for all accounts: password123');
    console.log('\n🎟️ Events Created:');
    console.log('🚀 Tech Innovation Summit 2024 (3 ticket types: Early Bird, General, VIP)');
    console.log('🎵 Summer Music Festival 2024 (2 ticket types: General, VIP)');
    console.log('💼 Startup Pitch Competition (2 ticket types: Student, Professional)');
    console.log('\n🎫 Available Coupons:');
    console.log('🏷️  TECH20 (20% off Tech Summit - john.doe@gmail.com)');
    console.log('🏷️  WELCOME10 (10% off first event - sarah.johnson@gmail.com)');
    console.log('🏷️  REFER15 (15% referral bonus - john.doe@gmail.com)');
    console.log('\n🎁 Active Promotions:');
    console.log('🏷️  EARLYTECH (30% off Tech Summit - 75/100 uses remaining)');
    console.log('🏷️  MUSICLOVER (25% off Music Festival - 40/50 uses remaining)');
    console.log('\n🔗 Database Connection:');
    console.log('   Host: localhost:5432');
    console.log('   Database: eventhub_db');
    console.log('   User: eventhub_user');
    console.log('   Password: eventhub_password123');
}
main()
    .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
