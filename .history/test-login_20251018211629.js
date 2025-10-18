const https = require('https');

// Test login API response structure
const testLogin = () => {
  const data = JSON.stringify({
    email: 'melindahidayatii@gmail.com',
    password: 'password123'
  });

  const options = {
    hostname: 'localhost',
    port: 8000,
    path: '/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = https.request(options, (res) => {
    let body = '';
    
    res.on('data', (chunk) => {
      body += chunk;
    });
    
    res.on('end', () => {
      try {
        const responseData = JSON.parse(body);
        console.log('Raw API Response:', JSON.stringify(responseData, null, 2));
        
        if (responseData.success && responseData.data) {
          console.log('\n✅ Success!');
          console.log('User:', responseData.data.user);
          console.log('Token:', responseData.data.token);
          console.log('User Role:', responseData.data.user?.role);
        } else {
          console.log('\n❌ Failed:', responseData);
        }
      } catch (error) {
        console.error('JSON Parse Error:', error);
        console.log('Raw response:', body);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Request Error:', error);
  });

  req.write(data);
  req.end();
};

testLogin();
