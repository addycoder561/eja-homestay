"use client";

import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { 
  HeartIcon, 
  GlobeAltIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  StarIcon,
  MapPinIcon,
  CheckCircleIcon,
  LightBulbIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  PhoneIcon,
  ArrowRightIcon,
  CameraIcon,
  BookOpenIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';

const blogPosts = [
  {
    id: 1,
    title: '10 Hidden Homestays in the Himalayas You Need to Visit',
    excerpt: 'Discover secluded mountain retreats that offer authentic local experiences and breathtaking views of the world\'s highest peaks.',
    author: 'Travel Team',
    date: 'Dec 20, 2024',
    readTime: '8 min read',
    category: 'Destinations'
  },
  {
    id: 2,
    title: 'The Ultimate Guide to Experiencing Local Culture Through Homestays',
    excerpt: 'Learn how to immerse yourself in local traditions, cuisine, and customs while staying with welcoming host families.',
    author: 'Cultural Expert',
    date: 'Dec 18, 2024',
    readTime: '12 min read',
    category: 'Culture'
  },
  {
    id: 3,
    title: 'Sustainable Travel: How Homestays Are Leading the Eco-Tourism Movement',
    excerpt: 'Explore how community-based homestays are promoting sustainable tourism and preserving local environments.',
    author: 'Eco Traveler',
    date: 'Dec 15, 2024',
    readTime: '6 min read',
    category: 'Sustainability'
  },
  {
    id: 4,
    title: 'From Host to Friend: Building Meaningful Connections on the Road',
    excerpt: 'Heartwarming stories of travelers who found lifelong friendships through their homestay experiences.',
    author: 'Community Stories',
    date: 'Dec 12, 2024',
    readTime: '5 min read',
    category: 'Stories'
  },
  {
    id: 5,
    title: 'The Art of Slow Travel: Why Homestays Beat Hotels Every Time',
    excerpt: 'Discover the benefits of slow travel and how homestays provide deeper, more meaningful travel experiences.',
    author: 'Slow Travel Expert',
    date: 'Dec 10, 2024',
    readTime: '7 min read',
    category: 'Travel Tips'
  },
  {
    id: 6,
    title: 'Cooking with Locals: Homestay Culinary Adventures Across India',
    excerpt: 'Join us on a culinary journey through India\'s diverse regional cuisines, learned directly from local home chefs.',
    author: 'Food Explorer',
    date: 'Dec 8, 2024',
    readTime: '9 min read',
    category: 'Food & Culture'
  }
];

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
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
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
      <Navigation />
      
      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center mb-6">
              <HeartIcon className="w-16 h-16 text-white/90" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">About EJA</h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Connecting travelers with authentic local experiences through carefully curated homestays, 
              experiences, and retreats across India.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          
          {/* Our Story */}
          <section className="mb-16">
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    EJA was born from a simple yet powerful idea: that the best travel experiences 
                    happen when you connect with local communities and immerse yourself in authentic culture. 
                    We believe that every traveler deserves to experience the heart and soul of India, 
                    not just its tourist attractions.
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    Founded in 2023, we started with a vision to bridge the gap between travelers seeking 
                    authentic experiences and local hosts eager to share their culture, traditions, and 
                    hospitality. What began as a small collection of homestays has grown into a vibrant 
                    community of hosts and travelers across India.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    Today, we're proud to offer not just homestays, but a complete ecosystem of local 
                    experiences, wellness retreats, and cultural immersions that allow travelers to 
                    discover the real India.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
                      <div className="text-gray-600">Happy Hosts</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-2">10K+</div>
                      <div className="text-gray-600">Happy Guests</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">50+</div>
                      <div className="text-gray-600">Cities</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-600 mb-2">4.8★</div>
                      <div className="text-gray-600">Average Rating</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Our Mission & Vision */}
          <section className="mb-16">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <LightBulbIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Our Mission</h3>
                </div>
                <p className="text-gray-700 leading-relaxed mb-6">
                  To create meaningful connections between travelers and local communities, fostering 
                  cultural exchange and authentic experiences that enrich both guests and hosts.
                </p>
                <ul className="text-gray-700 space-y-3">
                  <li className="flex items-start">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Promote sustainable and responsible tourism</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Support local economies and communities</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Preserve and celebrate cultural heritage</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Provide safe and comfortable accommodations</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                    <GlobeAltIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Our Vision</h3>
                </div>
                <p className="text-gray-700 leading-relaxed mb-6">
                  To become India's most trusted platform for authentic local experiences, connecting 
                  millions of travelers with the warmth and hospitality of Indian communities.
                </p>
                <ul className="text-gray-700 space-y-3">
                  <li className="flex items-start">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Expand to every corner of India</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Create a global community of travelers</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Lead the transformation of travel industry</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Set new standards for authentic experiences</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Our Values */}
          <section className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                The principles that guide everything we do and every decision we make
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HeartIcon className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Authenticity</h3>
                <p className="text-gray-600">
                  We believe in genuine experiences that reflect the true spirit of local communities.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheckIcon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Trust & Safety</h3>
                <p className="text-gray-600">
                  Your safety and security are our top priorities in every interaction.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserGroupIcon className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Community</h3>
                <p className="text-gray-600">
                  We foster connections and build bridges between cultures and communities.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <StarIcon className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Excellence</h3>
                <p className="text-gray-600">
                  We strive for excellence in every aspect of our service and experience.
                </p>
              </div>
            </div>
          </section>

          {/* What We Offer */}
          <section className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">What We Offer</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                A comprehensive platform for authentic Indian travel experiences
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                  <MapPinIcon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Homestays</h3>
                <p className="text-gray-600 mb-6">
                  Stay with local families in authentic Indian homes, experiencing daily life, 
                  traditional cuisine, and warm hospitality.
                </p>
                <ul className="text-gray-700 space-y-2">
                  <li>• Carefully verified hosts</li>
                  <li>• Authentic local experiences</li>
                  <li>• Cultural immersion opportunities</li>
                  <li>• Comfortable and safe accommodations</li>
                </ul>
              </div>

              <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <StarIcon className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Local Experiences</h3>
                <p className="text-gray-600 mb-6">
                  Discover unique activities and workshops led by local experts, from cooking 
                  classes to traditional crafts.
                </p>
                <ul className="text-gray-700 space-y-2">
                  <li>• Cultural workshops</li>
                  <li>• Cooking classes</li>
                  <li>• Traditional crafts</li>
                  <li>• Local tours and activities</li>
                </ul>
              </div>

              <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                  <HeartIcon className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Wellness Retreats</h3>
                <p className="text-gray-600 mb-6">
                  Rejuvenate your mind, body, and soul with our carefully curated wellness 
                  retreats in serene locations.
                </p>
                <ul className="text-gray-700 space-y-2">
                  <li>• Yoga and meditation</li>
                  <li>• Ayurvedic treatments</li>
                  <li>• Nature-based healing</li>
                  <li>• Holistic wellness programs</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Why Choose Us */}
          <section className="mb-16">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 md:p-12">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Eja Homestay?</h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  We're not just another booking platform - we're your gateway to authentic Indian experiences
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center mb-4">
                    <CheckCircleIcon className="w-6 h-6 text-green-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900">Verified Hosts</h3>
                  </div>
                  <p className="text-gray-600">
                    Every host undergoes thorough verification including background checks and property inspections.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center mb-4">
                    <CheckCircleIcon className="w-6 h-6 text-green-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900">24/7 Support</h3>
                  </div>
                  <p className="text-gray-600">
                    Our dedicated support team is available round the clock to assist you with any concerns.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center mb-4">
                    <CheckCircleIcon className="w-6 h-6 text-green-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900">Local Expertise</h3>
                  </div>
                  <p className="text-gray-600">
                    Deep local knowledge and connections ensure you get the most authentic experiences.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center mb-4">
                    <CheckCircleIcon className="w-6 h-6 text-green-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900">Flexible Cancellation</h3>
                  </div>
                  <p className="text-gray-600">
                    Multiple cancellation policies to suit your travel style and provide peace of mind.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center mb-4">
                    <CheckCircleIcon className="w-6 h-6 text-green-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900">Secure Payments</h3>
                  </div>
                  <p className="text-gray-600">
                    Multiple secure payment options with transparent pricing and no hidden fees.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center mb-4">
                    <CheckCircleIcon className="w-6 h-6 text-green-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900">Community Focus</h3>
                  </div>
                  <p className="text-gray-600">
                    Supporting local communities and promoting sustainable tourism practices.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Why Choose EJA - Moved from Homepage */}
          <section className="mb-16">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose EJA?</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We're committed to providing you with the best travel experience with safety and trust at the core
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="text-center group bg-gray-50 rounded-2xl p-8 hover:bg-white hover:shadow-lg transition-all duration-300">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
                  <div className="text-blue-600">
                    <ShieldCheckIcon className="w-8 h-8" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Verified Properties</h3>
                <p className="text-gray-600 leading-relaxed">All properties are personally verified by our team for quality and safety.</p>
              </div>

              <div className="text-center group bg-gray-50 rounded-2xl p-8 hover:bg-white hover:shadow-lg transition-all duration-300">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
                  <div className="text-blue-600">
                    <ClockIcon className="w-8 h-8" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">24/7 Support</h3>
                <p className="text-gray-600 leading-relaxed">Round-the-clock customer support to help you with any queries.</p>
              </div>

              <div className="text-center group bg-gray-50 rounded-2xl p-8 hover:bg-white hover:shadow-lg transition-all duration-300">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
                  <div className="text-blue-600">
                    <CurrencyRupeeIcon className="w-8 h-8" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Best Price Guarantee</h3>
                <p className="text-gray-600 leading-relaxed">We guarantee the best prices for all our properties.</p>
              </div>
            </div>
            
            {/* Trust & Safety Section - Moved from Homepage */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-3xl p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Your Safety & Trust</h3>
                <p className="text-gray-600">We prioritize your security and peace of mind</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <ShieldCheckIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="font-semibold text-gray-900">Verified Properties</div>
                  <div className="text-sm text-gray-600">All properties personally verified</div>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <ClockIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="font-semibold text-gray-900">24/7 Support</div>
                  <div className="text-sm text-gray-600">Round-the-clock assistance</div>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <CurrencyRupeeIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="font-semibold text-gray-900">Secure Payments</div>
                  <div className="text-sm text-gray-600">SSL encrypted transactions</div>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <PhoneIcon className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="font-semibold text-gray-900">Easy Cancellation</div>
                  <div className="text-sm text-gray-600">Flexible booking policies</div>
                </div>
              </div>
            </div>
          </section>

          {/* Team */}
          <section className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Team</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Meet the passionate individuals behind EJA
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">A</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Aditya</h3>
                <p className="text-blue-600 font-medium mb-4">Founder & CEO</p>
                <p className="text-gray-600">
                  Passionate about connecting travelers with authentic local experiences and building 
                  meaningful communities.
                </p>
              </div>

              <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">T</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Tech Team</h3>
                <p className="text-green-600 font-medium mb-4">Development & Innovation</p>
                <p className="text-gray-600">
                  Dedicated to creating seamless technology solutions that enhance the travel experience 
                  for both guests and hosts.
                </p>
              </div>

              <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">S</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Support Team</h3>
                <p className="text-purple-600 font-medium mb-4">Customer Success</p>
                <p className="text-gray-600">
                  Committed to providing exceptional support and ensuring every guest has a memorable 
                  and safe experience.
                </p>
              </div>
            </div>
          </section>

          {/* Latest Travel Stories */}
          <section className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Latest Travel Stories</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Discover authentic experiences, local culture, and inspiring stories from our community
              </p>
            </div>
            
            <div className="relative">
              <div 
                className="flex gap-6 overflow-x-auto pb-12 pt-8 px-8 -mx-8 scrollbar-hide"
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                }}
              >
                {blogPosts.map((post, index) => (
                  <div
                    key={post.id}
                    className="group animate-fade-in flex-shrink-0 w-80"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <Link 
                      href={`/blog/${post.id}`} 
                      className="block bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden hover:-translate-y-2 hover:scale-105"
                    >
                      <div className="relative h-48 w-full overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
                          <CameraIcon className="w-16 h-16 text-blue-600" />
                        </div>
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-900">
                          {post.category}
                        </div>
                        <div className="absolute top-3 right-3 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                          <BookOpenIcon className="w-3 h-3" />
                          Blog
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-3 text-sm text-gray-500">
                          <UserIcon className="w-4 h-4" />
                          <span>{post.author}</span>
                          <span>•</span>
                          <span>{post.date}</span>
                        </div>
                        
                        <h3 className="font-bold text-lg text-gray-900 mb-3 group-hover:text-yellow-500 transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-500">
                            <ClockIcon className="w-4 h-4 mr-1" />
                            <span>{post.readTime}</span>
                          </div>
                          
                          <button className="text-yellow-500 hover:text-yellow-600 font-medium text-sm flex items-center gap-1">
                            Read More
                            <ArrowRightIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
            
            {/* View All Blogs CTA */}
            <div className="text-center mt-12">
              <Link href="/blog">
                <button className="bg-white hover:bg-gray-50 text-yellow-500 font-bold px-8 py-4 rounded-xl border-2 border-yellow-500 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2 mx-auto">
                  <BookOpenIcon className="w-5 h-5" />
                  View All Stories
                  <ArrowRightIcon className="w-5 h-5" />
                </button>
              </Link>
            </div>
          </section>

          {/* Careers Section */}
          <section className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Join Our Team</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Help us create meaningful connections between travelers and local hosts, 
                making every journey an authentic and memorable experience.
              </p>
            </div>

            {/* Why Work With Us */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 mb-12">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Why Work With Us</h3>
                <p className="text-lg text-gray-600">We take care of our team so you can focus on doing your best work</p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <HeartIcon className="w-12 h-12 text-blue-600 mb-4" />
                  <h4 className="text-xl font-semibold text-gray-900 mb-3">Health & Wellness</h4>
                  <p className="text-gray-600">Comprehensive health insurance, mental health support, and wellness programs</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <UserGroupIcon className="w-12 h-12 text-blue-600 mb-4" />
                  <h4 className="text-xl font-semibold text-gray-900 mb-3">Flexible Work</h4>
                  <p className="text-gray-600">Remote work options, flexible hours, and work-life balance initiatives</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <GlobeAltIcon className="w-12 h-12 text-blue-600 mb-4" />
                  <h4 className="text-xl font-semibold text-gray-900 mb-3">Travel Perks</h4>
                  <p className="text-gray-600">Discounted stays at our partner homestays and travel allowances</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <StarIcon className="w-12 h-12 text-blue-600 mb-4" />
                  <h4 className="text-xl font-semibold text-gray-900 mb-3">Learning & Growth</h4>
                  <p className="text-gray-600">Professional development budget, training programs, and career advancement</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <UserGroupIcon className="w-12 h-12 text-blue-600 mb-4" />
                  <h4 className="text-xl font-semibold text-gray-900 mb-3">Team Culture</h4>
                  <p className="text-gray-600">Collaborative environment, team events, and inclusive workplace culture</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <LightBulbIcon className="w-12 h-12 text-blue-600 mb-4" />
                  <h4 className="text-xl font-semibold text-gray-900 mb-3">Innovation</h4>
                  <p className="text-gray-600">Work on cutting-edge technology and shape the future of travel</p>
                </div>
              </div>
            </div>

            {/* Open Positions */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Open Positions</h3>
                <p className="text-lg text-gray-600">Join our growing team and help shape the future of travel</p>
              </div>
              
              <div className="space-y-6">
                <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">Frontend Developer</h4>
                      <p className="text-gray-600 mb-2">Build beautiful, responsive user interfaces for our homestay platform using React, Next.js, and modern web technologies.</p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span>Engineering</span>
                        <span>Remote / Delhi</span>
                        <span>Full-time</span>
                        <span>2-4 years</span>
                        <span>₹8-15 LPA</span>
                      </div>
                    </div>
                    <button className="mt-4 lg:mt-0 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Apply Now
                    </button>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">Backend Developer</h4>
                      <p className="text-gray-600 mb-2">Develop robust backend services and APIs to power our homestay booking platform using Node.js and PostgreSQL.</p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span>Engineering</span>
                        <span>Remote / Bangalore</span>
                        <span>Full-time</span>
                        <span>3-5 years</span>
                        <span>₹12-20 LPA</span>
                      </div>
                    </div>
                    <button className="mt-4 lg:mt-0 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Apply Now
                    </button>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">Product Manager</h4>
                      <p className="text-gray-600 mb-2">Lead product strategy and development for our homestay platform, focusing on user experience and business growth.</p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span>Product</span>
                        <span>Delhi / Mumbai</span>
                        <span>Full-time</span>
                        <span>4-6 years</span>
                        <span>₹15-25 LPA</span>
                      </div>
                    </div>
                    <button className="mt-4 lg:mt-0 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Apply Now
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="text-center mt-8">
                <p className="text-gray-600 mb-4">Don't see the right role? We're always looking for talented individuals!</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                    Send Resume
                  </button>
                  <button className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors">
                    Contact HR
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-200">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Get in Touch</h2>
              <p className="text-gray-700 mb-8 max-w-2xl mx-auto">
                Have questions about EJA? Want to become a host? We'd love to hear from you!
              </p>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">General Inquiries</h4>
                  <p className="text-blue-600">hello@ejahomestay.com</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Become a Host</h4>
                  <p className="text-blue-600">hosts@ejahomestay.com</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Support</h4>
                  <p className="text-blue-600">support@ejahomestay.com</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
