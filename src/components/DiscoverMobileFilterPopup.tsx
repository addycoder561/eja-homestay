'use client';

import { useState } from 'react';
import { 
  XMarkIcon,
  FunnelIcon,
  ChevronRightIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

interface DiscoverMobileFilterPopupProps {
  isOpen: boolean;
  onClose: () => void;
  selectedContentTypeToggle: 'hyper-local' | 'retreats';
  onContentTypeToggle: (type: 'hyper-local' | 'retreats') => void;
  selectedExperienceCategory: string;
  onExperienceCategoryChange: (category: string) => void;
  selectedRetreatCategory: string;
  onRetreatCategoryChange: (category: string) => void;
}

const EXPERIENCE_CATEGORIES = [
  { id: 'Immersive', label: 'Immersive', icon: '🧘' },
  { id: 'Playful', label: 'Playful', icon: '🎮' },
  { id: 'Culinary', label: 'Culinary', icon: '🍽️' }
];

const RETREAT_CATEGORIES = [
  { id: 'Couple', label: 'Couple', icon: '💑' },
  { id: 'Solo', label: 'Solo', icon: '🧘' },
  { id: 'Family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
  { id: 'Group', label: 'Group', icon: '👥' },
  { id: 'Purposeful', label: 'Purposeful', icon: '🎯' }
];

export function DiscoverMobileFilterPopup({ 
  isOpen, 
  onClose, 
  selectedContentTypeToggle,
  onContentTypeToggle,
  selectedExperienceCategory,
  onExperienceCategoryChange,
  selectedRetreatCategory,
  onRetreatCategoryChange
}: DiscoverMobileFilterPopupProps) {
  const [activeSection, setActiveSection] = useState<'content-type' | 'categories'>('categories');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
             <div className="absolute left-0 top-0 h-1/2 w-full max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ease-out">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Filters</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        

                 {/* Content */}
         <div className="flex-1 overflow-y-auto">
           {activeSection === 'categories' && (
            <div className="p-4 space-y-6">
              {selectedContentTypeToggle === 'hyper-local' ? (
                <>
                  <h4 className="font-semibold text-gray-900">Experience Categories</h4>
                  <div className="space-y-2">
                    {EXPERIENCE_CATEGORIES.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => onExperienceCategoryChange(selectedExperienceCategory === category.id ? '' : category.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                          selectedExperienceCategory === category.id
                            ? 'bg-purple-50 border-purple-200 text-purple-700'
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{category.icon}</span>
                          <span>{category.label}</span>
                        </div>
                        {selectedExperienceCategory === category.id && (
                          <CheckIcon className="w-5 h-5 text-purple-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <h4 className="font-semibold text-gray-900">Retreat Categories</h4>
                  <div className="space-y-2">
                    {RETREAT_CATEGORIES.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => onRetreatCategoryChange(selectedRetreatCategory === category.id ? '' : category.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                          selectedRetreatCategory === category.id
                            ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{category.icon}</span>
                          <span>{category.label}</span>
                        </div>
                        {selectedRetreatCategory === category.id && (
                          <CheckIcon className="w-5 h-5 text-yellow-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={onClose}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
