require('dotenv').config();
const fetch = require('node-fetch');

console.log('🔍 Testing API Keys...\n');

// Test OpenAI API Key
async function testOpenAI() {
  console.log('1. Testing OpenAI API Key...');
  
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    console.log('❌ OPENAI_API_KEY not found in .env file');
    return false;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ OpenAI API Key is working!');
      console.log(`   Available models: ${data.data.length} models`);
      console.log(`   Models include: ${data.data.slice(0, 3).map(m => m.id).join(', ')}...`);
      return true;
    } else {
      const error = await response.json();
      console.log(`❌ OpenAI API Key failed: ${error.error?.message || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ OpenAI API Key test failed: ${error.message}`);
    return false;
  }
}

// Test Gemini API Key
async function testGemini() {
  console.log('\n2. Testing Gemini API Key...');
  
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    console.log('❌ GEMINI_API_KEY not found in .env file');
    return false;
  }

  try {
    const requestBody = {
      contents: [{
        parts: [{
          text: "Hello, this is a test message. Please respond with 'API test successful' if you can read this."
        }]
      }]
    };

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (response.ok) {
      const data = await response.json();
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        console.log('✅ Gemini API Key is working!');
        console.log(`   Response: ${data.candidates[0].content.parts[0].text.substring(0, 50)}...`);
        return true;
      } else {
        console.log('❌ Gemini API response format is invalid');
        return false;
      }
    } else {
      const error = await response.json();
      console.log(`❌ Gemini API Key failed: ${JSON.stringify(error)}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Gemini API Key test failed: ${error.message}`);
    return false;
  }
}

// Test Translation Service
async function testTranslation() {
  console.log('\n3. Testing Translation Service...');
  
  const TRANSLATION_SERVICE = process.env.TRANSLATION_SERVICE || 'gemini';
  console.log(`   Using translation service: ${TRANSLATION_SERVICE}`);
  
  try {
    let translateText;
    if (TRANSLATION_SERVICE === 'gemini') {
      translateText = require('./src/services/geminiTranslateService').translateText;
    } else if (TRANSLATION_SERVICE === 'google') {
      translateText = require('./src/services/googleTranslateService').translateText;
    } else if (TRANSLATION_SERVICE === 'libre') {
      translateText = require('./src/services/libreTranslateService').translateText;
    } else if (TRANSLATION_SERVICE === 'mymemory') {
      translateText = require('./src/services/myMemoryTranslateService').translateText;
    } else {
      console.log(`❌ Unknown translation service: ${TRANSLATION_SERVICE}`);
      return false;
    }

    const testText = "Hello, this is a test message for translation.";
    const translatedText = await translateText(testText, 'FR');
    
    if (translatedText && !translatedText.includes('Translation failed')) {
      console.log('✅ Translation service is working!');
      console.log(`   Original: ${testText}`);
      console.log(`   Translated: ${translatedText}`);
      return true;
    } else {
      console.log(`❌ Translation failed: ${translatedText}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Translation test failed: ${error.message}`);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting API Key Tests...\n');
  
  const openaiResult = await testOpenAI();
  const geminiResult = await testGemini();
  const translationResult = await testTranslation();
  
  console.log('\n📊 Test Results Summary:');
  console.log(`   OpenAI API: ${openaiResult ? '✅ Working' : '❌ Failed'}`);
  console.log(`   Gemini API: ${geminiResult ? '✅ Working' : '❌ Failed'}`);
  console.log(`   Translation: ${translationResult ? '✅ Working' : '❌ Failed'}`);
  
  if (openaiResult && geminiResult && translationResult) {
    console.log('\n🎉 All APIs are working correctly! Your app is ready to use.');
  } else {
    console.log('\n⚠️  Some APIs are not working. Please check your API keys and try again.');
  }
  
  console.log('\n💡 If any API failed, please:');
  console.log('   1. Check your API keys in the .env file');
  console.log('   2. Make sure you have sufficient credits/quota');
  console.log('   3. Verify the API keys are correct');
}

// Run the tests
runTests().catch(console.error);
