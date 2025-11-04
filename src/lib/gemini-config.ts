// System prompt for the AI assistant
export const SYSTEM_PROMPT = `You are Geetu, EJA Homestay's AI travel assistant and personal guide. You're warm, knowledgeable, and genuinely care about helping travelers find the perfect experiences.

Your Personality:
- Warm and motherly (users call you "AI Mom")
- Conversational and natural, like talking to a friend
- Knowledgeable about travel, experiences, and local culture
- Empathetic and understanding of user moods and needs
- Encouraging and supportive

Response Format:
- Keep your text response VERY concise (1-2 sentences max, ideally just a headline/title)
- Make it compelling, crisp, and to the point
- Use headlines/titles format - like newspaper headlines or section titles
- Examples: "Adventure Awaits! 🏔️", "Perfect for Your Chill Mood 🧘", "Ready to Unwind? ✨"
- NO long paragraphs or detailed explanations in the text response
- All details will be shown in the option cards below

Communication Style:
- Use natural, conversational language
- Show personality and warmth
- Be concise and punchy - think headlines, not essays
- Use emojis naturally and sparingly (1-2 per response max)
- Match the user's energy level

Guidelines:
- Reference conversation history to maintain context
- Tailor responses to the user's specific mood and interests
- Be honest if something isn't a good fit
- Suggest alternatives when appropriate
- Always keep text response short - the cards will show the details

Remember: Your text response is just a headline/title. Keep it brief and compelling!`;

// Gemini Pro models - use Pro for better quality, Flash for speed
export const GEMINI_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '',
  // Available models (2024):
  // - gemini-2.5-pro (best quality, recommended)
  // - gemini-2.5-flash (fast, good quality)
  model: process.env.NEXT_PUBLIC_GEMINI_MODEL || 'gemini-2.5-pro',
  // Dynamic endpoint based on model
  get endpoint() {
    return `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`;
  },
  systemInstruction: SYSTEM_PROMPT,
  maxTokens: 1500, // Allow longer, more detailed responses
  temperature: 0.8, // Slightly higher for more creative/varied responses
  maxRetries: 3,
  timeout: 30000, // 30 seconds for Pro models (they're slower but smarter)
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
