'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  HomeIcon, 
  MagnifyingGlassIcon, 
  UserIcon,
  PlusIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { 
  HomeIcon as HomeIconSolid, 
  MagnifyingGlassIcon as MagnifyingGlassIconSolid, 
  UserIcon as UserIconSolid,
  FireIcon as FireIconSolid
} from '@heroicons/react/24/solid';
import { CreateDropdown } from '@/components/CreateExperienceModal';
import { AuthPromptModal } from '@/components/AuthPromptModal';

export function MobileBottomNavigation() {
  const { user, profile } = useAuth();
  const pathname = usePathname();
  const [createDropdownOpen, setCreateDropdownOpen] = useState(false);
  const [isAuthPromptOpen, setIsAuthPromptOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const createButtonRef = useRef<HTMLButtonElement>(null);

  // Prevent hydration mismatch by only rendering on client
  useEffect(() => {
    setIsMounted(true);
  }, []);


  // Hide on auth pages and admin pages
  const isAuthPage = pathname?.startsWith('/auth/');
  const isAdminPage = pathname?.startsWith('/admin/');
  const isHostPage = pathname?.startsWith('/host/');
  
  if (isAuthPage || isAdminPage || isHostPage) {
    return null;
  }

  // Prevent hydration mismatch by not rendering on server
  if (!isMounted) {
    return null;
  }


  return (
    <>
    {/* Elevated Navigation Strip */}
    <div className="fixed bottom-4 left-4 right-4 z-50 lg:hidden">
      <nav className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 px-2 py-2">
        <div className="flex items-center justify-around">
          {/* Home */}
          <Link
            href="/"
            className={`flex flex-col items-center justify-center w-full py-3 px-2 rounded-2xl transition-all duration-300 ${
              pathname === '/'
                ? 'text-yellow-500 bg-yellow-50/80'
                : 'text-gray-600 hover:text-yellow-500 hover:bg-gray-50/50'
            }`}
          >
            <div className="relative">
              {pathname === '/' ? <HomeIconSolid className="w-6 h-6" /> : <HomeIcon className="w-6 h-6" />}
            </div>
            <span className="text-xs font-semibold mt-1">Home</span>
          </Link>

          {/* Discover */}
          <Link
            href="/discover"
            className={`flex flex-col items-center justify-center w-full py-3 px-2 rounded-2xl transition-all duration-300 ${
              pathname?.startsWith('/discover')
                ? 'text-yellow-500 bg-yellow-50/80'
                : 'text-gray-600 hover:text-yellow-500 hover:bg-gray-50/50'
            }`}
          >
            <div className="relative">
              {pathname?.startsWith('/discover') ? <MagnifyingGlassIconSolid className="w-6 h-6" /> : <MagnifyingGlassIcon className="w-6 h-6" />}
            </div>
            <span className="text-xs font-semibold mt-1">Discover</span>
          </Link>

          {/* Create Button - Central Floating */}
          <button
            ref={createButtonRef}
            onClick={() => {
              if (!user) {
                // Show auth prompt modal instead of redirecting
                setIsAuthPromptOpen(true);
                return;
              }
              setCreateDropdownOpen(true);
            }}
            className="flex items-center justify-center w-14 h-14 -mt-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-2xl shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <PlusIcon className="w-7 h-7" />
          </button>

          {/* Dares */}
          <Link
            href="/drop"
            className={`flex flex-col items-center justify-center w-full py-3 px-2 rounded-2xl transition-all duration-300 ${
              pathname?.startsWith('/drop')
                ? 'text-yellow-500 bg-yellow-50/80'
                : 'text-gray-600 hover:text-yellow-500 hover:bg-gray-50/50'
            }`}
          >
            <div className="relative">
              {pathname?.startsWith('/drop') ? <FireIconSolid className="w-6 h-6" /> : <FireIcon className="w-6 h-6" />}
            </div>
            <span className="text-xs font-semibold mt-1">Dares</span>
          </Link>

          {/* Profile */}
          <Link
            href="/profile"
            className={`flex flex-col items-center justify-center w-full py-3 px-2 rounded-2xl transition-all duration-300 ${
              pathname?.startsWith('/profile')
                ? 'text-yellow-500 bg-yellow-50/80'
                : 'text-gray-600 hover:text-yellow-500 hover:bg-gray-50/50'
            }`}
          >
            <div className="relative">
              {pathname?.startsWith('/profile') ? <UserIconSolid className="w-6 h-6" /> : <UserIcon className="w-6 h-6" />}
            </div>
            <span className="text-xs font-semibold mt-1">Profile</span>
          </Link>
        </div>
      </nav>
      
      {/* Safe area for devices with home indicator */}
      <div className="h-2" />
    </div>

      {/* Create Experience Modal */}
      <CreateDropdown 
        isOpen={createDropdownOpen}
        onClose={() => setCreateDropdownOpen(false)}
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
