const { transcribeAudio } = require('./src/services/customTranscriptionService');
const path = require('path');

async function testTranscription() {
  console.log('🧪 Testing Fixed Transcription Service...\n');

  try {
    // Check if there's a test audio file
    const testAudioPath = path.join(__dirname, 'test.wav');
    const fs = require('fs');
    
    if (fs.existsSync(testAudioPath)) {
      console.log('✅ Found test audio file:', testAudioPath);
      console.log('🎤 Testing transcription...\n');
      
      const transcript = await transcribeAudio(testAudioPath);
      console.log('🎉 Transcription successful!');
      console.log('📝 Full Transcript:');
      console.log('='.repeat(50));
      console.log(transcript);
      console.log('='.repeat(50));
      console.log(`📊 Transcript length: ${transcript.length} characters`);
      
      // Check if transcript contains only special characters
      const hasOnlySpecialChars = /^[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?\s]*$/.test(transcript);
      if (hasOnlySpecialChars) {
        console.log('⚠️ Warning: Transcript contains only special characters or is empty');
      } else {
        console.log('✅ Transcript contains readable text');
      }
    } else {
      console.log('⚠️ No test.wav file found in backend directory');
      console.log('💡 To test transcription:');
      console.log('   1. Place a test.wav file in the backend folder');
      console.log('   2. Or use an existing audio file from uploads folder\n');
      
      // Check if there are any audio files in uploads
      const uploadsDir = path.join(__dirname, '../uploads');
      if (fs.existsSync(uploadsDir)) {
        const files = fs.readdirSync(uploadsDir);
        const audioFiles = files.filter(file => file.endsWith('.wav'));
        
        if (audioFiles.length > 0) {
          console.log('🎵 Found audio files in uploads folder:');
          audioFiles.forEach(file => console.log(`   - ${file}`));
          console.log('\n💡 You can test with one of these files by copying it to backend/test.wav');
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('\n🔍 Debug information:');
    console.error('Error type:', error.constructor.name);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testTranscription().catch(console.error);
