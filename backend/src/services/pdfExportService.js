const fs = require('fs');
const path = require('path');

class PDFExportService {
  constructor() {
    this.isServiceReady = false;
    this.browser = null;
    this.browserPromise = null;
  }

  async getBrowser() {
    if (this.browser && this.browser.isConnected()) {
      return this.browser;
    }
    
    if (this.browserPromise) {
      return this.browserPromise;
    }
    
    this.browserPromise = this.launchBrowser();
    return this.browserPromise;
  }

  async launchBrowser() {
    try {
      console.log('📄 Launching Puppeteer browser...');
      
      const puppeteer = require('puppeteer');
      
      // Use more stable settings for Windows
      const browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--no-first-run',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-features=TranslateUI',
          '--disable-ipc-flooding-protection'
        ],
        ignoreDefaultArgs: ['--disable-extensions'],
        timeout: 30000
      });
      
      this.browser = browser;
      this.isServiceReady = true;
      console.log('✅ Browser launched successfully');
      
      return browser;
    } catch (error) {
      console.error('❌ Failed to launch browser:', error);
      this.browserPromise = null;
      throw new Error(`Browser launch failed: ${error.message}`);
    }
  }

  async generatePDF(data, options = {}) {
    try {
      console.log('📄 Starting PDF generation...');
      
      const {
        transcript = '',
        summary = '',
        translations = {},
        fileName = 'video-summary',
        contentType = 'lecture',
        summaryStyle = 'bullet'
      } = data;

      // Create HTML content
      const htmlContent = this.createHTMLContent({
        transcript,
        summary,
        translations,
        contentType,
        summaryStyle
      });

      // Generate PDF
      const pdfBuffer = await this.convertHTMLToPDF(htmlContent);
      
      // Validate PDF buffer
      if (!pdfBuffer || pdfBuffer.length === 0) {
        throw new Error('Generated PDF buffer is empty');
      }

      if (pdfBuffer.length < 100) {
        throw new Error('Generated PDF buffer is too small');
      }

      // Create filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const finalFileName = `${fileName}-${timestamp}.pdf`;
      
      console.log('✅ PDF generated successfully');
      console.log(`📊 PDF size: ${pdfBuffer.length} bytes`);
      
      return {
        fileName: finalFileName,
        pdfBuffer: pdfBuffer,
        size: pdfBuffer.length
      };
      
    } catch (error) {
      console.error('❌ PDF generation failed:', error);
      throw new Error(`PDF generation failed: ${error.message}`);
    }
  }

  createHTMLContent(data) {
    const {
      transcript,
      summary,
      translations,
      contentType,
      summaryStyle
    } = data;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Video Summary</title>
    <style>
        @page {
            margin: 15mm;
            size: A4;
        }
        
        * {
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, Helvetica, sans-serif;
            line-height: 1.4;
            color: #000;
            margin: 0;
            padding: 0;
            background: white;
            font-size: 11px;
        }
        
        .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 15px;
        }
        
        .header h1 {
            color: #000;
            margin: 0;
            font-size: 20px;
            font-weight: bold;
        }
        
        .header .subtitle {
            color: #333;
            font-size: 12px;
            margin-top: 5px;
        }
        
        .metadata {
            background: #f0f0f0;
            padding: 8px;
            border-radius: 3px;
            margin-bottom: 15px;
            border-left: 3px solid #000;
        }
        
        .metadata-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 3px;
        }
        
        .metadata-label {
            font-weight: bold;
            color: #000;
        }
        
        .metadata-value {
            color: #000;
        }
        
        .section {
            margin-bottom: 20px;
            page-break-inside: avoid;
        }
        
        .section-title {
            color: #000;
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 8px;
            padding-bottom: 3px;
            border-bottom: 1px solid #ccc;
        }
        
        .section-content {
            background: #fff;
            padding: 10px;
            border-radius: 3px;
            border: 1px solid #ddd;
            line-height: 1.3;
        }
        
        .transcript-content {
            white-space: pre-wrap;
            font-size: 10px;
        }
        
        .summary-content {
            font-size: 11px;
        }
        
        .translation-item {
            margin-bottom: 10px;
            padding: 8px;
            background: #f9f9f9;
            border-radius: 3px;
            border-left: 2px solid #000;
        }
        
        .translation-header {
            font-weight: bold;
            color: #000;
            margin-bottom: 3px;
            font-size: 11px;
        }
        
        .translation-content {
            font-size: 10px;
            line-height: 1.2;
        }
        
        .footer {
            text-align: center;
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px solid #ccc;
            color: #666;
            font-size: 9px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>AI Video Summary Report</h1>
        <div class="subtitle">Generated by AI Video Summarizer</div>
    </div>
    
    <div class="metadata">
        <div class="metadata-item">
            <span class="metadata-label">Content Type:</span>
            <span class="metadata-value">${this.formatContentType(contentType)}</span>
        </div>
        <div class="metadata-item">
            <span class="metadata-label">Summary Style:</span>
            <span class="metadata-value">${this.formatSummaryStyle(summaryStyle)}</span>
        </div>
        <div class="metadata-item">
            <span class="metadata-label">Generated On:</span>
            <span class="metadata-value">${new Date().toLocaleString()}</span>
        </div>
        <div class="metadata-item">
            <span class="metadata-label">Languages:</span>
            <span class="metadata-value">${this.getLanguageCount(translations)}</span>
        </div>
    </div>
    
    ${transcript ? `
    <div class="section">
        <div class="section-title">Transcript</div>
        <div class="section-content transcript-content">${this.escapeHtml(transcript)}</div>
    </div>
    ` : ''}
    
    ${summary ? `
    <div class="section">
        <div class="section-title">AI Summary</div>
        <div class="section-content summary-content">${this.escapeHtml(summary)}</div>
    </div>
    ` : ''}
    
    ${Object.keys(translations).length > 0 ? `
    <div class="section">
        <div class="section-title">Translations</div>
        ${this.generateTranslationsHTML(translations)}
    </div>
    ` : ''}
    
    <div class="footer">
        <p>Generated by AI Video Summarizer | ${new Date().toLocaleDateString()}</p>
        <p>This document contains AI-generated content for informational purposes.</p>
    </div>
</body>
</html>`;

    return html;
  }

  generateTranslationsHTML(translations) {
    let html = '';
    
    Object.entries(translations).forEach(([lang, text]) => {
      const langNames = {
        'EN': 'English',
        'HI': 'Hindi (हिंदी)',
        'TE': 'Telugu (తెలుగు)',
        'ES': 'Spanish (Español)',
        'FR': 'French (Français)',
        'DE': 'German (Deutsch)',
        'IT': 'Italian (Italiano)',
        'PT': 'Portuguese (Português)',
        'RU': 'Russian (Русский)',
        'JA': 'Japanese (日本語)',
        'KO': 'Korean (한국어)',
        'ZH': 'Chinese (中文)',
        'AR': 'Arabic (العربية)'
      };
      
      html += `
        <div class="translation-item">
          <div class="translation-header">${langNames[lang] || lang}</div>
          <div class="translation-content">${this.escapeHtml(text)}</div>
        </div>
      `;
    });
    
    return html;
  }

  formatContentType(contentType) {
    const types = {
      'lecture': 'Lecture',
      'meeting': 'Meeting',
      'news': 'News',
      'presentation': 'Presentation',
      'interview': 'Interview'
    };
    return types[contentType] || contentType;
  }

  formatSummaryStyle(style) {
    const styles = {
      'concise': 'Concise',
      'detailed': 'Detailed',
      'bullet': 'Bullet Points'
    };
    return styles[style] || style;
  }

  getLanguageCount(translations) {
    const count = Object.keys(translations).length;
    if (count === 0) return 'English only';
    if (count === 1) return 'English + 1 language';
    return `English + ${count} languages`;
  }

  escapeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  async convertHTMLToPDF(htmlContent) {
    let page = null;
    
    try {
      console.log('📄 Converting HTML to PDF...');
      
      // Get browser instance
      const browser = await this.getBrowser();
      
      // Create new page
      page = await browser.newPage();
      
      // Set viewport
      await page.setViewport({ width: 1200, height: 800 });
      
      // Set content with longer timeout
      await page.setContent(htmlContent, { 
        waitUntil: 'networkidle0',
        timeout: 60000 
      });
      
      // Wait for content to settle
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate PDF with stable settings
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '15mm',
          right: '15mm',
          bottom: '15mm',
          left: '15mm'
        },
        displayHeaderFooter: false,
        preferCSSPageSize: false,
        scale: 1.0
      });
      
      console.log('✅ HTML to PDF conversion completed');
      console.log(`📊 Generated PDF buffer size: ${pdfBuffer.length} bytes`);
      
      return pdfBuffer;
      
    } catch (error) {
      console.error('❌ HTML to PDF conversion failed:', error);
      throw new Error(`PDF conversion failed: ${error.message}`);
    } finally {
      // Always close the page
      if (page && !page.isClosed()) {
        try {
          await page.close();
        } catch (e) {
          console.log('Page close error (ignored):', e.message);
        }
      }
    }
  }

  async savePDFToFile(pdfBuffer, filePath) {
    try {
      fs.writeFileSync(filePath, pdfBuffer);
      console.log(`✅ PDF saved to: ${filePath}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to save PDF file:', error);
      throw new Error(`File save failed: ${error.message}`);
    }
  }

  async cleanup() {
    try {
      if (this.browser && this.browser.isConnected()) {
        await this.browser.close();
        this.browser = null;
      }
      this.browserPromise = null;
      this.isServiceReady = false;
      console.log('🧹 PDF Export Service cleaned up');
    } catch (error) {
      console.log('Cleanup error (ignored):', error.message);
    }
  }
}

// Create singleton instance
const pdfExportService = new PDFExportService();

// Handle process exit to cleanup browser
process.on('exit', () => {
  if (pdfExportService.browser && pdfExportService.browser.isConnected()) {
    pdfExportService.browser.close();
  }
});

process.on('SIGINT', async () => {
  await pdfExportService.cleanup();
  process.exit();
});

process.on('SIGTERM', async () => {
  await pdfExportService.cleanup();
  process.exit();
});

module.exports = { 
  generatePDF: (data, options) => pdfExportService.generatePDF(data, options),
  savePDFToFile: (pdfBuffer, filePath) => pdfExportService.savePDFToFile(pdfBuffer, filePath),
  cleanup: () => pdfExportService.cleanup(),
  PDFExportService 
};
