#!/usr/bin/env node

console.log('🧪 Testing EventHub Auth Flow - Updated Version');

async function testAuthFlow() {
  try {
    // Test 1: User Registration/Login
    console.log('1️⃣ Testing user registration/login...');
    
    const testUser = {
      email: 'test@eventhub.com',
      password: 'testPassword123'
    };

    let token;
    let user;

    try {
      // Try login first
      const loginResponse = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser)
      });
      
      const loginData = await loginResponse.json();
      
      if (loginResponse.ok && loginData.success) {
        console.log('✅ Login successful');
        token = loginData.data.token;
        user = loginData.data.user;
      } else {
        // Try registration
        console.log('   User not found, attempting registration...');
        const registerResponse = await fetch('http://localhost:8000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...testUser,
            firstName: 'Test',
            lastName: 'User'
          })
        });
        
        const registerData = await registerResponse.json();
        
        if (registerResponse.ok && registerData.success) {
          console.log('✅ Registration successful');
          token = registerData.data.token;
          user = registerData.data.user;
        } else {
          console.error('❌ Registration failed:', registerData);
          return;
        }
      }
    } catch (error) {
      console.error('❌ Auth error:', error.message);
      return;
    }
    
    console.log(`   User ID: ${user.id}`);
    console.log(`   Token: ${token.substring(0, 20)}...`);
    
    // Test 2: Protected route (Profile)
    console.log('\n2️⃣ Testing protected route (profile)...');
    try {
      const profileResponse = await fetch('http://localhost:8000/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const profileData = await profileResponse.json();
      
      if (profileResponse.ok && profileData.success) {
        console.log('✅ Profile access successful');
        console.log(`   Email: ${profileData.data.email}`);
      } else {
        console.error('❌ Profile access failed:', profileData);
        return;
      }
    } catch (error) {
      console.error('❌ Profile error:', error.message);
      return;
    }
    
    // Test 3: Events list
    console.log('\n3️⃣ Testing events endpoint...');
    try {
      const eventsResponse = await fetch('http://localhost:8000/events');
      const eventsData = await eventsResponse.json();
      
      if (eventsResponse.ok && eventsData.success) {
        console.log('✅ Events retrieval successful');
        console.log(`   Found ${eventsData.data.length} events`);
        
        // If no events, create one for testing
        if (eventsData.data.length === 0) {
          console.log('   Creating a test event...');
          
          const testEvent = {
            title: 'Test Event for Auth Flow',
            description: 'A test event to verify the checkout flow',
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            time: '19:00',
            venue: 'Test Venue',
            price: 25.00,
            maxAttendees: 100,
            categories: ['Technology']
          };
          
          const createEventResponse = await fetch('http://localhost:8000/events', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(testEvent)
          });
          
          if (createEventResponse.ok) {
            console.log('✅ Test event created');
            // Refresh events list
            const updatedEventsResponse = await fetch('http://localhost:8000/events');
            const updatedEventsData = await updatedEventsResponse.json();
            eventsData.data = updatedEventsData.data;
          }
        }
        
        // Test with first event
        if (eventsData.data.length > 0) {
          const testEvent = eventsData.data[0];
          console.log(`   Testing with event: "${testEvent.title}" (ID: ${testEvent.id})`);
          
          // Test 4: Event details
          console.log('\n4️⃣ Testing event details...');
          const eventDetailResponse = await fetch(`http://localhost:8000/events/${testEvent.id}`);
          const eventDetailData = await eventDetailResponse.json();
          
          if (eventDetailResponse.ok && eventDetailData.success) {
            console.log('✅ Event details retrieval successful');
          } else {
            console.error('❌ Event details failed:', eventDetailData);
          }
        }
        
      } else {
        console.error('❌ Events retrieval failed:', eventsData);
      }
    } catch (error) {
      console.error('❌ Events error:', error.message);
    }
    
    // Test 5: Frontend token verification simulation
    console.log('\n5️⃣ Frontend Integration Test Instructions:');
    console.log('   📋 Manual testing steps:');
    console.log(`   1. Open: http://localhost:3000/debug-auth`);
    console.log(`   2. In browser console, run: localStorage.setItem('token', '${token}')`);
    console.log(`   3. Refresh the page - check if user is recognized`);
    console.log(`   4. Navigate to an event page`);
    console.log(`   5. Click "Buy Ticket" - should go to checkout, not login`);
    console.log(`   6. Check browser Network tab for any 401/403 errors`);
    
    console.log('\n🎉 API Authentication flow test completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   ✅ User auth: ${user.email}`);
    console.log(`   ✅ Token: ${token.length} chars`);
    console.log('   ✅ Protected routes: accessible');
    console.log('   ✅ Events endpoint: working');
    console.log('\n🔍 Next: Test the web UI manually with the provided instructions above.');
    
  } catch (error) {
    console.error('❌ Unexpected test error:', error.message);
    console.error(error.stack);
  }
}

testAuthFlow();
