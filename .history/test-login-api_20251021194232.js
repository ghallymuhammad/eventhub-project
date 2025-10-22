const axios = require('axios');

async function testLogin() {
  try {
    console.log('🧪 Testing login API directly...');
    
    const response = await axios.post('http://localhost:8000/api/auth/login', {
      email: 'ghallymuhammad2@gmail.com',
      password: 'password123'
    });
    
    console.log('✅ Login successful!');
    console.log('Response structure:', {
      status: response.status,
      success: response.data?.success,
      hasData: !!response.data?.data,
      hasUser: !!response.data?.data?.user,
      hasToken: !!response.data?.data?.token,
      userRole: response.data?.data?.user?.role
    });
    
    if (response.data?.data?.user) {
      console.log('User info:', {
        email: response.data.data.user.email,
        role: response.data.data.user.role,
        firstName: response.data.data.user.firstName
      });
    }
    
  } catch (error) {
    console.error('❌ Login failed:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
  }
}

testLogin();
