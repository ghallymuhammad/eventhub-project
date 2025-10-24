// Paste this in the browser console at http://localhost:3000/debug-auth

console.log('🔧 Setting up authentication for checkout test');

// Set the fresh token
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJqb2huLmRvZUBnbWFpbC5jb20iLCJyb2xlIjoiVVNFUiIsImlhdCI6MTc2MTI3MzM1MSwiZXhwIjoxNzYxMzU5NzUxfQ.5GIrWgvtZsTGDwcoIEMDBAgIh_Xi-OO8DjFBJuXoY3E';

// Clear existing auth
localStorage.removeItem('token');
document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

// Set new token
localStorage.setItem('token', token);
document.cookie = `auth-token=${token}; path=/; max-age=86400; SameSite=Strict`;

console.log('✅ Token set. Now navigate to checkout page');
console.log('🔗 Go to: http://localhost:3000/checkout/3');

// Auto-navigate after a short delay
setTimeout(() => {
  window.location.href = '/checkout/3';
}, 2000);
