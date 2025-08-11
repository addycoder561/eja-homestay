'use client';

import { useState } from 'react';

export default function TestPage() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">Test Page</h1>
      <p className="text-lg text-gray-600 mb-4">This is a simple test page to check if the basic setup is working.</p>
      <button 
        onClick={() => setCount(count + 1)}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        Count: {count}
      </button>
    </div>
  );
}
