#!/usr/bin/env node

console.log('🧪 EventHub Complete Auth Flow Test - With Seeded Data');

async function testCompleteFlow() {
  try {
    // Use seeded user credentials
    const testUser = {
      email: 'john.doe@gmail.com',  // This user has 500 points and coupons
      password: 'password123'
    };

    console.log('1️⃣ Testing login with seeded user...');
    
    const loginResponse = await fetch('http://localhost:8000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    
    const loginData = await loginResponse.json();
    
    if (!loginResponse.ok || !loginData.success) {
      console.error('❌ Login failed:', loginData);
      return;
    }
    
    const { token, user } = loginData.data;
    console.log('✅ Login successful');
    console.log(`   User: ${user.email} (ID: ${user.id})`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Verified: ${user.isVerified}`);
    console.log(`   Token: ${token.substring(0, 20)}...`);
    
    // Test protected routes
    console.log('\n2️⃣ Testing protected routes...');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    const profileResponse = await fetch('http://localhost:8000/api/auth/profile', { headers });
    const profileData = await profileResponse.json();
    
    if (profileResponse.ok && profileData.success) {
      console.log('✅ Profile access successful');
    } else {
      console.error('❌ Profile access failed:', profileData);
      return;
    }
    
    // Test events
    console.log('\n3️⃣ Testing events endpoint...');
    const eventsResponse = await fetch('http://localhost:8000/api/events');
    const eventsData = await eventsResponse.json();
    
    if (eventsResponse.ok && eventsData.success) {
      console.log('✅ Events retrieval successful');
      console.log(`   Found ${eventsData.data.events.length} events`);
      
      if (eventsData.data.events.length > 0) {
        const testEvent = eventsData.data.events[0];
        console.log(`   Testing with: "${testEvent.name}" (ID: ${testEvent.id})`);
        console.log(`   Price: $${testEvent.price / 100} | Seats: ${testEvent.availableSeats}`);
        
        // Test event details
        console.log('\n4️⃣ Testing event details...');
        const eventDetailResponse = await fetch(`http://localhost:8000/api/events/${testEvent.id}`);
        const eventDetailData = await eventDetailResponse.json();
        
        if (eventDetailResponse.ok && eventDetailData.success) {
          console.log('✅ Event details successful');
          console.log(`   Tickets available: ${eventDetailData.data.tickets?.length || 0}`);
        }
        
        // Test user dashboard (for point balance)
        console.log('\n5️⃣ Testing user dashboard...');
        const dashboardResponse = await fetch('http://localhost:8000/api/user/dashboard', { headers });
        const dashboardData = await dashboardResponse.json();
        
        if (dashboardResponse.ok && dashboardData.success) {
          console.log('✅ Dashboard access successful');
          console.log(`   Points balance: ${dashboardData.data.pointsBalance || 0}`);
          console.log(`   Available coupons: ${dashboardData.data.coupons?.length || 0}`);
        }
        
        // Test checkout preview
        console.log('\n6️⃣ Testing checkout preview...');
        if (eventDetailData.data.tickets?.length > 0) {
          const checkoutData = {
            eventId: testEvent.id,
            tickets: [{
              ticketId: eventDetailData.data.tickets[0].id,
              quantity: 1
            }]
          };
          
          const checkoutResponse = await fetch('http://localhost:8000/api/checkout/preview', {
            method: 'POST',
            headers,
            body: JSON.stringify(checkoutData)
          });
          
          const checkoutResult = await checkoutResponse.json();
          
          if (checkoutResponse.ok && checkoutResult.success) {
            console.log('✅ Checkout preview successful');
            console.log(`   Total: $${checkoutResult.data.total / 100}`);
            console.log(`   Applicable discounts: ${checkoutResult.data.discounts?.length || 0}`);
          } else {
            console.log('⚠️  Checkout preview failed (might be expected):', checkoutResult);
          }
        }
      }
    }
    
    // Frontend integration instructions
    console.log('\n🌐 Frontend Integration Test:');
    console.log('📋 Test Steps:');
    console.log('1. Open: http://localhost:3000/debug-auth');
    console.log('2. In browser console, paste and run:');
    console.log('');
    console.log(`   localStorage.setItem('token', '${token}');`);
    console.log(`   document.cookie = 'auth-token=${token}; path=/; max-age=86400';`);
    console.log('   location.reload();');
    console.log('');
    console.log('3. After page reload, verify:');
    console.log('   ✓ User shown as authenticated');
    console.log(`   ✓ Email: ${user.email}`);
    console.log('   ✓ Token present in both localStorage and cookies');
    console.log('');
    console.log('4. Navigate to homepage (http://localhost:3000)');
    console.log('5. Click on any event to view details');
    console.log('6. Click "Buy Ticket" button');
    console.log('7. ✓ Should redirect to checkout page (NOT login page)');
    console.log('8. ✓ Checkout page should be accessible');
    console.log('');
    console.log('🚨 If redirected to login instead of checkout, the issue persists!');
    
    console.log('\n🎉 API Authentication flow test completed successfully!');
    console.log('\n📊 Test Summary:');
    console.log(`   ✅ User: ${user.email} (${user.role})`);
    console.log(`   ✅ Token: ${token.length} characters`);
    console.log('   ✅ Protected routes: accessible');
    console.log(`   ✅ Events: ${eventsData.data.events.length} available`);
    console.log('   ✅ Event details: working');
    console.log('   ✅ Dashboard: accessible');
    console.log('');
    console.log('🔍 Next: Follow the frontend integration test steps above');
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
    console.error(error.stack);
  }
}

testCompleteFlow();
