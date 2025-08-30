const { summarizeText } = require('./src/services/customSummarizationService');

async function testSummarization() {
  console.log('📝 Testing Improved Custom Summarization Service...\n');

  try {
    const testText = "Hello guys welcome to Amit Thinks. In this video we will see how to install node.js on Windows 11. Let us go to the web browser on Google type, node.js and press enter. The official web set is visible, node.js.org, click. Here the LTS version is visible. I'll click on it. The download will start. Once the download is complete, we can install node.js on our Windows 11 system. The installation process is simple and straightforward. We just need to follow the installation wizard. After installation, we can verify that node.js is installed correctly by opening the command prompt and typing node --version.";
    
    console.log('📝 Original text:');
    console.log(testText);
    console.log('\n' + '='.repeat(80) + '\n');
    
    // Test concise summary
    console.log('📋 Testing concise summary...');
    const conciseSummary = await summarizeText(testText, { 
      contentType: 'lecture', 
      summaryStyle: 'concise' 
    });
    console.log('Concise Summary:');
    console.log(conciseSummary);
    console.log('\n' + '='.repeat(80) + '\n');
    
    // Test detailed summary
    console.log('📋 Testing detailed summary...');
    const detailedSummary = await summarizeText(testText, { 
      contentType: 'lecture', 
      summaryStyle: 'detailed' 
    });
    console.log('Detailed Summary:');
    console.log(detailedSummary);
    
    console.log('\n✅ Summarization tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Summarization test failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
testSummarization().catch(console.error);
