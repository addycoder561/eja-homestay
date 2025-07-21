'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { BookingForm } from '@/components/BookingForm';
import { getPropertyWithReviews } from '@/lib/database';
import { PropertyWithReviews, Profile } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/Card';

function GoogleMap({ lat, lng }: { lat: number; lng: number }) {
  return (
    <iframe
      width="100%"
      height="300"
      style={{ border: 0, borderRadius: 12 }}
      loading="lazy"
      allowFullScreen
      src={`https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`}
    />
  );
}

export default function PropertyDetailPage() {
  const params = useParams();
  const propertyId = params.id as string;
  const [property, setProperty] = useState<PropertyWithReviews | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const data = await getPropertyWithReviews(propertyId);
        setProperty(data);
      } catch (error) {
        console.error('Error fetching property:', error);
      } finally {
        setLoading(false);
      }
    };

    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="bg-gray-200 h-96 rounded-lg mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
              <div className="h-96 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Property not found</h1>
            <p className="text-gray-600">The property you're looking for doesn't exist.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Demo/placeholder data for new fields
  const gallery = property.gallery || {
    Living: property.images.slice(0, 2),
    Kitchen: property.images.slice(2, 3),
    Outdoor: property.images.slice(3, 5),
  };
  const usps = property.usps || [
    'Stunning mountain views',
    'Power backup & pure-veg meals',
    'Pet friendly & parking available',
  ];
  const host: Profile = property.host || {
    id: '',
    email: '',
    full_name: 'Host Name',
    phone: '',
    avatar_url: '',
    is_host: true,
    created_at: '',
    updated_at: '',
    host_bio: 'Experienced host passionate about hospitality and local culture.',
    host_usps: ['Warm hospitality', 'Local expertise', 'Quick response'],
  };
  const houseRules = property.house_rules || 'No smoking. No parties. Check-in after 2pm. Pets allowed.';
  const cancellationPolicy = property.cancellation_policy || 'Free cancellation up to 7 days before check-in. 50% refund after.';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title & Subtitle */}
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">{property.title}</h1>
          {property.subtitle && <h2 className="text-lg text-gray-600 mb-2">{property.subtitle}</h2>}
        </div>

        {/* Categorized Gallery */}
        <div className="mb-8">
          <div className="flex gap-4 overflow-x-auto pb-2">
            {Object.entries(gallery).map(([category, images]) => (
              <div key={category} className="min-w-[250px]">
                <div className="font-semibold text-gray-800 mb-2">{category}</div>
                <div className="flex gap-2">
                  {images.map((img, i) => (
                    <div key={i} className="relative h-40 w-40 rounded-lg overflow-hidden">
                      <Image src={img} alt={`${category} ${i + 1}`} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Property Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* USPs */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Why Book This Stay?</h2>
                <ul className="list-disc pl-6 text-gray-800 space-y-1">
                  {usps.map((usp, i) => <li key={i}>{usp}</li>)}
                </ul>
              </CardContent>
            </Card>

            {/* Room/Beds/Bath/Guests */}
            <Card>
              <CardContent className="p-6 flex flex-wrap gap-6">
                <div><span className="font-bold">Rooms:</span> {property.bedrooms}</div>
                <div><span className="font-bold">Beds:</span> {property.bedrooms}</div>
                <div><span className="font-bold">Baths:</span> {property.bathrooms}</div>
                <div><span className="font-bold">Guests:</span> up to {property.max_guests}</div>
                <div><span className="font-bold">Type:</span> {property.property_type}</div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">About this place</h2>
                <p className="text-gray-700 leading-relaxed">{property.description}</p>
              </CardContent>
            </Card>

            {/* Amenities */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Amenities</h2>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((amenity, i) => (
                    <span key={i} className="inline-block bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">
                      {amenity}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* House Rules & Cancellation Policy */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">House Rules</h2>
                <p className="text-gray-700 mb-4">{houseRules}</p>
                <h2 className="text-xl font-semibold mb-4">Cancellation Policy</h2>
                <p className="text-gray-700">{cancellationPolicy}</p>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Reviews</h2>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="font-medium">{property.average_rating?.toFixed(1)}</span>
                    <span className="text-gray-600 ml-1">({property.review_count} reviews)</span>
                  </div>
                </div>
                {property.reviews.length > 0 ? (
                  <div className="space-y-4">
                    {property.reviews.slice(0, 3).map((review) => (
                      <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                        <div className="flex items-center mb-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-sm text-gray-600 ml-2">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-gray-700">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No reviews yet. Be the first to review this property!</p>
                )}
              </CardContent>
            </Card>

            {/* Host Info */}
            <Card>
              <CardContent className="p-6 flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                    {host.avatar_url ? (
                      <Image src={host.avatar_url} alt={host.full_name || 'Host'} width={80} height={80} />
                    ) : (
                      <span className="text-2xl font-bold text-gray-500">{host.full_name?.[0]}</span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="font-bold text-lg text-gray-900">{host.full_name}</div>
                  <div className="text-gray-700 mb-2">{host.host_bio}</div>
                  <div className="text-sm text-gray-600 font-semibold mb-1">Host USPs:</div>
                  <ul className="list-disc pl-6 text-gray-800 space-y-1">
                    {(host.host_usps || []).map((usp, i) => <li key={i}>{usp}</li>)}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Google Map */}
            {property.latitude && property.longitude && (
              <Card>
                <CardContent className="p-0">
                  <GoogleMap lat={property.latitude} lng={property.longitude} />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-1">
            <BookingForm property={property} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 