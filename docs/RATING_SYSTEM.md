# Rating System with Table Data

## Overview

The rating system uses data from the database tables and implements the following logic:

- **Platform reviews < 10**: Show Google rating/review count (from properties table)
- **Platform reviews ≥ 10**: Show platform rating/review count (from reviews table)
- **Never show both together**
- **No "New" badge**

## Components

### LiveRating Component (`src/components/LiveRating.tsx`)

The main component that handles rating display:

- Fetches platform ratings from the `reviews` table
- Fetches Google ratings from the `properties` table (google_rating, google_reviews_count columns)
- Implements logic to show either platform or Google ratings (never both)
- Handles loading states and errors

### Rating Calculator (`src/lib/rating-calculator.ts`)

Utilities for calculating and updating property ratings:

- `updatePropertyRating()`: Updates property rating when new reviews are added
- `getPropertyRatingData()`: Gets calculated rating data for a property

## Database Structure

The system uses two data sources:

- **Platform ratings**: Calculated from the `reviews` table
- **Google ratings**: Stored in `properties` table columns:
  - `google_rating`: Google rating value
  - `google_reviews_count`: Google review count

## Usage

### In Components

```tsx
import { LiveRating } from '@/components/LiveRating';

<LiveRating 
  propertyId={property.id}
  propertyTitle={property.title}
  size="sm"
/>
```

### After Adding Reviews

```tsx
import { updatePropertyRating } from '@/lib/rating-calculator';

// After successfully adding a review
await updatePropertyRating(propertyId);
```

## Logic Flow

1. **Component loads**: `LiveRating` fetches both platform and Google ratings
2. **Platform reviews < 10**: Shows Google rating with Google logo
3. **Platform reviews ≥ 10**: Shows platform rating with star icon
4. **New review added**: `updatePropertyRating()` recalculates and updates database
5. **Component refreshes**: Shows updated rating based on new count

## Benefits

- **Table-based data**: No external API dependencies
- **Real-time platform ratings**: Live calculation from reviews table
- **Stored Google ratings**: Fast access from properties table
- **Automatic updates**: Ratings update when reviews are added
- **Clean logic**: Simple rule for showing platform vs Google ratings
- **No API costs**: No external API calls or billing

## Migration Notes

- Uses existing `google_rating` and `google_reviews_count` columns in properties table
- All rating displays use `LiveRating`
- Property cards, detail pages, and booking forms updated
- No changes needed to existing review functionality 