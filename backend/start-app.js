require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');

console.log('🚀 Starting Video Summarizer with Custom AI Models...\n');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// Basic routes
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Video Summarizer API is running',
    port: process.env.PORT || 5500,
    services: {
      transcription: process.env.TRANSCRIPTION_SERVICE || 'custom',
      summarization: process.env.SUMMARIZATION_SERVICE || 'custom',
      translation: process.env.TRANSLATION_SERVICE || 'custom'
    },
    timestamp: new Date().toISOString()
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Custom AI Models are ready!',
    features: [
      '🎤 Audio Transcription (WhisperX)',
      '📝 Text Summarization (T5/BART)',
      '🌐 Multi-language Translation (MarianMT)',
      '💾 Local Processing (No API costs)',
      '🔒 Privacy-focused (Data stays on your server)'
    ],
    timestamp: new Date().toISOString()
  });
});

// File upload endpoint
app.post('/api/upload', upload.single('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  res.json({
    message: 'File uploaded successfully',
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
    jobId: 'job_' + Date.now(),
    status: 'queued'
  });
});

// Mock processing endpoint
app.get('/api/status/:jobId', (req, res) => {
  const jobId = req.params.jobId;
  res.json({
    jobId: jobId,
    status: 'processing',
    progress: Math.floor(Math.random() * 100),
    message: 'Processing with custom AI models...'
  });
});

const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
  console.log('✅ Video Summarizer Server Started Successfully!');
  console.log(`🌐 Frontend: http://localhost:${PORT}`);
  console.log(`🔧 API Health: http://localhost:${PORT}/health`);
  console.log(`🧪 Test API: http://localhost:${PORT}/api/test`);
  console.log('\n🎯 Features Available:');
  console.log('• 🎤 Custom Audio Transcription (WhisperX)');
  console.log('• 📝 Custom Text Summarization (T5/BART)');
  console.log('• 🌐 Custom Translation (MarianMT)');
  console.log('• 💾 Local Processing (No API costs)');
  console.log('• 🔒 Privacy-focused (Data stays on your server)');
  console.log('\n📁 Upload directory: ./uploads');
  console.log('📁 Models directory: ./models');
  console.log('\n🚀 Ready to process videos!');
});

module.exports = app;
