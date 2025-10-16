/**
 * Email Service Test Script
 * 
 * This script demonstrates and tests the email notification system.
 * Run with: npx ts-node src/tests/test-email.ts
 */

import emailService from '../services/email.service';
import ticketGeneratorService from '../services/ticketGenerator.service';

async function testEmailService() {
  console.log('🧪 Testing EventHub Email Service\n');

  try {
    // Test 1: Verification Email
    console.log('1️⃣ Testing Verification Email...');
    await emailService.sendVerificationEmail(
      process.env.TEST_EMAIL || 'test@example.com',
      'sample-verification-token-12345',
      'John'
    );
    console.log('✅ Verification email sent!\n');

    // Test 2: Password Reset Email
    console.log('2️⃣ Testing Password Reset Email...');
    await emailService.sendPasswordResetEmail(
      process.env.TEST_EMAIL || 'test@example.com',
      'sample-reset-token-67890',
      'John'
    );
    console.log('✅ Password reset email sent!\n');

    // Test 3: Ticket Email with JPG
    console.log('3️⃣ Testing Ticket Email with JPG Attachment...');
    
    // Generate sample ticket image
    const ticketData = {
      transactionId: 12345,
      eventName: 'Amazing Music Festival 2025',
      eventDate: new Date('2025-12-31T20:00:00').toISOString(),
      eventLocation: 'Jakarta International Expo',
      eventAddress: 'Jl. Gatot Subroto, Jakarta Pusat 10270',
      ticketType: 'VIP Access',
      attendeeName: 'John Doe',
      attendeeEmail: process.env.TEST_EMAIL || 'test@example.com',
      quantity: 2,
      qrCodeData: ticketGeneratorService.generateQRCodeData(
        12345,
        process.env.TEST_EMAIL || 'test@example.com'
      ),
    };

    const ticketImageBuffer = await ticketGeneratorService.generateTicket(ticketData);
    console.log('✅ Ticket image generated!');

    // Sample transaction and event data
    const sampleTransaction = {
      id: 12345,
      finalAmount: 500000,
      status: 'DONE',
    };

    const sampleEvent = {
      name: 'Amazing Music Festival 2025',
      startDate: '2025-12-31T20:00:00Z',
      location: 'Jakarta International Expo',
      address: 'Jl. Gatot Subroto, Jakarta Pusat 10270',
    };

    await emailService.sendTicketEmail(
      process.env.TEST_EMAIL || 'test@example.com',
      'John',
      sampleTransaction,
      sampleEvent,
      ticketImageBuffer
    );
    console.log('✅ Ticket email sent with JPG attachment!\n');

    // Test 4: Payment Confirmation Email
    console.log('4️⃣ Testing Payment Confirmation Email...');
    await emailService.sendPaymentConfirmationEmail(
      process.env.TEST_EMAIL || 'test@example.com',
      'John',
      12345,
      'Amazing Music Festival 2025'
    );
    console.log('✅ Payment confirmation email sent!\n');

    console.log('🎉 All email tests completed successfully!');
    console.log('\n📧 Check your inbox at:', process.env.TEST_EMAIL || 'test@example.com');
    console.log('\n💡 Tip: If using Gmail, check the Promotions tab if emails are not in Primary.');
    
  } catch (error) {
    console.error('❌ Email test failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your .env file has correct SMTP settings');
    console.log('2. For Gmail, use App Password (not regular password)');
    console.log('3. Ensure SMTP_USER and SMTP_PASSWORD are set');
    console.log('4. Try running: npm install nodemailer canvas qrcode');
  }
}

// Run the test
testEmailService();
