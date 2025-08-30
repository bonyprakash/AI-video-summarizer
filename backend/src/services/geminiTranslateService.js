const fetch = require('node-fetch');

// Gemini Translation Service using Google's Gemini API
async function translateText(text, targetLang) {
  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    // Map language codes to full names for better Gemini understanding
    const languageMap = {
      'EN': 'English',
      'FR': 'French',
      'ES': 'Spanish',
      'DE': 'German',
      'IT': 'Italian',
      'PT': 'Portuguese',
      'RU': 'Russian',
      'JA': 'Japanese',
      'KO': 'Korean',
      'ZH': 'Chinese',
      'AR': 'Arabic',
      'HI': 'Hindi'
    };

    const targetLanguage = languageMap[targetLang.toUpperCase()] || targetLang;

    const prompt = `Translate the following text to ${targetLanguage}. Maintain the original formatting, structure, and meaning. Only provide the translated text without any additional explanations or notes:

${text}`;

    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    };

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
      return data.candidates[0].content.parts[0].text.trim();
    } else {
      throw new Error('Invalid response format from Gemini API');
    }

  } catch (error) {
    console.error('Gemini Translate error:', error);
    return `Translation failed: ${error.message}`;
  }
}

module.exports = { translateText };
