require('dotenv').config();
const { generatePDF } = require('./src/services/pdfExportService');
const fs = require('fs');
const path = require('path');

async function testSimplePDF() {
  console.log('🧪 Testing Simple PDF Generation...\n');
  
  try {
    // Simple test data
    const testData = {
      transcript: 'This is a test transcript for PDF generation.',
      summary: 'This is a test summary with bullet points:\n• Point 1\n• Point 2\n• Point 3',
      translations: {
        'HI': 'यह एक परीक्षण सारांश है',
        'TE': 'ఇది ఒక పరీక్ష సారాంశం'
      },
      fileName: 'test-pdf',
      contentType: 'test',
      summaryStyle: 'bullet'
    };

    console.log('📄 Test data prepared');
    console.log('📊 Generating PDF...');

    const pdfResult = await generatePDF(testData);
    
    console.log('✅ PDF generated successfully!');
    console.log(`📊 File: ${pdfResult.fileName}`);
    console.log(`📊 Size: ${pdfResult.size} bytes`);
    
    // Save to test-outputs directory
    const outputDir = path.join(__dirname, 'test-outputs');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const outputPath = path.join(outputDir, pdfResult.fileName);
    fs.writeFileSync(outputPath, pdfResult.pdfBuffer);
    
    console.log(`💾 PDF saved to: ${outputPath}`);
    console.log('🎉 Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Run test
testSimplePDF().catch(console.error);
