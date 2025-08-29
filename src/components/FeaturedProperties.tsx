'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { buildCoverFirstImages } from '@/lib/media';
import { getProperties } from '@/lib/database';
import { PropertyWithHost } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/Card';
import { MapPinIcon, UserGroupIcon } from '@heroicons/react/24/solid';
import { LiveRating } from './LiveRating';

export function FeaturedProperties() {
  const [properties, setProperties] = useState<PropertyWithHost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const data = await getProperties();
        setProperties(data); // Show all properties
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Featured Properties
            </h2>
            <p className="text-lg text-gray-600">
              Discover our most popular accommodations
            </p>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-80 animate-pulse">
                <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Featured Properties
          </h2>
          <p className="text-lg text-gray-600">
            Discover our most popular accommodations
          </p>
        </div>

        <div className="relative">
          <div 
            className="flex gap-6 overflow-x-auto pb-12 pt-8 px-8 -mx-8 scrollbar-hide"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            {properties.map((property, index) => (
              <div key={property.id} className="flex-shrink-0 w-80">
                <Link href={`/property/${property.id}`}>
                  <Card className="group hover:shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer h-full hover:-translate-y-2 hover:scale-105">
                    <div className="relative h-48 overflow-hidden rounded-t-lg">
                      <Image
                        src={buildCoverFirstImages(property.cover_image, property.images)[0]}
                        alt={property.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 right-4 bg-white px-2 py-1 rounded-full text-sm font-semibold text-gray-900">
                        ₹{property.price_per_night}/night
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg text-gray-900 group-hover:text-yellow-500 transition-colors">
                          {property.title}
                        </h3>
                      </div>
                      
                      <div className="flex items-center text-gray-600 mb-2">
                        <MapPinIcon className="w-4 h-4 mr-1" />
                        <span className="text-sm">
                          {property.city}, {property.country}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <UserGroupIcon className="w-4 h-4 mr-1" />
                          <span>Up to {property.max_guests} guests</span>
                        </div>
                        <LiveRating 
                          propertyId={property.id}
                          propertyTitle={property.title}
                          size="sm"
                        />
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {property.amenities.slice(0, 3).map((amenity, index) => (
                          <span
                            key={index}
                            className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                          >
                            {amenity}
                          </span>
                        ))}
                        {property.amenities.length > 3 && (
                          <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                            +{property.amenities.length - 3} more
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <Link href="/search">
            <button className="bg-yellow-400 text-white px-8 py-3 rounded-lg font-medium hover:bg-yellow-500 transition-colors">
              View All Properties
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
} 