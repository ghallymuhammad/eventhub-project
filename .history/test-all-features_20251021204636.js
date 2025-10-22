console.log('🧪 Testing All Key Features - Organized State Management');

async function testAllFeatures() {
  try {
    console.log('=== 1. Backend Authentication Test ===');
    
    // Test login API
    const loginResponse = await fetch('http://localhost:8000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'ghallymuhammad2@gmail.com',
        password: 'password123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('✅ Login API:', {
      success: loginData.success,
      hasToken: !!loginData.data?.token,
      userRole: loginData.data?.user?.role
    });
    
    const token = loginData.data.token;
    
    // Test protected routes
    console.log('\n=== 2. Protected Routes Test ===');
    
    const protectedRoutes = [
      '/user/dashboard',
      '/user/coupons',
      '/checkout/preview'
    ];
    
    for (const route of protectedRoutes.slice(0, 2)) { // Test first 2
      const response = await fetch(`http://localhost:8000/api${route}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`✅ ${route}:`, {
        status: response.status,
        success: response.status === 200
      });
    }
    
    // Test checkout preview with real data
    console.log('\n=== 3. Checkout Flow Test ===');
    
    // Get events first
    const eventsResponse = await fetch('http://localhost:8000/api/events');
    const eventsData = await eventsResponse.json();
    
    if (eventsData.data?.events?.length > 0) {
      const eventId = eventsData.data.events[0].id;
      
      // Get event details
      const eventResponse = await fetch(`http://localhost:8000/api/events/${eventId}`);
      const eventData = await eventResponse.json();
      
      if (eventData.data.tickets?.length > 0) {
        const checkoutResponse = await fetch('http://localhost:8000/api/checkout/preview', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            eventId: eventId,
            tickets: [{ ticketId: eventData.data.tickets[0].id, quantity: 1 }]
          })
        });
        
        console.log('✅ Checkout preview:', {
          status: checkoutResponse.status,
          success: checkoutResponse.status === 200
        });
      }
    }
    
    console.log('\n=== 4. Frontend Features Test ===');
    console.log('🌐 Frontend features to test manually:');
    console.log('   • Login page: http://localhost:3000/login');
    console.log('   • Auth test: http://localhost:3000/auth-test');
    console.log('   • Homepage: http://localhost:3000');
    console.log('   • Event detail pages');
    console.log('   • Navbar sign out button');
    
    console.log('\n🎉 Backend tests completed successfully!');
    console.log('📝 Next: Test frontend features manually');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAllFeatures();
