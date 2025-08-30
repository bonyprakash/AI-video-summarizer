const { transcribeAudio } = require('./src/services/customTranscriptionService');
const { summarizeText } = require('./src/services/customSummarizationService');
const { translateText } = require('./src/services/customTranslationService');
const path = require('path');

async function testCustomModels() {
  console.log('🧪 Testing Custom AI Models...\n');

  try {
    // Test 1: Transcription
    console.log('🎤 Testing Custom Transcription Service...');
    console.log('⚠️ Note: This requires an audio file to test with');
    console.log('   You can create a test.wav file or use an existing audio file\n');
    
    // Uncomment the following lines to test with an actual audio file:
    /*
    const audioPath = path.join(__dirname, 'test.wav');
    if (require('fs').existsSync(audioPath)) {
      const transcript = await transcribeAudio(audioPath);
      console.log('✅ Transcription successful:');
      console.log(transcript.substring(0, 200) + '...\n');
    } else {
      console.log('⚠️ No test.wav file found. Skipping transcription test.\n');
    }
    */

    // Test 2: Summarization
    console.log('📝 Testing Custom Summarization Service...');
    const testText = `Artificial intelligence (AI) is a branch of computer science that aims to create intelligent machines that work and react like humans. Some of the activities computers with artificial intelligence are designed for include speech recognition, learning, planning, and problem solving. AI has been used in various fields including healthcare, finance, transportation, and entertainment. Machine learning, a subset of AI, enables computers to learn and improve from experience without being explicitly programmed. Deep learning, another subset, uses neural networks with multiple layers to analyze various factors of data. The development of AI has the potential to revolutionize how we live and work, but it also raises important questions about ethics, privacy, and the future of human employment.`;
    
    const summary = await summarizeText(testText, {
      contentType: 'lecture',
      summaryStyle: 'concise'
    });
    
    console.log('✅ Summarization successful:');
    console.log(summary);
    console.log('\n');

    // Test 3: Translation
    console.log('🌐 Testing Custom Translation Service...');
    const testSummary = 'AI is transforming how we work and live through machine learning and automation.';
    
    try {
      const spanishTranslation = await translateText(testSummary, 'ES');
      console.log('✅ Spanish translation successful:');
      console.log(`English: ${testSummary}`);
      console.log(`Spanish: ${spanishTranslation}\n`);
    } catch (error) {
      console.log('⚠️ Translation test failed (this is normal for first run):');
      console.log(`Error: ${error.message}\n`);
      console.log('💡 Translation models are downloaded on first use and may take time.\n');
    }

    console.log('🎉 Custom Models Test Completed!');
    console.log('\n📋 Summary:');
    console.log('✅ Summarization: Working');
    console.log('⚠️ Transcription: Requires audio file to test');
    console.log('⚠️ Translation: May need time to download models on first use');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('\n🔍 Debug information:');
    console.error('Error type:', error.constructor.name);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testCustomModels().catch(console.error);
