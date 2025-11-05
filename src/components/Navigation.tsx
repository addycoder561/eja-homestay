'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getBucketlist, getUnreadNotificationCount } from '@/lib/database';
import { 
  HomeIcon, 
  MagnifyingGlassIcon, 
  Bars3Icon,
  XMarkIcon,
  BookmarkIcon,
  ChatBubbleLeftEllipsisIcon,
  ChevronUpDownIcon,
  UserIcon,
  QuestionMarkCircleIcon,
  UserCircleIcon,
  HeartIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  GlobeAltIcon,
  CalendarIcon,
  UserGroupIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  ChevronDownIcon,
  SparklesIcon,
  PlusIcon,
  BellIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { SupportModal } from '@/components/SupportModal';
import { CreateDropdown } from '@/components/CreateExperienceModal';
import { AuthPromptModal } from '@/components/AuthPromptModal';

export function Navigation() {
  const { user, profile, signOut } = useAuth();
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [bucketlistCount, setBucketlistCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [destinationsOpen, setDestinationsOpen] = useState(false);
  const [createDropdownOpen, setCreateDropdownOpen] = useState(false);
  const [isAuthPromptOpen, setIsAuthPromptOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const createButtonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Hide header on auth pages
  const isAuthPage = pathname?.startsWith('/auth/');

  const displayName = profile?.full_name?.split(' ')[0] || profile?.full_name || 'User';
  const isAdmin = user?.email === 'admin@eja.com';

  // Popular destinations for dropdown
  const popularDestinations = [
    { name: 'Rishikesh', state: 'Uttarakhand', url: '/discover?location=Rishikesh' },
{ name: 'Mussoorie', state: 'Uttarakhand', url: '/discover?location=Mussoorie' },
{ name: 'Manali', state: 'Himachal Pradesh', url: '/discover?location=Manali' },
{ name: 'Ladakh', state: 'Ladakh', url: '/discover?location=Ladakh' },
{ name: 'Kanatal', state: 'Uttarakhand', url: '/discover?location=Kanatal' },
  ];

  // Fetch bucketlist count when user is logged in (delayed to avoid blocking initial render)
  useEffect(() => {
    if (!user?.id) {
      setBucketlistCount(0);
      return;
    }

    // Delay fetching to avoid blocking initial render
    const timeoutId = setTimeout(() => {
      const fetchBucketlistCount = async () => {
        try {
          const bucketlist = await getBucketlist(user.id);
          const count = bucketlist?.length || 0;
          setBucketlistCount(count);
        } catch (error) {
          if (process.env.NODE_ENV !== 'production') {
            console.error('Error fetching bucketlist count:', error);
          }
          setBucketlistCount(0);
        }
      };
      fetchBucketlistCount();
    }, 100); // Small delay to prioritize page rendering

    return () => clearTimeout(timeoutId);
  }, [user?.id]);

  // Fetch notification count when user is logged in (delayed to avoid blocking initial render)
  useEffect(() => {
    if (!user?.id) {
      setNotificationCount(0);
      return;
    }

    // Delay fetching to avoid blocking initial render
    const timeoutId = setTimeout(() => {
      const fetchNotificationCount = async () => {
        try {
          const count = await getUnreadNotificationCount(user.id);
          setNotificationCount(count);
        } catch (error) {
          if (process.env.NODE_ENV !== 'production') {
            console.error('Error fetching notification count:', error);
          }
          setNotificationCount(0);
        }
      };
      fetchNotificationCount();
    }, 150); // Small delay to prioritize page rendering

    return () => clearTimeout(timeoutId);
  }, [user?.id]);

  // Function to refresh bucketlist count (can be called from other components)
  const refreshBucketlistCount = async () => {
    if (user?.id) {
      try {
        const bucketlist = await getBucketlist(user.id);
        setBucketlistCount(bucketlist?.length || 0);
      } catch (error) {
        console.error('Error refreshing bucketlist count:', error);
        setBucketlistCount(0);
      }
    }
  };

  // Expose refresh function globally so other components can call it
  useEffect(() => {
    (window as any).refreshBucketlistCount = refreshBucketlistCount;
    return () => {
      delete (window as any).refreshBucketlistCount;
    };
  }, [user?.id]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      
      // Don't interfere with category cards or other navigation elements
      if ((target as Element).closest('[data-category-card]') || 
          (target as Element).closest('a[href*="/search"]')) {
        return;
      }
      
      // Don't close if clicking inside the account menu
      if ((target as Element).closest('[data-account-menu]')) {
        return;
      }
      
      // Handle account menu dropdown
      if (isAccountMenuOpen) {
        setIsAccountMenuOpen(false);
      }

      // Handle about dropdown
      if (destinationsOpen) {
        setDestinationsOpen(false);
      }
    }
    
    if (isAccountMenuOpen || destinationsOpen) {
      // Use a small delay to allow click handlers to execute first
      const timeoutId = setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 100);
      
      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('click', handleClickOutside);
      };
    }
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isAccountMenuOpen, destinationsOpen]);

  const handleSignOut = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (isSigningOut) return; // Prevent multiple clicks
    
    try {
      setIsSigningOut(true);
      setIsAccountMenuOpen(false); // Close menu immediately
      await signOut();
      // Force a page reload to clear all state
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
      setIsSigningOut(false);
    }
  };

  return (
    <>
      {!isAuthPage && (
        <>
          {/* Desktop Navigation */}
          <nav className={`sticky top-0 z-50 transition-all duration-300 hidden lg:block ${
            isScrolled 
              ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200' 
              : 'bg-white shadow-sm border-b border-gray-200'
          }`}>
                    <div className="max-w-7xl mx-auto">
            {/* Top Navigation Bar */}
            <div className="flex justify-between items-center h-16 sm:h-20">
              {/* Enhanced Logo - Extreme Left Aligned */}
              <Link href="/" className="flex items-center group-hover:scale-105 active:scale-95 transition-all duration-200 ml-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-white shadow-lg">
                  <img 
                    src="/eja_svg.svg" 
                    alt="EJA Logo" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </Link>

              {/* Enhanced Desktop Navigation with Dropdowns */}
              <div className="hidden lg:flex items-center space-x-1">
                <Link 
                  href="/" 
                  className={`text-gray-700 hover:text-yellow-500 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 group ${
                    pathname === '/' ? 'text-yellow-500 bg-yellow-50 shadow-sm' : 'hover:bg-gray-50'
                  }`}
                >
                  <HomeIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Home
                </Link>


                <Link 
                  href="/discover" 
                  className={`text-gray-700 hover:text-yellow-500 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 group ${
                    pathname?.startsWith('/discover') ? 'text-yellow-500 bg-yellow-50 shadow-sm' : 'hover:bg-gray-50'
                  }`}
                >
                  <MagnifyingGlassIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Discover
                </Link>

                <Link 
                  href="/drop" 
                  className={`text-gray-700 hover:text-yellow-500 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 group ${
                    pathname?.startsWith('/drop') ? 'text-yellow-500 bg-yellow-50 shadow-sm' : 'hover:bg-gray-50'
                  }`}
                >
                  <FireIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Dares
                </Link>

                {/* Create Button */}
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
                  className="text-gray-700 hover:text-yellow-500 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 group hover:bg-gray-50 hover:scale-105"
                >
                  <PlusIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Create
                </button>

                {/* Profile Link */}
                <Link 
                  href="/profile"
                  className="text-gray-700 hover:text-yellow-500 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 group hover:bg-gray-50 hover:scale-105"
                >
                  <UserIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Profile
                </Link>

                {/* About Dropdown */}
                {/* Removed About dropdown as requested */}

              </div>

              {/* Enhanced User Menu */}
              <div className="flex items-center gap-3 pr-4">
                
                {user && (
                  <>
                    <Link href="/guest/wishlist">
                      <button 
                        className="relative w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
                      >
                        <HeartIcon className="w-5 h-5 text-gray-700" />
                        {bucketlistCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
                            {bucketlistCount > 99 ? '99+' : bucketlistCount}
                          </span>
                        )}
                      </button>
                    </Link>
                    
                    {/* Notification Bell */}
                    <button 
                      className="relative w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
                    >
                      <BellIcon className="w-5 h-5 text-gray-700" />
                      {notificationCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
                          {notificationCount > 99 ? '99+' : notificationCount}
                        </span>
                      )}
                    </button>

                    {/* Three Dashes Menu */}
                    <div className="relative">
                      <button
                        onClick={() => {
                          console.log('Menu button clicked, current state:', isAccountMenuOpen);
                          setIsAccountMenuOpen(!isAccountMenuOpen);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <Bars3Icon className="w-5 h-5 text-gray-700" />
                      </button>
                      
                      {/* Dropdown Menu */}
                      {isAccountMenuOpen && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50" data-account-menu>
                          <Link
                            href="/guest/dashboard"
                            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => {
                              console.log('Dashboard clicked');
                              setIsAccountMenuOpen(false);
                            }}
                          >
                            <Cog6ToothIcon className="w-5 h-5" />
                            Dashboard
                          </Link>
                          <Link
                            href="/guest/profile"
                            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => {
                              console.log('Profile Settings clicked');
                              setIsAccountMenuOpen(false);
                            }}
                          >
                            <UserIcon className="w-5 h-5" />
                            Profile Settings
                          </Link>
                          <button
                            onClick={() => {
                              console.log('Support clicked');
                              setSupportOpen(true);
                              setIsAccountMenuOpen(false);
                            }}
                            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors w-full text-left"
                          >
                            <QuestionMarkCircleIcon className="w-5 h-5" />
                            Support
                          </button>
                          <button
                            onClick={handleSignOut}
                            disabled={isSigningOut}
                            className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors w-full text-left disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ArrowRightOnRectangleIcon className="w-5 h-5" />
                            {isSigningOut ? 'Signing out...' : 'Sign Out'}
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
                
              </div>


            </div>


          </div>
        </nav>

          {/* Mobile Header */}
          <nav className={`sticky top-0 z-50 transition-all duration-300 lg:hidden ${
            isScrolled 
              ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200' 
              : 'bg-white shadow-sm border-b border-gray-200'
          }`}>
            <div className="flex justify-between items-center h-16 px-4">
              {/* Mobile Logo */}
              <Link href="/" className="flex items-center">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-white shadow-lg">
                  <img 
                    src="/eja_svg.svg" 
                    alt="EJA Logo" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </Link>

              {/* Mobile User Menu */}
              {user && (
                <div className="flex items-center gap-2">
                  {/* Mobile Bucketlist */}
                  <Link href="/guest/wishlist">
                    <button 
                      className="relative w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
                    >
                      <HeartIcon className="w-5 h-5 text-gray-700" />
                      {bucketlistCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
                          {bucketlistCount > 99 ? '99+' : bucketlistCount}
                        </span>
                      )}
                    </button>
                  </Link>

                  {/* Mobile Notification Bell */}
                  <button 
                    className="relative w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
                  >
                    <BellIcon className="w-5 h-5 text-gray-700" />
                    {notificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
                        {notificationCount > 99 ? '99+' : notificationCount}
                      </span>
                    )}
                  </button>

                  {/* Mobile Three Dashes Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <Bars3Icon className="w-5 h-5 text-gray-700" />
                    </button>
                    
                    {/* Mobile Dropdown Menu */}
                    {isAccountMenuOpen && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50" data-account-menu>
                        <Link
                          href="/guest/dashboard"
                          className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setIsAccountMenuOpen(false)}
                        >
                          <Cog6ToothIcon className="w-5 h-5" />
                          Dashboard
                        </Link>
                        <Link
                          href="/guest/profile"
                          className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setIsAccountMenuOpen(false)}
                        >
                          <UserIcon className="w-5 h-5" />
                          Profile Settings
                        </Link>
                        <button
                          onClick={() => {
                            setSupportOpen(true);
                            setIsAccountMenuOpen(false);
                          }}
                          className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors w-full text-left"
                        >
                          <QuestionMarkCircleIcon className="w-5 h-5" />
                          Support
                        </button>
                        <button
                          onClick={handleSignOut}
                          disabled={isSigningOut}
                          className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors w-full text-left disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ArrowRightOnRectangleIcon className="w-5 h-5" />
                          {isSigningOut ? 'Signing out...' : 'Sign Out'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

          </nav>
        </>
      )}
      
      <SupportModal open={supportOpen} onClose={() => setSupportOpen(false)} />
      <CreateDropdown 
        isOpen={createDropdownOpen}
        onClose={() => setCreateDropdownOpen(false)}
        buttonRef={createButtonRef}
      />
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