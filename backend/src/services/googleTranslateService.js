const fetch = require('node-fetch');

// Google Translate API (free tier available)
// You can use it without API key for basic translations
async function translateText(text, targetLang) {
  try {
    // Method 1: Using Google Translate API (requires API key but has free tier)
    const GOOGLE_API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY;
    
    if (GOOGLE_API_KEY) {
      const url = `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_API_KEY}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          target: targetLang.toLowerCase(),
          source: 'en'
        })
      });
      
      const data = await response.json();
      if (data.data && data.data.translations && data.data.translations[0]) {
        return data.data.translations[0].translatedText;
      }
    }
    
    // Method 2: Using free Google Translate endpoint (no API key required)
    // Note: This is less reliable and may have rate limits
    const encodedText = encodeURIComponent(text);
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang.toLowerCase()}&dt=t&q=${encodedText}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data && data[0] && data[0][0] && data[0][0][0]) {
      return data[0][0][0];
    }
    
    throw new Error('Translation failed');
  } catch (error) {
    console.error('Google Translate error:', error);
    return `Translation failed: ${error.message}`;
  }
}

module.exports = { translateText };
