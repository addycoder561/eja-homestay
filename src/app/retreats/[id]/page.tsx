"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { PropertyImageGallery } from "@/components/PropertyImageGallery";
import { buildCoverFirstImages } from "@/lib/media";

export default function RetreatDetailPage() {
  const params = useParams();
  const retreatId = params.id as string;
  const [retreat, setRetreat] = useState<any>(null);

  useEffect(() => {
    async function fetchRetreat() {
      const { data, error } = await supabase
        .from('retreats')
        .select('*')
        .eq('id', retreatId)
        .single();
      if (!error) setRetreat(data);
    }
    if (retreatId) fetchRetreat();
  }, [retreatId]);

  if (!retreat) return <div className="max-w-5xl mx-auto p-6">Loading...</div>;

  const images: string[] = buildCoverFirstImages(retreat.cover_image, retreat.images);
  const hero = images[0] || '/placeholder-experience.jpg';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-6xl mx-auto p-6">
        {/* Image Gallery */}
        <PropertyImageGallery images={images.length ? images : ["/placeholder-experience.jpg"]} propertyTitle={retreat.title} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Details */}
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{retreat.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
              <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 016 6c0 4.418-6 10-6 10S4 12.418 4 8a6 6 0 016-6zm0 8a2 2 0 100-4 2 2 0 000 4z"/></svg>{retreat.location}</span>
              {retreat.duration && (
                <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"/></svg>{retreat.duration}</span>
              )}
            </div>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-3">About this retreat</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{retreat.description || 'Details coming soon.'}</p>

                {images.length > 1 && (
                  <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3">
                    {images.slice(0, 6).map((src, i) => (
                      <div key={i} className="w-full h-28 md:h-32 rounded-lg overflow-hidden">
                        <img src={src} alt={`Image ${i+1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Booking Summary */}
          <div>
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="text-2xl font-bold text-gray-900">₹{retreat.price}</div>
                <div className="text-sm text-gray-600">All taxes included</div>
                <Button 
                  variant="primary" 
                  className="w-full"
                  onClick={() => router.push(`/retreats?book=${retreatId}`)}
                >
                  Book Now
                </Button>
                {retreat.categories && (
                  <div className="text-xs text-gray-600">Category: {Array.isArray(retreat.categories) ? retreat.categories.join(', ') : retreat.categories}</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
