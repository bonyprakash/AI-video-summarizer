require('dotenv').config();
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5500';

async function testEndpoints() {
  console.log('🔍 Testing API Endpoints...\n');

  // Test 1: Health endpoint
  try {
    console.log('1. Testing health endpoint...');
    const healthRes = await fetch(`${BASE_URL}/health`);
    if (healthRes.ok) {
      const healthData = await healthRes.json();
      console.log('✅ Health endpoint working:', healthData);
    } else {
      console.log('❌ Health endpoint failed:', healthRes.status);
    }
  } catch (error) {
    console.log('❌ Health endpoint error:', error.message);
  }

  // Test 2: Frontend serving
  try {
    console.log('\n2. Testing frontend serving...');
    const frontendRes = await fetch(`${BASE_URL}/`);
    if (frontendRes.ok) {
      console.log('✅ Frontend is being served');
      console.log('   Content-Type:', frontendRes.headers.get('content-type'));
    } else {
      console.log('❌ Frontend serving failed:', frontendRes.status);
    }
  } catch (error) {
    console.log('❌ Frontend serving error:', error.message);
  }

  // Test 3: API routes
  try {
    console.log('\n3. Testing API routes...');
    const apiRes = await fetch(`${BASE_URL}/api/status/test`);
    if (apiRes.status === 404) {
      console.log('✅ API routes are working (404 expected for non-existent job)');
    } else {
      console.log('⚠️  API routes response:', apiRes.status);
    }
  } catch (error) {
    console.log('❌ API routes error:', error.message);
  }

  console.log('\n📊 Endpoint Test Summary:');
  console.log('   If all tests show ✅, your backend is working correctly!');
  console.log('   You can now open http://localhost:5500 in your browser');
}

// Wait a bit for server to start, then test
setTimeout(testEndpoints, 2000);
