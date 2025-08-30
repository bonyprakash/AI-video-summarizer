const { translateText } = require('./src/services/customTranslationService');

async function testTranslation() {
  console.log('🌐 Testing Custom Translation Service...\n');

  try {
    const testText = "Hello guys welcome to Amit Thinks. In this video we will see how to install node.js on Windows 11. The installation process is simple and straightforward.";
    
    console.log('📝 Original text:');
    console.log(testText);
    console.log('\n' + '='.repeat(60) + '\n');
    
    // Test Spanish translation
    console.log('🇪🇸 Testing Spanish translation...');
    const spanishTranslation = await translateText(testText, 'ES');
    console.log('Spanish:', spanishTranslation);
    console.log('\n' + '='.repeat(60) + '\n');
    
    // Test French translation
    console.log('🇫🇷 Testing French translation...');
    const frenchTranslation = await translateText(testText, 'FR');
    console.log('French:', frenchTranslation);
    console.log('\n' + '='.repeat(60) + '\n');
    
    // Test German translation
    console.log('🇩🇪 Testing German translation...');
    const germanTranslation = await translateText(testText, 'DE');
    console.log('German:', germanTranslation);
    console.log('\n' + '='.repeat(60) + '\n');
    
    // Test Hindi translation
    console.log('🇮🇳 Testing Hindi translation...');
    const hindiTranslation = await translateText(testText, 'HI');
    console.log('Hindi:', hindiTranslation);
    
    console.log('\n✅ Translation tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Translation test failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
testTranslation().catch(console.error);
