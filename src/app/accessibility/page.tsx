"use client";

import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { 
  HeartIcon, 
  EyeIcon, 
  SpeakerWaveIcon, 
  HandRaisedIcon,
  CogIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />
      
      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center mb-6">
              <HeartIcon className="w-16 h-16 text-white/90" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Accessibility</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Making travel accessible for everyone at EJA
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            
            {/* Commitment */}
            <section className="mb-12">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-8 border border-green-200 mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Commitment to Accessibility</h2>
                <p className="text-gray-700 leading-relaxed mb-6">
                  At EJA, we believe that travel should be accessible to everyone. 
                  We are committed to providing an inclusive experience for all our guests, 
                  regardless of their abilities or disabilities.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Our platform is designed with accessibility in mind, following WCAG 2.1 AA guidelines 
                  to ensure that everyone can easily browse, search, and book their perfect homestay experience.
                </p>
              </div>
            </section>

            {/* Website Accessibility Features */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Website Accessibility Features</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Keyboard Navigation */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <CogIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Keyboard Navigation</h3>
                  </div>
                  <p className="text-gray-700 mb-4">
                    Our website is fully navigable using only a keyboard. You can:
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• Navigate through all pages using Tab key</li>
                    <li>• Access all interactive elements</li>
                    <li>• Use Enter and Space keys for activation</li>
                    <li>• Skip to main content with keyboard shortcuts</li>
                  </ul>
                </div>

                {/* Screen Reader Support */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <SpeakerWaveIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Screen Reader Support</h3>
                  </div>
                  <p className="text-gray-700 mb-4">
                    Our website is compatible with popular screen readers including:
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• JAWS (Windows)</li>
                    <li>• NVDA (Windows)</li>
                    <li>• VoiceOver (Mac/iOS)</li>
                    <li>• TalkBack (Android)</li>
                  </ul>
                </div>

                {/* High Contrast */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <EyeIcon className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Visual Accessibility</h3>
                  </div>
                  <p className="text-gray-700 mb-4">
                    We ensure visual accessibility through:
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• High contrast color schemes</li>
                    <li>• Clear typography and readable fonts</li>
                    <li>• Alternative text for images</li>
                    <li>• Resizable text support</li>
                  </ul>
                </div>

                {/* Alternative Text */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                      <HandRaisedIcon className="w-6 h-6 text-orange-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Alternative Content</h3>
                  </div>
                  <p className="text-gray-700 mb-4">
                    We provide alternative content for:
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• Descriptive alt text for images</li>
                    <li>• Captions for videos</li>
                    <li>• Text transcripts for audio</li>
                    <li>• Clear form labels and instructions</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Property Accessibility */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Property Accessibility Features</h2>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-3">Mobility Accessibility</h4>
                  <ul className="text-blue-800 text-sm space-y-2">
                    <li>• Wheelchair accessible entrances</li>
                    <li>• Ground floor accommodations</li>
                    <li>• Accessible bathrooms</li>
                    <li>• Wide doorways and hallways</li>
                  </ul>
                </div>
                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-3">Visual Accessibility</h4>
                  <ul className="text-green-800 text-sm space-y-2">
                    <li>• Braille signage</li>
                    <li>• High contrast lighting</li>
                    <li>• Audio descriptions</li>
                    <li>• Tactile indicators</li>
                  </ul>
                </div>
                <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                  <h4 className="font-semibold text-purple-900 mb-3">Hearing Accessibility</h4>
                  <ul className="text-purple-800 text-sm space-y-2">
                    <li>• Visual fire alarms</li>
                    <li>• Captioned TV systems</li>
                    <li>• TTY devices available</li>
                    <li>• Sign language support</li>
                  </ul>
                </div>
              </div>

              <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                <div className="flex items-start">
                  <InformationCircleIcon className="w-6 h-6 text-yellow-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-yellow-900 mb-2">Property Information</h4>
                    <p className="text-yellow-800 text-sm">
                      Each property listing includes detailed accessibility information. 
                      Look for the accessibility icon and detailed descriptions of available features. 
                      You can also filter properties by specific accessibility needs.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Booking Assistance */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Booking Assistance</h2>
              <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
                <p className="text-gray-700 mb-6">
                  We understand that some guests may need additional assistance with the booking process. 
                  Our team is here to help ensure your travel experience is smooth and accessible.
                </p>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Contact Methods</h4>
                    <ul className="text-gray-700 space-y-3">
                      <li className="flex items-center">
                        <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3" />
                        <span>Phone support with extended hours</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3" />
                        <span>Email support with quick response</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3" />
                        <span>WhatsApp messaging support</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3" />
                        <span>Live chat assistance</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Special Assistance</h4>
                    <ul className="text-gray-700 space-y-3">
                      <li className="flex items-center">
                        <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3" />
                        <span>Personalized booking assistance</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3" />
                        <span>Accessibility requirement coordination</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3" />
                        <span>Special dietary accommodation</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3" />
                        <span>Emergency contact coordination</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Feedback */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Help Us Improve</h2>
              <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-8 border border-blue-200">
                <p className="text-gray-700 mb-6">
                  We continuously work to improve the accessibility of our platform. 
                  Your feedback is invaluable in helping us make EJA more accessible for everyone.
                </p>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Share Your Experience</h4>
                    <p className="text-gray-700 mb-4">
                      Tell us about your experience with our accessibility features. 
                      We welcome suggestions for improvements.
                    </p>
                    <div className="space-y-2">
                      <p className="text-blue-600 font-medium">Email: accessibility@ejahomestay.com</p>
                      <p className="text-blue-600 font-medium">Phone: +91 8976662177</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Report Issues</h4>
                    <p className="text-gray-700 mb-4">
                      If you encounter any accessibility issues while using our website, 
                      please report them to us immediately.
                    </p>
                    <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                      <p className="text-red-800 text-sm">
                        <strong>Emergency:</strong> For urgent accessibility issues, 
                        please call us directly for immediate assistance.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Compliance */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Accessibility Compliance</h2>
              <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Standards We Follow</h4>
                    <ul className="text-gray-700 space-y-3">
                      <li className="flex items-center">
                        <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3" />
                        <span>WCAG 2.1 AA Guidelines</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3" />
                        <span>Section 508 Compliance</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3" />
                        <span>ADA Title III Requirements</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3" />
                        <span>International accessibility standards</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Regular Testing</h4>
                    <ul className="text-gray-700 space-y-3">
                      <li className="flex items-center">
                        <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3" />
                        <span>Automated accessibility testing</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3" />
                        <span>Manual testing with assistive technologies</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3" />
                        <span>User testing with accessibility experts</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3" />
                        <span>Continuous monitoring and updates</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Contact */}
            <section className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-8 border border-green-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Need Accessibility Support?</h2>
              <p className="text-gray-700 mb-6">
                Our accessibility team is here to help ensure your travel experience is smooth and accessible. 
                Don't hesitate to reach out for assistance.
              </p>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Email Us</h4>
                  <p className="text-blue-600">accessibility@ejahomestay.com</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Call Us</h4>
                  <p className="text-blue-600">+91 8976662177</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">WhatsApp</h4>
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
