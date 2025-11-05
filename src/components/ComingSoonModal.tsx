'use client';

import { Modal } from '@/components/ui/Modal';

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ComingSoonModal({ isOpen, onClose }: ComingSoonModalProps) {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Coming Soon"
      size="md"
    >
      <div className="px-6 py-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg 
              className="w-10 h-10 text-yellow-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Coming Soon
          </h3>
          <p className="text-gray-600 text-base">
            In a few days 😉
          </p>
        </div>
        <button
          onClick={onClose}
          className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition-colors duration-200"
        >
          Got it
        </button>
      </div>
    </Modal>
  );
}

