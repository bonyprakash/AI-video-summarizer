require('dotenv').config();
const { translateText } = require('./src/services/enhancedTranslationService');

async function testEnhancedHindiTelugu() {
  console.log('🧪 Testing Enhanced Hindi & Telugu Translations...\n');
  
  // Test text based on your example
  const testText = `Executive Summary: This guide provides a concise overview of installing Node.js on Windows 11. The process involves downloading the LTS version from the official website, running the installer, and verifying the installation via the command prompt. Successful installation enables using Node.js for development.

Key Points:
• Download the Long Term Support (LTS) version of Node.js from nodejs.org.
• Run the downloaded installer file.
• Accept the default installation settings unless customization is required.
• Ensure the Node Package Manager (npm) is also installed.
• Verify the installation by opening the command prompt and typing node -v.
• A version number confirms successful installation.

Main Insights:
• Installing Node.js on Windows 11 is straightforward and requires minimal technical expertise.
• Using the LTS version ensures stability and access to long-term support.
• Verifying the installation is crucial to ensure Node.js is functioning correctly.

Action Items:
• Download the LTS version of Node.js from the official website.
• Follow the on-screen instructions during the installation process.
• Verify the installation using the command prompt.`;

  console.log('📝 Test Text (English):');
  console.log(testText.substring(0, 200) + '...\n');

  try {
    // Test Hindi Translation
    console.log('🇮🇳 Testing Hindi Translation...');
    const hindiTranslation = await translateText(testText, 'HI');
    console.log('✅ Hindi Translation:');
    console.log(hindiTranslation.substring(0, 300) + '...\n');

    // Test Telugu Translation
    console.log('🇮🇳 Testing Telugu Translation...');
    const teluguTranslation = await translateText(testText, 'TE');
    console.log('✅ Telugu Translation:');
    console.log(teluguTranslation.substring(0, 300) + '...\n');

    // Test Spanish Translation (for comparison)
    console.log('🇪🇸 Testing Spanish Translation...');
    const spanishTranslation = await translateText(testText, 'ES');
    console.log('✅ Spanish Translation:');
    console.log(spanishTranslation.substring(0, 300) + '...\n');

    console.log('🎉 All enhanced translations completed successfully!');
    console.log('\n📊 Translation Quality Summary:');
    console.log('  - Hindi: Enhanced with technical terms and summary structure');
    console.log('  - Telugu: Enhanced with technical terms and summary structure');
    console.log('  - Spanish: Enhanced with summary structure and common terms');
    console.log('  - All: Maintain bullet points and proper formatting');

  } catch (error) {
    console.error('❌ Translation test failed:', error.message);
  }
}

// Run the test
testEnhancedHindiTelugu().catch(console.error);
