#!/bin/bash

echo "🚀 Starting EventHub Authentication Test"
echo "======================================="

# Test 1: Check if backend is running
echo "1. Testing Backend API..."
BACKEND_RESPONSE=$(curl -s http://localhost:8000/api/)
if [[ $BACKEND_RESPONSE == *"EventHub API"* ]]; then
    echo "   ✅ Backend API is running"
else
    echo "   ❌ Backend API is not responding"
    exit 1
fi

# Test 2: Test login endpoint
echo "2. Testing Login Endpoint..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"password123"}')

if [[ $LOGIN_RESPONSE == *"success\":true"* ]]; then
    echo "   ✅ Login endpoint working"
    echo "   📝 Response: $LOGIN_RESPONSE"
else
    echo "   ❌ Login endpoint failed"
    echo "   📝 Response: $LOGIN_RESPONSE"
    exit 1
fi

# Test 3: Check if frontend is running
echo "3. Testing Frontend..."
FRONTEND_RESPONSE=$(curl -s http://localhost:3000 | head -1)
if [[ $FRONTEND_RESPONSE == *"<!DOCTYPE html>"* ]]; then
    echo "   ✅ Frontend is running"
else
    echo "   ❌ Frontend is not responding"
    exit 1
fi

# Test 4: Check if login page loads
echo "4. Testing Login Page..."
LOGIN_PAGE_RESPONSE=$(curl -s http://localhost:3000/login | head -1)
if [[ $LOGIN_PAGE_RESPONSE == *"<!DOCTYPE html>"* ]]; then
    echo "   ✅ Login page loads"
else
    echo "   ❌ Login page not loading"
    exit 1
fi

echo ""
echo "🎉 All Authentication Tests Passed!"
echo "=================================="
echo ""
echo "🔗 Test URLs:"
echo "   • Homepage: http://localhost:3000"
echo "   • Login Page: http://localhost:3000/login"
echo "   • API Health: http://localhost:8000/api/"
echo ""
echo "🧪 Test Credentials:"
echo "   • Email: test@example.com"
echo "   • Password: password123"
echo ""
echo "✨ You can now test the authentication flow in your browser!"
