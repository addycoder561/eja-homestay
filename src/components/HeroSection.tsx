'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  MapPinIcon, 
  CalendarIcon, 
  UserGroupIcon,
  MagnifyingGlassIcon,
  PlayIcon,
  StarIcon,
  SparklesIcon,
  GlobeAltIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

export function HeroSection() {
  const router = useRouter();
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const words = ['Families', 'Females', 'Corporates', 'Adventurers', 'Solo Travelers'];
  const typingSpeed = 150;
  const deletingSpeed = 100;
  const pauseTime = 2000;

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const currentWord = words[currentWordIndex];
    
    if (isDeleting) {
      if (currentText === '') {
        setIsDeleting(false);
        setCurrentWordIndex((prev) => (prev + 1) % words.length);
        return;
      }
      
      const timeout = setTimeout(() => {
        setCurrentText(currentText.slice(0, -1));
      }, deletingSpeed);
      
      return () => clearTimeout(timeout);
    } else {
      if (currentText === currentWord) {
        const timeout = setTimeout(() => {
          setIsDeleting(true);
        }, pauseTime);
        
        return () => clearTimeout(timeout);
      }
      
      const timeout = setTimeout(() => {
        setCurrentText(currentWord.slice(0, currentText.length + 1));
      }, typingSpeed);
      
      return () => clearTimeout(timeout);
    }
  }, [currentText, currentWordIndex, isDeleting, words]);

  const handleSearchClick = () => {
    const searchSection = document.getElementById('search-section');
    if (searchSection) {
      searchSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 overflow-hidden">
      {/* Enhanced Animated Background Elements */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`
          }}
        />
        
        {/* Enhanced Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-float-1" />
        <div className="absolute top-40 right-20 w-32 h-32 bg-blue-400/20 rounded-full blur-xl animate-float-2" />
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-indigo-400/15 rounded-full blur-xl animate-float-3" />
        <div className="absolute top-1/3 left-1/3 w-24 h-24 bg-purple-400/10 rounded-full blur-xl animate-float-1" />
        <div className="absolute bottom-1/3 right-1/3 w-28 h-28 bg-cyan-400/15 rounded-full blur-xl animate-float-2" />
        
        {/* Sparkle Effects */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-300 rounded-full animate-ping" style={{ animationDelay: '0s' }} />
        <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-white rounded-full animate-ping" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-blue-200 rounded-full animate-ping" style={{ animationDelay: '2s' }} />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="text-center">
          {/* Enhanced Main Heading */}
          <div className="mb-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-blue-100 text-sm font-medium mb-4">
              <SparklesIcon className="w-4 h-4" />
              Trusted by 10,000+ travelers
            </div>
          </div>

          <h1 
            className={`text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight transition-all duration-1000 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            Travel for{' '}
            <span className="block text-blue-200 relative">
              {currentText}
              <span className="animate-pulse text-blue-100">|</span>
            </span>
          </h1>

          {/* Enhanced Subtitle */}
          <p 
            className={`text-xl md:text-2xl text-blue-100 mb-12 max-w-4xl mx-auto leading-relaxed transition-all duration-1000 delay-300 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            Discover amazing properties around the world. From cozy cabins to luxury villas, 
            find the perfect accommodation for your next adventure with our curated collection.
          </p>

          {/* Enhanced CTA Buttons */}
          <div 
            className={`flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 transition-all duration-1000 delay-500 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <button
              onClick={handleSearchClick}
              className="group relative overflow-hidden bg-white text-blue-600 font-bold px-8 py-4 rounded-xl hover:bg-gray-100 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
              <MagnifyingGlassIcon className="w-6 h-6 group-hover:scale-110 transition-transform relative z-10" />
              <span className="relative z-10">Start Your Search</span>
            </button>
            
            <button
              onClick={() => setIsVideoPlaying(true)}
              className="group relative overflow-hidden border-2 border-white text-white font-bold px-8 py-4 rounded-xl hover:bg-white hover:text-blue-600 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 backdrop-blur-sm"
            >
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <PlayIcon className="w-6 h-6 group-hover:scale-110 transition-transform relative z-10" />
              <span className="relative z-10">Watch Video</span>
            </button>
          </div>

          {/* Enhanced Trust Indicators */}
          <div 
            className={`flex flex-wrap justify-center items-center gap-8 text-blue-100 mb-16 transition-all duration-1000 delay-700 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <StarIcon className="w-5 h-5 text-yellow-300" />
              <span className="text-sm font-medium">4.9/5 Rating</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <UserGroupIcon className="w-5 h-5" />
              <span className="text-sm font-medium">10k+ Happy Guests</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <GlobeAltIcon className="w-5 h-5" />
              <span className="text-sm font-medium">50+ Destinations</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <ShieldCheckIcon className="w-5 h-5" />
              <span className="text-sm font-medium">100% Verified</span>
            </div>
          </div>

          {/* Enhanced Stats */}
          <div 
            className={`grid grid-cols-1 md:grid-cols-4 gap-6 text-center transition-all duration-1000 delay-900 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="group bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <div className="text-4xl font-bold text-white mb-2 group-hover:text-blue-200 transition-colors">1000+</div>
              <div className="text-blue-200 font-medium">Properties Available</div>
            </div>
            <div className="group bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <div className="text-4xl font-bold text-white mb-2 group-hover:text-blue-200 transition-colors">50+</div>
              <div className="text-blue-200 font-medium">Destinations</div>
            </div>
            <div className="group bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <div className="text-4xl font-bold text-white mb-2 group-hover:text-blue-200 transition-colors">10k+</div>
              <div className="text-blue-200 font-medium">Happy Guests</div>
            </div>
            <div className="group bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <div className="text-4xl font-bold text-white mb-2 group-hover:text-blue-200 transition-colors">24/7</div>
              <div className="text-blue-200 font-medium">Support</div>
            </div>
          </div>

          {/* Enhanced Scroll Indicator */}
          <div 
            className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 transition-all duration-1000 delay-1100 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center animate-bounce">
              <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse" />
            </div>
            <div className="text-white/60 text-xs mt-2 animate-pulse">Scroll to explore</div>
          </div>
        </div>
      </div>

      {/* Enhanced Video Modal */}
      {isVideoPlaying && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setIsVideoPlaying(false)}
              className="absolute -top-12 right-0 text-white text-2xl hover:text-gray-300 transition-colors p-2 hover:bg-white/10 rounded-full"
            >
              ✕
            </button>
            <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden">
              <div className="text-white text-center">
                <PlayIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Video player would be integrated here</p>
                <p className="text-sm text-gray-400 mt-2">Showcasing our properties and experiences</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 