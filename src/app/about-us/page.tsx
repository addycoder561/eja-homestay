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
  LightBulbIcon
} from '@heroicons/react/24/outline';

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />
      
      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center mb-6">
              <HeartIcon className="w-16 h-16 text-white/90" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">About Eja Homestay</h1>
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
                    Eja Homestay was born from a simple yet powerful idea: that the best travel experiences 
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

          {/* Team */}
          <section className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Team</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Meet the passionate individuals behind Eja Homestay
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

          {/* Contact */}
          <section className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-200">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Get in Touch</h2>
              <p className="text-gray-700 mb-8 max-w-2xl mx-auto">
                Have questions about Eja Homestay? Want to become a host? We'd love to hear from you!
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
