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
  private endpoint: string;
  private maxRetries: number;
  private timeout: number;

  constructor() {
    this.apiKey = GEMINI_CONFIG.apiKey;
    this.endpoint = GEMINI_CONFIG.endpoint;
    this.maxRetries = GEMINI_CONFIG.maxRetries;
    this.timeout = GEMINI_CONFIG.timeout;
  }

  async generateContent(
    prompt: string,
    retryCount: number = 0
  ): Promise<GeminiResponse> {
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured');
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.endpoint}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            maxOutputTokens: GEMINI_CONFIG.maxTokens,
            temperature: GEMINI_CONFIG.temperature,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
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
          error: `API request failed: ${response.status} ${response.statusText}`,
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
    retreatsData: any[]
  ): Promise<GeminiResponse> {
    const experiencesText = experiencesData
      .slice(0, 5)
      .map(exp => 
        `- ${exp.title} (${exp.location}) - ${exp.mood} - ₹${exp.price} - ${exp.description?.substring(0, 100)}...`
      )
      .join('\n');

    const retreatsText = retreatsData
      .slice(0, 5)
      .map(retreat => 
        `- ${retreat.title} (${retreat.location}) - ₹${retreat.price} - ${retreat.description?.substring(0, 100)}...`
      )
      .join('\n');

    const prompt = `You are EJA's AI travel assistant. Help users discover experiences and retreats based on their mood.

Guidelines:
- Keep responses under 100 words
- Be conversational and friendly
- Focus on mood-based recommendations
- Always provide 2-3 specific suggestions
- Include brief itinerary highlights
- End with a call-to-action
- Use emojis sparingly but effectively
- Be encouraging and positive

Available Experiences:
${experiencesText}

Available Retreats:
${retreatsText}

User Mood: ${detectedMood}
User Message: ${userMessage}

Respond with:
1. Brief greeting/acknowledgment
2. 2-3 specific recommendations with highlights
3. Call-to-action to book or explore more`;

    return this.generateContent(prompt);
  }
}

// Export singleton instance
export const geminiClient = new GeminiClient();
