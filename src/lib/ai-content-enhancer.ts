/**
 * AI Content Enhancer
 * Provides AI-powered content enhancement for knowledge base articles
 */

import { AIEnhancementRequest, AIEnhancementResponse } from '@/types/zendesk';

export class AIContentEnhancer {
  private apiKey: string;
  private provider: 'openai' | 'anthropic';

  constructor() {
    // Check which AI provider is configured
    if (process.env.OPENAI_API_KEY) {
      this.apiKey = process.env.OPENAI_API_KEY;
      this.provider = 'openai';
    } else if (process.env.ANTHROPIC_API_KEY) {
      this.apiKey = process.env.ANTHROPIC_API_KEY;
      this.provider = 'anthropic';
    } else {
      throw new Error('No AI API key configured. Please set OPENAI_API_KEY or ANTHROPIC_API_KEY environment variable.');
    }
  }

  /**
   * Enhance content using AI
   */
  async enhanceContent(request: AIEnhancementRequest): Promise<AIEnhancementResponse> {
    const prompt = this.buildPrompt(request);
    const enhancedContent = await this.callAI(prompt);

    return {
      original_content: request.content,
      enhanced_content: enhancedContent,
      suggestions: this.generateSuggestions(request.content, enhancedContent),
      word_count_change: this.calculateWordCountChange(request.content, enhancedContent),
    };
  }

  /**
   * Build prompt based on enhancement type
   */
  private buildPrompt(request: AIEnhancementRequest): string {
    const { content, enhancement_type, target_audience, tone } = request;

    const audienceContext = target_audience
      ? `The target audience is ${target_audience} users.`
      : '';

    const toneContext = tone
      ? `Use a ${tone} tone.`
      : '';

    const prompts = {
      improve: `Improve the following knowledge base article. Make it clearer, more concise, and easier to understand. ${audienceContext} ${toneContext}\n\nOriginal content:\n${content}\n\nProvide only the improved version without explanations.`,

      expand: `Expand the following knowledge base article with more details, examples, and explanations. ${audienceContext} ${toneContext}\n\nOriginal content:\n${content}\n\nProvide only the expanded version without explanations.`,

      summarize: `Summarize the following knowledge base article into a concise version that captures the key points. ${audienceContext} ${toneContext}\n\nOriginal content:\n${content}\n\nProvide only the summary without explanations.`,

      format: `Reformat the following knowledge base article to improve its structure and readability. Add appropriate headings, bullet points, and formatting. ${audienceContext} ${toneContext}\n\nOriginal content:\n${content}\n\nProvide only the formatted version in HTML without explanations.`,
    };

    return prompts[enhancement_type];
  }

  /**
   * Call AI API based on provider
   */
  private async callAI(prompt: string): Promise<string> {
    if (this.provider === 'openai') {
      return this.callOpenAI(prompt);
    } else {
      return this.callAnthropic(prompt);
    }
  }

  /**
   * Call OpenAI API
   */
  private async callOpenAI(prompt: string): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that improves knowledge base articles. Provide clear, well-structured content that is easy to understand.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  }

  /**
   * Call Anthropic API
   */
  private async callAnthropic(prompt: string): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Anthropic API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data.content[0].text.trim();
  }

  /**
   * Generate suggestions based on changes
   */
  private generateSuggestions(original: string, enhanced: string): string[] {
    const suggestions: string[] = [];

    const originalLength = original.length;
    const enhancedLength = enhanced.length;

    if (enhancedLength > originalLength * 1.5) {
      suggestions.push('Content has been significantly expanded with more details');
    } else if (enhancedLength < originalLength * 0.7) {
      suggestions.push('Content has been condensed for clarity');
    }

    if (enhanced.includes('<h2>') || enhanced.includes('<h3>')) {
      suggestions.push('Headings added for better structure');
    }

    if (enhanced.includes('<ul>') || enhanced.includes('<ol>')) {
      suggestions.push('Lists added for improved readability');
    }

    if (enhanced.includes('<code>') || enhanced.includes('<pre>')) {
      suggestions.push('Code formatting applied');
    }

    return suggestions;
  }

  /**
   * Calculate word count change
   */
  private calculateWordCountChange(original: string, enhanced: string): number {
    const originalWords = original.split(/\s+/).length;
    const enhancedWords = enhanced.split(/\s+/).length;
    return enhancedWords - originalWords;
  }

  /**
   * Generate article from scratch using AI
   */
  async generateArticle(
    topic: string,
    targetAudience?: string,
    tone?: string,
    sections?: string[]
  ): Promise<string> {
    const audienceContext = targetAudience
      ? `Target audience: ${targetAudience}.`
      : '';

    const toneContext = tone
      ? `Tone: ${tone}.`
      : '';

    const sectionsContext = sections && sections.length > 0
      ? `Include these sections: ${sections.join(', ')}.`
      : '';

    const prompt = `Create a comprehensive knowledge base article about: ${topic}

${audienceContext}
${toneContext}
${sectionsContext}

The article should be well-structured with appropriate headings, clear explanations, and examples where relevant. Format the output in HTML suitable for a knowledge base.

Provide only the article content without any introductory text or explanations.`;

    return this.callAI(prompt);
  }

  /**
   * Test AI connection
   */
  async testConnection(): Promise<{ success: boolean; message: string; provider: string }> {
    try {
      const testContent = 'This is a test article.';
      await this.enhanceContent({
        content: testContent,
        enhancement_type: 'improve',
      });

      return {
        success: true,
        message: `Successfully connected to ${this.provider.toUpperCase()}`,
        provider: this.provider,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection failed',
        provider: this.provider,
      };
    }
  }
}

// Singleton instance
let aiEnhancer: AIContentEnhancer | null = null;

export function getAIEnhancer(): AIContentEnhancer {
  if (!aiEnhancer) {
    aiEnhancer = new AIContentEnhancer();
  }
  return aiEnhancer;
}
