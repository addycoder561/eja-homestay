export interface ItineraryItem {
  time: string;
  activity: string;
  description?: string;
  duration?: string;
}

export interface ExperienceItinerary {
  title: string;
  duration: string;
  price: number;
  location: string;
  items: ItineraryItem[];
  highlights: string[];
}

export interface RetreatItinerary {
  title: string;
  duration: string;
  price: number;
  location: string;
  days: {
    day: number;
    title: string;
    activities: ItineraryItem[];
  }[];
  highlights: string[];
}

export class ItineraryGenerator {
  generateExperienceItinerary(experience: any): ExperienceItinerary {
    const duration = experience.duration_hours 
      ? `${experience.duration_hours} hours`
      : 'Full day';

    const items: ItineraryItem[] = [];
    const highlights: string[] = [];

    // Generate itinerary based on experience type and mood
    if (experience.mood?.toLowerCase().includes('adventure')) {
      items.push(
        { time: 'Morning', activity: 'Adventure briefing and safety orientation', duration: '30 mins' },
        { time: 'Morning', activity: 'Main adventure activity', duration: '2-3 hours' },
        { time: 'Afternoon', activity: 'Recovery and reflection time', duration: '1 hour' },
        { time: 'Evening', activity: 'Group sharing and photo session', duration: '30 mins' }
      );
      highlights.push('Thrilling adventure experience', 'Safety-first approach', 'Group bonding');
    } else if (experience.mood?.toLowerCase().includes('wellness')) {
      items.push(
        { time: 'Morning', activity: 'Welcome and intention setting', duration: '30 mins' },
        { time: 'Morning', activity: 'Wellness practice (yoga/meditation)', duration: '1.5 hours' },
        { time: 'Afternoon', activity: 'Healthy meal and rest', duration: '1 hour' },
        { time: 'Afternoon', activity: 'Mindfulness and reflection', duration: '1 hour' },
        { time: 'Evening', activity: 'Closing circle and integration', duration: '30 mins' }
      );
      highlights.push('Holistic wellness approach', 'Mind-body connection', 'Personal transformation');
    } else if (experience.mood?.toLowerCase().includes('cultural')) {
      items.push(
        { time: 'Morning', activity: 'Cultural introduction and context', duration: '30 mins' },
        { time: 'Morning', activity: 'Guided cultural exploration', duration: '2 hours' },
        { time: 'Afternoon', activity: 'Interactive cultural activity', duration: '1.5 hours' },
        { time: 'Evening', activity: 'Cultural sharing and Q&A', duration: '30 mins' }
      );
      highlights.push('Authentic cultural immersion', 'Local expert guidance', 'Interactive learning');
    } else {
      // Default itinerary
      items.push(
        { time: 'Morning', activity: 'Welcome and introduction', duration: '30 mins' },
        { time: 'Morning', activity: 'Main experience activity', duration: '2 hours' },
        { time: 'Afternoon', activity: 'Break and refreshments', duration: '30 mins' },
        { time: 'Afternoon', activity: 'Continued experience', duration: '1.5 hours' },
        { time: 'Evening', activity: 'Wrap-up and feedback', duration: '30 mins' }
      );
      highlights.push('Immersive experience', 'Expert guidance', 'Memorable moments');
    }

    return {
      title: experience.title,
      duration,
      price: experience.price,
      location: experience.location,
      items,
      highlights,
    };
  }

  generateRetreatItinerary(retreat: any): RetreatItinerary {
    const duration = retreat.duration_days 
      ? `${retreat.duration_days} days`
      : 'Multi-day retreat';

    const days = [];
    const highlights: string[] = [];

    // Generate day-by-day itinerary
    for (let day = 1; day <= (retreat.duration_days || 3); day++) {
      const dayActivities: ItineraryItem[] = [];

      if (day === 1) {
        // Arrival day
        dayActivities.push(
          { time: 'Afternoon', activity: 'Arrival and welcome', duration: '1 hour' },
          { time: 'Evening', activity: 'Orientation and intention setting', duration: '1 hour' },
          { time: 'Evening', activity: 'Welcome dinner and introductions', duration: '2 hours' }
        );
      } else if (day === (retreat.duration_days || 3)) {
        // Departure day
        dayActivities.push(
          { time: 'Morning', activity: 'Final practice and integration', duration: '1.5 hours' },
          { time: 'Morning', activity: 'Closing circle and sharing', duration: '1 hour' },
          { time: 'Afternoon', activity: 'Departure and farewell', duration: '30 mins' }
        );
      } else {
        // Regular days
        dayActivities.push(
          { time: 'Morning', activity: 'Morning practice (yoga/meditation)', duration: '1.5 hours' },
          { time: 'Morning', activity: 'Healthy breakfast', duration: '1 hour' },
          { time: 'Afternoon', activity: 'Main retreat activity', duration: '2-3 hours' },
          { time: 'Afternoon', activity: 'Rest and reflection time', duration: '1 hour' },
          { time: 'Evening', activity: 'Evening practice and sharing', duration: '1.5 hours' }
        );
      }

      days.push({
        day,
        title: day === 1 ? 'Arrival & Welcome' : 
               day === (retreat.duration_days || 3) ? 'Departure & Integration' : 
               `Day ${day} - Deep Practice`,
        activities: dayActivities,
      });
    }

    // Generate highlights based on retreat type
    if (retreat.title?.toLowerCase().includes('yoga')) {
      highlights.push('Daily yoga practice', 'Meditation sessions', 'Holistic wellness');
    } else if (retreat.title?.toLowerCase().includes('wellness')) {
      highlights.push('Wellness practices', 'Healthy meals', 'Mind-body healing');
    } else {
      highlights.push('Immersive experience', 'Group bonding', 'Personal growth');
    }

    return {
      title: retreat.title,
      duration,
      price: retreat.price,
      location: retreat.location,
      days,
      highlights,
    };
  }

  formatItineraryText(itinerary: ExperienceItinerary | RetreatItinerary): string {
    if ('items' in itinerary) {
      // Experience itinerary
      const experienceItinerary = itinerary as ExperienceItinerary;
      let text = `**${experienceItinerary.title}**\n`;
      text += `📍 ${experienceItinerary.location} | ⏱️ ${experienceItinerary.duration} | 💰 ₹${experienceItinerary.price}\n\n`;
      
      text += '**Itinerary:**\n';
      experienceItinerary.items.forEach(item => {
        text += `• ${item.time}: ${item.activity}`;
        if (item.duration) text += ` (${item.duration})`;
        text += '\n';
      });

      if (experienceItinerary.highlights.length > 0) {
        text += '\n**Highlights:**\n';
        experienceItinerary.highlights.forEach(highlight => {
          text += `✨ ${highlight}\n`;
        });
      }

      return text;
    } else {
      // Retreat itinerary
      const retreatItinerary = itinerary as RetreatItinerary;
      let text = `**${retreatItinerary.title}**\n`;
      text += `📍 ${retreatItinerary.location} | ⏱️ ${retreatItinerary.duration} | 💰 ₹${retreatItinerary.price}\n\n`;
      
      text += '**Daily Schedule:**\n';
      retreatItinerary.days.forEach(day => {
        text += `\n**Day ${day.day}: ${day.title}**\n`;
        day.activities.forEach(activity => {
          text += `• ${activity.time}: ${activity.activity}`;
          if (activity.duration) text += ` (${activity.duration})`;
          text += '\n';
        });
      });

      if (retreatItinerary.highlights.length > 0) {
        text += '\n**Highlights:**\n';
        retreatItinerary.highlights.forEach(highlight => {
          text += `✨ ${highlight}\n`;
        });
      }

      return text;
    }
  }
}

// Export singleton instance
export const itineraryGenerator = new ItineraryGenerator();
