export function buildCoverFirstImages(coverImage?: string | null, images?: string[]): string[] {
  const base = Array.isArray(images) ? images.filter(Boolean) : [];
  const withCover = coverImage ? [coverImage, ...base] : base;
  // de-duplicate while keeping order
  const unique: string[] = [];
  for (const url of withCover) {
    if (url && !unique.includes(url)) unique.push(url);
  }
  return unique.length > 0 ? unique : ["/placeholder-experience.jpg"];
}


