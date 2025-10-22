console.log('=== Testing Token Persistence ===');

// Check if token exists after page load
function checkTokenAfterPageLoad() {
    console.log('📋 Checking token after page load...');
    
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user_data');
    
    console.log('Token exists:', !!token);
    console.log('User data exists:', !!userData);
    
    if (token) {
        console.log('Token length:', token.length);
        console.log('Token starts with:', token.substring(0, 30));
        
        // Test token parsing
        try {
            const parts = token.split('.');
            if (parts.length === 3) {
                const payload = JSON.parse(atob(parts[1]));
                console.log('Token payload:', payload);
                
                const now = Math.floor(Date.now() / 1000);
                console.log('Token expiry check:', {
                    now: now,
                    exp: payload.exp,
                    isExpired: payload.exp < now,
                    timeLeft: payload.exp - now
                });
            }
        } catch (e) {
            console.error('Error parsing token:', e);
        }
    }
    
    if (userData) {
        try {
            const user = JSON.parse(userData);
            console.log('User data:', user);
        } catch (e) {
            console.error('Error parsing user data:', e);
        }
    }
}

// Run the check
checkTokenAfterPageLoad();
