# EJA Homestay - Database Scripts Guide

This directory contains SQL scripts to set up the EJA Homestay database from scratch.

## 📋 Overview

The database consists of:
- **15 Tables**: blogs, bookings, bucketlist, completed_dares, dare_engagements, dares, experiences, follows, notifications, profiles, properties, micro_experiences, room_inventory, rooms, tales
- **6 Views**: completed_dare_stats, dare_stats, experiences_with_host, property_rooms_summary, room_availability_view, user_social_stats

## 🚀 Execution Order

Run the scripts in this exact order:

### 1. **01_schema_structure_latest.sql** (Run FIRST - REQUIRED)
- Creates all 15 tables with correct column structure matching actual database
- Sets up foreign keys, indexes, and constraints
- Creates custom types/enums (booking_type, booking_status, property_type_enum, item_type_enum)
- Enables Row Level Security (RLS) policies
- Creates triggers for `updated_at` columns
- Includes verification at the end

**Prerequisites:**
- Supabase project created
- No existing tables (or drop existing ones first)
- UUID extensions enabled (uuid-ossp, pgcrypto)

**Key Features:**
- All column types match actual database schema
- Proper nullable/non-nullable constraints
- Correct default values
- Foreign key relationships properly defined

### 2. **Populate Data via CSV Uploads** (Optional)
- Use Supabase Dashboard → Table Editor → Import CSV
- Upload your data files for each table
- Recommended method for real/production data
- Ensure data respects foreign key relationships

**Upload Order (Respect Dependencies):**
1. `profiles` (required for foreign keys)
2. `properties`, `experiences`, `dares` (depend on profiles)
3. `rooms` (depends on properties)
4. `room_inventory` (depends on rooms)
5. `bookings` (depends on profiles and items)
6. Other tables (bucketlist, follows, notifications, blogs, etc.)

### 3. **02_create_views_latest.sql** (Run AFTER Schema - REQUIRED)
- Creates all 6 views for optimized queries
- Sets up aggregated statistics views
- Grants necessary permissions to authenticated users
- Includes verification at the end

**Prerequisites:**
- Schema script (01_schema_structure_latest.sql) executed
- Data populated (via CSV uploads or manual insertion) - recommended but not strictly required

**Views Created:**
1. `completed_dare_stats` - Engagement statistics for completed dares
2. `dare_stats` - Statistics for original dares
3. `experiences_with_host` - Experiences with host profile information
4. `property_rooms_summary` - Aggregated room data per property
5. `room_availability_view` - Room availability with property details
6. `user_social_stats` - Social statistics per user

## 📁 Script Details

### 01_schema_structure_latest.sql

**Tables Created (15 total):**
1. `profiles` - User profiles with host/guest roles (id, email, full_name, phone, avatar_url, is_host, host_bio, host_usps)
2. `properties` - Homestay properties (includes accommodation_type, beds, currency, min_nights, max_nights, google ratings)
3. `rooms` - Rooms within properties (includes cover_image, gallery)
4. `room_inventory` - Room inventory with room_number and is_available (not date-based)
5. `bookings` - Unified bookings table (user_id, booking_type enum, item_id, status enum)
6. `experiences` - Experiences and retreats (includes host_name, host_avatar with defaults)
7. `micro_experiences` - Micro experiences for retreats (includes cover_image, gallery)
8. `tales` - Reviews/stories for experiences (includes image_url, video_url)
9. `dares` - Challenge dares
10. `completed_dares` - User completions of dares (media_urls array)
11. `dare_engagements` - Engagements (smiles, comments, shares, tags) with item_id/item_type support
12. `bucketlist` - User wishlists (uses item_type enum)
13. `follows` - User follow relationships
14. `notifications` - User notifications (includes type, is_read, action_url)
15. `blogs` - Blog posts (title, content, author_id, published, cover_image, tags)

**Custom Types/Enums:**
- `booking_type` - ENUM ('property', 'experience', 'retreat')
- `booking_status` - ENUM ('pending', 'confirmed', 'cancelled', 'completed')
- `property_type_enum` - ENUM ('Boutique', 'Cottage', 'Homely', 'Off-Beat')
- `item_type_enum` - ENUM ('property', 'experience', 'retreat')

**Features:**
- All column types match actual database schema
- Comprehensive RLS policies for data security
- Foreign key constraints for data integrity
- Indexes for query performance
- Automatic `updated_at` triggers
- Proper nullable/non-nullable constraints
- Correct default values

**Key Schema Updates:**
- `bookings` table uses `user_id` + `booking_type` + `item_id` (not property_id/guest_id)
- `properties.host_id` is TEXT (not UUID)
- `room_inventory` uses `room_number` and `is_available` (not date/available)
- `experiences` has default values for `host_name` and `host_avatar`
- All tables use correct UUID generation functions (gen_random_uuid() or uuid_generate_v4())

### 02_create_views_latest.sql

**Views Created (6 total):**
1. `completed_dare_stats` - Engagement statistics for completed dares (smile_count, comment_count, share_count, tag_count, total_engagements)
2. `dare_stats` - Statistics for original dares (completion_count, engagement counts)
3. `experiences_with_host` - Experiences with host profile information (joins profiles table)
4. `property_rooms_summary` - Aggregated room data per property (total_rooms, min/max/avg prices, total_max_guests, active_rooms_count)
5. `room_availability_view` - Room availability with property details (uses room_number and is_available, includes availability_status)
6. `user_social_stats` - Social statistics per user (following_count, followers_count, smiles_given, completed_dares_count, dares_created_count)

**Features:**
- Optimized queries with JOINs
- Aggregated statistics
- Proper permissions granted to authenticated users
- Updated to match latest schema structure
- Views work with actual table column names

**View Updates:**
- `experiences_with_host` - Removed non-existent fields (categories, unique_propositions)
- `property_rooms_summary` - Uses `base_price` instead of `price`, removed `total_inventory` reference
- `room_availability_view` - Updated to use `room_number` and `is_available` instead of `date` and `available`

## 🔧 Setup Instructions

1. **Open Supabase Dashboard** → SQL Editor

2. **Create a User First** (if not already exists):
   - Go to Authentication → Users
   - Create a new user or use existing one
   - Note: Required for profiles table (foreign key to auth.users)

3. **Run Scripts in Order:**
   ```sql
   -- Step 1: Copy and run 01_schema_structure_latest.sql (REQUIRED)
   -- This creates all 15 tables with correct schema
   
   -- Step 2: Populate data via CSV uploads in Supabase Dashboard (Optional)
   -- Upload data respecting foreign key relationships
   
   -- Step 3: Copy and run 02_create_views_latest.sql (REQUIRED)
   -- This creates all 6 views for optimized queries
   ```

4. **Populate Data:**
   - Use CSV uploads in Supabase Dashboard (Table Editor → Import CSV)
   - Ensure data respects foreign key relationships
   - Upload tables in dependency order:
     1. `profiles` (must be first - other tables depend on it)
     2. `properties`, `experiences`, `dares` (depend on profiles)
     3. `rooms` (depends on properties)
     4. `room_inventory` (depends on rooms)
     5. `bookings` (depends on profiles and items)
     6. `micro_experiences` (depends on experiences)
     7. `tales` (depends on experiences and profiles)
     8. `completed_dares` (depends on dares and profiles)
     9. `dare_engagements` (depends on dares, completed_dares, profiles)
     10. `bucketlist`, `follows`, `notifications`, `blogs` (depend on profiles)

5. **Verify Installation:**
   - Each script includes verification at the end
   - Check table count: Should have 15 tables
   - Check view count: Should have 6 views
   - Run verification queries below to confirm

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

Edit the `CREATE POLICY` statements in `01_schema_structure_latest.sql` to adjust access control.

### Modifying Views

Edit the `CREATE OR REPLACE VIEW` statements in `02_create_views_latest.sql` to customize view queries.

## 📝 Notes

- All scripts use `IF NOT EXISTS` / `IF EXISTS` clauses to prevent errors on re-runs
- Views are created with `CREATE OR REPLACE` to allow re-runs
- All timestamps use `TIMESTAMPTZ` for timezone support
- Custom types/enums are created with error handling to prevent duplicate errors
- Scripts include verification blocks to confirm successful execution
- All UUIDs use `gen_random_uuid()` or `uuid_generate_v4()` as per actual schema
- RLS policies are enabled on all tables for security

## 🐛 Troubleshooting

**Error: "No users found in auth.users"**
- Create a user first in Supabase Authentication

**Error: Foreign key constraint violation**
- Ensure you run scripts in order: `01_schema_structure_latest.sql` → CSV Uploads → `02_create_views_latest.sql`
- Upload tables in dependency order (profiles first, then dependent tables)
- Check that referenced IDs exist in parent tables

**Error: Table already exists**
- Scripts use `IF NOT EXISTS`, but if you need to start fresh, drop tables first:
  ```sql
  -- Drop views first
  DROP VIEW IF EXISTS completed_dare_stats, dare_stats, experiences_with_host,
    property_rooms_summary, room_availability_view, user_social_stats CASCADE;
  
  -- Drop tables
  DROP TABLE IF EXISTS blogs, bookings, bucketlist, completed_dares, 
    dare_engagements, dares, experiences, follows, notifications, 
    profiles, properties, micro_experiences, room_inventory, rooms, tales CASCADE;
  
  -- Drop custom types
  DROP TYPE IF EXISTS booking_type, booking_status, property_type_enum, item_type_enum CASCADE;
  ```

**Error: Type already exists**
- Custom types are created with error handling, but if issues persist:
  ```sql
  DROP TYPE IF EXISTS booking_type CASCADE;
  DROP TYPE IF EXISTS booking_status CASCADE;
  DROP TYPE IF EXISTS property_type_enum CASCADE;
  DROP TYPE IF EXISTS item_type_enum CASCADE;
  ```

**RLS Policy Errors**
- Ensure user is authenticated in Supabase
- Check that policies allow the operation you're trying to perform

## 📚 File Structure

### Required Scripts (Run in Order):
1. **01_schema_structure_latest.sql** - Creates all 15 tables with correct schema
2. **02_create_views_latest.sql** - Creates all 6 views for optimized queries

### Legacy/Backup Files:
- `01_schema_structure_backup.sql` - Backup of original schema
- `03_misc_view.sql` - Additional views (if needed)

## 🔄 Migration from Old Schema

If you're migrating from an older schema:

1. **Backup your data** - Export all tables as CSV
2. **Drop old tables and views** - Use the drop commands in troubleshooting
3. **Run new scripts** - Execute `01_schema_structure_latest.sql` then `02_create_views_latest.sql`
4. **Re-import data** - Upload CSV files in dependency order

## 📊 Schema Differences from Previous Version

### Bookings Table:
- **Old**: `property_id`, `guest_id`, `check_in_date`, `check_out_date`
- **New**: `user_id`, `booking_type` (enum), `item_id`, `check_in_date`, `check_out_date` (nullable)

### Properties Table:
- **New Fields**: `accommodation_type`, `beds`, `currency`, `min_nights`, `max_nights`, `google_average_rating`, `google_reviews_count`
- **Changed**: `host_id` is now TEXT (not UUID)

### Room Inventory:
- **Old**: `date` (DATE), `available` (INTEGER)
- **New**: `room_number` (TEXT), `is_available` (BOOLEAN)

### Experiences:
- **New Defaults**: `host_name` defaults to 'EJA', `host_avatar` has default URL
- **Removed**: `categories`, `unique_propositions` fields

---

**Last Updated:** Based on latest database schema (November 2025)
**Scripts Version:** Latest (01_schema_structure_latest.sql, 02_create_views_latest.sql)

