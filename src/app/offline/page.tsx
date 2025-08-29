'use client';

import Link from 'next/link';
import { WifiIcon, HomeIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <WifiIcon className="w-12 h-12 text-yellow-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            You're Offline
          </h1>
          <p className="text-gray-600 mb-8">
            It looks like you've lost your internet connection. Don't worry, you can still browse some cached content.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleRetry}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <ArrowPathIcon className="w-5 h-5" />
            Try Again
          </button>
          
          <Link
            href="/"
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <HomeIcon className="w-5 h-5" />
            Go Home
          </Link>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">What you can do offline:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• View previously visited pages</li>
            <li>• Browse cached property images</li>
            <li>• Access your saved wishlist</li>
            <li>• View your profile information</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
