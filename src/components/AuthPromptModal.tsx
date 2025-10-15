'use client';

import { useState } from 'react';
import Link from 'next/link';
import { HeartIcon } from '@heroicons/react/24/outline';

interface AuthPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  primaryAction: string;
  secondaryAction: string;
  primaryHref: string;
  secondaryHref: string;
}

export function AuthPromptModal({
  isOpen,
  onClose,
  title,
  description,
  primaryAction,
  secondaryAction,
  primaryHref,
  secondaryHref
}: AuthPromptModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-8 text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-yellow-50 border-2 border-yellow-200 flex items-center justify-center">
            <HeartIcon className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {title}
        </h2>

        {/* Description */}
        <p className="text-gray-600 mb-8">
          {description}
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href={primaryHref}
            className="block w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            onClick={onClose}
          >
            {primaryAction}
          </Link>
          
          <Link
            href={secondaryHref}
            className="block w-full bg-white border border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={onClose}
          >
            {secondaryAction}
          </Link>
        </div>
      </div>
    </div>
  );
}
