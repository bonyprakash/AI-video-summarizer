const fs = require('fs');
const path = require('path');
const { pipeline } = require('@xenova/transformers');
const wav = require('wav');

class CustomTranscriptionService {
  constructor() {
    this.isModelLoaded = false;
    this.model = null;
    this.modelName = 'Xenova/whisper-tiny.en'; // Lightweight English model
  }

  async loadModel() {
    if (this.isModelLoaded && this.model) return;

    try {
      console.log('🎤 Loading custom transcription model...');
      console.log(`📦 Using model: ${this.modelName}`);
      
      // Load the Whisper model
      this.model = await pipeline('automatic-speech-recognition', this.modelName);
      this.isModelLoaded = true;
      
      console.log('✅ Custom transcription model loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load custom transcription model:', error);
      throw new Error(`Model loading failed: ${error.message}`);
    }
  }

  readWavFile(filePath) {
    return new Promise((resolve, reject) => {
      const reader = new wav.Reader();
      const audioData = [];
      let format = null;
      
      reader.on('format', (fmt) => {
        format = fmt;
        console.log('🎵 Audio format:', format);
      });
      
      reader.on('data', (chunk) => {
        audioData.push(chunk);
      });
      
      reader.on('end', () => {
        const buffer = Buffer.concat(audioData);
        console.log('📊 Audio data loaded, size:', buffer.length, 'bytes');
        
        // Convert buffer to proper format for Whisper
        const samples = new Int16Array(buffer.buffer, buffer.byteOffset, buffer.length / 2);
        const float32Array = new Float32Array(samples.length);
        
        // Convert 16-bit integers to float32 (-1 to 1 range)
        for (let i = 0; i < samples.length; i++) {
          float32Array[i] = samples[i] / 32768.0;
        }
        
        console.log('🔄 Converted to Float32Array, samples:', float32Array.length);
        resolve({ audioData: float32Array, format });
      });
      
      reader.on('error', (error) => {
        reject(error);
      });
      
      fs.createReadStream(filePath).pipe(reader);
    });
  }

  async transcribeAudio(audioPath) {
    try {
      await this.loadModel();
      
      console.log('🎤 Transcribing audio with custom model...');
      
      // Check if audio file exists
      if (!fs.existsSync(audioPath)) {
        throw new Error(`Audio file not found: ${audioPath}`);
      }
      
      // Get file stats
      const stats = fs.statSync(audioPath);
      console.log('🎵 Audio file found, size:', stats.size, 'bytes');
      
      // Read and convert audio data
      console.log('🔄 Reading and converting audio data...');
      const { audioData, format } = await this.readWavFile(audioPath);
      
      // Calculate audio duration
      const durationSeconds = audioData.length / format.sampleRate;
      console.log(`⏱️ Audio duration: ${durationSeconds.toFixed(2)} seconds`);
      
      // For longer audio, use chunking with timestamps
      if (durationSeconds > 30) {
        console.log('🔄 Processing long audio with chunking...');
        const result = await this.model(audioData, {
          chunk_length_s: 30,
          stride_length_s: 5,
          return_timestamps: true
        });
        
        const transcript = result.text;
        console.log('✅ Custom transcription completed');
        console.log(`📝 Transcript length: ${transcript.length} characters`);
        
        return transcript;
      } else {
        // For shorter audio, process normally
        console.log('🔄 Processing audio with Whisper model...');
        const result = await this.model(audioData);
        
        const transcript = result.text;
        console.log('✅ Custom transcription completed');
        console.log(`📝 Transcript length: ${transcript.length} characters`);
        
        return transcript;
      }
      
    } catch (error) {
      console.error('❌ Custom transcription failed:', error);
      throw new Error(`Custom transcription failed: ${error.message}`);
    }
  }

  async transcribeWithTimestamps(audioPath) {
    try {
      await this.loadModel();
      
      console.log('🎤 Transcribing audio with timestamps...');
      
      // Check if audio file exists
      if (!fs.existsSync(audioPath)) {
        throw new Error(`Audio file not found: ${audioPath}`);
      }
      
      // Get file stats
      const stats = fs.statSync(audioPath);
      console.log('🎵 Audio file found, size:', stats.size, 'bytes');
      
      // Read and convert audio data
      console.log('🔄 Reading and converting audio data...');
      const { audioData, format } = await this.readWavFile(audioPath);
      
      // Calculate audio duration
      const durationSeconds = audioData.length / format.sampleRate;
      console.log(`⏱️ Audio duration: ${durationSeconds.toFixed(2)} seconds`);
      
      // Transcribe with timestamps
      console.log('🔄 Processing audio with Whisper model (timestamps)...');
      const result = await this.model(audioData, {
        chunk_length_s: 30,
        stride_length_s: 5,
        return_timestamps: true
      });
      
      const transcript = result.text;
      const chunks = result.chunks || [];
      
      console.log('✅ Custom transcription with timestamps completed');
      console.log(`📝 Transcript length: ${transcript.length} characters`);
      console.log(`⏱️ Number of chunks: ${chunks.length}`);
      
      return {
        text: transcript,
        chunks: chunks.map(chunk => ({
          text: chunk.text,
          timestamp: [chunk.timestamp[0], chunk.timestamp[1]]
        }))
      };
      
    } catch (error) {
      console.error('❌ Custom transcription with timestamps failed:', error);
      throw new Error(`Custom transcription failed: ${error.message}`);
    }
  }

  // Helper method to get model info
  getModelInfo() {
    return {
      name: this.modelName,
      loaded: this.isModelLoaded,
      type: 'Whisper Speech Recognition'
    };
  }
}

// Create singleton instance
const transcriptionService = new CustomTranscriptionService();

module.exports = { 
  transcribeAudio: (audioPath) => transcriptionService.transcribeAudio(audioPath),
  transcribeWithTimestamps: (audioPath) => transcriptionService.transcribeWithTimestamps(audioPath),
  getModelInfo: () => transcriptionService.getModelInfo(),
  CustomTranscriptionService 
};
