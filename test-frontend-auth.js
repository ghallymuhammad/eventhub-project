// EventHub Frontend Authentication Test Script
// Copy and paste this in the browser console on http://localhost:3000/debug-auth

console.log('🔍 EventHub Frontend Auth Test');

// Set the token from our successful API test
const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ0ZXN0QGV2ZW50aHViLmNvbSIsInJvbGUiOiJVU0VSIiwiaWF0IjoxNzYxMjY4NTkzLCJleHAiOjE3NjEzNTQ5OTN9.8Zmp6RQYbnJCsLhvDYugDaEGQ2x74kPde03Ga3B25pk';

// Clear any existing auth data
localStorage.removeItem('token');
document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

console.log('1. Cleared existing auth data');

// Set the new token
localStorage.setItem('token', testToken);

// Also set as cookie
document.cookie = `auth-token=${testToken}; path=/; max-age=86400; SameSite=Strict`;

console.log('2. Set new token in localStorage and cookie');
console.log('   Token:', testToken.substring(0, 20) + '...');

// Refresh the page to trigger auth check
console.log('3. Refreshing page to trigger auth check...');
setTimeout(() => {
  window.location.reload();
}, 1000);

// Instructions for manual testing
console.log(`
📋 After page refresh, verify:
- User is shown as authenticated
- Email: test@eventhub.com  
- Token is present in both localStorage and cookies
- Navigate to homepage and find an event
- Click "Buy Ticket" - should redirect to checkout, NOT login
`);
