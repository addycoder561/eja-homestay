"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { PropertyImageGallery } from "@/components/PropertyImageGallery";
import { buildCoverFirstImages } from "@/lib/media";

export default function ExperienceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const experienceId = params.id as string;
  const { user, profile } = useAuth();
  const [experience, setExperience] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  useEffect(() => {
    const fetchExperience = async () => {
      const { data } = await supabase
        .from("experiences")
        .select("*")
        .eq("id", experienceId)
        .single();
      setExperience(data);
    };
    if (experienceId) fetchExperience();
  }, [experienceId]);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data } = await supabase
        .from("experience_reviews")
        .select("*")
        .eq("experience_id", experienceId)
        .order("created_at", { ascending: false });
      setReviews(data || []);
    };
    if (experienceId) fetchReviews();
  }, [experienceId]);

  useEffect(() => {
    // TODO: Gate by completed booking if needed
    setCanReview(!!user);
    setHasReviewed(reviews.some((r) => r.guest_id === user?.id));
  }, [user, reviews]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    setSubmitting(true);
    const { data, error } = await supabase
      .from("experience_reviews")
      .insert({
        experience_id: experienceId,
        guest_id: profile.id,
        rating: reviewRating,
        comment: reviewText,
      })
      .select()
      .single();
    setSubmitting(false);
    if (error) {
      toast.error("Failed to submit review");
    } else {
      setReviewText("");
      setReviewRating(5);
      setReviews([data, ...reviews]);
    }
  };

  if (!experience) return <div className="max-w-5xl mx-auto p-6">Loading...</div>;

  // Build images list from cover_image + images[]
  const images: string[] = buildCoverFirstImages(experience.cover_image, experience.images);
  const hero = images[0] || "/placeholder-experience.jpg";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-6xl mx-auto p-6">
        {/* Image Gallery */}
        <PropertyImageGallery images={images.length ? images : ["/placeholder-experience.jpg"]} propertyTitle={experience.title} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Details */}
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{experience.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
              <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 016 6c0 4.418-6 10-6 10S4 12.418 4 8a6 6 0 016-6zm0 8a2 2 0 100-4 2 2 0 000 4z"/></svg>{experience.location}</span>
              {experience.duration && (
                <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"/></svg>{experience.duration}</span>
              )}
            </div>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-3">About this experience</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{experience.description || "Details coming soon."}</p>

                {images.length > 1 && (
                  <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3">
                    {images.slice(0, 6).map((src, i) => (
                      <div key={i} className="w-full h-28 md:h-32 rounded-lg overflow-hidden">
                        <img src={src} alt={`Image ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card className="mt-6">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Reviews</h2>
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                        <div className="flex items-center mb-2 gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                            <span className="text-lg font-bold text-gray-500">G</span>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 text-sm">Guest</div>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`w-4 h-4 ${i < review.rating ? "text-yellow-400" : "text-gray-300"}`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                              <span className="text-xs text-gray-600 ml-2">{new Date(review.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        {review.comment && <p className="text-gray-700 mt-2">{review.comment}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No reviews yet. Be the first to review this experience!</p>
                )}
                {canReview && !hasReviewed && (
                  <form onSubmit={handleReviewSubmit} className="space-y-4 mt-8">
                    <Input label="Your Review" value={reviewText} onChange={(e) => setReviewText(e.target.value)} required />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                      <input
                        type="range"
                        min={1}
                        max={5}
                        value={reviewRating}
                        onChange={(e) => setReviewRating(Number(e.target.value))}
                        className="w-full"
                      />
                      <div className="text-center text-lg font-bold text-blue-700">{reviewRating} / 5</div>
                    </div>
                    <Button type="submit" loading={submitting} disabled={submitting} className="w-full">
                      Submit Review
                    </Button>
                  </form>
                )}
                {hasReviewed && user && (
                  <div className="text-center text-green-600 mt-8">You have already reviewed this experience. Thank you!</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Booking Summary */}
          <div>
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="text-2xl font-bold text-gray-900">₹{experience.price}</div>
                <div className="text-sm text-gray-600">All taxes included</div>
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => router.push(`/experiences?book=${experienceId}`)}
                >
                  Book Now
                </Button>
                {experience.categories && (
                  <div className="text-xs text-gray-600">Categories: {experience.categories}</div>
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