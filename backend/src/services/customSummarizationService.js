const natural = require('natural');
const path = require('path');
const { pipeline } = require('@xenova/transformers');

class CustomSummarizationService {
  constructor() {
    this.isModelLoaded = false;
    this.model = null;
    this.modelName = 'Xenova/t5-small'; // Lightweight summarization model
    
    // Initialize tokenizer
    this.tokenizer = new natural.WordTokenizer();
    
    // Key concept patterns for different content types
    this.contentPatterns = {
      lecture: {
        keywords: ['concept', 'theory', 'principle', 'method', 'approach', 'technique', 'framework', 'model'],
        structure: ['introduction', 'overview', 'explanation', 'example', 'conclusion', 'summary']
      },
      meeting: {
        keywords: ['decision', 'action', 'agenda', 'discussion', 'proposal', 'plan', 'timeline', 'deadline'],
        structure: ['agenda', 'discussion', 'decisions', 'action items', 'next steps']
      },
      presentation: {
        keywords: ['slide', 'point', 'highlight', 'key', 'main', 'important', 'significant', 'critical'],
        structure: ['introduction', 'main points', 'conclusion', 'recommendations']
      },
      interview: {
        keywords: ['question', 'answer', 'experience', 'background', 'opinion', 'view', 'perspective'],
        structure: ['introduction', 'questions', 'responses', 'insights']
      },
      news: {
        keywords: ['event', 'announcement', 'development', 'report', 'statement', 'response', 'impact'],
        structure: ['headline', 'details', 'context', 'implications']
      }
    };
  }

  async loadModel() {
    if (this.isModelLoaded && this.model) return;

    try {
      console.log('📝 Loading custom summarization service...');
      console.log(`📦 Using model: ${this.modelName}`);
      
      // Load the T5 summarization model
      this.model = await pipeline('summarization', this.modelName);
      this.isModelLoaded = true;
      
      console.log('✅ Custom summarization service ready (T5 model)');
    } catch (error) {
      console.error('❌ Failed to load custom summarization service:', error);
      throw new Error(`Service loading failed: ${error.message}`);
    }
  }

  preprocessText(text) {
    // Clean and preprocess text
    let cleaned = text
      .replace(/\s+/g, ' ') // Remove extra whitespace
      .replace(/[^\w\s\.\,\!\?\-]/g, '') // Remove special characters
      .trim();
    
    // Split into sentences using simple regex
    const sentences = cleaned.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // For short content, be more lenient with sentence filtering
    const minSentenceLength = text.length < 200 ? 5 : 20;
    const filteredSentences = sentences.filter(sentence => 
      sentence.length > minSentenceLength && sentence.length < 500
    );
    
    // If all sentences were filtered out, return original cleaned text
    if (filteredSentences.length === 0) {
      return cleaned;
    }
    
    return filteredSentences.join(' ');
  }

  async summarizeText(transcript, opts = {}) {
    try {
      await this.loadModel();
      
      console.log('📝 Summarizing text with custom service...');
      
      const contentType = opts.contentType || 'lecture';
      const summaryStyle = opts.summaryStyle || 'concise';
      
      // Preprocess transcript
      const processedText = this.preprocessText(transcript);
      
      // Handle very short content
      if (processedText.length < 20) {
        console.log('⚠️ Very short text detected, providing basic summary');
        return this.generateBasicSummary(transcript, contentType);
      }
      
      // Use T5 model for summarization
      console.log('🔄 Processing text with T5 summarization model...');
      
      // Create a proper summary prompt
      const summaryPrompt = this.createSummaryPrompt(processedText, contentType, summaryStyle);
      
      const result = await this.model(summaryPrompt, {
        max_length: summaryStyle === 'detailed' ? 150 : 100,
        min_length: 30,
        do_sample: false
      });
      
      const generatedSummary = result[0].summary_text;
      
      // Analyze the content for additional insights
      const contentAnalysis = this.analyzeTranscriptContent(processedText);
      
      // Extract key points using NLP techniques
      const keyPoints = this.extractKeyPointsFromContent(processedText, contentAnalysis, 
        summaryStyle === 'detailed' ? 8 : 5
      );
      
      // Extract insights from actual content
      const insights = this.extractInsightsFromContent(processedText, contentAnalysis, contentType);
      
      // Format the final summary
      let formattedSummary = this.formatContentBasedSummary(generatedSummary, keyPoints, insights, summaryStyle, contentType, contentAnalysis);
      
      console.log('✅ Custom summarization completed');
      return formattedSummary;
      
    } catch (error) {
      console.error('❌ Custom summarization failed:', error);
      throw new Error(`Custom summarization failed: ${error.message}`);
    }
  }

  generateBasicSummary(transcript, contentType) {
    // Handle very short content with a basic summary
    const cleanText = transcript.trim();
    
    if (cleanText.length < 50) {
      return `📋 Basic Summary\nThis ${contentType} contains: "${cleanText}"\n\n📝 Note: Content is very brief and may not require detailed summarization.`;
    }
    
    // For slightly longer content, provide a simple summary
    const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const keyPoints = sentences.slice(0, Math.min(3, sentences.length));
    
    return `📋 Summary\nThis ${contentType} covers: ${keyPoints.join(' ')}\n\n🎯 Key Points\n${keyPoints.map(point => `• ${point.trim()}`).join('\n')}`;
  }

  createSummaryPrompt(text, contentType, summaryStyle) {
    // Create a proper prompt for the T5 model
    const prompts = {
      lecture: {
        concise: `summarize this lecture in a concise way: ${text}`,
        detailed: `provide a detailed summary of this lecture: ${text}`
      },
      meeting: {
        concise: `summarize this meeting discussion: ${text}`,
        detailed: `provide a detailed summary of this meeting: ${text}`
      },
      presentation: {
        concise: `summarize this presentation: ${text}`,
        detailed: `provide a detailed summary of this presentation: ${text}`
      },
      interview: {
        concise: `summarize this interview: ${text}`,
        detailed: `provide a detailed summary of this interview: ${text}`
      },
      news: {
        concise: `summarize this news content: ${text}`,
        detailed: `provide a detailed summary of this news: ${text}`
      }
    };
    
    const contentPrompts = prompts[contentType] || prompts.lecture;
    return contentPrompts[summaryStyle] || contentPrompts.concise;
  }

  analyzeTranscriptContent(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = this.tokenizer.tokenize(text.toLowerCase());
    
    // Analyze word frequency (be more lenient for short texts)
    const wordFreq = {};
    words.forEach(word => {
      if (word.length > 2) { // Reduced from 3 to 2 for short texts
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });
    
    // Find most common words (adjust based on text length)
    const maxCommonWords = text.length < 200 ? 5 : 10;
    const commonWords = Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, maxCommonWords)
      .map(([word]) => word);
    
    // Detect topics based on keywords
    const topics = this.detectTopics(commonWords, text);
    
    // Analyze sentence structure (handle edge cases)
    const avgSentenceLength = sentences.length > 0 ? 
      sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length : 0;
    const complexity = this.analyzeComplexity(text);
    
    return {
      totalWords: words.length,
      totalSentences: sentences.length,
      avgSentenceLength: Math.round(avgSentenceLength),
      commonWords: commonWords,
      topics: topics,
      complexity: complexity,
      contentType: this.detectContentTypeFromText(text),
      keyThemes: this.extractKeyThemes(text)
    };
  }

  detectTopics(commonWords, text) {
    const topicKeywords = {
      'technology': ['computer', 'software', 'hardware', 'system', 'technology', 'digital', 'electronic', 'program', 'code', 'algorithm'],
      'business': ['business', 'company', 'market', 'industry', 'profit', 'revenue', 'strategy', 'management', 'leadership', 'organization'],
      'education': ['learn', 'teach', 'education', 'student', 'course', 'study', 'knowledge', 'skill', 'training', 'academic'],
      'science': ['research', 'science', 'experiment', 'theory', 'hypothesis', 'analysis', 'data', 'method', 'study', 'discovery'],
      'health': ['health', 'medical', 'patient', 'treatment', 'disease', 'medicine', 'doctor', 'hospital', 'care', 'therapy'],
      'politics': ['government', 'policy', 'political', 'election', 'vote', 'democracy', 'law', 'regulation', 'public', 'citizen'],
      'environment': ['environment', 'climate', 'nature', 'pollution', 'sustainable', 'green', 'energy', 'conservation', 'ecosystem', 'planet']
    };
    
    const detectedTopics = [];
    const lowerText = text.toLowerCase();
    
    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      const matchCount = keywords.filter(keyword => lowerText.includes(keyword)).length;
      if (matchCount >= 2) {
        detectedTopics.push(topic);
      }
    });
    
    return detectedTopics;
  }

  analyzeComplexity(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = this.tokenizer.tokenize(text.toLowerCase());
    
    // Calculate average word length
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    
    // Count complex words (longer than 6 characters)
    const complexWords = words.filter(word => word.length > 6).length;
    const complexityRatio = complexWords / words.length;
    
    if (complexityRatio > 0.2) return 'high';
    if (complexityRatio > 0.1) return 'medium';
    return 'low';
  }

  detectContentTypeFromText(text) {
    const lowerText = text.toLowerCase();
    
    // Check for content type indicators
    if (lowerText.includes('lecture') || lowerText.includes('course') || lowerText.includes('lesson')) {
      return 'lecture';
    }
    if (lowerText.includes('meeting') || lowerText.includes('agenda') || lowerText.includes('discussion')) {
      return 'meeting';
    }
    if (lowerText.includes('presentation') || lowerText.includes('slide') || lowerText.includes('present')) {
      return 'presentation';
    }
    if (lowerText.includes('interview') || lowerText.includes('question') || lowerText.includes('answer')) {
      return 'interview';
    }
    if (lowerText.includes('news') || lowerText.includes('report') || lowerText.includes('announcement')) {
      return 'news';
    }
    
    return 'general';
  }

  extractKeyThemes(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const themes = [];
    
    // Look for theme indicators
    const themeIndicators = [
      'main topic', 'key theme', 'primary focus', 'central idea', 'core concept',
      'important point', 'critical issue', 'major concern', 'fundamental principle'
    ];
    
    themeIndicators.forEach(indicator => {
      const matchingSentences = sentences.filter(sentence => 
        sentence.toLowerCase().includes(indicator)
      );
      if (matchingSentences.length > 0) {
        themes.push(...matchingSentences.slice(0, 2));
      }
    });
    
    return themes.slice(0, 3);
  }

  extractKeyPointsFromContent(text, contentAnalysis, maxPoints) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Score sentences based on content analysis
    const sentenceScores = sentences.map((sentence, index) => {
      const words = this.tokenizer.tokenize(sentence.toLowerCase());
      
      // Factor 1: Relevance to detected topics
      const topicScore = contentAnalysis.topics.reduce((score, topic) => {
        const topicKeywords = this.getTopicKeywords(topic);
        const matches = topicKeywords.filter(keyword => 
          sentence.toLowerCase().includes(keyword)
        ).length;
        return score + (matches * 2);
      }, 0);
      
      // Factor 2: Contains common words
      const commonWordScore = contentAnalysis.commonWords.filter(word => 
        sentence.toLowerCase().includes(word)
      ).length * 1.5;
      
      // Factor 3: Position bonus (earlier sentences are more important)
      const positionScore = (sentences.length - index) * 0.1;
      
      // Factor 4: Length bonus (medium-length sentences are preferred)
      const lengthScore = sentence.length > 50 && sentence.length < 200 ? 2 : 0;
      
      // Factor 5: Theme relevance
      const themeScore = contentAnalysis.keyThemes.some(theme => 
        sentence.toLowerCase().includes(theme.toLowerCase())
      ) ? 3 : 0;
      
      const totalScore = topicScore + commonWordScore + positionScore + lengthScore + themeScore;
      
      return { sentence, score: totalScore, index };
    });
    
    // Sort by score and return top sentences
    return sentenceScores
      .sort((a, b) => b.score - a.score)
      .slice(0, maxPoints)
      .sort((a, b) => a.index - b.index) // Maintain original order
      .map(item => item.sentence);
  }

  getTopicKeywords(topic) {
    const topicKeywords = {
      'technology': ['computer', 'software', 'hardware', 'system', 'technology', 'digital', 'electronic', 'program', 'code', 'algorithm'],
      'business': ['business', 'company', 'market', 'industry', 'profit', 'revenue', 'strategy', 'management', 'leadership', 'organization'],
      'education': ['learn', 'teach', 'education', 'student', 'course', 'study', 'knowledge', 'skill', 'training', 'academic'],
      'science': ['research', 'science', 'experiment', 'theory', 'hypothesis', 'analysis', 'data', 'method', 'study', 'discovery'],
      'health': ['health', 'medical', 'patient', 'treatment', 'disease', 'medicine', 'doctor', 'hospital', 'care', 'therapy'],
      'politics': ['government', 'policy', 'political', 'election', 'vote', 'democracy', 'law', 'regulation', 'public', 'citizen'],
      'environment': ['environment', 'climate', 'nature', 'pollution', 'sustainable', 'green', 'energy', 'conservation', 'ecosystem', 'planet']
    };
    
    return topicKeywords[topic] || [];
  }

  extractInsightsFromContent(text, contentAnalysis, contentType) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const patterns = this.contentPatterns[contentType] || this.contentPatterns.lecture;
    
    const insights = sentences.filter(sentence => {
      const lowerSentence = sentence.toLowerCase();
      
      // Check for insight indicators
      const insightIndicators = [
        'important', 'key', 'critical', 'significant', 'notable',
        'interesting', 'surprising', 'reveals', 'shows', 'indicates',
        'suggests', 'implies', 'demonstrates', 'proves', 'concludes',
        'finding', 'discovery', 'result', 'outcome', 'impact'
      ];
      
      const hasIndicator = insightIndicators.some(indicator => 
        lowerSentence.includes(indicator)
      );
      
      // Check for content-specific keywords
      const hasKeyword = patterns.keywords.some(keyword => 
        lowerSentence.includes(keyword)
      );
      
      // Check for topic relevance
      const hasTopic = contentAnalysis.topics.some(topic => 
        lowerSentence.toLowerCase().includes(topic)
      );
      
      return hasIndicator || hasKeyword || hasTopic;
    });
    
    return insights.slice(0, 4); // Return top 4 insights
  }

  formatContentBasedSummary(summary, keyPoints, insights, summaryStyle, contentType, contentAnalysis) {
    let formattedSummary = '';
    
    if (summaryStyle === 'bullet') {
      formattedSummary = `📋 Executive Summary\n${summary}\n\n🎯 Key Points\n${keyPoints.map(point => `• ${point}`).join('\n')}`;
    } else if (summaryStyle === 'detailed') {
      formattedSummary = `📋 Executive Summary\n${summary}\n\n🎯 Key Points\n${keyPoints.map(point => `• ${point}`).join('\n')}\n\n💡 Main Insights\n${insights.map(insight => `• ${insight}`).join('\n')}`;
    } else {
      // Concise style
      formattedSummary = `📋 Summary\n${summary}\n\n🎯 Key Points\n${keyPoints.slice(0, 5).map(point => `• ${point}`).join('\n')}`;
    }
    
    // Add content analysis information
    if (contentAnalysis.topics.length > 0) {
      formattedSummary += `\n\n🏷️ Detected Topics: ${contentAnalysis.topics.join(', ')}`;
    }
    
    if (contentAnalysis.complexity !== 'low') {
      formattedSummary += `\n\n📊 Content Complexity: ${contentAnalysis.complexity}`;
    }
    
    // Add content-specific formatting
    if (contentType === 'meeting') {
      formattedSummary += '\n\n📝 Action Items\n• Review meeting notes and assign tasks\n• Schedule follow-up meeting if needed';
    } else if (contentType === 'lecture') {
      formattedSummary += '\n\n📚 Learning Objectives\n• Review key concepts\n• Practice with examples provided';
    } else if (contentType === 'presentation') {
      formattedSummary += '\n\n📊 Key Takeaways\n• Focus on main points presented\n• Consider implications for your work';
    }
    
    return formattedSummary;
  }

  // Helper method to get model info
  getModelInfo() {
    return {
      name: this.modelName,
      loaded: this.isModelLoaded,
      type: 'T5 Text Summarization'
    };
  }
}

// Create singleton instance
const summarizationService = new CustomSummarizationService();

module.exports = { 
  summarizeText: (transcript, opts) => summarizationService.summarizeText(transcript, opts),
  getModelInfo: () => summarizationService.getModelInfo(),
  CustomSummarizationService 
};
