require('dotenv').config();
const path = require('path');
const fs = require('fs');
const { extractAudio } = require('../services/ffmpegService');

// Choose service based on environment variable
const TRANSCRIPTION_SERVICE = process.env.TRANSCRIPTION_SERVICE || 'custom';
const SUMMARIZATION_SERVICE = process.env.SUMMARIZATION_SERVICE || 'openai';
const TRANSLATION_SERVICE = process.env.TRANSLATION_SERVICE || 'custom';
const ENABLE_FALLBACK_SERVICES = process.env.ENABLE_FALLBACK_SERVICES === 'true';

// Debug environment variables
console.log('🔧 Environment Configuration:');
console.log('  - TRANSCRIPTION_SERVICE:', TRANSCRIPTION_SERVICE);
console.log('  - SUMMARIZATION_SERVICE:', SUMMARIZATION_SERVICE);
console.log('  - TRANSLATION_SERVICE:', TRANSLATION_SERVICE);
console.log('  - ENABLE_FALLBACK_SERVICES:', ENABLE_FALLBACK_SERVICES);
console.log('  - OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'Configured' : 'Not configured');
console.log('  - GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Configured' : 'Not configured');

// Import custom services
const { transcribeAudio: customTranscribe } = require('../services/customTranscriptionService');
const { summarizeText: customSummarize } = require('../services/customSummarizationService');
const { translateText: customTranslate } = require('../services/enhancedTranslationService');

// Import fallback services (only if enabled)
let openaiTranscribe, openaiSummarize;
let transcribeAudioWithGemini, summarizeTextWithGemini, geminiTranslate;

if (ENABLE_FALLBACK_SERVICES) {
  console.log('🔄 Loading fallback services...');
  
  try {
    const openaiService = require('../services/openaiService');
    openaiTranscribe = openaiService.transcribeAudio;
    openaiSummarize = openaiService.summarizeText;
    console.log('✅ OpenAI fallback services loaded');
  } catch (error) {
    console.log('⚠️ OpenAI service not available for fallback:', error.message);
  }
  
  try {
    const geminiService = require('../services/geminiTranscribeService');
    transcribeAudioWithGemini = geminiService.transcribeAudioWithGemini;
    console.log('✅ Gemini transcription fallback service loaded');
  } catch (error) {
    console.log('⚠️ Gemini transcription service not available for fallback:', error.message);
  }
  
  try {
    const geminiSummarizeService = require('../services/geminiSummarizeService');
    summarizeTextWithGemini = geminiSummarizeService.summarizeTextWithGemini;
    console.log('✅ Gemini summarization fallback service loaded');
  } catch (error) {
    console.log('⚠️ Gemini summarization service not available for fallback:', error.message);
  }
  
  try {
    const geminiTranslateService = require('../services/geminiTranslateService');
    geminiTranslate = geminiTranslateService.translateText;
    console.log('✅ Gemini translation fallback service loaded');
  } catch (error) {
    console.log('⚠️ Gemini translation service not available for fallback:', error.message);
  }
} else {
  console.log('⚠️ Fallback services are disabled');
}

// Service selection functions
function getTranscriptionService() {
  switch (TRANSCRIPTION_SERVICE) {
    case 'custom':
      return customTranscribe;
    case 'openai':
      return openaiTranscribe || (() => { throw new Error('OpenAI service not available'); });
    case 'gemini':
      return transcribeAudioWithGemini || (() => { throw new Error('Gemini service not available'); });
    default:
      return customTranscribe;
  }
}

function getSummarizationService() {
  switch (SUMMARIZATION_SERVICE) {
    case 'custom':
      return customSummarize;
    case 'openai':
      return openaiSummarize || (() => { throw new Error('OpenAI service not available'); });
    case 'gemini':
      return summarizeTextWithGemini || (() => { throw new Error('Gemini service not available'); });
    default:
      return openaiSummarize || customSummarize;
  }
}

function getTranslationService() {
  switch (TRANSLATION_SERVICE) {
    case 'custom':
      return customTranslate;
    case 'gemini':
      return geminiTranslate || (() => { throw new Error('Gemini service not available'); });
    case 'google':
      return require('../services/googleTranslateService').translateText;
    case 'mymemory':
      return require('../services/myMemoryTranslateService').translateText;
    case 'libre':
      return require('../services/libreTranslateService').translateText;
    default:
      return customTranslate;
  }
}

const JOBS = {};

async function addJob(file, opts) {
  const jobId = 'job_' + Date.now();
  JOBS[jobId] = { id: jobId, status: 'queued', file: file.originalname, createdAt: new Date().toISOString() };

  // Start processing asynchronously
  processJob(jobId, file, opts).catch(err => {
    console.error('Job error', err);
    JOBS[jobId].status = 'error';
    JOBS[jobId].error = err.message;
  });

  return jobId;
}

function getJobStatus(jobId) {
  return JOBS[jobId];
}

async function processJob(jobId, file, opts) {
  JOBS[jobId].status = 'processing';
  
  // Use absolute paths to avoid path resolution issues
  const uploadPath = path.resolve(file.path);
  const audioName = jobId + '.wav';
  const audioPath = path.resolve(path.join(__dirname, '../../../uploads'), audioName);
  
  console.log('🔧 Job processing paths:');
  console.log('  - Upload path:', uploadPath);
  console.log('  - Audio path:', audioPath);
  console.log('  - File exists:', fs.existsSync(uploadPath));

  try {
    // 1) Extract audio
    await extractAudio(uploadPath, audioPath);
    JOBS[jobId].status = 'audio_extracted';

    // 2) Transcribe audio
    let transcript;
    const transcribeService = getTranscriptionService();
    console.log(`🎤 Using ${TRANSCRIPTION_SERVICE} for transcription...`);
    
    try {
      transcript = await transcribeService(audioPath);
      JOBS[jobId].transcript = transcript;
      JOBS[jobId].status = 'transcribed';
    } catch (error) {
      console.error('❌ Transcription failed:', error.message);
      
      if (ENABLE_FALLBACK_SERVICES && openaiTranscribe) {
        console.log('🔄 Trying OpenAI fallback...');
        try {
          transcript = await openaiTranscribe(audioPath);
          JOBS[jobId].transcript = transcript;
          JOBS[jobId].status = 'transcribed';
        } catch (fallbackError) {
          throw new Error(`Custom transcription failed: ${error.message}. OpenAI fallback also failed: ${fallbackError.message}`);
        }
      } else {
        throw new Error(`Custom transcription failed: ${error.message}. Fallback services are disabled.`);
      }
    }

    // 3) Summarize text using OpenAI (with automatic Gemini fallback)
    let summary;
    const summarizeService = getSummarizationService();
    console.log(`📝 Using ${SUMMARIZATION_SERVICE} for summarization...`);
    
    try {
      summary = await summarizeService(transcript, opts);
      JOBS[jobId].summary = summary;
      JOBS[jobId].status = 'summarized';
      console.log('✅ Summarization completed successfully');
    } catch (error) {
      console.error('❌ All summarization services failed:', error.message);
      throw new Error(`Summarization failed: ${error.message}`);
    }

    // 4) Translate summary using enhanced custom translation service
    const selectedLang = (opts.languages || 'EN').trim().toUpperCase();
    JOBS[jobId].translations = {};
    
    try {
      if (selectedLang === 'EN') {
        JOBS[jobId].translations[selectedLang] = summary;
        console.log('Summary kept in English (original)');
      } else {
        console.log(`🌐 Using ${TRANSLATION_SERVICE} to translate to ${selectedLang}...`);
        const translateService = getTranslationService();
        const translatedText = await translateService(summary, selectedLang);
        JOBS[jobId].translations[selectedLang] = translatedText;
        console.log(`Translation to ${selectedLang} completed successfully`);
      }
    } catch (e) {
      console.error(`Translation error for ${selectedLang}:`, e);
      JOBS[jobId].translations[selectedLang] = `Translation failed: ${e.message}`;
    }

    JOBS[jobId].status = 'done';
    JOBS[jobId].finishedAt = new Date().toISOString();
    console.log('🎉 Job processing completed successfully!');
  } finally {
    // cleanup local files
    try { fs.unlinkSync(uploadPath); } catch (e) {}
    try { fs.unlinkSync(audioPath); } catch (e) {}
  }
}

module.exports = { addJob, getJobStatus };
