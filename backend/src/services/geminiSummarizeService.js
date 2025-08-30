async function summarizeTextWithGemini(transcript, opts = {}) {
  const contentType = opts.contentType || 'lecture';
  const summaryStyle = opts.summaryStyle || 'concise';
  
  const systemPrompt = `You are an expert AI assistant that creates intelligent summaries of video content. 
Content type: ${contentType}
Style: ${summaryStyle}

IMPORTANT INSTRUCTIONS:
1. DO NOT use asterisks (*) in your response
2. Create clean, structured summaries without special formatting characters
3. Use clear headings and bullet points
4. Focus on key information and actionable insights
5. Make the content easily translatable to other languages
6. Avoid repetitive information from the transcript
7. Provide unique value in the summary that's different from the transcript
8. For bullet points, use proper bullet symbols (•) and ensure consistent formatting

Your task is to analyze the transcript and create a comprehensive, well-structured summary that captures the essence of the content.`;

  let userPrompt = `Transcript:\n${transcript}\n\n`;

  if (summaryStyle === 'bullet') {
    userPrompt += `Create a structured summary with EXACTLY this format:

Executive Summary:
[2-3 clear sentences about the main topic]

Key Points:
• [First key point]
• [Second key point]
• [Third key point]
• [Fourth key point]
• [Fifth key point]

Main Insights:
• [First insight]
• [Second insight]
• [Third insight]

Important Details:
• [Any critical information]

Action Items:
• [Any actionable tasks or next steps]

Format: Use proper bullet points (•) and maintain consistent structure. No asterisks or special characters.`;
  } else if (summaryStyle === 'detailed') {
    userPrompt += `Create a detailed summary with EXACTLY this format:

Executive Summary:
[3-4 comprehensive sentences about the main topic]

Key Points:
• [First detailed point]
• [Second detailed point]
• [Third detailed point]
• [Fourth detailed point]
• [Fifth detailed point]
• [Sixth detailed point]
• [Seventh detailed point]
• [Eighth detailed point]

Main Insights:
• [First deep insight]
• [Second deep insight]
• [Third deep insight]
• [Fourth deep insight]

Important Details:
• [Comprehensive coverage of critical information]

Action Items:
• [Any actionable tasks with clear responsibilities]

Tags/Keywords:
• [Relevant topics discussed]

Format: Use proper bullet points (•) and maintain consistent structure. No asterisks or special characters.`;
  } else {
    // Concise style
    userPrompt += `Create a concise summary with EXACTLY this format:

Executive Summary:
[2-3 focused sentences about the main topic]

Key Points:
• [First essential point]
• [Second essential point]
• [Third essential point]
• [Fourth essential point]
• [Fifth essential point]

Main Insights:
• [First core takeaway]
• [Second core takeaway]

Action Items:
• [Any applicable actions]

Format: Use proper bullet points (•) and maintain consistent structure. No asterisks or special characters.`;
  }

  // Add content-specific instructions
  if (contentType === 'meeting') {
    userPrompt += `\n\nFocus on: Meeting objectives, decisions made, action items with owners and deadlines, key discussions, and next steps.`;
  } else if (contentType === 'lecture') {
    userPrompt += `\n\nFocus on: Main concepts, key takeaways, important definitions, examples provided, and learning objectives.`;
  } else if (contentType === 'presentation') {
    userPrompt += `\n\nFocus on: Presentation goals, key messages, data/statistics mentioned, conclusions, and recommendations.`;
  } else if (contentType === 'interview') {
    userPrompt += `\n\nFocus on: Key questions asked, important answers, insights shared, background information, and notable quotes.`;
  } else if (contentType === 'news') {
    userPrompt += `\n\nFocus on: Main story, key facts, people involved, timeline of events, and implications.`;
  }

  userPrompt += `\n\nCRITICAL: Ensure the summary is completely different from the transcript. Extract only the most important information and present it in a structured, easy-to-read format. Use clean language that will translate well to other languages. Maintain the exact bullet point format specified above.`;

  try {
    console.log('📝 Attempting Gemini summarization...');
    
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\n${userPrompt}`
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1200,
        }
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API error: ${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
    let summary = data.candidates[0].content.parts[0].text;
    
    // Post-process the summary to remove any remaining asterisks and clean up formatting
    summary = cleanSummaryFormatting(summary);
    
    console.log('✅ Gemini summarization completed with clean formatting');
    return summary;
    
  } catch (error) {
    console.error('❌ Gemini summarization failed:', error);
    throw new Error(`Gemini API error: ${error.message}`);
  }
}

function cleanSummaryFormatting(summary) {
  if (!summary) return summary;
  
  // Remove asterisks and other special formatting characters
  let cleaned = summary
    .replace(/\*/g, '') // Remove all asterisks
    .replace(/\_/g, '') // Remove underscores
    .replace(/\`/g, '') // Remove backticks
    .replace(/\~/g, '') // Remove tildes
    
    // Clean up multiple spaces and line breaks
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')
    
    // Ensure proper bullet point formatting
    .replace(/^[-•*]\s*/gm, '• ') // Convert any bullet style to bullet points
    .replace(/^\d+\.\s*/gm, (match) => match) // Keep numbered lists
    
    // Clean up section headers
    .replace(/^([A-Z][^:]*):/gm, (match, header) => `${header.trim()}:`)
    
    // Remove any remaining special characters that might cause translation issues
    .replace(/[^\w\s\.,!?;:()\-–—…•]/g, '')
    
    .trim();
  
  return cleaned;
}

module.exports = { summarizeTextWithGemini };
