'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getWishlist } from '@/lib/database';
import { 
  HomeIcon, 
  MagnifyingGlassIcon, 
  HeartIcon,
  UserIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { 
  HomeIcon as HomeIconSolid, 
  MagnifyingGlassIcon as MagnifyingGlassIconSolid, 
  HeartIcon as HeartIconSolid,
  UserIcon as UserIconSolid,
  SparklesIcon as SparklesIconSolid
} from '@heroicons/react/24/solid';

export function MobileBottomNavigation() {
  const { user, profile } = useAuth();
  const pathname = usePathname();
  const [wishlistCount, setWishlistCount] = useState(0);

  // Fetch wishlist count when user is logged in
  useEffect(() => {
    const fetchWishlistCount = async () => {
      if (user?.id) {
        try {
          const wishlist = await getWishlist(user.id);
          setWishlistCount(wishlist?.length || 0);
        } catch (error) {
          console.error('Error fetching wishlist count:', error);
          setWishlistCount(0);
        }
      } else {
        setWishlistCount(0);
      }
    };

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseKey && supabaseUrl !== 'https://placeholder.supabase.co') {
      fetchWishlistCount();
    }
  }, [user?.id]);

  // Hide on auth pages and admin pages
  const isAuthPage = pathname?.startsWith('/auth/');
  const isAdminPage = pathname?.startsWith('/admin/');
  const isHostPage = pathname?.startsWith('/host/');
  
  if (isAuthPage || isAdminPage || isHostPage) {
    return null;
  }

  const navigationItems = [
    {
      name: 'Home',
      href: '/',
      icon: pathname === '/' ? HomeIconSolid : HomeIcon,
      active: pathname === '/'
    },
    {
      name: 'Discover',
      href: '/discover',
      icon: pathname?.startsWith('/discover') ? SparklesIconSolid : SparklesIcon,
      active: pathname?.startsWith('/discover')
    },
    {
      name: 'Wishlist',
      href: '/guest/wishlist',
      icon: pathname?.startsWith('/guest/wishlist') ? HeartIconSolid : HeartIcon,
      active: pathname?.startsWith('/guest/wishlist'),
      badge: wishlistCount > 0 ? wishlistCount : undefined
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 lg:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full py-2 px-1 rounded-lg transition-all duration-200 ${
                item.active
                  ? 'text-yellow-500 bg-yellow-50'
                  : 'text-gray-600 hover:text-yellow-500 hover:bg-gray-50'
              }`}
            >
              <div className="relative">
                <Icon className="w-6 h-6" />
                {item.badge && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium mt-1">{item.name}</span>
            </Link>
          );
        })}
      </div>
      
      {/* Safe area for devices with home indicator */}
      <div className="h-safe-area-inset-bottom bg-white" />
    </nav>
  );
}
