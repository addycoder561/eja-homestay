'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthPromptModal } from '@/components/AuthPromptModal';

export function FloatingCreateButton() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthPromptOpen, setIsAuthPromptOpen] = useState(false);

  const handleOpenModal = () => {
    if (!user) {
      // Show auth prompt modal instead of redirecting
      setIsAuthPromptOpen(true);
      return;
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = () => {
    alert('Experience created! (This is a demo)');
    handleCloseModal();
  };

  return (
    <>
      <button
        onClick={handleOpenModal}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-30 hover:scale-110 active:scale-95"
        aria-label="Create Experience"
        type="button"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Create Experience</h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                type="button"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Experience Title"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <textarea
                  placeholder="Description"
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
              
              <div>
                <input
                  type="text"
                  placeholder="Location"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  type="button"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  type="button"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auth Prompt Modal */}
      <AuthPromptModal
        isOpen={isAuthPromptOpen}
        onClose={() => setIsAuthPromptOpen(false)}
        title="Sign in to create content"
        description="Please sign in to create and share your experiences with the community."
        primaryAction="Sign In"
        secondaryAction="Create Account"
        primaryHref="/auth/signin"
        secondaryHref="/auth/signup"
      />
    </>
  );
}
