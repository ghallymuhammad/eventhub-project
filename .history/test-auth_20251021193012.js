const axios = require('axios');

const testAuth = async () => {
  console.log('🧪 Testing authentication flow...');
  
  try {
    // Test login first
    console.log('1️⃣ Testing login...');
    const loginResponse = await axios.post('http://localhost:8000/api/auth/login', {
      email: 'ghallymuhammad2@gmail.com',
      password: 'password123'
    });
    
    console.log('✅ Login successful:', {
      success: loginResponse.data.success,
      hasToken: !!loginResponse.data.data.token,
      user: loginResponse.data.data.user.email,
      role: loginResponse.data.data.user.role
    });
    
    const token = loginResponse.data.data.token;
    
    // Test protected route - user dashboard
    console.log('\n2️⃣ Testing protected route with token...');
    const dashboardResponse = await axios.get('http://localhost:8000/api/user/dashboard', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Dashboard access successful:', {
      success: dashboardResponse.data.success,
      hasProfile: !!dashboardResponse.data.data.profile
    });
    
    // Check available events first
    console.log('\n3️⃣ Checking available events...');
    const eventsResponse = await axios.get('http://localhost:8000/api/events');
    
    console.log('📋 Available events:', {
      success: eventsResponse.data.success,
      eventCount: eventsResponse.data.data.events.length,
      events: eventsResponse.data.data.events.map(e => ({ id: e.id, name: e.name }))
    });
    
    if (eventsResponse.data.data.events.length > 0) {
      const firstEvent = eventsResponse.data.data.events[0];
      
      // Get event details with tickets
      console.log('\n4️⃣ Getting event details...');
      const eventDetailsResponse = await axios.get(`http://localhost:8000/api/events/${firstEvent.id}`);
      const eventWithTickets = eventDetailsResponse.data.data;
      
      console.log('Event tickets:', {
        eventId: eventWithTickets.id,
        ticketCount: eventWithTickets.tickets?.length || 0,
        tickets: eventWithTickets.tickets?.map(t => ({ id: t.id, type: t.type, price: t.price })) || []
      });
      
      if (eventWithTickets.tickets && eventWithTickets.tickets.length > 0) {
        // Test checkout preview with real event and ticket
        console.log('\n5️⃣ Testing checkout preview with real event...');
        const checkoutResponse = await axios.post('http://localhost:8000/api/checkout/preview', {
          eventId: firstEvent.id,
          tickets: [{ ticketId: eventWithTickets.tickets[0].id, quantity: 1 }]
        }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Checkout preview successful:', {
        success: checkoutResponse.data.success,
        hasEvent: !!checkoutResponse.data.data.event
      });
    } else {
      console.log('⚠️ No events found - skipping checkout test');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
  }
};

testAuth();
