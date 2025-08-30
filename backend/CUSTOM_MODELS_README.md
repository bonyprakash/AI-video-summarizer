# Custom AI Models for Video Summarizer

This document explains the custom AI model implementation that replaces external APIs (OpenAI, Gemini) with locally hosted models for transcription, summarization, and translation.

## 🎯 Overview

The custom model system provides:
- **Local Processing**: No external API calls required
- **Cost Effective**: No per-request charges
- **Privacy**: Data stays on your server
- **Customizable**: Can be fine-tuned for specific domains
- **Fallback Support**: Automatic fallback to external APIs if needed

## 🏗️ Architecture

### Model Components

1. **Custom Transcription Service** (`customTranscriptionService.js`)
   - Uses WhisperX models for audio-to-text conversion
   - Supports multiple model sizes (tiny, small, base, medium)
   - Includes timestamp extraction

2. **Custom Summarization Service** (`customSummarizationService.js`)
   - Uses T5/BART models for text summarization
   - Supports different content types (lecture, meeting, presentation, etc.)
   - Includes key point extraction and insights

3. **Custom Translation Service** (`customTranslationService.js`)
   - Uses MarianMT models for multi-language translation
   - Supports 20+ languages including Indian languages
   - Batch translation capabilities

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Download Models

```bash
# Download all models
npm run download-models

# Or download specific model types
npm run download-models transcription
npm run download-models summarization
npm run download-models translation
```

### 3. Configure Environment

Create a `.env` file:

```env
# Choose which services to use
TRANSCRIPTION_SERVICE=custom
SUMMARIZATION_SERVICE=custom
TRANSLATION_SERVICE=custom

# Fallback to external APIs if needed
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key
```

### 4. Start the Server

```bash
npm start
```

## 📊 Model Configuration

### Transcription Models

| Model | Size | Speed | Accuracy | Use Case |
|-------|------|-------|----------|----------|
| whisper-tiny.en | ~39MB | Fast | Good | Real-time processing |
| whisper-small.en | ~244MB | Medium | Better | Standard use |
| whisper-base.en | ~461MB | Slower | Best | High accuracy needed |

### Summarization Models

| Model | Size | Quality | Speed | Best For |
|-------|------|---------|-------|----------|
| t5-small | ~60MB | Good | Fast | General purpose |
| t5-base | ~220MB | Better | Medium | Balanced performance |
| bart-base | ~500MB | Best | Slower | High quality summaries |

### Translation Models

Supports 20+ language pairs including:
- European: Spanish, French, German, Italian, Portuguese, Russian
- Asian: Chinese, Japanese, Korean, Arabic
- Indian: Hindi, Telugu, Tamil, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi

## 🎓 Training Custom Models

### 1. Prepare Training Data

```bash
# Generate sample training data
npm run train prepare-data
```

### 2. Fine-tune Models

```bash
# Train all models
npm run train

# Train specific models
npm run train train-summarization
npm run train train-translation
```

### 3. Training Data Format

#### Summarization Training Data
```json
{
  "input": "Long text to summarize...",
  "summary": "Short summary...",
  "content_type": "lecture",
  "style": "concise"
}
```

#### Translation Training Data
```json
{
  "source": "English text",
  "target": "Translated text",
  "source_lang": "en",
  "target_lang": "es"
}
```

## ⚙️ Configuration Options

### Model Parameters

Edit `src/config/customModels.js` to customize:

```javascript
// Transcription settings
transcription: {
  defaultModel: 'Xenova/whisper-tiny.en',
  parameters: {
    chunk_length_s: 30,
    stride_length_s: 5,
    return_timestamps: true
  }
}

// Summarization settings
summarization: {
  parameters: {
    max_length: 150,
    min_length: 30,
    num_beams: 4,
    temperature: 0.7
  }
}
```

### Performance Settings

```javascript
performance: {
  enableGPU: false,
  enableQuantization: true,
  maxMemoryUsage: '2GB',
  maxConcurrentRequests: 5
}
```

## 🔄 Service Selection

The system automatically chooses services based on environment variables:

```env
# Use custom models (default)
TRANSCRIPTION_SERVICE=custom
SUMMARIZATION_SERVICE=custom
TRANSLATION_SERVICE=custom

# Use external APIs
TRANSCRIPTION_SERVICE=openai
SUMMARIZATION_SERVICE=gemini
TRANSLATION_SERVICE=google

# Mixed approach
TRANSCRIPTION_SERVICE=custom
SUMMARIZATION_SERVICE=openai
TRANSLATION_SERVICE=custom
```

## 🛠️ API Usage

### Transcription

```javascript
const { transcribeAudio } = require('./services/customTranscriptionService');

// Basic transcription
const transcript = await transcribeAudio('audio.wav');

// With timestamps
const result = await transcribeWithTimestamps('audio.wav');
console.log(result.text);
console.log(result.chunks);
```

### Summarization

```javascript
const { summarizeText } = require('./services/customSummarizationService');

const summary = await summarizeText(transcript, {
  contentType: 'lecture',
  summaryStyle: 'detailed'
});
```

### Translation

```javascript
const { translateText } = require('./services/customTranslationService');

const translated = await translateText(summary, 'ES'); // Spanish
const translated = await translateText(summary, 'TE'); // Telugu
```

## 📈 Performance Optimization

### 1. Model Caching

Models are automatically cached after first load:

```javascript
// First call - loads model
await transcribeAudio('audio1.wav');

// Subsequent calls - uses cached model
await transcribeAudio('audio2.wav');
```

### 2. Memory Management

```javascript
// Configure memory usage
performance: {
  maxMemoryUsage: '2GB',
  enableQuantization: true
}
```

### 3. Parallel Processing

```javascript
// Enable parallel processing
performance: {
  enableParallelProcessing: true,
  maxConcurrentRequests: 5
}
```

## 🔍 Monitoring and Debugging

### Model Status

```javascript
// Check if models are loaded
const { CustomTranscriptionService } = require('./services/customTranscriptionService');
const service = new CustomTranscriptionService();
console.log(service.isModelLoaded);
```

### Performance Metrics

```javascript
// Monitor processing time
const startTime = Date.now();
const result = await transcribeAudio('audio.wav');
const processingTime = Date.now() - startTime;
console.log(`Processing time: ${processingTime}ms`);
```

## 🚨 Troubleshooting

### Common Issues

1. **Model Loading Fails**
   ```bash
   # Clear model cache
   rm -rf ./models
   npm run download-models
   ```

2. **Out of Memory**
   ```javascript
   // Use smaller models
   transcription: {
     defaultModel: 'Xenova/whisper-tiny.en'
   }
   ```

3. **Slow Performance**
   ```javascript
   // Enable quantization
   performance: {
     enableQuantization: true
   }
   ```

### Fallback Strategy

The system automatically falls back to external APIs if custom models fail:

1. Try custom model
2. If fails, try OpenAI
3. If fails, try Gemini
4. Return error if all fail

## 🔮 Future Enhancements

### Planned Features

1. **GPU Acceleration**: CUDA support for faster processing
2. **Model Compression**: Further size optimization
3. **Domain-Specific Models**: Pre-trained for specific industries
4. **Real-time Processing**: Streaming audio support
5. **Multi-modal Models**: Video + audio processing

### Custom Model Development

To add new models:

1. Add model configuration to `customModels.js`
2. Implement service in `custom*Service.js`
3. Update service selection in `jobProcessor.js`
4. Add training data and scripts

## 📚 Resources

- [Transformers.js Documentation](https://huggingface.co/docs/transformers.js)
- [Whisper Model Guide](https://openai.com/research/whisper)
- [T5 Paper](https://arxiv.org/abs/1910.10683)
- [MarianMT Documentation](https://marian-nmt.github.io/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add your custom model implementation
4. Update documentation
5. Submit a pull request

## 📄 License

This custom model implementation is part of the Video Summarizer project and follows the same license terms.
