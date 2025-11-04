import { GEMINI_CONFIG } from './gemini-config';

export interface GeminiResponse {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export class GeminiError extends Error {
  error: string;
  code?: number;
  retryable: boolean;

  constructor({ error, code, retryable }: { error: string; code?: number; retryable: boolean }) {
    super(error);
    this.name = 'GeminiError';
    this.error = error;
    this.code = code;
    this.retryable = retryable;
  }
}

export class GeminiClient {
  private apiKey: string;
  private endpoint: string | (() => string);
  private maxRetries: number;
  private timeout: number;

  constructor() {
    this.apiKey = GEMINI_CONFIG.apiKey;
    this.endpoint = GEMINI_CONFIG.endpoint;
    this.maxRetries = GEMINI_CONFIG.maxRetries;
    this.timeout = GEMINI_CONFIG.timeout;
  }

  private getEndpoint(): string {
    return typeof this.endpoint === 'function' ? this.endpoint() : this.endpoint;
  }

  async generateContent(
    prompt: string,
    retryCount: number = 0,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
  ): Promise<GeminiResponse> {
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured');
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      // Build conversation history for context
      const contents = conversationHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }));

      // Add current user message
      contents.push({
        role: 'user',
        parts: [{ text: prompt }],
      });

      const requestBody: any = {
        contents,
        generationConfig: {
          maxOutputTokens: GEMINI_CONFIG.maxTokens,
          temperature: GEMINI_CONFIG.temperature,
          topP: 0.95,
          topK: 40,
        },
      };

      // Add system instruction if available
      if (GEMINI_CONFIG.systemInstruction) {
        requestBody.systemInstruction = {
          parts: [{ text: GEMINI_CONFIG.systemInstruction }],
        };
      }

      const response = await fetch(`${this.getEndpoint()}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Handle 404 - model not found
        if (response.status === 404) {
          const modelName = GEMINI_CONFIG.model;
          console.error(`Gemini model "${modelName}" not found. Available models: gemini-2.5-pro, gemini-2.5-flash`);
          throw new GeminiError({
            error: `Model "${modelName}" not found. Please check NEXT_PUBLIC_GEMINI_MODEL in your .env.local file. Try: gemini-2.5-pro or gemini-2.5-flash`,
            code: 404,
            retryable: false,
          });
        }
        
        // Handle rate limiting
        if (response.status === 429) {
          throw new GeminiError({
            error: 'Rate limit exceeded. Please wait a moment.',
            code: 429,
            retryable: true,
          });
        }

        // Handle quota exceeded
        if (response.status === 403 && errorData.error?.message?.includes('quota')) {
          throw new GeminiError({
            error: 'API quota exceeded. Please try again later.',
            code: 403,
            retryable: false,
          });
        }

        throw new GeminiError({
          error: `API request failed: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`,
          code: response.status,
          retryable: response.status >= 500,
        });
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
        throw new GeminiError({
          error: 'Invalid response format from Gemini API',
          retryable: true,
        });
      }

      return {
        text: data.candidates[0].content.parts[0].text,
        usage: data.usageMetadata ? {
          promptTokens: data.usageMetadata.promptTokenCount || 0,
          completionTokens: data.usageMetadata.candidatesTokenCount || 0,
          totalTokens: data.usageMetadata.totalTokenCount || 0,
        } : undefined,
      };

    } catch (error) {
      // Handle network errors and timeouts
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new GeminiError({
            error: 'Request timeout. Please try again.',
            retryable: true,
          });
        }

        if (error.message.includes('fetch')) {
          throw new GeminiError({
            error: 'Network error. Please check your connection.',
            retryable: true,
          });
        }
      }

      // Retry logic for retryable errors
      if (error instanceof GeminiError && error.retryable && retryCount < this.maxRetries) {
        // Exponential backoff: wait 1s, 2s, 4s
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.generateContent(prompt, retryCount + 1);
      }

      throw error;
    }
  }

  async generateTravelRecommendations(
    userMessage: string,
    detectedMood: string,
    experiencesData: any[],
    retreatsData: any[],
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
  ): Promise<GeminiResponse> {
    // Format experiences with more details
    const experiencesText = experiencesData
      .slice(0, 8)
      .map(exp => {
        const details = [
          `Title: ${exp.title}`,
          `Location: ${exp.location}`,
          `Mood: ${exp.mood || 'Various'}`,
          `Price: ₹${exp.price || 'N/A'}`,
          exp.duration_hours ? `Duration: ${exp.duration_hours} hours` : '',
          exp.description ? `Description: ${exp.description.substring(0, 200)}` : '',
          exp.cover_image ? `Image: ${exp.cover_image}` : '',
        ].filter(Boolean).join(' | ');
        return `- ${details}`;
      })
      .join('\n');

    // Format retreats with more details
    const retreatsText = retreatsData
      .slice(0, 5)
      .map(retreat => {
        const details = [
          `Title: ${retreat.title}`,
          `Location: ${retreat.location}`,
          `Price: ₹${retreat.price || 'N/A'}`,
          retreat.duration_days ? `Duration: ${retreat.duration_days} days` : '',
          retreat.description ? `Description: ${retreat.description.substring(0, 200)}` : '',
          retreat.cover_image ? `Image: ${retreat.cover_image}` : '',
        ].filter(Boolean).join(' | ');
        return `- ${details}`;
      })
      .join('\n');

    // Build context-aware prompt
    const conversationContext = conversationHistory.length > 0
      ? `\n\nPrevious conversation:\n${conversationHistory.map(msg => `${msg.role === 'user' ? 'User' : 'You'}: ${msg.content}`).join('\n')}\n`
      : '';

    const prompt = `User's current message: "${userMessage}"
Detected mood: ${detectedMood}${conversationContext}

Available Experiences (use these for recommendations):
${experiencesText || 'No experiences available'}

Available Retreats (use these for recommendations):
${retreatsText || 'No retreats available'}

IMPORTANT: Your response must be VERY SHORT - just a headline/title (1-2 sentences max). Think like a newspaper headline or section title. Be compelling and crisp. Examples: "Adventure Awaits! 🏔️", "Perfect for Your Chill Mood 🧘", "Ready to Unwind? ✨"

Do NOT write long paragraphs. Keep it brief and punchy. The user will see the detailed options in cards below.`;
    
    return this.generateContent(prompt, 0, conversationHistory);
  }
}

// Export singleton instance
export const geminiClient = new GeminiClient();
