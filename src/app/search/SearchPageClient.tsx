"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { PropertyCard } from '@/components/PropertyCard';
import { getProperties, searchProperties, checkDatabaseContent, getExperiences, getRetreats } from '@/lib/database';
import { PropertyWithHost, SearchFilters as SearchFiltersType, PropertyType } from '@/lib/types';
import { 
  MagnifyingGlassIcon, 
  MapPinIcon, 
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';


export default function SearchPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, profile, loading: loadingAuth } = useAuth();
  
  // Get search type from URL parameters
  const searchType = searchParams.get('type') || 'properties';
  const category = searchParams.get('category') || '';
  
  
  const [properties, setProperties] = useState<PropertyWithHost[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [retreats, setRetreats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SearchFiltersType>({
    location: searchParams.get('location') || '',
    checkIn: searchParams.get('checkIn') || '',
    checkOut: searchParams.get('checkOut') || '',
    rooms: searchParams.get('rooms') ? parseInt(searchParams.get('rooms')!) : undefined,
    adults: searchParams.get('adults') ? parseInt(searchParams.get('adults')!) : undefined,
    // Add guest capacity filtering
    guests: searchParams.get('guests') ? parseInt(searchParams.get('guests')!) : undefined,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  
  // Filter states
  const [selectedFilterChips, setSelectedFilterChips] = useState<string[]>([]);
  
  // Advanced filter states
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    minPrice: 0,
    maxPrice: 10000,
    propertyType: '',
    amenities: [] as string[]
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const startTime = Date.now();
      
      try {
        if (searchType === 'experiences') {
          // Fetch experiences and retreats by category
          
          const [experiencesData, retreatsData] = await Promise.all([
            getExperiences(),
            getRetreats()
          ]);
          
          // Filter by category if provided
          let filteredExperiences = experiencesData || [];
          let filteredRetreats = retreatsData || [];
          
          if (category) {
            filteredExperiences = filteredExperiences.filter(exp => 
              exp.categories === category || 
              (Array.isArray(exp.categories) && exp.categories.includes(category))
            );
            filteredRetreats = filteredRetreats.filter(retreat => 
              retreat.categories === category
            );
          }
          
          setExperiences(filteredExperiences);
          setRetreats(filteredRetreats);
          setTotalResults(filteredExperiences.length + filteredRetreats.length);
          setProperties([]); // Clear properties
          
        } else {
          // Original properties logic
          let data;
          
          // Combine filters with selected chips and advanced filters
          const combinedFilters = {
            ...filters,
            selectedChips: selectedFilterChips.length > 0 ? selectedFilterChips : undefined,
            // Include advanced filters in backend search
            minPrice: advancedFilters.minPrice > 0 ? advancedFilters.minPrice : undefined,
            maxPrice: advancedFilters.maxPrice < 10000 ? advancedFilters.maxPrice : undefined,
            propertyType: (advancedFilters.propertyType as PropertyType) || undefined,
            amenities: advancedFilters.amenities.length > 0 ? advancedFilters.amenities : undefined
          };

          // Check if any filters are applied
          const hasFilters = Object.values(combinedFilters).some(value => {
            if (Array.isArray(value)) {
              return value.length > 0;
            }
            return value !== undefined && value !== null && value !== '';
          });

          // Check if we have meaningful search criteria
          const hasLocationOnly = combinedFilters.location && !combinedFilters.checkIn && !combinedFilters.checkOut && !combinedFilters.adults && !combinedFilters.guests;
          const hasNoFilters = !combinedFilters.location && !combinedFilters.checkIn && !combinedFilters.checkOut && !combinedFilters.adults && !combinedFilters.guests && selectedFilterChips.length === 0;
          const hasAdvancedFilters = selectedFilterChips.length > 0 || 
            (advancedFilters.minPrice > 0) || 
            (advancedFilters.maxPrice < 10000) || 
            advancedFilters.propertyType || 
            advancedFilters.amenities.length > 0;

          // Logic: 
          // 1. If no filters at all -> fetch all properties
          // 2. If location only OR location + other criteria OR advanced filters -> use search
          console.log('🔍 Search Debug - Filters:', combinedFilters);
          console.log('🔍 Search Debug - selectedFilterChips:', selectedFilterChips);
          console.log('🔍 Search Debug - hasNoFilters:', hasNoFilters);
          console.log('🔍 Search Debug - hasLocationOnly:', hasLocationOnly);
          console.log('🔍 Search Debug - hasAdvancedFilters:', hasAdvancedFilters);
          
          if (hasNoFilters) {
            console.log('🔍 Search Debug - Fetching all properties');
            data = await getProperties();
          } else {
            console.log('🔍 Search Debug - Using search with filters');
            data = await searchProperties(combinedFilters);
          }
          
          setProperties(data || []);
          setTotalResults((data || []).length);
          setExperiences([]); // Clear experiences
          setRetreats([]); // Clear retreats
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setProperties([]);
        setExperiences([]);
        setRetreats([]);
        setTotalResults(0);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filters, selectedFilterChips, advancedFilters, searchType, category]);

  // Check database content on mount for debugging
  useEffect(() => {
    checkDatabaseContent();
  }, []);

  // Filter chip click handler
  const handleFilterChipClick = (chipName: string) => {
    console.log('🔍 DEBUG - Filter chip clicked:', chipName);
    setSelectedFilterChips(prev => {
      const newChips = prev.includes(chipName) 
        ? prev.filter(chip => chip !== chipName)
        : [...prev, chipName];
      console.log('🔍 DEBUG - Updated selectedFilterChips:', newChips);
      return newChips;
    });
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      checkIn: '',
      checkOut: '',
      rooms: undefined,
      adults: undefined,
      guests: undefined,
    });
  };



  const hasPropertyFilters = Object.values(filters).some(value => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return value !== undefined && value !== null && value !== '';
  });

  // Check if any filters are active
  const hasActiveFilters = selectedFilterChips.length > 0 || 
    advancedFilters.minPrice > 0 || 
    advancedFilters.maxPrice < 10000 || 
    advancedFilters.propertyType || 
    advancedFilters.amenities.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
      <Navigation />
      <div className="relative">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Horizontal Filter Bar - Only show for properties */}
          {searchType !== 'experiences' && (
            <div className="mb-8 sticky top-16 z-40 bg-gray-50 py-4 -mx-8 px-8 border-b border-gray-200">
            <div className="flex items-center gap-4">
              {/* All Filters Button - Fixed Left */}
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-full text-blue-600 font-medium hover:bg-gray-50 transition-colors whitespace-nowrap flex-shrink-0 text-sm shadow-sm h-12"
                aria-label="Toggle advanced filters panel"
                aria-expanded={showAdvancedFilters}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                </svg>
                All filters
              </button>



              {/* Scrollable Middle Section */}
              <div className="flex-1 overflow-x-auto scrollbar-hide relative">
                <div className="flex items-center gap-3 py-2 pr-16">
                  {/* Scroll gradient indicators - Reduced opacity and width */}
                  <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-gray-50/80 to-transparent pointer-events-none z-10"></div>
                  <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-gray-50/80 to-transparent pointer-events-none z-10"></div>
                  
                  {/* Property Filters - Removed for now, will recreate */}
                  
                  {/* Property Type Filters */}
                  <button 
                    onClick={() => handleFilterChipClick('Boutique')}
                    className={`flex items-center justify-center gap-1 px-2 py-1 rounded-full border-2 transition-all duration-200 whitespace-nowrap text-xs font-medium h-7 flex-shrink-0 ${
                      selectedFilterChips.includes('Boutique')
                        ? 'bg-blue-100 border-blue-200 text-blue-700 shadow-md'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400 hover:shadow-sm'
                    }`}
                    title="Boutique properties"
                  >
                    <span className="text-xs">🏨</span>
                    <span>Boutique</span>
                  </button>

                  <button 
                    onClick={() => handleFilterChipClick('Homely')}
                    className={`flex items-center justify-center gap-1 px-2 py-1 rounded-full border-2 transition-all duration-200 whitespace-nowrap text-xs font-medium h-7 flex-shrink-0 ${
                      selectedFilterChips.includes('Homely')
                        ? 'bg-blue-100 border-blue-200 text-blue-700 shadow-md'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400 hover:shadow-sm'
                    }`}
                    title="Homely properties"
                  >
                    <span className="text-xs">🏠</span>
                    <span>Homely</span>
                  </button>

                  <button 
                    onClick={() => handleFilterChipClick('Off-Beat')}
                    className={`flex items-center justify-center gap-1 px-2 py-1 rounded-full border-2 transition-all duration-200 whitespace-nowrap text-xs font-medium h-7 flex-shrink-0 ${
                      selectedFilterChips.includes('Off-Beat')
                        ? 'bg-blue-100 border-blue-200 text-blue-700 shadow-md'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400 hover:shadow-sm'
                    }`}
                    title="Off-Beat properties"
                  >
                    <span className="text-xs">✨</span>
                    <span>Off-Beat</span>
                  </button>

                  {/* Tag Filters (from tags column) */}
                  <button 
                    onClick={() => handleFilterChipClick('Families-only')}
                    className={`flex items-center justify-center gap-1 px-2 py-1 rounded-full border-2 transition-all duration-200 whitespace-nowrap text-xs font-medium h-7 flex-shrink-0 ${
                      selectedFilterChips.includes('Families-only')
                        ? 'bg-green-100 border-green-200 text-green-700 shadow-md'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400 hover:shadow-sm'
                    }`}
                    title="Family-friendly properties"
                  >
                    <span className="text-xs">👨‍👩‍👧‍👦</span>
                    <span>Families-only</span>
                  </button>

                  <button 
                    onClick={() => handleFilterChipClick('Females-only')}
                    className={`flex items-center justify-center gap-1 px-2 py-1 rounded-full border-2 transition-all duration-200 whitespace-nowrap text-xs font-medium h-7 flex-shrink-0 ${
                      selectedFilterChips.includes('Females-only')
                        ? 'bg-green-100 border-green-200 text-green-700 shadow-md'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400 hover:shadow-sm'
                    }`}
                    title="Female-only properties"
                  >
                    <span className="text-xs">👩</span>
                    <span>Females-only</span>
                  </button>

                  <button 
                    onClick={() => handleFilterChipClick('Pet Friendly')}
                    className={`flex items-center justify-center gap-1 px-2 py-1 rounded-full border-2 transition-all duration-200 whitespace-nowrap text-xs font-medium h-7 flex-shrink-0 ${
                      selectedFilterChips.includes('Pet Friendly')
                        ? 'bg-green-100 border-green-200 text-green-700 shadow-md'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400 hover:shadow-sm'
                    }`}
                    title="Pet-friendly properties"
                  >
                    <span className="text-xs">🐕</span>
                    <span>Pet Friendly</span>
                  </button>

                  <button 
                    onClick={() => handleFilterChipClick('Pure-Veg')}
                    className={`flex items-center justify-center gap-1 px-2 py-1 rounded-full border-2 transition-all duration-200 whitespace-nowrap text-xs font-medium h-7 flex-shrink-0 ${
                      selectedFilterChips.includes('Pure-Veg')
                        ? 'bg-green-100 border-green-200 text-green-700 shadow-md'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400 hover:shadow-sm'
                    }`}
                    title="Pure vegetarian properties"
                  >
                    <span className="text-xs">🥗</span>
                    <span>Pure-Veg</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          )}

          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {searchType === 'experiences' 
                    ? (category ? category : 'All Categories')
                    : (filters.location ? `Properties in ${filters.location}` : 'All Properties')
                  }
                </h1>
              </div>
              
              <div className="flex items-center gap-3">
              </div>
            </div>
          </div>

          {/* Mobile Filters Panel */}
          {showFilters && (
            <div
              className="sm:hidden mb-6 p-4 bg-white rounded-lg shadow-lg border border-gray-200 animate-fade-in"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Quick Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              
              {/* Mobile Content Type Toggle */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Content Type</h4>
                <div className="bg-gray-100 rounded-xl p-1 flex">
                  {/* The content type toggle is removed from the main filter bar,
                      so this section is no longer relevant for properties.
                      Keeping it for now as it might be re-introduced or removed later. */}
                  {/* {experienceFilterData.contentType.map((contentType) => (
                    <button
                      key={contentType.id}
                      onClick={() => setSelectedContentTypeToggle(contentType.id as 'hyper-local' | 'retreats')}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        selectedContentTypeToggle === contentType.id
                          ? 'bg-yellow-400 text-white shadow-md'
                          : 'bg-white text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <span className="text-lg">{contentType.icon}</span>
                      {contentType.label}
                    </button>
                  ))} */}
                </div>
              </div>

              {/* Mobile Experience Categories - Only show for Hyper-local */}
              {/* The experience categories are removed from the main filter bar,
                  so this section is no longer relevant for properties.
                  Keeping it for now as it might be re-introduced or removed later. */}
              {/* {selectedContentTypeToggle === 'hyper-local' && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Experience Vibe</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'immersive', label: 'Immersive', icon: '🧘', color: 'bg-purple-100 text-purple-700 border-purple-200' },
                      { id: 'playful', label: 'Playful', icon: '🎮', color: 'bg-green-100 text-green-700 border-green-200' },
                      { id: 'culinary', label: 'Culinary', icon: '🍽️', color: 'bg-orange-100 text-orange-700 border-orange-200' }
                    ].map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedExperienceCategory(selectedExperienceCategory === category.label ? "" : category.label)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 text-sm font-medium ${
                          selectedExperienceCategory === category.label
                            ? `${category.color} shadow-lg`
                            : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        <span className="text-lg">{category.icon}</span>
                        <span>{category.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )} */}

              {/* Mobile Retreat Categories - Only show for Retreats */}
              {/* The retreat categories are removed from the main filter bar,
                  so this section is no longer relevant for properties.
                  Keeping it for now as it might be re-introduced or removed later. */}
              {/* {selectedContentTypeToggle === 'retreats' && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Retreat Categories</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {retreatFilterData.category.slice(0, 6).map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedRetreatCategory(selectedRetreatCategory === category.id ? "" : category.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 text-sm font-medium ${
                          selectedRetreatCategory === category.id
                            ? 'bg-yellow-400 border-yellow-400 text-white shadow-lg'
                            : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        <span className="text-lg">{category.icon}</span>
                        {category.label}
                      </button>
                    ))}
                  </div>
                </div>
              )} */}


            </div>
          )}

          {/* Advanced Filters Modal */}
          {showAdvancedFilters && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
                {/* Fixed Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
                  <h2 className="text-2xl font-bold text-gray-900">Advanced Filters</h2>
                  <button
                    onClick={() => setShowAdvancedFilters(false)}
                    className="text-gray-500 hover:text-gray-700 p-2"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-6">
                    {/* Price Range */}
                    <div className="mb-6">
                      <h3 className="text-base font-semibold text-gray-900 mb-3">Price Range</h3>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { label: '₹2,500', value: 2500 },
                          { label: '₹4,500', value: 4500 },
                          { label: '₹7,500', value: 7500 },
                          { label: '₹9,500', value: 9500 }
                        ].map((priceOption) => (
                          <button
                            key={priceOption.value}
                            onClick={() => {
                              if (advancedFilters.maxPrice === priceOption.value) {
                                setAdvancedFilters(prev => ({ ...prev, maxPrice: 10000 }));
                              } else {
                                setAdvancedFilters(prev => ({ 
                                  ...prev, 
                                  maxPrice: priceOption.value,
                                  minPrice: priceOption.value === 2500 ? 0 : 
                                           priceOption.value === 4500 ? 2501 :
                                           priceOption.value === 7500 ? 4501 : 7501
                                }));
                              }
                            }}
                            className={`px-4 py-2 rounded-full border-2 transition-all duration-200 text-sm font-medium ${
                              advancedFilters.maxPrice === priceOption.value
                                ? 'bg-yellow-400 border-yellow-400 text-white shadow-md'
                                : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400 hover:shadow-sm'
                            }`}
                          >
                            {priceOption.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Property Type */}
                    <div className="mb-6">
                      <h3 className="text-base font-semibold text-gray-900 mb-3">Property Type</h3>
                      <div className="flex flex-wrap gap-2">
                        {[
                              { label: 'Boutique', icon: '🏨' },
    { label: 'Cottage', icon: '🏡' },
    { label: 'Homely', icon: '🏠' },
    { label: 'Off-Beat', icon: '✨' }
                        ].map((type) => (
                          <button
                            key={type.label}
                            onClick={() => {
                              const newPropertyType = advancedFilters.propertyType === type.label ? '' : type.label;
                              console.log('🔍 DEBUG - Property type changed to:', newPropertyType);
                              setAdvancedFilters(prev => ({ 
                                ...prev, 
                                propertyType: newPropertyType
                              }));
                            }}
                            className={`px-4 py-2 rounded-full border-2 transition-all duration-200 text-sm font-medium flex items-center gap-2 ${
                              advancedFilters.propertyType === type.label
                                ? 'bg-yellow-400 border-yellow-400 text-white shadow-md'
                                : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400 hover:shadow-sm'
                            }`}
                          >
                            <span className="text-base">{type.icon}</span>
                            {type.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Amenities */}
                    <div className="mb-6">
                      <h3 className="text-base font-semibold text-gray-900 mb-3">Amenities</h3>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { label: 'WiFi', icon: '📶', value: 'wifi' },
                          { label: 'Mountain View', icon: '🏔️', value: 'mountain-view' },
                          { label: 'Parking', icon: '🅿️', value: 'parking' },
                          { label: 'AC', icon: '❄️', value: 'ac' },
                          { label: 'Kitchen', icon: '🍳', value: 'kitchen' },
                          { label: 'Garden', icon: '🌿', value: 'garden' },
                          { label: 'Balcony', icon: '🏞️', value: 'balcony' }
                        ].map((amenity) => (
                          <button
                            key={amenity.value}
                            onClick={() => {
                              if (advancedFilters.amenities.includes(amenity.value)) {
                                setAdvancedFilters(prev => ({ 
                                  ...prev, 
                                  amenities: prev.amenities.filter(a => a !== amenity.value) 
                                }));
                              } else {
                                setAdvancedFilters(prev => ({ 
                                  ...prev, 
                                  amenities: [...prev.amenities, amenity.value] 
                                }));
                              }
                            }}
                            className={`px-4 py-2 rounded-full border-2 transition-all duration-200 text-sm font-medium flex items-center gap-2 ${
                              advancedFilters.amenities.includes(amenity.value)
                                ? 'bg-yellow-400 border-yellow-400 text-white shadow-md'
                                : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400 hover:shadow-sm'
                            }`}
                          >
                            <span className="text-base">{amenity.icon}</span>
                            {amenity.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fixed Footer */}
                <div className="flex gap-3 p-6 border-t border-gray-200 flex-shrink-0">
                  <Button
                    onClick={() => {
                      setAdvancedFilters({
                        minPrice: 0,
                        maxPrice: 10000,
                        propertyType: '',
                        amenities: []
                      });
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Clear All
                  </Button>
                  <Button
                    onClick={() => setShowAdvancedFilters(false)}
                    className="flex-1"
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            </div>
          )}





          {/* Results Section */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(12)].map((_, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="h-56 bg-gradient-to-br from-gray-200 to-gray-300"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : searchType === 'experiences' ? (
            // Experiences and Retreats Results
            (experiences.length === 0 && retreats.length === 0) ? (
              <div className="text-center py-16 animate-fade-in">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MagnifyingGlassIcon className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No experiences or retreats found
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Try adjusting your filters or browse our popular categories
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Experiences Section */}
                {experiences.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Experiences</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {experiences.map((experience, index) => (
                        <div key={experience.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                          <div className="relative h-48">
                            <img
                              src={experience.cover_image || (Array.isArray(experience.images) ? experience.images[0] : experience.images) || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80'}
                              alt={experience.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="p-6">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                {experience.categories || 'Experience'}
                              </span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                              {experience.title}
                            </h3>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                              {experience.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center text-gray-500 text-sm">
                                <MapPinIcon className="w-4 h-4 mr-1" />
                                <span>{experience.location}</span>
                              </div>
                              <div className="text-lg font-bold text-gray-900">
                                ₹{experience.price?.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Retreats Section */}
                {retreats.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Retreats</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {retreats.map((retreat, index) => (
                        <div key={retreat.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                          <div className="relative h-48">
                            <img
                              src={retreat.cover_image || retreat.image || (Array.isArray(retreat.images) ? retreat.images[0] : retreat.images) || 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80'}
                              alt={retreat.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="p-6">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                                {retreat.categories || 'Retreat'}
                              </span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                              {retreat.title}
                            </h3>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                              {retreat.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center text-gray-500 text-sm">
                                <MapPinIcon className="w-4 h-4 mr-1" />
                                <span>{retreat.location}</span>
                              </div>
                              <div className="text-lg font-bold text-gray-900">
                                ₹{retreat.price?.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          ) : (
            // Properties Results (original logic)
            properties.length === 0 ? (
              <div className="text-center py-16 animate-fade-in">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MagnifyingGlassIcon className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No properties found
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Try adjusting your filters or browse our popular destinations
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {properties.map((property, index) => (
                  <PropertyCard key={property.id} property={property} index={index} />
                ))}
              </div>
            )
          )}
        </main>
      </div>
      
      <Footer />
    </div>
  );
} 