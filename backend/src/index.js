const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');
const { logger } = require('./utils/logger');

const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend static files (so you can open http://localhost:5500/)
const frontendPath = path.join(__dirname, '../../frontend');
app.use(express.static(frontendPath));

// Serve index.html for root path
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// API routes
app.use('/api', apiRoutes);

// Root
app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
  console.log('✅ AI Video Summarizer Server Started Successfully!');
  console.log(`🌐 Frontend: http://localhost:${PORT}`);
  console.log(`🔧 API Health: http://localhost:${PORT}/health`);
  console.log(`📄 PDF Export: Available at /api/export-pdf`);
  console.log('\n🎯 Features Available:');
  console.log('• 🎤 Custom Audio Transcription (WhisperX)');
  console.log('• 📝 OpenAI Text Summarization (GPT-4)');
  console.log('• 🌐 Custom Translation (MarianMT)');
  console.log('• 📄 PDF Export (Transcript, Summary, Translations)');
  console.log('• 💾 Local Processing (No API costs for transcription/translation)');
  console.log('\n🚀 Ready to process videos!');
});
