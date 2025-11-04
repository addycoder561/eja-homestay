import { NextRequest, NextResponse } from 'next/server';
import { geminiClient, GeminiError } from '@/lib/gemini-client';
import { moodDetector } from '@/lib/mood-detector';
import { itineraryGenerator } from '@/lib/itinerary-generator';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory = [] } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Check if Gemini API key is configured
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      console.warn('Gemini API key not configured, using fallback response');
      
      // Detect mood from user message
      const moodResult = moodDetector.detectMood(message);
      const detectedMood = moodResult.mood;
      const moodKeywords = moodDetector.getMoodKeywords(detectedMood);

      // Query database for relevant experiences and retreats
      const { experiences, retreats } = await getRecommendations(moodKeywords, 5);

      // Generate fallback response
      const fallbackResponse = generateFallbackResponse(detectedMood, experiences, retreats);
      const suggestions = formatSuggestions(experiences, retreats);

      return NextResponse.json({
        success: true,
        data: {
          message: fallbackResponse,
          detectedMood,
          confidence: moodResult.confidence,
          suggestions,
          conversationHistory: [...conversationHistory, { role: 'user', content: message }],
        },
      });
    }

    // Detect mood from user message
    const moodResult = moodDetector.detectMood(message);
    const detectedMood = moodResult.mood;
    const moodKeywords = moodDetector.getMoodKeywords(detectedMood);

    // Query database for relevant experiences and retreats
    const { experiences, retreats } = await getRecommendations(moodKeywords, 5);

    // Generate AI response using Gemini with conversation history
    const aiResponse = await geminiClient.generateTravelRecommendations(
      message,
      detectedMood,
      experiences,
      retreats,
      conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content,
      }))
    );

    // Format response with suggestions
    const suggestions = formatSuggestions(experiences, retreats);

    return NextResponse.json({
      success: true,
      data: {
        message: aiResponse.text,
        detectedMood,
        confidence: moodResult.confidence,
        suggestions,
        conversationHistory: [...conversationHistory, { role: 'user', content: message }],
      },
    });

  } catch (error) {
    console.error('AI Chat API Error:', error);

    if (error instanceof GeminiError) {
      return NextResponse.json(
        { 
          error: error.error,
          retryable: error.retryable,
          code: error.code 
        },
        { status: error.code || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getRecommendations(moodKeywords: string[], limit: number = 5) {
  try {
    // Query experiences (Hyper-local and Online only, exclude Retreats)
    const { data: experiences, error: expError } = await supabase
      .from('experiences_with_host')
      .select('*')
      .in('mood', moodKeywords)
      .eq('is_active', true)
      .neq('location', 'Retreats') // Exclude retreats
      .limit(limit);

    if (expError) {
      console.error('Error fetching experiences:', expError);
    }

    // Query retreats (only items with location = 'Retreats')
    const { data: retreats, error: retreatError } = await supabase
      .from('experiences')
      .select('*')
      .eq('is_active', true)
      .eq('location', 'Retreats') // Only get actual retreats
      .limit(limit);

    if (retreatError) {
      console.error('Error fetching retreats:', retreatError);
    }

    return {
      experiences: experiences || [],
      retreats: retreats || [],
    };

  } catch (error) {
    console.error('Database query error:', error);
    return {
      experiences: [],
      retreats: [],
    };
  }
}

function formatSuggestions(experiences: any[], retreats: any[]) {
  const suggestions = [];

  // Add experiences (Hyper-local and Online)
  experiences.slice(0, 3).forEach(exp => {
    // Determine duration based on location and available fields
    let duration = 'Full day';
    if (exp.duration_hours) {
      duration = `${exp.duration_hours} hours`;
    } else if (exp.location === 'Online') {
      duration = 'Online';
    } else if (exp.location === 'Hyper-local') {
      duration = 'Hyper-local';
    }

    suggestions.push({
      id: exp.id,
      type: 'experience',
      title: exp.title,
      description: exp.description?.substring(0, 100) + '...',
      location: exp.location,
      price: exp.price,
      mood: exp.mood,
      cover_image: exp.cover_image,
      duration: duration,
      booking_url: `/experiences/${exp.id}`,
      itinerary: itineraryGenerator.formatItineraryText(
        itineraryGenerator.generateExperienceItinerary(exp)
      ),
    });
  });

  // Add retreats (only items with location = 'Retreats')
  retreats.slice(0, 2).forEach(retreat => {
    // For retreats, check duration_days field if available, otherwise use Multi-day
    let duration = 'Multi-day';
    if (retreat.duration_days) {
      duration = `${retreat.duration_days} days`;
    }

    suggestions.push({
      id: retreat.id,
      type: 'retreat',
      title: retreat.title,
      description: retreat.description?.substring(0, 100) + '...',
      location: retreat.location,
      price: retreat.price,
      mood: 'Retreat',
      cover_image: retreat.cover_image,
      duration: duration,
      booking_url: `/retreats/${retreat.id}`,
      itinerary: itineraryGenerator.formatItineraryText(
        itineraryGenerator.generateRetreatItinerary(retreat)
      ),
    });
  });

  return suggestions;
}

function generateFallbackResponse(mood: string, experiences: any[], retreats: any[]) {
  const moodEmojis: Record<string, string> = {
    'adventure': '🏔️',
    'relaxation': '🧘',
    'social': '🎉',
    'cultural': '🎭',
    'foodie': '🍽️',
    'wellness': '🌿',
  };

  const moodMessages: Record<string, string> = {
    'adventure': 'Ready for some excitement?',
    'relaxation': 'Time to unwind and recharge!',
    'social': 'Let\'s connect and have fun!',
    'cultural': 'Ready to explore and learn?',
    'foodie': 'Let\'s discover amazing flavors!',
    'wellness': 'Time to focus on your wellbeing!',
  };

  const emoji = moodEmojis[mood] || '✨';
  const message = moodMessages[mood] || 'Let me help you find something amazing!';

  let response = `${emoji} ${message}\n\n`;

  if (experiences.length > 0 || retreats.length > 0) {
    response += 'Here are some great options for you:\n\n';
    
    // Add experiences
    experiences.slice(0, 2).forEach((exp, index) => {
      response += `${index + 1}. **${exp.title}**\n`;
      response += `   📍 ${exp.location} | 💰 ₹${exp.price}\n`;
      if (exp.description) {
        response += `   ${exp.description.substring(0, 80)}...\n`;
      }
      response += '\n';
    });

    // Add retreats
    retreats.slice(0, 1).forEach((retreat, index) => {
      const retreatIndex = experiences.length + index + 1;
      response += `${retreatIndex}. **${retreat.title}**\n`;
      response += `   📍 ${retreat.location} | 💰 ₹${retreat.price}\n`;
      if (retreat.description) {
        response += `   ${retreat.description.substring(0, 80)}...\n`;
      }
      response += '\n';
    });

    response += 'Click on any option to view details or book directly! 🎯';
  } else {
    response += 'I couldn\'t find specific matches for your mood, but I\'m sure we can find something perfect for you! Try browsing our experiences or retreats sections.';
  }

  return response;
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
