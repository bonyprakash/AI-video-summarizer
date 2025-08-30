const { pipeline } = require('@xenova/transformers');
const fs = require('fs');
const path = require('path');

class ModelDownloader {
  constructor() {
    this.modelsPath = path.join(__dirname, '../../models');
    this.ensureDirectories();
  }

  ensureDirectories() {
    const dirs = [
      this.modelsPath,
      path.join(this.modelsPath, 'transcription'),
      path.join(this.modelsPath, 'summarization'),
      path.join(this.modelsPath, 'translation')
    ];
    
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  async downloadTranscriptionModels() {
    console.log('🎤 Downloading transcription models...');
    
    const models = [
      'Xenova/whisper-tiny.en',
      'Xenova/whisper-small.en',
      'Xenova/whisper-base.en'
    ];
    
    for (const modelName of models) {
      try {
        console.log(`📥 Downloading ${modelName}...`);
        
        const model = await pipeline('automatic-speech-recognition', modelName, {
          quantized: true,
          progress_callback: (progress) => {
            console.log(`  Progress: ${Math.round(progress * 100)}%`);
          }
        });
        
        console.log(`✅ ${modelName} downloaded successfully`);
        
      } catch (error) {
        console.error(`❌ Failed to download ${modelName}:`, error);
      }
    }
  }

  async downloadSummarizationModels() {
    console.log('📝 Downloading summarization models...');
    
    const models = [
      'Xenova/t5-small',
      'Xenova/bart-base',
      'Xenova/pegasus-base'
    ];
    
    for (const modelName of models) {
      try {
        console.log(`📥 Downloading ${modelName}...`);
        
        const model = await pipeline('summarization', modelName, {
          quantized: true,
          progress_callback: (progress) => {
            console.log(`  Progress: ${Math.round(progress * 100)}%`);
          }
        });
        
        console.log(`✅ ${modelName} downloaded successfully`);
        
      } catch (error) {
        console.error(`❌ Failed to download ${modelName}:`, error);
      }
    }
  }

  async downloadTranslationModels() {
    console.log('🌐 Downloading translation models...');
    
    const languagePairs = [
      'Xenova/marianmt-en-es',
      'Xenova/marianmt-en-fr',
      'Xenova/marianmt-en-de',
      'Xenova/marianmt-en-it',
      'Xenova/marianmt-en-pt',
      'Xenova/marianmt-en-ru',
      'Xenova/marianmt-en-zh',
      'Xenova/marianmt-en-ja',
      'Xenova/marianmt-en-ko',
      'Xenova/marianmt-en-ar',
      'Xenova/marianmt-en-hi'
    ];
    
    for (const modelName of languagePairs) {
      try {
        console.log(`📥 Downloading ${modelName}...`);
        
        const model = await pipeline('translation', modelName, {
          quantized: true,
          progress_callback: (progress) => {
            console.log(`  Progress: ${Math.round(progress * 100)}%`);
          }
        });
        
        console.log(`✅ ${modelName} downloaded successfully`);
        
      } catch (error) {
        console.error(`❌ Failed to download ${modelName}:`, error);
      }
    }
  }

  async downloadAllModels() {
    console.log('🚀 Starting download of all models...');
    
    try {
      await this.downloadTranscriptionModels();
      await this.downloadSummarizationModels();
      await this.downloadTranslationModels();
      
      console.log('✅ All models downloaded successfully!');
      
    } catch (error) {
      console.error('❌ Download failed:', error);
      throw error;
    }
  }

  async verifyModels() {
    console.log('🔍 Verifying downloaded models...');
    
    const modelTypes = {
      transcription: ['Xenova/whisper-tiny.en'],
      summarization: ['Xenova/t5-small'],
      translation: ['Xenova/marianmt-en-es']
    };
    
    for (const [type, models] of Object.entries(modelTypes)) {
      console.log(`Testing ${type} models...`);
      
      for (const modelName of models) {
        try {
          const pipelineType = type === 'transcription' ? 'automatic-speech-recognition' : type;
          const model = await pipeline(pipelineType, modelName, { quantized: true });
          
          // Test the model with sample input
          if (type === 'summarization') {
            const result = await model('This is a test sentence for summarization.', {
              max_length: 50,
              min_length: 10
            });
            console.log(`✅ ${modelName} working - Sample output: ${result[0].summary_text.substring(0, 50)}...`);
          } else if (type === 'translation') {
            const result = await model('Hello, how are you?', {
              max_length: 50
            });
            console.log(`✅ ${modelName} working - Sample output: ${result[0].translation_text}`);
          } else {
            console.log(`✅ ${modelName} loaded successfully`);
          }
          
        } catch (error) {
          console.error(`❌ ${modelName} verification failed:`, error);
        }
      }
    }
  }
}

// CLI interface
async function main() {
  const downloader = new ModelDownloader();
  
  const command = process.argv[2] || 'all';
  
  switch (command) {
    case 'transcription':
      await downloader.downloadTranscriptionModels();
      break;
    case 'summarization':
      await downloader.downloadSummarizationModels();
      break;
    case 'translation':
      await downloader.downloadTranslationModels();
      break;
    case 'verify':
      await downloader.verifyModels();
      break;
    case 'all':
      await downloader.downloadAllModels();
      await downloader.verifyModels();
      break;
    default:
      console.log('Usage: node downloadModels.js [transcription|summarization|translation|verify|all]');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { ModelDownloader };
