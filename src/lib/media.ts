export function buildCoverFirstImages(coverImage?: string | null, images?: string | string[]): string[] {
  // Handle images as either string or array
  let base: string[] = [];
  if (images) {
    if (Array.isArray(images)) {
      base = images.filter(Boolean);
    } else if (typeof images === 'string') {
      // If images is a string, try to parse it as JSON array, otherwise treat as single image
      try {
        const parsed = JSON.parse(images);
        base = Array.isArray(parsed) ? parsed.filter(Boolean) : [images];
      } catch {
        // If not valid JSON, treat as single image URL
        base = [images];
      }
    }
  }
  
  const withCover = coverImage ? [coverImage, ...base] : base;
  // de-duplicate while keeping order
  const unique: string[] = [];
  for (const url of withCover) {
    if (url && !unique.includes(url)) unique.push(url);
  }
  return unique.length > 0 ? unique : ["/placeholder-experience.jpg"];
}


