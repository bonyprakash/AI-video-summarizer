module.exports = {
  // Transcription model configuration
  transcription: {
    defaultModel: 'Xenova/whisper-tiny.en',
    models: {
      'tiny': 'Xenova/whisper-tiny.en',
      'small': 'Xenova/whisper-small.en',
      'base': 'Xenova/whisper-base.en',
      'medium': 'Xenova/whisper-medium.en'
    },
    parameters: {
      chunk_length_s: 30,
      stride_length_s: 5,
      return_timestamps: true,
      language: 'en'
    },
    fallbackModels: ['Xenova/whisper-small.en', 'Xenova/whisper-base.en']
  },

  // Summarization model configuration
  summarization: {
    defaultModel: 'Xenova/t5-small',
    models: {
      't5-small': 'Xenova/t5-small',
      't5-base': 'Xenova/t5-base',
      'bart-base': 'Xenova/bart-base',
      'pegasus-base': 'Xenova/pegasus-base'
    },
    parameters: {
      max_length: 150,
      min_length: 30,
      do_sample: false,
      num_beams: 4,
      temperature: 0.7,
      top_p: 0.9
    },
    contentTypes: {
      lecture: {
        max_length: 120,
        focus: ['concepts', 'definitions', 'examples', 'objectives']
      },
      meeting: {
        max_length: 100,
        focus: ['decisions', 'action_items', 'discussions', 'next_steps']
      },
      presentation: {
        max_length: 130,
        focus: ['key_messages', 'data', 'conclusions', 'recommendations']
      },
      interview: {
        max_length: 110,
        focus: ['questions', 'answers', 'insights', 'quotes']
      },
      news: {
        max_length: 90,
        focus: ['main_story', 'facts', 'timeline', 'implications']
      }
    },
    fallbackModels: ['Xenova/bart-base', 'Xenova/pegasus-base']
  },

  // Translation model configuration
  translation: {
    defaultModel: 'Xenova/marianmt-en-es',
    languagePairs: {
      'en-es': 'Xenova/marianmt-en-es',
      'en-fr': 'Xenova/marianmt-en-fr',
      'en-de': 'Xenova/marianmt-en-de',
      'en-it': 'Xenova/marianmt-en-it',
      'en-pt': 'Xenova/marianmt-en-pt',
      'en-ru': 'Xenova/marianmt-en-ru',
      'en-zh': 'Xenova/marianmt-en-zh',
      'en-ja': 'Xenova/marianmt-en-ja',
      'en-ko': 'Xenova/marianmt-en-ko',
      'en-ar': 'Xenova/marianmt-en-ar',
      'en-hi': 'Xenova/marianmt-en-hi',
      'en-te': 'Xenova/marianmt-en-te',
      'en-ta': 'Xenova/marianmt-en-ta',
      'en-bn': 'Xenova/marianmt-en-bn',
      'en-mr': 'Xenova/marianmt-en-mr',
      'en-gu': 'Xenova/marianmt-en-gu',
      'en-kn': 'Xenova/marianmt-en-kn',
      'en-ml': 'Xenova/marianmt-en-ml',
      'en-pa': 'Xenova/marianmt-en-pa'
    },
    parameters: {
      max_length: 512,
      do_sample: false,
      num_beams: 4,
      temperature: 0.6,
      top_p: 0.9
    },
    supportedLanguages: {
      'EN': 'English',
      'ES': 'Spanish',
      'FR': 'French',
      'DE': 'German',
      'IT': 'Italian',
      'PT': 'Portuguese',
      'RU': 'Russian',
      'ZH': 'Chinese',
      'JA': 'Japanese',
      'KO': 'Korean',
      'AR': 'Arabic',
      'HI': 'Hindi',
      'TE': 'Telugu',
      'TA': 'Tamil',
      'BN': 'Bengali',
      'MR': 'Marathi',
      'GU': 'Gujarati',
      'KN': 'Kannada',
      'ML': 'Malayalam',
      'PA': 'Punjabi'
    }
  },

  // Model loading and caching configuration
  loading: {
    quantized: true,
    progressCallback: true,
    cacheDir: './models',
    maxConcurrentModels: 3,
    modelTimeout: 30000, // 30 seconds
    retryAttempts: 3
  },

  // Training configuration
  training: {
    dataDir: './training-data',
    modelOutputDir: './models/fine-tuned',
    batchSize: 8,
    learningRate: 2e-5,
    epochs: 3,
    validationSplit: 0.1,
    earlyStoppingPatience: 3,
    maxGradNorm: 1.0,
    warmupSteps: 100
  },

  // Performance configuration
  performance: {
    enableGPU: false,
    enableQuantization: true,
    enablePruning: false,
    maxMemoryUsage: '2GB',
    enableParallelProcessing: true,
    chunkSize: 500,
    maxConcurrentRequests: 5
  },

  // Quality configuration
  quality: {
    minConfidence: 0.7,
    enablePostProcessing: true,
    enableSpellCheck: true,
    enableGrammarCheck: false,
    enableContentFiltering: true,
    maxOutputLength: 1000
  }
};
