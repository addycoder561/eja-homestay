'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthPromptModal } from '@/components/AuthPromptModal';
import { CreateDropdown } from '@/components/CreateExperienceModal';

export function FloatingCreateButton() {
  const { user } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAuthPromptOpen, setIsAuthPromptOpen] = useState(false);
  const createButtonRef = useRef<HTMLButtonElement>(null);

  const handleOpenModal = () => {
    if (!user) {
      // Show auth prompt modal instead of redirecting
      setIsAuthPromptOpen(true);
      return;
    }
    setIsDropdownOpen(true);
  };


  return (
    <>
      <button
        ref={createButtonRef}
        onClick={handleOpenModal}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-30 hover:scale-110 active:scale-95"
        aria-label="Create Experience"
        type="button"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      <CreateDropdown 
        isOpen={isDropdownOpen}
        onClose={() => setIsDropdownOpen(false)}
        buttonRef={createButtonRef}
      />

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
