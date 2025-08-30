const fetch = require('node-fetch');

// MyMemory Translation API - Free translation service
// No API key required, but has rate limits
async function translateText(text, targetLang) {
  try {
    const encodedText = encodeURIComponent(text);
    const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=en|${targetLang.toLowerCase()}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data && data.responseData && data.responseData.translatedText) {
      return data.responseData.translatedText;
    }
    
    throw new Error('Translation failed');
  } catch (error) {
    console.error('MyMemory Translate error:', error);
    return `Translation failed: ${error.message}`;
  }
}

module.exports = { translateText };
