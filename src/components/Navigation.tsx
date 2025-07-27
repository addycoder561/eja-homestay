'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { 
  HomeIcon, 
  MagnifyingGlassIcon, 
  Bars3Icon,
  XMarkIcon,
  BookmarkIcon,
  ChatBubbleLeftEllipsisIcon
} from '@heroicons/react/24/outline';
import { SupportModal } from '@/components/SupportModal';

export function Navigation() {
  const { user, profile, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const router = useRouter();

  const displayName = profile?.full_name?.split(' ')[0] || profile?.full_name || user?.email;
  const isHost = profile?.role === 'host' || profile?.is_host;
  const isAdmin = user?.email === 'admin@eja.com'; // stub: treat this email as admin

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              href="/trips" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Trips
            </Link>
            <Link 
              href="/search" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <MagnifyingGlassIcon className="w-5 h-5 inline mr-1" />
              Search
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
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/collaborate">
              <Button size="md" className="px-6 font-medium bg-green-600 hover:bg-green-700 text-white">
                Collaborate
              </Button>
            </Link>
            {isAdmin && (
              <div className="relative">
                <button className="text-sm text-gray-700 font-bold px-3 py-2 rounded hover:bg-gray-100" onClick={() => router.push('/admin/dashboard')}>
                  Admin ▾
                </button>
              </div>
            )}
            <div
              className="flex items-center cursor-pointer text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              onClick={() => setSupportOpen(true)}
              style={{ userSelect: 'none' }}
            >
              <ChatBubbleLeftEllipsisIcon className="w-5 h-5 mr-1" />
              <span>Support</span>
            </div>
            {user ? (
              <div className="flex items-center space-x-4 relative">
                <div className="text-sm text-gray-700 cursor-pointer" onClick={() => setIsAccountMenuOpen((v) => !v)}>
                  My Account ▾
                </div>
                {isAccountMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50" style={{ top: '100%' }}>
                    <div className="px-4 py-3 border-b border-gray-100 font-bold text-gray-900">
                      {profile?.full_name ? profile.full_name.split(' ')[0] : user?.email}
                    </div>
                    {isHost ? (
                      <>
                        <Link href="/host/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Dashboard</Link>
                        <Link href="/host/bookings" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Bookings</Link>
                        <Link href="/host/listings/new" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Submit New Listing</Link>
                        <Link href="/host/payments" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Payments</Link>
                        <Link href="/host/calendar" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Calendar</Link>
                        <button onClick={handleSignOut} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">Sign Out</button>
                      </>
                    ) : (
                      <>
                        <Link href="/guest/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">My Bookings</Link>
                        <Link href="/guest/bookmarks" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Bookmarks</Link>
                        <Link href="/guest/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Profile</Link>
                        <button onClick={handleSignOut} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">Sign Out</button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <Button size="md" className="ml-4 px-6 font-medium" onClick={() => router.push('/auth/signin')}>
                Log In
              </Button>
            )}
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
                href="/trips" 
                className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Trips
              </Link>
              <Link 
                href="/search" 
                className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <MagnifyingGlassIcon className="w-5 h-5 inline mr-2" />
                Search
              </Link>
              {user && (
                <>
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
      <SupportModal open={supportOpen} onClose={() => setSupportOpen(false)} />
    </nav>
  );
} 