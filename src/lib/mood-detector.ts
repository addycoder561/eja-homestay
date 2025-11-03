import { MOOD_KEYWORDS } from './gemini-config';

export interface MoodDetectionResult {
  mood: string;
  confidence: number;
  keywords: string[];
}

export class MoodDetector {
  private moodPatterns: Record<string, RegExp[]> = {};

  constructor() {
    // Initialize mood patterns
    this.moodPatterns = {
      adventure: [
        /adventure/i,
        /adventurous/i,
        /thrill/i,
        /thrilling/i,
        /exciting/i,
        /exciting/i,
        /extreme/i,
        /daring/i,
        /bold/i,
        /action/i,
        /sports/i,
        /hiking/i,
        /climbing/i,
        /biking/i,
        /trekking/i,
        /outdoor/i,
        /nature/i,
        /explore/i,
        /discover/i,
        /journey/i,
        /expedition/i,
      ],
      relaxation: [
        /relax/i,
        /relaxing/i,
        /peaceful/i,
        /calm/i,
        /chill/i,
        /chilling/i,
        /soulful/i,
        /wellness/i,
        /spa/i,
        /meditation/i,
        /yoga/i,
        /mindful/i,
        /zen/i,
        /serene/i,
        /tranquil/i,
        /quiet/i,
        /rest/i,
        /resting/i,
        /unwind/i,
        /de-stress/i,
        /stress/i,
        /tired/i,
        /exhausted/i,
        /burnout/i,
      ],
      social: [
        /social/i,
        /socialize/i,
        /group/i,
        /team/i,
        /friends/i,
        /party/i,
        /celebration/i,
        /fun/i,
        /playful/i,
        /play/i,
        /dance/i,
        /music/i,
        /concert/i,
        /festival/i,
        /community/i,
        /meet/i,
        /connect/i,
        /network/i,
        /collaborate/i,
        /together/i,
        /shared/i,
        /bonding/i,
      ],
      cultural: [
        /cultural/i,
        /culture/i,
        /artistic/i,
        /art/i,
        /museum/i,
        /gallery/i,
        /heritage/i,
        /traditional/i,
        /history/i,
        /historical/i,
        /learning/i,
        /learn/i,
        /educational/i,
        /meaningful/i,
        /spiritual/i,
        /temple/i,
        /monument/i,
        /architecture/i,
        /craft/i,
        /handicraft/i,
        /local/i,
        /authentic/i,
      ],
      foodie: [
        /food/i,
        /foodie/i,
        /culinary/i,
        /cooking/i,
        /cook/i,
        /chef/i,
        /restaurant/i,
        /dining/i,
        /dine/i,
        /taste/i,
        /flavor/i,
        /cuisine/i,
        /recipe/i,
        /kitchen/i,
        /meal/i,
        /eat/i,
        /eating/i,
        /delicious/i,
        /gourmet/i,
        /street food/i,
        /local food/i,
        /traditional food/i,
      ],
      wellness: [
        /wellness/i,
        /health/i,
        /healthy/i,
        /fitness/i,
        /exercise/i,
        /workout/i,
        /gym/i,
        /yoga/i,
        /meditation/i,
        /mindfulness/i,
        /mental health/i,
        /physical/i,
        /body/i,
        /mind/i,
        /soul/i,
        /balance/i,
        /harmony/i,
        /healing/i,
        /therapy/i,
        /retreat/i,
        /detox/i,
        /cleanse/i,
      ],
    };
  }

  detectMood(userMessage: string): MoodDetectionResult {
    const message = userMessage.toLowerCase();
    const scores: Record<string, number> = {};
    const matchedKeywords: Record<string, string[]> = {};

    // Initialize scores
    Object.keys(this.moodPatterns).forEach(mood => {
      scores[mood] = 0;
      matchedKeywords[mood] = [];
    });

    // Score each mood based on pattern matches
    Object.entries(this.moodPatterns).forEach(([mood, patterns]) => {
      patterns.forEach(pattern => {
        const matches = message.match(pattern);
        if (matches) {
          scores[mood] += matches.length;
          matchedKeywords[mood].push(matches[0]);
        }
      });
    });

    // Find the mood with highest score
    const sortedMoods = Object.entries(scores)
      .sort(([, a], [, b]) => b - a);

    const [detectedMood, score] = sortedMoods[0];
    const totalPossibleScore = Object.keys(this.moodPatterns[detectedMood]).length;
    const confidence = Math.min(score / totalPossibleScore, 1);

    return {
      mood: detectedMood,
      confidence,
      keywords: matchedKeywords[detectedMood] || [],
    };
  }

  getMoodKeywords(mood: string): string[] {
    return MOOD_KEYWORDS[mood] || [];
  }

  // Quick mood detection for common phrases
  quickDetect(userMessage: string): string | null {
    const message = userMessage.toLowerCase();

    // Common mood phrases
    const quickPatterns = {
      'adventure': [
        /i'm feeling adventurous/i,
        /i want adventure/i,
        /something exciting/i,
        /thrilling/i,
        /adrenaline/i,
      ],
      'relaxation': [
        /i'm stressed/i,
        /i need a break/i,
        /i'm tired/i,
        /i want to relax/i,
        /peaceful/i,
        /calm/i,
        /chill/i,
      ],
      'social': [
        /i want to meet people/i,
        /social/i,
        /group activity/i,
        /fun with friends/i,
        /party/i,
      ],
      'cultural': [
        /i want to learn/i,
        /cultural/i,
        /art/i,
        /history/i,
        /traditional/i,
      ],
      'foodie': [
        /i'm hungry/i,
        /food/i,
        /cooking/i,
        /culinary/i,
        /restaurant/i,
      ],
    };

    for (const [mood, patterns] of Object.entries(quickPatterns)) {
      if (patterns.some(pattern => pattern.test(message))) {
        return mood;
      }
    }

    return null;
  }
}

// Export singleton instance
export const moodDetector = new MoodDetector();
