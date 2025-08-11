'use client';

import { useState, useEffect, useRef } from 'react';
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
  SparklesIcon,
  GlobeAltIcon,
  CalendarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { SupportModal } from '@/components/SupportModal';
import { DestinationAutocomplete } from './DestinationAutocomplete';
import { SearchFilters as SearchFiltersType } from '@/lib/types';

export function Navigation() {
  const { user, profile, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [searchData, setSearchData] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
    rooms: 1,
    adults: 1,
    children: 0,
  });
  const [guestsOpen, setGuestsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const guestsRef = useRef<HTMLDivElement>(null);
  const [filters, setFilters] = useState<SearchFiltersType>({});
  const router = useRouter();
  const pathname = usePathname();

  // Hide header on auth pages
  const isAuthPage = pathname?.startsWith('/auth/');
  
  // Show search form only on home and search pages
  const showSearchForm = pathname === '/' || pathname?.startsWith('/search');

  const displayName = profile?.full_name?.split(' ')[0] || profile?.full_name || user?.email;
  const isHost = profile?.role === 'host' || profile?.is_host;
  const isAdmin = user?.email === 'admin@eja.com';

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

  // Close hamburger menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const menuButton = document.querySelector('[aria-label="Menu"]');
      const menuPopup = document.querySelector('[data-menu-popup]');
      
      if (menuOpen && 
          menuButton && !menuButton.contains(e.target as Node) &&
          menuPopup && !menuPopup.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const handleSignOut = async () => {
    await signOut();
    setMenuOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchData.location) params.append('location', searchData.location);
    if (searchData.checkIn) params.append('checkIn', searchData.checkIn);
    if (searchData.checkOut) params.append('checkOut', searchData.checkOut);
    if (searchData.rooms) params.append('rooms', String(searchData.rooms));
    if (searchData.adults) params.append('adults', String(searchData.adults));
    if (searchData.children) params.append('children', String(searchData.children));
    if (filters.minPrice) params.append('minPrice', String(filters.minPrice));
    if (filters.maxPrice) params.append('maxPrice', String(filters.maxPrice));
    if (filters.propertyType) params.append('propertyType', filters.propertyType);
    if (filters.amenities && filters.amenities.length > 0) params.append('amenities', filters.amenities.join(','));
    router.push(`/search?${params.toString()}`);
  };

  return (
    <>
      {!isAuthPage && (
        <nav className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200' 
            : 'bg-white shadow-sm border-b border-gray-200'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Top Navigation Bar */}
            <div className="flex justify-between items-center h-16">
              {/* Enhanced Logo */}
              <Link href="/" className="flex items-center space-x-2 group">
                <div 
                  className="relative w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center group-hover:from-blue-700 group-hover:to-indigo-800 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg group-hover:shadow-xl"
                >
                  <span className="text-white font-bold text-xl">E</span>
                  <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    EJA Homestay
                  </span>
                  <span className="text-xs text-gray-500 -mt-1">Travel with confidence</span>
                </div>
              </Link>

              {/* Enhanced Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                <Link 
                  href="/" 
                  className={`text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1 group ${
                    pathname === '/' ? 'text-blue-600 bg-blue-50 shadow-sm' : 'hover:bg-gray-50'
                  }`}
                >
                  <HomeIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Home
                </Link>
                <Link 
                  href="/experiences" 
                  className={`text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1 group ${
                    pathname?.startsWith('/experiences') ? 'text-blue-600 bg-blue-50 shadow-sm' : 'hover:bg-gray-50'
                  }`}
                >
                  <SparklesIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Experiences
                </Link>
                <Link 
                  href="/retreats" 
                  className={`text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1 group ${
                    pathname?.startsWith('/retreats') ? 'text-blue-600 bg-blue-50 shadow-sm' : 'hover:bg-gray-50'
                  }`}
                >
                  <GlobeAltIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Retreats
                </Link>
                {user && isHost && (
                  <Link 
                    href="/host/dashboard" 
                    className={`text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1 group ${
                      pathname?.startsWith('/host') ? 'text-blue-600 bg-blue-50 shadow-sm' : 'hover:bg-gray-50'
                    }`}
                  >
                    <UserCircleIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Host Dashboard
                  </Link>
                )}
              </div>

              {/* Enhanced User Menu */}
              <div className="flex items-center gap-3">
                <Link href="/collaborate">
                  <Button size="md" className="px-6 font-medium bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white hidden sm:flex shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                    <SparklesIcon className="w-4 h-4 mr-2" />
                    Collaborate
                  </Button>
                </Link>
                
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
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center shadow-sm">
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
                          <div className="px-6 py-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center shadow-lg">
                                <span className="text-white font-semibold text-lg">
                                  {displayName?.charAt(0)?.toUpperCase() || 'U'}
                                </span>
                              </div>
                              <div>
                                <div className="font-bold text-gray-900 text-lg">{displayName}</div>
                                <div className="text-sm text-gray-600">{user.email}</div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="py-3">
                            <Link
                              href="/guest/dashboard"
                              onClick={() => setMenuOpen(false)}
                              className="flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-blue-50 transition-colors group"
                            >
                              <UserCircleIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                              <span className="font-medium">Dashboard</span>
                            </Link>
                            
                            <Link
                              href="/guest/profile"
                              onClick={() => setMenuOpen(false)}
                              className="flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-blue-50 transition-colors group"
                            >
                              <Cog6ToothIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                              <span className="font-medium">Profile Settings</span>
                            </Link>
                            
                            <button
                              onClick={() => {
                                setMenuOpen(false);
                                setSupportOpen(true);
                              }}
                              className="flex items-center gap-3 w-full px-6 py-3 text-left text-gray-700 hover:bg-blue-50 transition-colors group"
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
                            className="flex items-center gap-3 w-full px-6 py-3 text-left text-gray-700 hover:bg-blue-50 transition-colors group"
                          >
                            <UserIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            <span className="font-medium">Sign in / Sign up</span>
                          </button>
                          <button
                            onClick={() => {
                              setMenuOpen(false);
                              setSupportOpen(true);
                            }}
                            className="flex items-center gap-3 w-full px-6 py-3 text-left text-gray-700 hover:bg-blue-50 transition-colors group"
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
              <div className="md:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="text-gray-700 hover:text-blue-600 p-2 transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  {isMobileMenuOpen ? (
                    <XMarkIcon className="w-6 h-6" />
                  ) : (
                    <Bars3Icon className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>

            {/* Enhanced Search Form Section - Only show on home and search pages */}
            {showSearchForm && (
              <div 
                className="py-6 border-t border-gray-100 animate-fade-in"
              >
                <form onSubmit={handleSearch} className="max-w-5xl mx-auto relative">
                  <div className="bg-white rounded-2xl shadow-xl border border-gray-200 flex items-center overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                    {/* Where Section */}
                    <div className="flex-1 px-6 py-4 border-r border-gray-200">
                      <div className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-1">
                        <GlobeAltIcon className="w-4 h-4" />
                        Where
                      </div>
                      <DestinationAutocomplete
                        value={searchData.location}
                        onChange={(value) => setSearchData({ ...searchData, location: value })}
                        placeholder="Search destinations"
                        className="w-full text-gray-600 placeholder-gray-400 text-sm border-none p-0 m-0 focus:ring-0 focus:outline-none bg-transparent"
                      />
                    </div>

                    {/* Check-in Section */}
                    <div className="flex-1 px-6 py-4 border-r border-gray-200">
                      <div className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-1">
                        <CalendarIcon className="w-4 h-4" />
                        Check in
                      </div>
                      <input
                        type="date"
                        id="check-in"
                        name="check-in"
                        value={searchData.checkIn}
                        onChange={(e) => setSearchData({ ...searchData, checkIn: e.target.value })}
                        className="w-full text-gray-600 placeholder-gray-400 text-sm border-none p-0 m-0 focus:ring-0 focus:outline-none bg-transparent"
                        placeholder="Add dates"
                      />
                    </div>

                    {/* Check-out Section */}
                    <div className="flex-1 px-6 py-4 border-r border-gray-200">
                      <div className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-1">
                        <CalendarIcon className="w-4 h-4" />
                        Check out
                      </div>
                      <input
                        type="date"
                        id="check-out"
                        name="check-out"
                        value={searchData.checkOut}
                        onChange={(e) => setSearchData({ ...searchData, checkOut: e.target.value })}
                        min={searchData.checkIn ? new Date(new Date(searchData.checkIn).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined}
                        className="w-full text-gray-600 placeholder-gray-400 text-sm border-none p-0 m-0 focus:ring-0 focus:outline-none bg-transparent"
                        placeholder="Add dates"
                      />
                    </div>

                    {/* Who Section */}
                    <div className="flex-1 px-6 py-4 border-r border-gray-200 relative" ref={guestsRef} data-guest-dropdown>
                      <div className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-1">
                        <UserGroupIcon className="w-4 h-4" />
                        Guests
                      </div>
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => setGuestsOpen((v) => !v)}
                        onKeyDown={(e) => { if (e.key === 'Escape') setGuestsOpen(false); }}
                        tabIndex={0}
                      >
                        <span className="text-gray-600 text-sm">
                          {searchData.adults} Adult{searchData.adults !== 1 ? 's' : ''}, {searchData.children} Child{searchData.children !== 1 ? 'ren' : ''}
                        </span>
                        <ChevronUpDownIcon className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>

                    {/* Enhanced Search Button */}
                    <div className="px-3 py-2">
                      <button 
                        type="submit" 
                        className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white flex items-center justify-center p-0 shadow-lg rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                      >
                        <MagnifyingGlassIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Enhanced Guest Selector Dropdown */}
                  {guestsOpen && (
                    <div 
                      className="absolute z-[9999] bg-white border border-gray-200 rounded-2xl shadow-2xl p-6 space-y-4 min-w-[320px] animate-scale-in"
                      style={{
                        left: '75%',
                        transform: 'translateX(-50%)',
                        top: 'calc(100% + 8px)'
                      }}
                      data-guest-dropdown
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-gray-900 font-bold text-lg">Select Guests</div>
                        <button 
                          onClick={() => setGuestsOpen(false)}
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm bg-blue-50 px-3 py-1 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          Done
                        </button>
                      </div>
                      
                      {/* Adults */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900 text-sm">Adults</div>
                          <div className="text-xs text-gray-500">Ages 13 or above</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button 
                            type="button" 
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110 active:scale-95" 
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSearchData(prev => ({ ...prev, adults: Math.max(1, prev.adults - 1) }));
                            }} 
                            disabled={searchData.adults <= 1}
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-gray-900 font-medium">{searchData.adults}</span>
                          <button 
                            type="button" 
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110 active:scale-95" 
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSearchData(prev => ({ ...prev, adults: Math.min(20, prev.adults + 1) }));
                            }} 
                            disabled={searchData.adults >= 20}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      
                      {/* Children */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900 text-sm">Children</div>
                          <div className="text-xs text-gray-500">Ages 0 to 12</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button 
                            type="button" 
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110 active:scale-95" 
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSearchData(prev => ({ ...prev, children: Math.max(0, prev.children - 1) }));
                            }} 
                            disabled={searchData.children <= 0}
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-gray-900 font-medium">{searchData.children}</span>
                          <button 
                            type="button" 
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110 active:scale-95" 
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSearchData(prev => ({ ...prev, children: Math.min(20, prev.children + 1) }));
                            }} 
                            disabled={searchData.children >= 20}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            )}

            {/* Enhanced Mobile Navigation */}
            {isMobileMenuOpen && (
              <div 
                className="md:hidden border-t border-gray-200 py-4 animate-fade-in"
              >
                <div className="space-y-2">
                  <Link 
                    href="/" 
                    className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg text-base font-medium transition-colors hover:bg-gray-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <HomeIcon className="w-5 h-5 inline mr-2" />
                    Home
                  </Link>
                  <Link 
                    href="/experiences" 
                    className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg text-base font-medium transition-colors hover:bg-gray-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <SparklesIcon className="w-5 h-5 inline mr-2" />
                    Local Experiences
                  </Link>
                  <Link 
                    href="/retreats" 
                    className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg text-base font-medium transition-colors hover:bg-gray-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <GlobeAltIcon className="w-5 h-5 inline mr-2" />
                    Retreats
                  </Link>
                  {user && (
                    <>
                      <Link 
                        href="/guest/wishlist" 
                        className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg text-base font-medium transition-colors hover:bg-gray-50"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <BookmarkIcon className="w-5 h-5 inline mr-2" />
                        Wishlist
                        {wishlistCount > 0 && (
                          <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            {wishlistCount}
                          </span>
                        )}
                      </Link>
                      {isHost && (
                        <Link 
                          href="/host/dashboard" 
                          className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg text-base font-medium transition-colors hover:bg-gray-50"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <UserCircleIcon className="w-5 h-5 inline mr-2" />
                          Host Dashboard
                        </Link>
                      )}
                    </>
                  )}
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="text-sm text-gray-700 px-3 py-2">
                      Welcome, {displayName}
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left text-gray-700 hover:text-red-600 px-3 py-2 rounded-lg text-base font-medium transition-colors hover:bg-red-50"
                    >
                      Sign Out
                    </button>
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