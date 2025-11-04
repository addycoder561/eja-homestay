'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { 
  XMarkIcon,
  PhotoIcon,
  MapPinIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';

interface Dare {
  id: string;
  title: string;
  description: string;
  hashtag?: string;
  vibe: 'Happy' | 'Chill' | 'Bold' | 'Social';
  creator: {
    full_name: string;
    avatar_url?: string;
  };
  completion_count: number;
  smile_count: number;
  comment_count: number;
  share_count: number;
  expiry_date: string;
  created_at: string;
  hours_remaining?: number;
}

interface CompleteDareModalProps {
  isOpen: boolean;
  onClose: () => void;
  dare: Dare;
  onDareCompleted: () => void;
}

export function CompleteDareModal({ isOpen, onClose, dare, onDareCompleted }: CompleteDareModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    caption: '',
    location: ''
  });
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        caption: '',
        location: ''
      });
      setMediaFiles([]);
      setMediaPreviews([]);
    }
  }, [isOpen]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles = [...mediaFiles, ...files].slice(0, 10); // Max 10 files
    setMediaFiles(newFiles);

    // Create previews
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setMediaPreviews(newPreviews);
  };

  const removeMedia = (index: number) => {
    const newFiles = mediaFiles.filter((_, i) => i !== index);
    const newPreviews = mediaPreviews.filter((_, i) => i !== index);
    
    // Revoke the URL to free memory
    URL.revokeObjectURL(mediaPreviews[index]);
    
    setMediaFiles(newFiles);
    setMediaPreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please sign in to complete dares');
      return;
    }

    if (mediaFiles.length === 0) {
      toast.error('Please upload at least one media file');
      return;
    }

    if (!formData.caption.trim()) {
      toast.error('Please add a caption');
      return;
    }

    if (!formData.location.trim()) {
      toast.error('Please add a location');
      return;
    }

    setLoading(true);

    try {
      // Upload media files to Supabase Storage
      const mediaUrls: string[] = [];
      
      // Try completed-dares bucket first, fallback to experience-images, then avatars
      const bucketName = 'completed-dares';
      const fallbackBucket = 'experience-images';
      const finalFallback = 'avatars';
      
      for (const file of mediaFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${dare.id}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `dare-media/${fileName}`;

        // Try uploading to completed-dares bucket first
        const uploadError = null;
        let usedBucket = bucketName;
        
        const { error: primaryError } = await supabase.storage
          .from(bucketName)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (primaryError) {
          console.error('Primary bucket upload error:', {
            bucket: bucketName,
            error: primaryError,
            message: primaryError.message,
            code: primaryError.statusCode
          });
          
          // If bucket doesn't exist, try fallback buckets
          if (primaryError.message?.includes('not found') || 
              primaryError.message?.includes('Bucket') ||
              primaryError.statusCode === '404' ||
              primaryError.statusCode === 404) {
            console.warn(`Bucket "${bucketName}" not found. Error: ${primaryError.message}. Trying fallback: ${fallbackBucket}`);
            
            // Try first fallback
            const { error: fallbackError } = await supabase.storage
              .from(fallbackBucket)
              .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
              });
            
            if (fallbackError) {
              // Try final fallback
              if (fallbackError.message?.includes('not found') || fallbackError.message?.includes('Bucket')) {
                console.warn(`Bucket ${fallbackBucket} not found, using final fallback: ${finalFallback}`);
                const { error: finalError } = await supabase.storage
                  .from(finalFallback)
                  .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                  });
                
                if (finalError) {
                  const errorDetails = `Failed to upload ${file.name}. All buckets failed:
- Primary bucket "${bucketName}": ${primaryError.message}
- Fallback bucket "${fallbackBucket}": ${fallbackError.message}
- Final fallback "${finalFallback}": ${finalError.message}

Please verify:
1. Bucket "${bucketName}" exists in Supabase Dashboard → Storage
2. Bucket name is exactly "${bucketName}" (lowercase, hyphenated)
3. Bucket is set to Public
4. Storage policies are set up (run 04_create_storage_buckets.sql)`;
                  throw new Error(errorDetails);
                }
                usedBucket = finalFallback;
              } else {
                throw new Error(`Failed to upload ${file.name}: ${fallbackError.message}`);
              }
            } else {
              usedBucket = fallbackBucket;
            }
          } else {
            throw new Error(`Failed to upload ${file.name}: ${primaryError.message}`);
          }
        }

        // Get public URL from the bucket we used
        const { data: { publicUrl } } = supabase.storage
          .from(usedBucket)
          .getPublicUrl(filePath);

        mediaUrls.push(publicUrl);
      }
      
      // Get the session to pass in the request
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to complete dares');
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/dares/${dare.id}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'X-Refresh-Token': session.refresh_token || '',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          media_urls: mediaUrls,
          caption: formData.caption.trim() || null,
          location: formData.location.trim() || null
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        toast.success('Dare completed successfully!');
        onDareCompleted();
        // Reset form
        setFormData({ caption: '', location: '' });
        setMediaFiles([]);
        setMediaPreviews([]);
      } else {
        const errorMessage = responseData.error || `Failed to complete dare (${response.status})`;
        console.error('Error completing dare:', {
          status: response.status,
          error: responseData,
          dareId: dare.id,
          mediaUrlsCount: mediaUrls.length
        });
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error completing dare:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error completing dare. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="w-6 h-6 text-green-500" />
            <h2 className="text-xl font-bold text-gray-900">Complete Dare</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>


        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-6 pb-6">
          {/* Media Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Media *
            </label>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full flex items-center justify-center gap-2 py-3"
            >
              <PhotoIcon className="w-5 h-5" />
              Add Photos/Videos
            </Button>

            {/* Media Previews */}
            {mediaPreviews.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {mediaPreviews.map((preview, index) => (
                  <div key={index} className="relative group aspect-square">
                    <div className="w-full h-full rounded-lg overflow-hidden bg-gray-200">
                      <img 
                        src={preview} 
                        alt={`Media ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMedia(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Caption */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Caption *
            </label>
            <textarea
              value={formData.caption}
              onChange={(e) => handleInputChange('caption', e.target.value)}
              placeholder="Tell us about your experience completing this dare..."
              rows={3}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none text-gray-900"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location *
            </label>
            <div className="relative">
              <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Where did you complete this dare?"
                required
                className="pl-10"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              disabled={loading || mediaFiles.length === 0 || !formData.caption.trim() || !formData.location.trim()}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              {loading ? 'Completing...' : 'Complete Dare'}
            </Button>
          </div>
          </form>
        </div>
      </div>
    </div>
  );
}
