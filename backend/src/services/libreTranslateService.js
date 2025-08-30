const fetch = require('node-fetch');

// LibreTranslate - Free and open-source translation service
// You can use their public API or host your own instance
async function translateText(text, targetLang) {
  try {
    // Using LibreTranslate public API (free, no API key required)
    const response = await fetch('https://libretranslate.de/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: 'en',
        target: targetLang.toLowerCase(),
        format: 'text'
      })
    });
    
    const data = await response.json();
    if (data && data.translatedText) {
      return data.translatedText;
    }
    
    throw new Error('Translation failed');
  } catch (error) {
    console.error('LibreTranslate error:', error);
    return `Translation failed: ${error.message}`;
  }
}

module.exports = { translateText };
