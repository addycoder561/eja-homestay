'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  const pathname = usePathname();
  
  // Generate breadcrumbs from pathname if no items provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const paths = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', href: '/' }
    ];
    
    let currentPath = '';
    paths.forEach((path, index) => {
      currentPath += `/${path}`;
      
      // Convert path to readable label
      const label = path
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      // Don't add href for current page
      const href = index === paths.length - 1 ? undefined : currentPath;
      
      breadcrumbs.push({ label, href });
    });
    
    return breadcrumbs;
  };
  
  const breadcrumbItems = items || generateBreadcrumbs();
  
  if (breadcrumbItems.length <= 1) {
    return null;
  }
  
  return (
    <nav className={`flex items-center space-x-2 text-sm text-gray-600 ${className}`} aria-label="Breadcrumb">
      {breadcrumbItems.map((item, index) => (
        <div key={item.label} className="flex items-center">
          {index > 0 && (
            <ChevronRightIcon className="w-4 h-4 mx-2 text-gray-400" />
          )}
          
          {item.href ? (
            <Link
              href={item.href}
              className="flex items-center gap-1 hover:text-blue-600 transition-colors"
            >
              {index === 0 && <HomeIcon className="w-4 h-4" />}
              <span>{item.label}</span>
            </Link>
          ) : (
            <span className="text-gray-900 font-medium flex items-center gap-1">
              {index === 0 && <HomeIcon className="w-4 h-4" />}
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
