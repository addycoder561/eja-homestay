'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getWishlist } from '@/lib/database';
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
  SparklesIcon
} from '@heroicons/react/24/outline';
import { SupportModal } from '@/components/SupportModal';

export function Navigation() {
  const { user, profile, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [destinationsOpen, setDestinationsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Hide header on auth pages
  const isAuthPage = pathname?.startsWith('/auth/');

  const displayName = profile?.full_name?.split(' ')[0] || profile?.full_name || 'User';
  const isHost = profile?.role === 'host' || profile?.is_host;
  const isAdmin = user?.email === 'admin@eja.com';

  // Popular destinations for dropdown
  const popularDestinations = [
    { name: 'Rishikesh', state: 'Uttarakhand', url: '/discover?location=Rishikesh' },
{ name: 'Mussoorie', state: 'Uttarakhand', url: '/discover?location=Mussoorie' },
{ name: 'Manali', state: 'Himachal Pradesh', url: '/discover?location=Manali' },
{ name: 'Ladakh', state: 'Ladakh', url: '/discover?location=Ladakh' },
{ name: 'Kanatal', state: 'Uttarakhand', url: '/discover?location=Kanatal' },
  ];

  // Fetch wishlist count when user is logged in
  useEffect(() => {
    const fetchWishlistCount = async () => {
      if (user?.id) {
        try {
          const wishlist = await getWishlist(user.id);
          const count = wishlist?.length || 0;
          console.log('📊 Wishlist count updated:', count, 'items');
          console.log('📋 Wishlist items:', wishlist);
          console.log('🔍 Item types breakdown:', {
            properties: wishlist?.filter(item => item.item_type === 'property').length || 0,
            experiences: wishlist?.filter(item => item.item_type === 'experience').length || 0,
            trips: wishlist?.filter(item => item.item_type === 'trip').length || 0,
            retreats: wishlist?.filter(item => item.item_type === 'retreat').length || 0
          });
          setWishlistCount(count);
        } catch (error) {
          console.error('Error fetching wishlist count:', error);
          setWishlistCount(0);
        }
      } else {
        setWishlistCount(0);
      }
    };

    // Only fetch if we have proper Supabase configuration
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseKey && supabaseUrl !== 'https://placeholder.supabase.co') {
      fetchWishlistCount();
    } else {
      console.warn('Supabase environment variables not configured, skipping wishlist fetch');
      setWishlistCount(0);
    }
  }, [user?.id]);

  // Function to refresh wishlist count (can be called from other components)
  const refreshWishlistCount = async () => {
    if (user?.id) {
      try {
        const wishlist = await getWishlist(user.id);
        setWishlistCount(wishlist?.length || 0);
      } catch (error) {
        console.error('Error refreshing wishlist count:', error);
        setWishlistCount(0);
      }
    }
  };

  // Expose refresh function globally so other components can call it
  useEffect(() => {
    (window as any).refreshWishlistCount = refreshWishlistCount;
    return () => {
      delete (window as any).refreshWishlistCount;
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
      
      // Handle menu dropdown
      const menuButton = document.querySelector('[aria-label="Menu"]');
      const menuPopup = document.querySelector('[data-menu-popup]');
      
      if (menuOpen && 
          menuButton && !menuButton.contains(target) &&
          menuPopup && !menuPopup.contains(target)) {
        setMenuOpen(false);
      }

      // Handle about dropdown
      if (destinationsOpen) {
        setDestinationsOpen(false);
      }
    }
    
    if (menuOpen || destinationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen, destinationsOpen]);

  const handleSignOut = async () => {
    await signOut();
    setMenuOpen(false);
  };

  return (
    <>
      {!isAuthPage && (
        <nav className={`sticky top-0 z-50 transition-all duration-300 hidden lg:block ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200' 
            : 'bg-white shadow-sm border-b border-gray-200'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Top Navigation Bar */}
            <div className="flex justify-between items-center h-16 sm:h-20">
              {/* Enhanced Logo */}
              <Link href="/" className="flex items-center group-hover:scale-105 active:scale-95 transition-all duration-200">
                                  <img 
                    src="/eja_02.svg" 
                    alt="EJA Logo" 
                    className="w-20 h-20 sm:w-24 sm:h-24"
                  />
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
                  href="/delight" 
                  className={`text-gray-700 hover:text-yellow-500 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 group ${
                    pathname?.startsWith('/delight') ? 'text-yellow-500 bg-yellow-50 shadow-sm' : 'hover:bg-gray-50'
                  }`}
                >
                  <SparklesIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Delight
                </Link>

                {/* About Dropdown */}
                {/* Removed About dropdown as requested */}

                {user && isHost && (
                  <Link 
                    href="/host/dashboard" 
                    className={`text-gray-700 hover:text-yellow-500 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 group ${
                      pathname?.startsWith('/host') ? 'text-yellow-500 bg-yellow-50 shadow-sm' : 'hover:bg-gray-50'
                    }`}
                  >
                    <BuildingOfficeIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Host Dashboard
                  </Link>
                )}
              </div>

              {/* Enhanced User Menu */}
              <div className="flex items-center gap-3">
                
                {user && (
                  <>
                    <Link href="/guest/wishlist">
                      <button 
                        className="relative w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
                      >
                        <HeartIcon className="w-5 h-5 text-gray-700" />
                        {wishlistCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
                            {wishlistCount > 99 ? '99+' : wishlistCount}
                          </span>
                        )}
                      </button>
                    </Link>
                  </>
                )}
                
                {/* Enhanced User Menu Button */}
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
                    aria-label="Menu"
                  >
                    {user ? (
                                          <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-sm">
                      <span className="text-white font-semibold text-sm">
                        {displayName?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    ) : (
                      <UserIcon className="w-5 h-5 text-gray-700" />
                    )}
                  </button>
                  
                  {/* Enhanced Menu Popup */}
                  {menuOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-scale-in"
                      data-menu-popup
                    >
                      {user ? (
                        <>
                          <div className="px-6 py-6 border-b border-gray-100 bg-gradient-to-r from-yellow-50 to-orange-50">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                                <span className="text-white font-semibold text-lg">
                                  {displayName?.charAt(0)?.toUpperCase() || 'U'}
                                </span>
                              </div>
                              <div>
                                <div className="font-bold text-gray-900 text-lg">{displayName}</div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="py-3">
                            <Link
                              href="/guest/dashboard"
                              onClick={() => setMenuOpen(false)}
                              className="flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-yellow-50 transition-colors group"
                            >
                              <UserCircleIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                              <span className="font-medium">Dashboard</span>
                            </Link>
                            
                            <Link
                              href="/guest/profile"
                              onClick={() => setMenuOpen(false)}
                              className="flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-yellow-50 transition-colors group"
                            >
                              <Cog6ToothIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                              <span className="font-medium">Profile Settings</span>
                            </Link>
                            
                            <button
                              onClick={() => {
                                setMenuOpen(false);
                                setSupportOpen(true);
                              }}
                              className="flex items-center gap-3 w-full px-6 py-3 text-left text-gray-700 hover:bg-yellow-50 transition-colors group"
                            >
                              <QuestionMarkCircleIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                              <span className="font-medium">Support</span>
                            </button>
                            
                            <div className="border-t border-gray-100 my-2" />
                            
                            <button
                              onClick={handleSignOut}
                              className="flex items-center gap-3 w-full px-6 py-3 text-left text-gray-700 hover:bg-red-50 transition-colors group"
                            >
                              <ArrowRightOnRectangleIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                              <span className="font-medium">Sign out</span>
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="py-3">
                          <button
                            onClick={() => {
                              setMenuOpen(false);
                              router.push('/auth/signin');
                            }}
                            className="flex items-center gap-3 w-full px-6 py-3 text-left text-gray-700 hover:bg-yellow-50 transition-colors group"
                          >
                            <UserIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            <span className="font-medium">Sign in / Sign up</span>
                          </button>
                          <button
                            onClick={() => {
                              setMenuOpen(false);
                              setSupportOpen(true);
                            }}
                            className="flex items-center gap-3 w-full px-6 py-3 text-left text-gray-700 hover:bg-yellow-50 transition-colors group"
                          >
                            <QuestionMarkCircleIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            <span className="font-medium">Support</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Enhanced Mobile menu button */}
              <div className="lg:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="text-gray-700 hover:text-yellow-500 p-2 transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  {isMobileMenuOpen ? (
                    <XMarkIcon className="w-6 h-6" />
                  ) : (
                    <Bars3Icon className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>

            {/* Enhanced Mobile Navigation Menu */}
            {isMobileMenuOpen && (
              <div className="lg:hidden border-t border-gray-100 bg-white animate-slide-down">
                <div className="px-4 py-6 space-y-4">
                  {/* Mobile Navigation Links */}
                  <div className="space-y-2">
                    <Link
                      href="/"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        pathname === '/' ? 'bg-yellow-50 text-yellow-500' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <HomeIcon className="w-5 h-5" />
                      Home
                    </Link>

                    <Link
                      href="/discover"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        pathname?.startsWith('/discover') ? 'bg-yellow-50 text-yellow-500' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <MagnifyingGlassIcon className="w-5 h-5" />
                      Discover
                    </Link>


                    


                  </div>
                  
                  {/* Mobile About Links */}
                  {/* Removed About section as requested */}
                  
                  {/* Mobile User Actions */}
                  <div className="border-t border-gray-100 pt-4">
                    {user ? (
                      <div className="space-y-2">
                        <Link
                          href="/guest/dashboard"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <UserCircleIcon className="w-5 h-5" />
                          Dashboard
                        </Link>
                        <Link
                          href="/guest/wishlist"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <HeartIcon className="w-5 h-5" />
                          Wishlist ({wishlistCount})
                        </Link>
                        <button
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            setSupportOpen(true);
                          }}
                          className="flex items-center gap-3 w-full px-4 py-3 text-left rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <QuestionMarkCircleIcon className="w-5 h-5" />
                          Support
                        </button>
                        <button
                          onClick={() => {
                            handleSignOut();
                            setIsMobileMenuOpen(false);
                          }}
                          className="flex items-center gap-3 w-full px-4 py-3 text-left rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <ArrowRightOnRectangleIcon className="w-5 h-5" />
                          Sign out
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Link
                          href="/auth/signin"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <UserIcon className="w-5 h-5" />
                          Sign in / Sign up
                        </Link>
                        <button
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            setSupportOpen(true);
                          }}
                          className="flex items-center gap-3 w-full px-4 py-3 text-left rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <QuestionMarkCircleIcon className="w-5 h-5" />
                          Support
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>
      )}
      
      <SupportModal open={supportOpen} onClose={() => setSupportOpen(false)} />
    </>
  );
} 