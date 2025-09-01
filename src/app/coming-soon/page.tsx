import Link from 'next/link';
import Image from 'next/image';

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Logo/Brand Section */}
        <div className="mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-6 shadow-lg">
            <span className="text-3xl font-bold text-white">EJA</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-4">
            EJA Homestay
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto">
            Your gateway to authentic, curated homestay experiences across India
          </p>
        </div>

        {/* Coming Soon Message */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20 mb-12">
          <div className="text-8xl md:text-9xl mb-6">🚀</div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Coming Soon
          </h2>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            We're crafting something extraordinary for you. Get ready to discover 
            handpicked homestays, unique experiences, and unforgettable memories.
          </p>
          
          {/* Launch Date */}
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 mb-8">
            <p className="text-white text-lg font-semibold mb-2">Launch Date</p>
            <p className="text-white text-3xl font-bold">September 2025</p>
          </div>

          {/* Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="text-4xl mb-3">🏠</div>
              <h3 className="font-semibold text-gray-900 mb-2">Curated Homestays</h3>
              <p className="text-gray-600 text-sm">Handpicked properties with authentic local experiences</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🌟</div>
              <h3 className="font-semibold text-gray-900 mb-2">Unique Experiences</h3>
              <p className="text-gray-600 text-sm">Retreats, workshops, and cultural immersions</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">💎</div>
              <h3 className="font-semibold text-gray-900 mb-2">Premium Quality</h3>
              <p className="text-gray-600 text-sm">Verified hosts and quality-assured accommodations</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="space-y-4">
          <p className="text-lg text-gray-700 mb-6">
            Be the first to know when we launch!
          </p>
          
          {/* Email Signup Form */}
          <div className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-6 py-4 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-gray-700 placeholder-gray-500"
              />
              <button className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold px-8 py-4 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg">
                Notify Me
              </button>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex justify-center space-x-6 mt-8">
            <a href="#" className="text-gray-600 hover:text-orange-500 transition-colors">
              <span className="sr-only">Instagram</span>
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                IG
              </div>
            </a>
            <a href="#" className="text-gray-600 hover:text-orange-500 transition-colors">
              <span className="sr-only">Twitter</span>
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                X
              </div>
            </a>
            <a href="#" className="text-gray-600 hover:text-orange-500 transition-colors">
              <span className="sr-only">LinkedIn</span>
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                IN
              </div>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-gray-500">
          <p className="text-sm">
            © 2025 EJA Homestay. All rights reserved.
          </p>
          <div className="flex justify-center space-x-4 mt-2 text-xs">
            <Link href="/privacy" className="hover:text-orange-500 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-orange-500 transition-colors">
              Terms of Service
            </Link>
            <Link href="/contact-us" className="hover:text-orange-500 transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
