# Supabase Edge Functions Cleanup Guide

## Overview

You have 126 Supabase Edge Functions that need to be analyzed and cleaned up. This guide will help you identify which functions are redundant, no longer needed, or safe to remove based on our recent system changes.

## 🎯 Functions Likely Safe to Remove

### **Impact System Functions (SAFE TO REMOVE)**
Based on our recent removal of the impact system, these functions are definitely safe to remove:

- Any function with `impact` in the name
- Any function with `story` in the name (impact stories)
- Any function with `task` in the name (impact tasks)
- Any function with `badge` in the name (user badges)
- Any function with `streak` in the name (daily streak tracking)
- Any function with `leaderboard` in the name
- Any function with `submission` in the name (task submissions)

### **Testimonial Functions (SAFE TO REMOVE)**
Since we removed the testimonials system:

- Any function with `testimonial` in the name
- Any function with `review` in the name (if related to testimonials)

### **Collaboration Functions (SAFE TO REMOVE)**
Since we removed the collaborations system:

- Any function with `collaboration` in the name
- Any function with `card_collaboration` in the name

## ⚠️ Functions to Review Carefully

### **Booking System Functions**
Since we optimized the booking system but kept it:

- Functions with `booking` in the name - **REVIEW CAREFULLY**
- Functions with `room` in the name - **REVIEW CAREFULLY**
- Functions with `inventory` in the name - **REVIEW CAREFULLY**
- Functions with `reservation` in the name - **REVIEW CAREFULLY**

### **Search Functions**
Since we implemented unified search:

- Functions with `search` in the name - **REVIEW CAREFULLY**
- Functions with `filter` in the name - **REVIEW CAREFULLY**
- Functions with `query` in the name - **REVIEW CAREFULLY**

### **User Management Functions**
These are likely still needed:

- Functions with `user` in the name - **KEEP**
- Functions with `auth` in the name - **KEEP**
- Functions with `profile` in the name - **KEEP**

## 🔧 Recommended Cleanup Process

### **Step 1: Export Function List**
1. Go to Supabase Dashboard > Edge Functions
2. Export or copy the list of all 126 functions
3. Create a spreadsheet with columns: `Name`, `Purpose`, `Status`, `Action`

### **Step 2: Categorize Functions**
Use this categorization system:

| Category | Action | Examples |
|----------|--------|----------|
| **Impact System** | 🗑️ Remove | `get_impact_stories`, `create_impact_task` |
| **Testimonials** | 🗑️ Remove | `get_testimonials`, `create_testimonial` |
| **Collaborations** | 🗑️ Remove | `get_collaborations`, `create_collaboration` |
| **Booking** | ⚠️ Review | `get_bookings`, `create_booking` |
| **Search** | ⚠️ Review | `search_properties`, `filter_results` |
| **User Management** | ✅ Keep | `get_user_profile`, `update_user` |
| **Authentication** | ✅ Keep | `auth_callback`, `verify_token` |
| **Utility** | ⚠️ Review | `helper_function`, `common_util` |

### **Step 3: Create Cleanup Script**
Create a SQL script like this:

```sql
-- =====================================================
-- SUPABASE FUNCTIONS CLEANUP SCRIPT
-- =====================================================
-- SAFE TO REMOVE - Impact System Functions
-- =====================================================

-- Impact Stories
DROP FUNCTION IF EXISTS get_impact_stories CASCADE;
DROP FUNCTION IF EXISTS create_impact_story CASCADE;
DROP FUNCTION IF EXISTS update_impact_story CASCADE;
DROP FUNCTION IF EXISTS delete_impact_story CASCADE;

-- Impact Tasks
DROP FUNCTION IF EXISTS get_impact_tasks CASCADE;
DROP FUNCTION IF EXISTS create_impact_task CASCADE;
DROP FUNCTION IF EXISTS update_impact_task CASCADE;
DROP FUNCTION IF EXISTS delete_impact_task CASCADE;

-- User Badges
DROP FUNCTION IF EXISTS get_user_badges CASCADE;
DROP FUNCTION IF EXISTS create_user_badge CASCADE;
DROP FUNCTION IF EXISTS update_user_badge CASCADE;

-- Daily Streak
DROP FUNCTION IF EXISTS get_daily_streak CASCADE;
DROP FUNCTION IF EXISTS update_daily_streak CASCADE;
DROP FUNCTION IF EXISTS reset_daily_streak CASCADE;

-- Leaderboard
DROP FUNCTION IF EXISTS get_leaderboard CASCADE;
DROP FUNCTION IF EXISTS update_leaderboard CASCADE;

-- Task Submissions
DROP FUNCTION IF EXISTS get_task_submissions CASCADE;
DROP FUNCTION IF EXISTS create_task_submission CASCADE;

-- =====================================================
-- SAFE TO REMOVE - Testimonial Functions
-- =====================================================

DROP FUNCTION IF EXISTS get_testimonials CASCADE;
DROP FUNCTION IF EXISTS create_testimonial CASCADE;
DROP FUNCTION IF EXISTS update_testimonial CASCADE;
DROP FUNCTION IF EXISTS delete_testimonial CASCADE;

-- =====================================================
-- SAFE TO REMOVE - Collaboration Functions
-- =====================================================

DROP FUNCTION IF EXISTS get_collaborations CASCADE;
DROP FUNCTION IF EXISTS create_collaboration CASCADE;
DROP FUNCTION IF EXISTS update_collaboration CASCADE;
DROP FUNCTION IF EXISTS delete_collaboration CASCADE;

-- =====================================================
-- REVIEW CAREFULLY - Booking Functions
-- =====================================================

-- Comment out these if you're sure they're not needed
-- DROP FUNCTION IF EXISTS get_bookings CASCADE;
-- DROP FUNCTION IF EXISTS create_booking CASCADE;
-- DROP FUNCTION IF EXISTS update_booking CASCADE;

-- =====================================================
-- REVIEW CAREFULLY - Search Functions
-- =====================================================

-- Comment out these if you're using unified search
-- DROP FUNCTION IF EXISTS search_properties CASCADE;
-- DROP FUNCTION IF EXISTS search_experiences CASCADE;
-- DROP FUNCTION IF EXISTS search_retreats CASCADE;
```

### **Step 4: Test Before Removing**
1. **Create a staging environment** or backup
2. **Remove functions one by one** (not all at once)
3. **Test functionality** after each removal
4. **Monitor for errors** in your application
5. **Keep a log** of what was removed

### **Step 5: Batch Removal Strategy**
Remove functions in this order:

1. **Batch 1**: Impact system functions (safest)
2. **Batch 2**: Testimonial functions
3. **Batch 3**: Collaboration functions
4. **Batch 4**: Review booking functions
5. **Batch 5**: Review search functions
6. **Batch 6**: Review utility functions

## 📋 Function Analysis Template

Create a spreadsheet with these columns:

| Function Name | Purpose | Dependencies | Status | Action | Notes |
|---------------|---------|--------------|--------|--------|-------|
| `get_impact_stories` | Get impact stories | None | Impact System | 🗑️ Remove | Safe to remove |
| `create_booking` | Create booking | Rooms, Users | Booking System | ⚠️ Review | Check if still needed |
| `search_properties` | Search properties | Properties | Search System | ⚠️ Review | Replaced by unified search |

## 🚨 Safety Checklist

Before removing any function:

- [ ] **Function is not called anywhere** in your codebase
- [ ] **Function is not referenced** in database triggers
- [ ] **Function is not used** in RLS policies
- [ ] **Function is not part** of active workflows
- [ ] **Function has been tested** in staging environment
- [ ] **Backup is available** if needed

## 🔍 How to Check Function Usage

### **In Your Codebase:**
```bash
# Search for function calls
grep -r "function_name" src/
grep -r "function_name" pages/
grep -r "function_name" components/
```

### **In Database:**
```sql
-- Check if function is used in triggers
SELECT * FROM information_schema.triggers 
WHERE action_statement LIKE '%function_name%';

-- Check if function is used in policies
SELECT * FROM pg_policies 
WHERE cmd LIKE '%function_name%';
```

## 📊 Expected Results

After cleanup, you should see:

- **Before**: 126 functions
- **After**: ~30-50 functions (estimated)
- **Removed**: ~70-90 redundant functions
- **Improved**: Performance and maintainability

## 🎯 Quick Action Items

1. **Export function list** from Supabase Dashboard
2. **Create analysis spreadsheet** using the template above
3. **Identify safe-to-remove functions** (impact, testimonials, collaborations)
4. **Create cleanup script** with the functions you identified
5. **Test in staging** before production
6. **Remove in batches** to minimize risk

## 📞 Need Help?

If you need assistance with specific functions:

1. **Share the function list** with me
2. **I can help categorize** each function
3. **I can create a custom cleanup script** for your specific functions
4. **I can help test** the removal process

This systematic approach will help you safely clean up your Supabase Edge Functions while maintaining system stability.
