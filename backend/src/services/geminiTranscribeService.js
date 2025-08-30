const fs = require('fs');
const path = require('path');

async function transcribeAudioWithGemini(audioPath) {
  try {
    console.log('🎤 Using Gemini for transcription...');
    
    // Read the audio file as base64
    const audioBuffer = fs.readFileSync(audioPath);
    const base64Audio = audioBuffer.toString('base64');
    
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }
    
    // Use Gemini's audio transcription capability
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: "Please transcribe this audio file accurately. Return only the transcribed text without any additional formatting or commentary."
          }, {
            inline_data: {
              mime_type: "audio/wav",
              data: base64Audio
            }
          }]
        }]
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API error: ${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
    const transcription = data.candidates[0].content.parts[0].text;
    
    console.log('✅ Gemini transcription completed');
    return transcription;
    
  } catch (error) {
    console.error('❌ Gemini transcription failed:', error);
    throw new Error(`Gemini transcription failed: ${error.message}`);
  }
}

module.exports = { transcribeAudioWithGemini };
