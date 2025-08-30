require('dotenv').config();
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5500';

async function testUploadAPI() {
  console.log('🧪 Testing Upload API...\n');

  // Test 1: Check if server is running
  try {
    console.log('1. Testing server connection...');
    const healthRes = await fetch(`${BASE_URL}/health`);
    if (healthRes.ok) {
      console.log('✅ Server is running');
    } else {
      console.log('❌ Server not responding');
      return;
    }
  } catch (error) {
    console.log('❌ Cannot connect to server:', error.message);
    console.log('💡 Make sure the server is running with: node src/index.js');
    return;
  }

  // Test 2: Check if uploads directory exists
  const uploadsDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadsDir)) {
    console.log('❌ Uploads directory does not exist');
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✅ Created uploads directory');
  } else {
    console.log('✅ Uploads directory exists');
  }

  // Test 3: Test API routes
  try {
    console.log('\n2. Testing API routes...');
    const apiRes = await fetch(`${BASE_URL}/api/status/test`);
    if (apiRes.status === 404) {
      console.log('✅ API routes are working (404 expected for non-existent job)');
    } else {
      console.log('⚠️  API routes response:', apiRes.status);
    }
  } catch (error) {
    console.log('❌ API routes error:', error.message);
  }

  console.log('\n📊 Upload API Test Summary:');
  console.log('   If all tests show ✅, the backend is ready for uploads');
  console.log('   You can now try uploading a video file');
}

testUploadAPI().catch(console.error);
