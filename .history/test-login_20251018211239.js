// Test login API response structure
const testLogin = async () => {
  try {
    const response = await fetch('http://localhost:8000/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'melindahidayatii@gmail.com',
        password: 'password123'
      })
    });

    const data = await response.json();
    console.log('Raw API Response:', JSON.stringify(data, null, 2));
    
    if (data.success && data.data) {
      console.log('User:', data.data.user);
      console.log('Token:', data.data.token);
      console.log('User Role:', data.data.user?.role);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

testLogin();
