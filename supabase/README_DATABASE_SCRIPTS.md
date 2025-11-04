# EJA Homestay - Database Scripts Guide

This directory contains SQL scripts to set up the EJA Homestay database from scratch.

## 📋 Overview

The database consists of:
- **15 Tables**: blogs, bookings, bucketlist, completed_dares, dare_engagements, dares, experiences, follows, notifications, profiles, properties, micro_experiences, room_inventory, rooms, tales
- **6 Views**: completed_dare_stats, dare_stats, experiences_with_host, property_rooms_summary, room_availability_view, user_social_stats

## 🚀 Execution Order

Run the scripts in this exact order:

### 1. **01_schema_structure.sql** (Run FIRST)
- Creates all 15 tables with proper structure
- Sets up foreign keys, indexes, and constraints
- Enables Row Level Security (RLS) policies
- Creates triggers for `updated_at` columns

**Prerequisites:**
- Supabase project created
- No existing tables (or drop existing ones first)

### 2. **Populate Data via CSV Uploads** (Optional)
- Use Supabase Dashboard → Table Editor → Import CSV
- Upload your data files for each table
- Recommended method for real/production data

### 3. **04_create_storage_buckets.sql** (Optional but Recommended)
- Creates storage buckets for media files
- Sets up storage policies for file access
- Creates `completed-dares` bucket for dare completion media
- Creates `experience-images` bucket for experience images

**Prerequisites:**
- Schema script (01) executed
- Can be run at any time after schema setup

### 4. **03_create_views.sql** (Run LAST)
- Creates all 6 views for optimized queries
- Sets up aggregated statistics views
- Grants necessary permissions

**Prerequisites:**
- Schema script (01) executed
- Data populated (via CSV uploads or manual insertion)

## 📁 Script Details

### 01_schema_structure.sql

**Tables Created:**
1. `profiles` - User profiles with host/guest roles
2. `properties` - Homestay properties
3. `rooms` - Rooms within properties
4. `room_inventory` - Daily availability for rooms
5. `bookings` - Property bookings
6. `experiences` - Experiences and retreats (unified)
7. `micro_experiences` - Budget tiers for retreat experiences
8. `tales` - Reviews/stories for experiences and properties
9. `dares` - Challenge dares
10. `completed_dares` - User completions of dares
11. `dare_engagements` - Engagements (smiles, comments, shares, tags)
12. `bucketlist` - User wishlists
13. `follows` - User follow relationships
14. `notifications` - User notifications
15. `blogs` - Blog posts

**Features:**
- Comprehensive RLS policies for data security
- Foreign key constraints for data integrity
- Indexes for query performance
- Automatic `updated_at` triggers

### 04_create_storage_buckets.sql

**Buckets Created:**
1. `completed-dares` - For dare completion media (images/videos)
2. `experience-images` - For experience story images (backward compatibility)

**Storage Policies:**
- Public read access (anyone can view files)
- Authenticated users can upload
- Users can update/delete their own files (in folders named with their user ID)

**Features:**
- 50MB file size limit per file
- Allowed MIME types: images (JPEG, PNG, WebP, GIF) and videos (MP4, WebM)
- Secure file access controls

### 03_create_views.sql

**Views Created:**
1. `completed_dare_stats` - Engagement stats for completed dares
2. `dare_stats` - Statistics for original dares
3. `experiences_with_host` - Experiences with host profile info
4. `property_rooms_summary` - Aggregated room data per property
5. `room_availability_view` - Room availability with property details
6. `user_social_stats` - Social statistics per user

**Features:**
- Optimized queries with JOINs
- Aggregated statistics
- Proper permissions granted

## 🔧 Setup Instructions

1. **Open Supabase Dashboard** → SQL Editor

2. **Create a User First** (if not already exists):
   - Go to Authentication → Users
   - Create a new user or use existing one
   - Note: Required for profiles table (foreign key to auth.users)

3. **Run Scripts in Order:**
   ```sql
   -- Step 1: Copy and run 01_schema_structure.sql (REQUIRED)
   -- Step 2: Populate data via CSV uploads in Supabase Dashboard
   -- Step 3: Copy and run 03_create_views.sql (REQUIRED)
   ```

4. **Populate Data:**
   - Use CSV uploads in Supabase Dashboard (Table Editor → Import CSV)
   - Ensure data respects foreign key relationships
   - Upload tables in dependency order (profiles first, then others)

5. **Verify Installation:**
   - Check table count: Should have 15 tables
   - Check view count: Should have 6 views
   - Verify data: Run verification queries at the end of each script

## 🔍 Verification Queries

After running all scripts, verify with:

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Check all views exist
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check row counts
SELECT 'profiles' AS table_name, COUNT(*) AS row_count FROM profiles
UNION ALL SELECT 'properties', COUNT(*) FROM properties
UNION ALL SELECT 'experiences', COUNT(*) FROM experiences
-- ... etc
```

## 🛠️ Customization

### Modifying RLS Policies

Edit the `CREATE POLICY` statements in `01_schema_structure.sql` to adjust access control.

## 📝 Notes

- All scripts use `IF NOT EXISTS` / `IF EXISTS` clauses to prevent errors on re-runs
- Data insertion uses `ON CONFLICT DO NOTHING` / `ON CONFLICT DO UPDATE` for idempotency
- Views are created with `CREATE OR REPLACE` to allow re-runs
- All timestamps use `TIMESTAMPTZ` for timezone support

## 🐛 Troubleshooting

**Error: "No users found in auth.users"**
- Create a user first in Supabase Authentication

**Error: Foreign key constraint violation**
- Ensure you run scripts in order: Schema → CSV Uploads → Views
- Upload tables in dependency order (profiles first, then dependent tables)

**Error: Table already exists**
- Scripts use `IF NOT EXISTS`, but if you need to start fresh, drop tables first:
  ```sql
  DROP TABLE IF EXISTS blogs, bookings, bucketlist, completed_dares, 
    dare_engagements, dares, experiences, follows, notifications, 
    profiles, properties, micro_experiences, room_inventory, rooms, tales CASCADE;
  ```

**RLS Policy Errors**
- Ensure user is authenticated in Supabase
- Check that policies allow the operation you're trying to perform

## 📚 Related Files

- `00_drop_views.sql` - Drop all views before recreating
- `remove_reactions_shares_tables.sql` - Legacy cleanup script (already executed)
- `extend_dare_engagements_table.sql` - Extension script (already executed)
- `rename_tables.sql` - Table rename script (already executed)

---

**Last Updated:** After table consolidation (reactions/shares removed, tables renamed)

