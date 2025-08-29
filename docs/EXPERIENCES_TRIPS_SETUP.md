# Experiences and Trips Setup Guide

This guide explains how to set up the Experiences and Trips functionality in the EJA application.

## Overview

The application now fetches experiences and trips data from Supabase instead of using hardcoded data. This makes the application fully dynamic and allows for easy management of experiences and trips through the database.

## Changes Made

### 1. Updated Experiences Page (`src/app/experiences/page.tsx`)
- **Removed**: Hardcoded `experiences` array
- **Added**: Database fetching using `getExperiences()` function
- **Added**: Loading states and error handling
- **Added**: Empty state handling when no experiences are available
- **Enhanced**: TypeScript interface to include database fields

### 2. Updated Trips Page (`src/app/trips/page.tsx`)
- **Removed**: Hardcoded `trips` array
- **Added**: Database fetching using `getTrips()` function
- **Added**: Loading states and error handling
- **Added**: Empty state handling when no trips are available
- **Enhanced**: TypeScript interface to include database fields

### 3. Database Functions (Already Available)
The following functions in `src/lib/database.ts` are used:
- `getExperiences()` - Fetches all experiences from the database
- `getTrips()` - Fetches all trips from the database
- `createExperienceBooking()` - Creates experience bookings
- `createTripBooking()` - Creates trip bookings

## Setup Instructions

### Step 1: Run the SQL Script
1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `scripts/setup-experiences-trips.sql`
4. Execute the script

### Step 2: Verify Data
After running the script, you should see:
- 8 experiences added to the `experiences` table
- 8 trips added to the `trips` table
- A summary showing the count of records in each table

### Step 3: Test the Application
1. Start your development server: `npm run dev`
2. Navigate to `/experiences` - you should see the experiences loading from the database
3. Navigate to `/trips` - you should see the trips loading from the database
4. Test the search functionality by filtering by location
5. Test the booking functionality (requires authentication)

## Sample Data Included

### Experiences (8 items)
1. **Sunrise Mountain Hike** - Manali, Himachal Pradesh (₹1,200)
2. **Local Food Tasting Tour** - Jaipur, Rajasthan (₹900)
3. **Pottery Workshop** - Pune, Maharashtra (₹700)
4. **Old City Heritage Walk** - Varanasi, Uttar Pradesh (₹500)
5. **Yoga by the Ganges** - Rishikesh, Uttarakhand (₹800)
6. **Spice Garden Tour** - Munnar, Kerala (₹600)
7. **Desert Safari** - Jaisalmer, Rajasthan (₹1,500)
8. **Traditional Dance Performance** - Udaipur, Rajasthan (₹400)

### Trips (8 items)
1. **Golden Triangle Tour** - Delhi, Agra, Jaipur (₹8,500)
2. **Goa Beach Getaway** - Goa (₹6,500)
3. **Kerala Backwaters** - Alleppey, Kerala (₹9,000)
4. **Himalayan Adventure** - Leh, Ladakh (₹12,000)
5. **Rajasthan Heritage Tour** - Jaipur, Jodhpur, Udaipur (₹11,000)
6. **South India Temple Trail** - Chennai, Madurai, Rameshwaram (₹7,500)
7. **Northeast Discovery** - Guwahati, Shillong, Kaziranga (₹9,500)
8. **Mumbai to Goa Coastal Drive** - Mumbai, Ratnagiri, Goa (₹8,000)

## Features

### Loading States
- Both pages now show loading spinners while fetching data
- Users get visual feedback during data loading

### Error Handling
- If database queries fail, users see error messages
- Graceful fallback when data cannot be loaded

### Empty States
- When no experiences/trips are available, users see helpful messages
- When search returns no results, users get guidance

### Search Functionality
- Users can search experiences and trips by location
- Real-time filtering as users type

### Booking System
- Full booking functionality with payment integration
- Guest information collection
- Email notifications for successful bookings

## Database Schema

### Experiences Table
```sql
CREATE TABLE experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT NOT NULL,
  price INTEGER NOT NULL,
  date DATE,
  max_guests INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Trips Table
```sql
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT NOT NULL,
  price INTEGER NOT NULL,
  duration TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  max_guests INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Troubleshooting

### No Data Loading
1. Check if the SQL script was executed successfully
2. Verify the database connection in your `.env.local` file
3. Check the browser console for any errors
4. Ensure the Supabase functions are working correctly

### Booking Issues
1. Make sure users are authenticated
2. Check if the booking tables exist in the database
3. Verify the payment integration is configured

### Search Not Working
1. Check if the location data is properly formatted
2. Verify the search logic is working correctly
3. Test with different search terms

## Future Enhancements

1. **Admin Panel**: Add ability to manage experiences and trips through an admin interface
2. **Categories**: Add categories for better organization
3. **Reviews**: Add review system for experiences and trips
4. **Availability**: Add availability checking for experiences and trips
5. **Images**: Add multiple images support
6. **Pricing**: Add dynamic pricing based on dates and demand

## Files Modified

- `src/app/experiences/page.tsx` - Updated to fetch from database
- `src/app/trips/page.tsx` - Updated to fetch from database
- `scripts/setup-experiences-trips.sql` - SQL script for sample data
- `scripts/add-sample-experiences.sql` - Individual experiences script
- `scripts/add-sample-trips.sql` - Individual trips script
- `EXPERIENCES_TRIPS_SETUP.md` - This documentation file 