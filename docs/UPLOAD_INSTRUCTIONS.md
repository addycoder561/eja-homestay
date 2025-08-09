# 🚀 Experiences Upload Instructions

## 📋 **Step-by-Step Upload Process**

### **Step 1: Update Database Schema**
Run this migration first to add the new columns:

```sql
-- File: supabase/migrations/011_update_experiences_table.sql
-- Add new columns to experiences table
ALTER TABLE experiences 
ADD COLUMN IF NOT EXISTS cover_image TEXT,
ADD COLUMN IF NOT EXISTS duration TEXT,
ADD COLUMN IF NOT EXISTS categories TEXT[];

-- Create index for categories for better query performance
CREATE INDEX IF NOT EXISTS idx_experiences_categories ON experiences USING GIN (categories);

-- Add comment to document the new structure
COMMENT ON COLUMN experiences.cover_image IS 'Primary cover image URL for the experience';
COMMENT ON COLUMN experiences.duration IS 'Duration of the experience (e.g., "2-3 hrs")';
COMMENT ON COLUMN experiences.categories IS 'Array of categories for filtering (e.g., ["Mountain", "Immersive"])';
```

### **Step 2: Upload Experiences Data**
Copy and execute the contents of `insert-experiences-final.sql` in your Supabase SQL Editor.

## 📊 **What's New in Your Data**

### **Enhanced Features:**
- ✅ **52 unique experiences** with realistic pricing
- ✅ **Price range**: ₹800 - ₹1,950 (optimized pricing)
- ✅ **Duration format**: "2-3 hrs", "4-6 hrs", etc.
- ✅ **Cover images**: High-quality Unsplash images
- ✅ **Categories**: JSON arrays for filtering
- ✅ **Multiple locations**: Mountains, Delhi NCR, Mixed

### **Experience Categories:**
- 🏔️ **Mountain Experiences** (Glamping, Trekking, Forest Bathing)
- 🎨 **Creative Activities** (Pottery, Art & Craft, Photography)
- 🎵 **Entertainment** (Music, Karaoke, Theatre)
- 🍽️ **Culinary** (Cooking, Food Tours, Dining)
- ❤️ **Volunteering** (Animal Rescue, Food Distribution)
- 🧘 **Spiritual** (Meditation, Temple Visits)

## 🔧 **Database Schema Updates**

### **New Columns Added:**
- `cover_image` - Primary image URL
- `duration` - Experience duration (e.g., "2-3 hrs")
- `categories` - Array of categories for filtering

### **Updated TypeScript Interface:**
```typescript
export interface Experience {
  id: string;
  host_id: string | null;
  title: string;
  subtitle?: string | null;
  description: string | null;
  location: string;
  date: string;
  price: number;
  max_guests: number;
  images: string[];
  cover_image?: string;
  duration?: string;
  categories?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

## 🎯 **Next Steps After Upload**

### **1. Verify Data**
- Check Supabase dashboard → Table Editor → experiences
- Verify all 52 experiences are uploaded
- Check that new columns are populated

### **2. Update Frontend**
- Update experiences page to display new data
- Add filtering by categories, price, duration
- Display cover images and duration
- Add booking functionality

### **3. Test Features**
- Test experience search and filtering
- Test booking flow
- Test responsive design

## 📁 **Files Created**

1. **`supabase/migrations/011_update_experiences_table.sql`** - Database schema update
2. **`insert-experiences-final.sql`** - Data upload script
3. **`src/lib/types.ts`** - Updated TypeScript interfaces
4. **`scripts/upload-experiences-final.js`** - Upload script generator

## 🚨 **Important Notes**

- **Backup**: Consider backing up existing data before running migrations
- **RLS**: Row Level Security is temporarily disabled during upload
- **Indexes**: New GIN index on categories for better performance
- **Validation**: Verify data integrity after upload

## 🎉 **Success Criteria**

After upload, you should have:
- ✅ 52 experiences in the database
- ✅ All new columns populated
- ✅ Realistic pricing (₹800-₹1,950)
- ✅ Proper categories and filtering
- ✅ High-quality images
- ✅ Duration information

**Ready to upload! Follow the steps above and let me know if you need help with the frontend updates.**
