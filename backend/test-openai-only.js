require('dotenv').config();
const { summarizeText } = require('./src/services/openaiService');

async function testOpenAIOnly() {
  console.log('🧪 Testing OpenAI Summarization Only...\n');
  
  // Check environment
  console.log('🔧 Environment Check:');
  console.log('  - OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'Configured' : 'Not configured');
  console.log('  - ENABLE_FALLBACK_SERVICES:', process.env.ENABLE_FALLBACK_SERVICES);
  console.log('  - SUMMARIZATION_SERVICE:', process.env.SUMMARIZATION_SERVICE);
  
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not configured in .env file');
    return;
  }
  
  const testTranscript = `Artificial intelligence (AI) is a branch of computer science that aims to create intelligent machines that work and react like humans. Some of the activities computers with artificial intelligence are designed for include speech recognition, learning, planning, and problem solving. AI has been used in various fields including healthcare, finance, transportation, and entertainment. Machine learning, a subset of AI, enables computers to learn and improve from experience without being explicitly programmed. Deep learning, another subset, uses neural networks with multiple layers to analyze various factors of data. The development of AI has the potential to revolutionize how we live and work, but it also raises important questions about ethics, privacy, and the future of human employment.`;
  
  try {
    console.log('\n📝 Testing OpenAI Summarization...');
    const summary = await summarizeText(testTranscript, {
      contentType: 'lecture',
      summaryStyle: 'bullet'
    });
    
    console.log('✅ OpenAI Summarization successful!');
    console.log('\n📋 Summary:');
    console.log(summary);
    
    // Check if asterisks were removed
    if (summary.includes('*')) {
      console.log('\n⚠️ Warning: Summary still contains asterisks');
    } else {
      console.log('\n✅ No asterisks found in summary - formatting cleaned successfully');
    }
    
  } catch (error) {
    console.error('\n❌ OpenAI summarization failed:', error.message);
    
    if (error.message.includes('quota')) {
      console.log('\n💡 This might be a quota issue. Check your OpenAI dashboard.');
    } else if (error.message.includes('authentication')) {
      console.log('\n💡 This might be an API key issue. Check your OPENAI_API_KEY.');
    }
  }
}

// Run the test
testOpenAIOnly().catch(console.error);
