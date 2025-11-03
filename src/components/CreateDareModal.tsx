'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  XMarkIcon,
  FireIcon,
  CalendarIcon,
  HashtagIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import toast from 'react-hot-toast';

interface CreateDareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDareCreated: () => void;
}

const VIBES = [
  { id: 'Happy', name: 'Happy', color: 'yellow', icon: '😊' },
  { id: 'Chill', name: 'Chill', color: 'blue', icon: '😌' },
  { id: 'Bold', name: 'Bold', color: 'red', icon: '🔥' },
  { id: 'Social', name: 'Social', color: 'green', icon: '👥' }
];

export function CreateDareModal({ isOpen, onClose, onDareCreated }: CreateDareModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    hashtag: '',
    vibe: '',
    expiry_date: ''
  });

  // Pre-fill form with sample data for preview (remove in production)
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: 'Take a photo with a stranger and make them smile',
        description: 'Approach someone you don\'t know, ask to take a photo together, and make sure they\'re genuinely smiling in the picture. Share the joy!',
        hashtag: 'strangersmile',
        vibe: 'Happy',
        expiry_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please sign in to create dares');
      return;
    }

    // Validate form
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Description is required');
      return;
    }
    if (!formData.vibe) {
      toast.error('Please select a vibe');
      return;
    }
    if (!formData.expiry_date) {
      toast.error('Expiry date is required');
      return;
    }

    // Validate expiry date (must be at least 1 hour from now)
    const expiryDate = new Date(formData.expiry_date);
    const now = new Date();
    const minExpiry = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now

    if (expiryDate <= minExpiry) {
      toast.error('Expiry date must be at least 1 hour from now');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/dares', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim(),
          hashtag: formData.hashtag.trim() || null,
          vibe: formData.vibe,
          expiry_date: expiryDate.toISOString()
        }),
      });

      if (response.ok) {
        toast.success('Dare created successfully!');
        onDareCreated();
        // Reset form
        setFormData({
          title: '',
          description: '',
          hashtag: '',
          vibe: '',
          expiry_date: ''
        });
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create dare');
      }
    } catch (error) {
      console.error('Error creating dare:', error);
      toast.error('Error creating dare. Please try again.');
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
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-2">
            <FireIcon className="w-6 h-6 text-yellow-500" />
            <h2 className="text-xl font-bold text-gray-900">Drop a Dare</h2>
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
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dare Title *
            </label>
            <Input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="What's the dare?"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe what people need to do..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              required
            />
          </div>

          {/* Hashtag */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hashtag (Optional)
            </label>
            <div className="relative">
              <HashtagIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                value={formData.hashtag}
                onChange={(e) => handleInputChange('hashtag', e.target.value)}
                placeholder="darechallenge"
                className="pl-10"
              />
            </div>
          </div>

          {/* Vibe Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Vibe *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {VIBES.map((vibe) => (
                <button
                  key={vibe.id}
                  type="button"
                  onClick={() => handleInputChange('vibe', vibe.id)}
              className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                formData.vibe === vibe.id
                  ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{vibe.icon}</span>
                    <span className="font-medium">{vibe.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Expiry Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expiry Date *
            </label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="datetime-local"
                value={formData.expiry_date}
                onChange={(e) => handleInputChange('expiry_date', e.target.value)}
                min={new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16)}
                className="pl-10"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Dare expires in 3 days by default
            </p>
          </div>

          {/* Info Card */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <SparklesIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Dare Rules:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Dare expires in 3 days</li>
                    <li>• Vanishes in 7 days if under 10 completions</li>
                    <li>• Completed dares vanish in 3 days if under 10 smiles</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

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
              disabled={loading}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              {loading ? 'Creating...' : 'Drop Dare'}
            </Button>
          </div>
          </form>
        </div>
      </div>
    </div>
  );
}
