'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
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
  HeartIcon
} from '@heroicons/react/24/outline';
import { SupportModal } from '@/components/SupportModal';
import { DestinationAutocomplete } from './DestinationAutocomplete';
import { SearchFilters as SearchFiltersType } from '@/lib/types';

export function Navigation() {
  const { user, profile, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
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
  const isAdmin = user?.email === 'admin@eja.com'; // stub: treat this email as admin

  // Remove the problematic click outside detection
  // useEffect(() => {
  //   function handleClick(e: MouseEvent) {
  //     // Only close if clicking outside both the guests section and the dropdown
  //     const guestsSection = guestsRef.current;
  //     const dropdown = document.querySelector('[data-guest-dropdown]');
      
  //     if (guestsSection && !guestsSection.contains(e.target as Node) && 
  //         dropdown && !dropdown.contains(e.target as Node)) {
  //       setGuestsOpen(false);
  //     }
  //   }
    
  //   if (guestsOpen) {
  //     // Add a small delay to prevent immediate closing
  //     const timeoutId = setTimeout(() => {
  //       document.addEventListener('mousedown', handleClick);
  //     }, 100);
      
  //     return () => {
  //       clearTimeout(timeoutId);
  //       document.removeEventListener('mousedown', handleClick);
  //     };
  //   }
  // }, [guestsOpen]);

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
    // Merge filters
    if (filters.minPrice) params.append('minPrice', String(filters.minPrice));
    if (filters.maxPrice) params.append('maxPrice', String(filters.maxPrice));
    if (filters.propertyType) params.append('propertyType', filters.propertyType);
    if (filters.amenities && filters.amenities.length > 0) params.append('amenities', filters.amenities.join(','));
    router.push(`/search?${params.toString()}`);
  };

  return (
    <>
      {!isAuthPage && (
        <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Top Navigation Bar */}
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">E</span>
                </div>
                <span className="text-xl font-bold text-gray-900">EJA Homestay</span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                <Link 
                  href="/" 
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  <HomeIcon className="w-5 h-5 inline mr-1" />
                  Home
                </Link>
                <Link 
                  href="/experiences" 
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Local Experiences
                </Link>
                <Link 
                  href="/retreats" 
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Retreats
                </Link>
                {user && (
                  <>
                    {profile?.is_host && (
                      <Link 
                        href="/host/dashboard" 
                        className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        Host Dashboard
                      </Link>
                    )}
                  </>
                )}
              </div>

              {/* User Menu */}
              <div className="flex items-center gap-4">
                <Link href="/collaborate">
                  <Button size="md" className="px-6 font-medium bg-green-600 hover:bg-green-700 text-white">
                    Collab
                  </Button>
                </Link>
                {user && (
                  <Link href="/guest/wishlist">
                    <button className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                      <HeartIcon className="w-5 h-5 text-gray-700" />
                    </button>
                  </Link>
                )}
                
                {/* Hamburger Menu Button */}
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                    aria-label="Menu"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="w-4 h-0.5 bg-gray-700 rounded-full"></div>
                      <div className="w-4 h-0.5 bg-gray-700 rounded-full"></div>
                      <div className="w-4 h-0.5 bg-gray-700 rounded-full"></div>
                    </div>
                  </button>
                  
                  {/* Menu Popup */}
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50" data-menu-popup>
                      <div className="py-2">
                        {user ? (
                          <>
                            <div className="px-4 py-2 border-b border-gray-100">
                              <div className="text-sm font-medium text-gray-900 flex items-center">
                                <UserCircleIcon className="w-4 h-4 mr-2 text-gray-600" />
                                {displayName}
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setMenuOpen(false);
                                setSupportOpen(true);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <QuestionMarkCircleIcon className="w-4 h-4 inline mr-2" />
                              Support
                            </button>
                            <button
                              onClick={() => {
                                setMenuOpen(false);
                                handleSignOut();
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <UserIcon className="w-4 h-4 inline mr-2" />
                              Sign out
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setMenuOpen(false);
                                router.push('/auth/signin');
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <UserIcon className="w-4 h-4 inline mr-2" />
                              Sign in / Sign up
                            </button>
                            <button
                              onClick={() => {
                                setMenuOpen(false);
                                setSupportOpen(true);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <QuestionMarkCircleIcon className="w-4 h-4 inline mr-2" />
                              Support
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="text-gray-700 hover:text-blue-600 p-2"
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
              <div className="py-6 border-t border-gray-100">
                <form onSubmit={handleSearch} className="max-w-4xl mx-auto relative">
                  <div className="bg-white rounded-full shadow-lg border border-gray-200 flex items-center overflow-hidden">
                    {/* Where Section */}
                    <div className="flex-1 px-6 py-4 border-r border-gray-200">
                      <div className="text-sm font-semibold text-gray-900 mb-1">Where</div>
                      <DestinationAutocomplete
                        value={searchData.location}
                        onChange={(value) => setSearchData({ ...searchData, location: value })}
                        placeholder="Search destinations"
                        className="w-full text-gray-600 placeholder-gray-400 text-sm border-none p-0 m-0 focus:ring-0 focus:outline-none bg-transparent"
                      />
                    </div>

                    {/* Check-in Section */}
                    <div className="flex-1 px-6 py-4 border-r border-gray-200">
                      <div className="text-sm font-semibold text-gray-900 mb-1">Check in</div>
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
                      <div className="text-sm font-semibold text-gray-900 mb-1">Check out</div>
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
                        <div className="text-sm font-semibold text-gray-900 mb-1">Guests</div>
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

                      {/* Search Button */}
                      <div className="px-2 py-2">
                        <Button 
                          type="submit" 
                          className="w-12 h-12 bg-red-500 hover:bg-red-600 text-white flex items-center justify-center p-0 shadow-md"
                          style={{ borderRadius: '12px' }}
                        >
                          <MagnifyingGlassIcon className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>

                    {/* Guest Selector Dropdown - Positioned outside the form container */}
                    {guestsOpen && (
                      <div 
                        className="absolute z-[9999] bg-white border border-gray-200 rounded-lg shadow-2xl p-4 space-y-4 min-w-[320px]"
                        style={{
                          left: '75%', // Position it to align with the Guests section
                          transform: 'translateX(-50%)',
                          top: 'calc(100% + 8px)' // Position it just below the search form
                        }}
                        data-guest-dropdown
                      >
                        <div className="flex justify-between items-center mb-2">
                          <div className="text-gray-900 font-medium">Select Guests</div>
                          <button 
                            onClick={() => setGuestsOpen(false)}
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                          >
                            Done
                          </button>
                        </div>
                        
                        {/* Adults */}
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900 text-sm">Adults</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              type="button" 
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" 
                              onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('Minus adults clicked');
                                setSearchData(prev => ({ ...prev, adults: Math.max(1, prev.adults - 1) }));
                              }} 
                              disabled={searchData.adults <= 1}
                            >
                              -
                            </button>
                            <span className="w-8 text-center text-gray-900">{searchData.adults}</span>
                            <button 
                              type="button" 
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" 
                              onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('Plus adults clicked');
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
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              type="button" 
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" 
                              onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('Minus children clicked');
                                setSearchData(prev => ({ ...prev, children: Math.max(0, prev.children - 1) }));
                              }} 
                              disabled={searchData.children <= 0}
                            >
                              -
                            </button>
                            <span className="w-8 text-center text-gray-900">{searchData.children}</span>
                            <button 
                              type="button" 
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" 
                              onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('Plus children clicked');
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

            {/* Mobile Navigation */}
            {isMobileMenuOpen && (
              <div className="md:hidden border-t border-gray-200 py-4">
                <div className="space-y-2">
                  <Link 
                    href="/" 
                    className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <HomeIcon className="w-5 h-5 inline mr-2" />
                    Home
                  </Link>
                  <Link 
                    href="/experiences" 
                    className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Local Experiences
                  </Link>
                  <Link 
                    href="/retreats" 
                    className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Retreats
                  </Link>
                  {user && (
                    <>
                      <Link 
                        href="/guest/wishlist" 
                        className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <BookmarkIcon className="w-5 h-5 inline mr-2" />
                        Wishlist
                      </Link>
                      {profile?.is_host && (
                        <Link 
                          href="/host/dashboard" 
                          className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
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
                      className="block w-full text-left text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium"
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