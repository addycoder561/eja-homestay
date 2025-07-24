"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

export default function ExperienceDetailPage() {
  const params = useParams();
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
      const { data } = await supabase.from("experiences").select("*, reviews:experience_reviews(*)").eq("id", experienceId).single();
      setExperience(data);
      setReviews(data?.reviews || []);
    };
    if (experienceId) fetchExperience();
  }, [experienceId]);

  useEffect(() => {
    // TODO: Check if user has completed booking for this experience
    setCanReview(!!user);
    setHasReviewed(reviews.some(r => r.guest_id === user?.id));
  }, [user, reviews]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    setSubmitting(true);
    const { data, error } = await supabase.from("experience_reviews").insert({
      experience_id: experienceId,
      guest_id: profile.id,
      rating: reviewRating,
      comment: reviewText,
    }).select().single();
    setSubmitting(false);
    if (error) {
      toast.error("Failed to submit review");
    } else {
      setReviewText("");
      setReviewRating(5);
      setReviews([data, ...reviews]);
    }
  };

  if (!experience) return <div>Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">{experience.title}</h1>
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Reviews</h2>
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <div className="flex items-center mb-2 gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                      {/* TODO: Show avatar */}
                      <span className="text-lg font-bold text-gray-500">G</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">Guest</div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <span className="text-xs text-gray-600 ml-2">{new Date(review.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-gray-700 mt-2">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No reviews yet. Be the first to review this experience!</p>
          )}
          {canReview && !hasReviewed && (
            <form onSubmit={handleReviewSubmit} className="space-y-4 mt-8">
              <Input
                label="Your Review"
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={reviewRating}
                  onChange={e => setReviewRating(Number(e.target.value))}
                  className="w-full"
                />
                <div className="text-center text-lg font-bold text-blue-700">{reviewRating} / 5</div>
              </div>
              <Button type="submit" loading={submitting} disabled={submitting} className="w-full">Submit Review</Button>
            </form>
          )}
          {hasReviewed && user && (
            <div className="text-center text-green-600 mt-8">You have already reviewed this experience. Thank you!</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 