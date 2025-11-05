'use client';

import dynamic from 'next/dynamic';

// Lazy load heavy components
const AIChatAssistant = dynamic(() => import('@/components/AIChatAssistant').then(mod => ({ default: mod.AIChatAssistant })), {
  ssr: false,
  loading: () => null
});

export function LazyAIChatAssistant() {
  return <AIChatAssistant />;
}

