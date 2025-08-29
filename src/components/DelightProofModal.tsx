'use client';

import { useState, useRef } from 'react';
import { 
  XMarkIcon, 
  CameraIcon, 
  MapPinIcon,
  CloudArrowUpIcon,
  PhotoIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';
import { uploadDelightProof } from '@/lib/delight-api';
import toast from 'react-hot-toast';

interface DelightProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  taskTitle: string;
  onSuccess: () => void;
}

export function DelightProofModal({ 
  isOpen, 
  onClose, 
  taskId, 
  taskTitle, 
  onSuccess 
}: DelightProofModalProps) {
  const [proofText, setProofText] = useState('');
  const [proofMedia, setProofMedia] = useState<string>('');
  const [latitude, setLatitude] = useState<number>(0);
  const [longitude, setLongitude] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [mediaType, setMediaType] = useState<'photo' | 'video'>('photo');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          toast.success('Location captured!');
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Could not get location. Please enable location services.');
        }
      );
    } else {
      toast.error('Geolocation is not supported by this browser.');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setProofMedia(result);
    };

    if (mediaType === 'photo') {
      reader.readAsDataURL(file);
    } else {
      // For video, we'll use a placeholder for now
      setProofMedia('/placeholder-video.jpg');
    }
  };

  const capturePhoto = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
        })
        .catch((error) => {
          console.error('Error accessing camera:', error);
          toast.error('Could not access camera. Please upload a file instead.');
        });
    } else {
      toast.error('Camera access not supported. Please upload a file instead.');
    }
  };

  const takePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(videoRef.current, 0, 0);
      
      const photoDataUrl = canvas.toDataURL('image/jpeg');
      setProofMedia(photoDataUrl);
      
      // Stop the video stream
      const stream = videoRef.current.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const handleSubmit = async () => {
    if (!proofMedia) {
      toast.error('Please upload or capture proof media');
      return;
    }

    if (!proofText.trim()) {
      toast.error('Please describe your proof');
      return;
    }

    if (latitude === 0 && longitude === 0) {
      toast.error('Please capture your location');
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadDelightProof(taskId, proofMedia, proofText, latitude, longitude);
      
      if (result.success) {
        toast.success(`Proof uploaded successfully! You earned ${result.points} points!`);
        onSuccess();
        onClose();
        resetForm();
      }
    } catch (error) {
      console.error('Error uploading proof:', error);
      toast.error('Failed to upload proof. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setProofText('');
    setProofMedia('');
    setLatitude(0);
    setLongitude(0);
    setMediaType('photo');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Upload Proof</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Task Info */}
          <div className="bg-yellow-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Task: {taskTitle}</h3>
            <p className="text-sm text-gray-600">
              Upload proof of completion with location and media
            </p>
          </div>

          {/* Media Upload */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Proof Media</h3>
            
            {/* Media Type Selection */}
            <div className="flex gap-4 mb-4">
              <button
                onClick={() => setMediaType('photo')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  mediaType === 'photo'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <PhotoIcon className="w-5 h-5" />
                Photo
              </button>
              <button
                onClick={() => setMediaType('video')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  mediaType === 'video'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <VideoCameraIcon className="w-5 h-5" />
                Video
              </button>
            </div>

            {/* Media Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
              {!proofMedia ? (
                <div className="space-y-4">
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-6 py-3 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
                    >
                      <CloudArrowUpIcon className="w-5 h-5" />
                      Upload {mediaType}
                    </button>
                    <button
                      onClick={capturePhoto}
                      className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                    >
                      <CameraIcon className="w-5 h-5" />
                      Capture {mediaType}
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">
                    Upload a {mediaType} or capture one using your camera
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {mediaType === 'photo' ? (
                    <img 
                      src={proofMedia} 
                      alt="Proof" 
                      className="max-w-full max-h-64 mx-auto rounded-lg"
                    />
                  ) : (
                    <video 
                      ref={videoRef}
                      className="max-w-full max-h-64 mx-auto rounded-lg"
                      controls
                    />
                  )}
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => setProofMedia('')}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                      Remove
                    </button>
                    {mediaType === 'photo' && videoRef.current?.srcObject && (
                      <button
                        onClick={takePhoto}
                        className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition-colors"
                      >
                        Take Photo
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept={mediaType === 'photo' ? 'image/*' : 'video/*'}
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Location */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Location</h3>
            <button
              onClick={getCurrentLocation}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              <MapPinIcon className="w-5 h-5" />
              Capture Current Location
            </button>
            {(latitude !== 0 || longitude !== 0) && (
              <div className="mt-3 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  Location captured: {latitude.toFixed(6)}, {longitude.toFixed(6)}
                </p>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
            <textarea
              value={proofText}
              onChange={(e) => setProofText(e.target.value)}
              placeholder="Describe what you did and how it made a difference..."
              rows={4}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isUploading || !proofMedia || !proofText.trim()}
              className="flex-1 px-6 py-3 bg-yellow-500 text-white rounded-xl font-semibold hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Uploading...' : 'Submit Proof'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
