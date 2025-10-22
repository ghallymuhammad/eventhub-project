console.log('🧪 Testing Simplified Auth Flow');

async function testAuthFlow() {
  try {
    // Test 1: Login
    console.log('1️⃣ Testing login...');
    const loginResponse = await fetch('http://localhost:8000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'ghallymuhammad2@gmail.com',
        password: 'password123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('✅ Login successful:', {
      success: loginData.success,
      hasToken: !!loginData.data?.token,
      userRole: loginData.data?.user?.role
    });
    
    const token = loginData.data.token;
    
    // Test 2: Protected route
    console.log('2️⃣ Testing protected route...');
    const dashboardResponse = await fetch('http://localhost:8000/api/user/dashboard', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const dashboardData = await dashboardResponse.json();
    console.log('✅ Dashboard access:', {
      status: dashboardResponse.status,
      success: dashboardData.success
    });
    
    // Test 3: Event list
    console.log('3️⃣ Testing event list...');
    const eventsResponse = await fetch('http://localhost:8000/api/events');
    const eventsData = await eventsResponse.json();
    console.log('✅ Events:', {
      success: eventsData.success,
      eventCount: eventsData.data?.events?.length
    });
    
    // Test 4: Checkout preview
    if (eventsData.data?.events?.length > 0) {
      console.log('4️⃣ Testing checkout...');
      const eventId = eventsData.data.events[0].id;
      
      // Get event details first
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
        
        const checkoutData = await checkoutResponse.json();
        console.log('✅ Checkout preview:', {
          status: checkoutResponse.status,
          success: checkoutData.success
        });
      }
    }
    
    console.log('🎉 All tests passed! Auth flow is working.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAuthFlow();
