'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function HeroSection() {
  const router = useRouter();
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const words = ['Families', 'Females', 'Corporates'];
  const typingSpeed = 150;
  const deletingSpeed = 100;
  const pauseTime = 2000;

  useEffect(() => {
    const currentWord = words[currentWordIndex];
    
    if (isDeleting) {
      // Deleting effect
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
      // Typing effect
      if (currentText === currentWord) {
        // Word is complete, pause then start deleting
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

  return (
    <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`
        }}
      />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Travel for{' '}
            <span className="block text-blue-200">
              {currentText}
              <span className="animate-pulse">|</span>
            </span>
          </h1>
          <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto">
            Discover amazing properties around the world. From cozy cabins to luxury villas, 
            find the perfect accommodation for your next adventure.
          </p>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-white mb-2">1000+</div>
              <div className="text-blue-200">Properties Available</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">50+</div>
              <div className="text-blue-200">Destinations</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">10k+</div>
              <div className="text-blue-200">Happy Guests</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 