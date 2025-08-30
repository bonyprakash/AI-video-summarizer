const fetch = require('node-fetch');
const fs = require('fs');
const FormData = require('form-data');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const ENABLE_FALLBACK_SERVICES = process.env.ENABLE_FALLBACK_SERVICES === 'true';

async function transcribeAudio(filePath) {
  try {
    console.log('🎤 Transcribing audio with OpenAI Whisper...');
    console.log('🔑 Using OpenAI API key:', OPENAI_API_KEY ? 'Configured' : 'Not configured');
    
    // Uses OpenAI Whisper API (audio transcription)
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));
    form.append('model', 'whisper-1');

    const resp = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        // Don't set Content-Type for FormData, let it set automatically
      },
      body: form
    });

    console.log('📡 OpenAI response status:', resp.status);
    console.log('📡 OpenAI response headers:', Object.fromEntries(resp.headers.entries()));

    // Check if response is JSON
    const contentType = resp.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await resp.text();
      console.error('❌ OpenAI returned non-JSON response:', textResponse.substring(0, 500));
      
      // If it's an authentication error, try Gemini fallback only if enabled
      if (resp.status === 401 || resp.status === 403) {
        if (ENABLE_FALLBACK_SERVICES) {
          console.log('🔄 OpenAI authentication failed, trying Gemini fallback...');
          const { transcribeAudioWithGemini } = require('./geminiTranscribeService');
          try {
            return await transcribeAudioWithGemini(filePath);
          } catch (geminiError) {
            console.error('❌ Gemini fallback also failed:', geminiError);
            throw new Error(`All transcription services failed. OpenAI auth error, Gemini: ${geminiError.message}`);
          }
        } else {
          throw new Error(`OpenAI authentication failed. Fallback services are disabled.`);
        }
      }
      
      throw new Error(`OpenAI returned invalid response: ${resp.status} ${textResponse.substring(0, 200)}`);
    }

    const data = await resp.json();
    if (!resp.ok) {
      // Check if it's a quota error
      if (data.error && (data.error.message.includes('quota') || data.error.message.includes('insufficient_quota'))) {
        if (ENABLE_FALLBACK_SERVICES) {
          console.log('🔄 OpenAI quota exceeded, trying Gemini fallback...');
          const { transcribeAudioWithGemini } = require('./geminiTranscribeService');
          try {
            return await transcribeAudioWithGemini(filePath);
          } catch (geminiError) {
            console.error('❌ Gemini fallback also failed:', geminiError);
            throw new Error(`All transcription services failed. OpenAI: ${data.error.message}, Gemini: ${geminiError.message}`);
          }
        } else {
          throw new Error(`OpenAI quota exceeded. Fallback services are disabled.`);
        }
      }
      throw new Error('Transcription failed: ' + JSON.stringify(data));
    }
    
    console.log('✅ OpenAI transcription completed');
    return data.text;
  } catch (error) {
    console.error('❌ OpenAI transcription failed:', error);
    
    // If it's a JSON parsing error, try Gemini fallback only if enabled
    if (ENABLE_FALLBACK_SERVICES && (error.message.includes('Unexpected token') || error.message.includes('invalid json'))) {
      console.log('🔄 OpenAI JSON error, trying Gemini fallback...');
      const { transcribeAudioWithGemini } = require('./geminiTranscribeService');
      try {
        return await transcribeAudioWithGemini(filePath);
      } catch (geminiError) {
        console.error('❌ Gemini fallback also failed:', geminiError);
        throw new Error(`All transcription services failed. OpenAI JSON error, Gemini: ${geminiError.message}`);
      }
    }
    
    throw error;
  }
}

async function summarizeText(transcript, opts = {}) {
  const contentType = opts.contentType || 'lecture';
  const summaryStyle = opts.summaryStyle || 'concise';
  
  const system = `You are an expert AI assistant that creates intelligent summaries of video content. 
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

  const body = {
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.3,
    max_tokens: 1200
  };

  try {
    console.log('📝 Attempting OpenAI summarization...');
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(body)
    });

    const data = await resp.json();
    if (!resp.ok) {
      // Check if it's a quota error
      if (data.error && (data.error.message.includes('quota') || data.error.message.includes('insufficient_quota'))) {
        if (ENABLE_FALLBACK_SERVICES) {
          console.log('🔄 OpenAI quota exceeded, automatically falling back to Gemini...');
          const { summarizeTextWithGemini } = require('./geminiSummarizeService');
          try {
            return await summarizeTextWithGemini(transcript, opts);
          } catch (geminiError) {
            console.error('❌ Gemini fallback also failed:', geminiError);
            throw new Error(`All summarization services failed. OpenAI: ${data.error.message}, Gemini: ${geminiError.message}`);
          }
        } else {
          throw new Error(`OpenAI summarization quota exceeded. Fallback services are disabled. Please enable fallback services or check your OpenAI quota.`);
        }
      }
      throw new Error('OpenAI summarization failed: ' + JSON.stringify(data));
    }
    
    let summary = data.choices?.[0]?.message?.content ?? '';
    
    // Post-process the summary to remove any remaining asterisks and clean up formatting
    summary = cleanSummaryFormatting(summary);
    
    console.log('✅ OpenAI summarization completed with clean formatting');
    return summary;
    
  } catch (error) {
    console.error('❌ OpenAI summarization failed:', error.message);
    
    // If OpenAI fails for any reason, automatically try Gemini fallback
    if (ENABLE_FALLBACK_SERVICES) {
      console.log('🔄 OpenAI failed, automatically falling back to Gemini...');
      const { summarizeTextWithGemini } = require('./geminiSummarizeService');
      try {
        const geminiSummary = await summarizeTextWithGemini(transcript, opts);
        console.log('✅ Gemini fallback successful');
        return geminiSummary;
      } catch (geminiError) {
        console.error('❌ Gemini fallback also failed:', geminiError.message);
        throw new Error(`All summarization services failed. OpenAI: ${error.message}, Gemini: ${geminiError.message}`);
      }
    } else {
      throw new Error(`OpenAI summarization failed: ${error.message}. Fallback services are disabled. Please check your OpenAI API key and quota.`);
    }
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

module.exports = { transcribeAudio, summarizeText };
