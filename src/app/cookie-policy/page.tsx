"use client";

import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { ShieldCheckIcon, EyeIcon, CogIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />
      
      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center mb-6">
              <ShieldCheckIcon className="w-16 h-16 text-white/90" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Cookie Policy</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Learn how we use cookies to enhance your experience on Eja Homestay
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            
            {/* Last Updated */}
            <div className="mb-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-blue-800 font-medium">
                <ClockIcon className="w-5 h-5 inline mr-2" />
                Last updated: {new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>

            {/* Introduction */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">What Are Cookies?</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                Cookies are small text files that are placed on your device when you visit our website. 
                They help us provide you with a better experience by remembering your preferences, 
                analyzing how you use our site, and personalizing content.
              </p>
              <p className="text-gray-700 leading-relaxed">
                At Eja Homestay, we use cookies to make your booking experience seamless, secure, 
                and personalized. This policy explains what cookies we use and why.
              </p>
            </section>

            {/* Types of Cookies */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Types of Cookies We Use</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Essential Cookies */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                      <ShieldCheckIcon className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Essential Cookies</h3>
                  </div>
                  <p className="text-gray-700 mb-4">
                    These cookies are necessary for the website to function properly. They enable 
                    basic functions like page navigation, secure areas access, and form submissions.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• Authentication and security</li>
                    <li>• Shopping cart functionality</li>
                    <li>• Payment processing</li>
                    <li>• Session management</li>
                  </ul>
                </div>

                {/* Functional Cookies */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <CogIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Functional Cookies</h3>
                  </div>
                  <p className="text-gray-700 mb-4">
                    These cookies enhance your experience by remembering your preferences and 
                    providing personalized features.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• Language preferences</li>
                    <li>• Currency settings</li>
                    <li>• Search history</li>
                    <li>• Wishlist items</li>
                  </ul>
                </div>

                {/* Analytics Cookies */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <EyeIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Analytics Cookies</h3>
                  </div>
                  <p className="text-gray-700 mb-4">
                    These cookies help us understand how visitors interact with our website, 
                    allowing us to improve our services and user experience.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• Page visit statistics</li>
                    <li>• User behavior analysis</li>
                    <li>• Performance monitoring</li>
                    <li>• Service improvements</li>
                  </ul>
                </div>

                {/* Marketing Cookies */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <EyeIcon className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Marketing Cookies</h3>
                  </div>
                  <p className="text-gray-700 mb-4">
                    These cookies are used to deliver relevant advertisements and track 
                    marketing campaign performance.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• Personalized ads</li>
                    <li>• Social media integration</li>
                    <li>• Campaign tracking</li>
                    <li>• Retargeting</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Third-Party Cookies */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Third-Party Cookies</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                We may use third-party services that place cookies on your device. These services help us:
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-3">Payment Processing</h4>
                  <p className="text-blue-800 text-sm">
                    Secure payment gateways like Razorpay use cookies to process transactions safely.
                  </p>
                </div>
                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-3">Analytics Services</h4>
                  <p className="text-green-800 text-sm">
                    Google Analytics helps us understand website usage and improve user experience.
                  </p>
                </div>
                <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                  <h4 className="font-semibold text-purple-900 mb-3">Social Media</h4>
                  <p className="text-purple-800 text-sm">
                    Social media platforms use cookies for sharing and integration features.
                  </p>
                </div>
                <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
                  <h4 className="font-semibold text-orange-900 mb-3">Customer Support</h4>
                  <p className="text-orange-800 text-sm">
                    Support tools use cookies to provide better customer service experiences.
                  </p>
                </div>
              </div>
            </section>

            {/* Cookie Management */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Managing Your Cookie Preferences</h2>
              <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Browser Settings</h3>
                <p className="text-gray-700 mb-6">
                  You can control and manage cookies through your browser settings. Most browsers allow you to:
                </p>
                <ul className="text-gray-700 space-y-3 mb-6">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>View and delete existing cookies</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Block cookies from specific websites</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Set preferences for different types of cookies</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Receive notifications when cookies are set</span>
                  </li>
                </ul>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-blue-800 text-sm">
                    <strong>Note:</strong> Disabling certain cookies may affect the functionality of our website 
                    and your booking experience. Essential cookies cannot be disabled as they are necessary 
                    for the website to function properly.
                  </p>
                </div>
              </div>
            </section>

            {/* Updates */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Updates to This Policy</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                We may update this Cookie Policy from time to time to reflect changes in our practices 
                or for other operational, legal, or regulatory reasons. We will notify you of any 
                material changes by posting the new policy on this page.
              </p>
              <p className="text-gray-700 leading-relaxed">
                We encourage you to review this policy periodically to stay informed about how we use cookies.
              </p>
            </section>

            {/* Contact */}
            <section className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 border border-blue-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions About Cookies?</h2>
              <p className="text-gray-700 mb-6">
                If you have any questions about our use of cookies or this Cookie Policy, 
                please don't hesitate to contact us.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Email Us</h4>
                  <p className="text-blue-600">privacy@ejahomestay.com</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Call Us</h4>
                  <p className="text-blue-600">+91 8976662177</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
