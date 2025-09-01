-- Update retreats: Change locations to "Mountains" and update cover images
-- for Second Chances Retreat and Doctors Retreat

-- Update all 6 retreats to have location "Mountains"
UPDATE public.retreats 
SET 
  location = 'Mountains',
  updated_at = NOW()
WHERE title IN (
  'Specially-Abled Getaways',
  'Second Chances Retreat',
  'Doctors Retreat',
  'Engineers Retreat',
  'First Relationship Retreat',
  'First Startup Retreat'
);

-- Update cover images for Second Chances Retreat and Doctors Retreat
UPDATE public.retreats 
SET 
  cover_image = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80',
  updated_at = NOW()
WHERE title = 'Second Chances Retreat';

UPDATE public.retreats 
SET 
  cover_image = 'https://images.unsplash.com/photo-1454391304352-2bf4678b1a7a?auto=format&fit=crop&w=1600&q=80',
  updated_at = NOW()
WHERE title = 'Doctors Retreat';

-- Verify the updates
SELECT title, location, cover_image 
FROM public.retreats 
WHERE title IN (
  'Specially-Abled Getaways',
  'Second Chances Retreat',
  'Doctors Retreat',
  'Engineers Retreat',
  'First Relationship Retreat',
  'First Startup Retreat'
)
ORDER BY title;
