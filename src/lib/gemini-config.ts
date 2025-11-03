export const GEMINI_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '',
  model: 'gemini-1.5-flash',
  endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
  maxTokens: 500, // Keep responses concise
  temperature: 0.7,
  maxRetries: 3,
  timeout: 10000, // 10 seconds
};

export const MOOD_KEYWORDS = {
  'adventure': ['Adventure', 'Thrill'],
  'relaxation': ['Chill', 'Soulful', 'Wellness'],
  'social': ['Social', 'Group', 'Playful'],
  'cultural': ['Cultural', 'Artistic', 'Meaningful'],
  'foodie': ['Foodie', 'Culinary'],
  'happy': ['Happy', 'Playful', 'Social'],
  'chill': ['Chill', 'Soulful', 'Relaxation'],
  'bold': ['Adventure', 'Thrill', 'Bold'],
  'creative': ['Creative', 'Artistic', 'Cultural'],
  'wellness': ['Wellness', 'Soulful', 'Chill'],
  'nature': ['Nature', 'Adventure', 'Wellness'],
  'learning': ['Learning', 'Cultural', 'Meaningful'],
};

export const QUICK_MOODS = [
  { emoji: '😊', label: 'Happy', value: 'happy' },
  { emoji: '😌', label: 'Chill', value: 'chill' },
  { emoji: '💪', label: 'Bold', value: 'bold' },
  { emoji: '🎉', label: 'Social', value: 'social' },
];

export const SYSTEM_PROMPT = `You are EJA's AI travel assistant. Help users discover experiences and retreats based on their mood.

Guidelines:
- Keep responses under 100 words
- Be conversational and friendly
- Focus on mood-based recommendations
- Always provide 2-3 specific suggestions
- Include brief itinerary highlights
- End with a call-to-action
- Use emojis sparingly but effectively
- Be encouraging and positive

Available Data:
{experiences_data}
{retreats_data}

User Mood: {detected_mood}
User Message: {user_message}

Respond with:
1. Brief greeting/acknowledgment
2. 2-3 specific recommendations with highlights
3. Call-to-action to book or explore more`;
