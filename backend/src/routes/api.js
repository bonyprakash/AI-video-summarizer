const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { handleUpload } = require('../controllers/uploadController');
const { getSummaryStatus } = require('../controllers/summaryController');
const { generatePDF } = require('../services/pdfExportService');

const router = express.Router();

// Configure multer for video uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

// Video upload endpoint
router.post('/upload', upload.single('video'), handleUpload);

// Job status endpoint
router.get('/status/:jobId', getSummaryStatus);

// PDF export endpoint
router.post('/export-pdf', async (req, res) => {
  try {
    const {
      transcript,
      summary,
      translations,
      fileName,
      contentType,
      summaryStyle
    } = req.body;

    console.log('📄 PDF export request received');
    console.log('📊 Request data:', {
      hasTranscript: !!transcript,
      hasSummary: !!summary,
      translationCount: Object.keys(translations || {}).length,
      fileName,
      contentType,
      summaryStyle
    });

    if (!transcript && !summary && Object.keys(translations || {}).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No content provided for PDF export'
      });
    }

    // Generate PDF
    const pdfData = await generatePDF({
      transcript: transcript || '',
      summary: summary || '',
      translations: translations || {},
      fileName: fileName || 'video-summary',
      contentType: contentType || 'lecture',
      summaryStyle: summaryStyle || 'bullet'
    });

    // Validate PDF data thoroughly
    if (!pdfData || !pdfData.pdfBuffer || pdfData.pdfBuffer.length === 0) {
      throw new Error('Generated PDF data is invalid or empty');
    }

    // Check if PDF buffer is reasonable size
    if (pdfData.pdfBuffer.length < 100) {
      throw new Error('Generated PDF buffer is too small to be valid');
    }

    console.log(`📊 PDF validation passed - Size: ${pdfData.size} bytes`);

    // Ensure the buffer is properly formatted
    const buffer = Buffer.from(pdfData.pdfBuffer);
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${pdfData.fileName}"`);
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Send PDF buffer
    res.end(buffer);

    console.log('✅ PDF exported successfully');

  } catch (error) {
    console.error('❌ PDF export failed:', error);
    
    // Send error response
    res.status(500).json({
      success: false,
      error: `PDF export failed: ${error.message}`,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'AI Video Summarizer API'
  });
});

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API is working correctly!',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
