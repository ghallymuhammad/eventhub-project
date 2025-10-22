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
    
    // Test checkout preview
    console.log('\n3️⃣ Testing checkout preview...');
    const checkoutResponse = await axios.post('http://localhost:8000/api/checkout/preview', {
      eventId: 1,
      tickets: [{ ticketId: 1, quantity: 1 }]
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Checkout preview successful:', {
      success: checkoutResponse.data.success,
      hasEvent: !!checkoutResponse.data.data.event
    });
    
  } catch (error) {
    console.error('❌ Test failed:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
  }
};

testAuth();
