const express = require('express');
const cors = require('cors');
const path = require('path');

// Simple test server
const app = express();
app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Video Summarizer API is working!',
    timestamp: new Date().toISOString(),
    customModels: 'Ready to use'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    port: process.env.PORT || 5500,
    services: {
      transcription: 'custom',
      summarization: 'custom',
      translation: 'custom'
    }
  });
});

// Serve frontend
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
  console.log(`🚀 Video Summarizer Server running on port ${PORT}`);
  console.log(`📱 Frontend: http://localhost:${PORT}`);
  console.log(`🔧 API Health: http://localhost:${PORT}/health`);
  console.log(`🧪 Test API: http://localhost:${PORT}/test`);
  console.log('\n✅ Server is ready! You can now:');
  console.log('1. Open http://localhost:5500 in your browser');
  console.log('2. Upload a video file');
  console.log('3. Get AI-powered summary with custom models');
});

module.exports = app;
