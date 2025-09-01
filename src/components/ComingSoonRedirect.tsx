'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Set this to false when you're ready to launch
const SHOW_COMING_SOON = false;

export default function ComingSoonRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Only redirect if coming soon is enabled
    if (SHOW_COMING_SOON) {
      router.push('/coming-soon');
    }
  }, [router]);

  // Don't render anything if coming soon is disabled
  if (!SHOW_COMING_SOON) {
    return null;
  }

  return null;
}
