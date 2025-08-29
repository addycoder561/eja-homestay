"use client";

import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { 
  ShieldCheckIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PhoneIcon,
  EyeIcon,
  UserGroupIcon,
  LockClosedIcon,
  FireIcon,
  HeartIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

export default function SafetyInformationPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />
      
      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center mb-6">
              <ShieldCheckIcon className="w-16 h-16 text-white/90" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Safety Information</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Your safety is our top priority. Learn about our comprehensive safety measures and protocols.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            
            {/* Safety Commitment */}
            <section className="mb-12">
              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-8 border border-red-200 mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Safety Commitment</h2>
                <p className="text-gray-700 leading-relaxed mb-6">
                  At EJA, your safety and well-being are our highest priorities. We have implemented 
                  comprehensive safety measures and protocols to ensure that every guest enjoys a secure and 
                  comfortable stay.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Our safety standards exceed industry requirements, and we continuously update our protocols 
                  based on the latest safety guidelines and guest feedback.
                </p>
              </div>
            </section>

            {/* Host & Property Verification */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Host & Property Verification</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <UserGroupIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Host Verification</h3>
                  </div>
                  <ul className="text-gray-700 space-y-3">
                    <li className="flex items-start">
                      <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span>Identity verification with government-issued ID</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span>Background checks and criminal record verification</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span>Phone number and email verification</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span>Social media profile verification</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <EyeIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Property Inspection</h3>
                  </div>
                  <ul className="text-gray-700 space-y-3">
                    <li className="flex items-start">
                      <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span>On-site property verification by our team</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span>Safety equipment and emergency exit verification</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span>Fire safety and electrical system checks</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span>Regular property maintenance inspections</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Safety Features */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Safety Features & Amenities</h2>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                  <LockClosedIcon className="w-10 h-10 text-blue-600 mb-4" />
                  <h4 className="font-semibold text-blue-900 mb-3">Security Measures</h4>
                  <ul className="text-blue-800 text-sm space-y-2">
                    <li>• 24/7 security monitoring</li>
                    <li>• Secure keyless entry systems</li>
                    <li>• CCTV surveillance (where applicable)</li>
                    <li>• Safe storage for valuables</li>
                  </ul>
                </div>
                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                  <FireIcon className="w-10 h-10 text-green-600 mb-4" />
                  <h4 className="font-semibold text-green-900 mb-3">Fire Safety</h4>
                  <ul className="text-green-800 text-sm space-y-2">
                    <li>• Smoke detectors in all rooms</li>
                    <li>• Fire extinguishers available</li>
                    <li>• Clear emergency exit routes</li>
                    <li>• Fire safety training for hosts</li>
                  </ul>
                </div>
                <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                  <HeartIcon className="w-10 h-10 text-purple-600 mb-4" />
                  <h4 className="font-semibold text-purple-900 mb-3">Health & Hygiene</h4>
                  <ul className="text-purple-800 text-sm space-y-2">
                    <li>• Enhanced cleaning protocols</li>
                    <li>• Sanitization between stays</li>
                    <li>• Contactless check-in options</li>
                    <li>• Health guidelines compliance</li>
                  </ul>
                </div>
              </div>

              <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                <div className="flex items-start">
                  <InformationCircleIcon className="w-6 h-6 text-yellow-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-yellow-900 mb-2">Property Safety Information</h4>
                    <p className="text-yellow-800 text-sm">
                      Each property listing includes detailed safety information. Look for safety badges and 
                      read the property description for specific safety features and amenities available.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Emergency Procedures */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Emergency Procedures</h2>
              <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Emergency Contacts</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <span className="text-gray-700">EJA Emergency</span>
                        <span className="text-red-600 font-semibold">+91 8976662177</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <span className="text-gray-700">Local Police</span>
                        <span className="text-red-600 font-semibold">100</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <span className="text-gray-700">Fire Department</span>
                        <span className="text-red-600 font-semibold">101</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <span className="text-gray-700">Medical Emergency</span>
                        <span className="text-red-600 font-semibold">108</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">What to Do in an Emergency</h4>
                    <ul className="text-gray-700 space-y-3">
                      <li className="flex items-start">
                        <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                        <span>Call our emergency hotline immediately</span>
                      </li>
                      <li className="flex items-start">
                        <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                        <span>Contact local emergency services if needed</span>
                      </li>
                      <li className="flex items-start">
                        <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                        <span>Follow emergency exit routes</span>
                      </li>
                      <li className="flex items-start">
                        <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                        <span>Stay calm and follow instructions</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Guest Safety Guidelines */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Guest Safety Guidelines</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-4">Before Your Stay</h4>
                  <ul className="text-gray-700 space-y-3">
                    <li className="flex items-start">
                      <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span>Read the property description and house rules</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span>Save emergency contact numbers</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span>Share your travel plans with family/friends</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span>Download the property's location on your phone</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-4">During Your Stay</h4>
                  <ul className="text-gray-700 space-y-3">
                    <li className="flex items-start">
                      <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span>Familiarize yourself with emergency exits</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span>Keep your phone charged and accessible</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span>Report any safety concerns immediately</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span>Follow local safety guidelines and laws</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* COVID-19 Safety */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">COVID-19 Safety Measures</h2>
              <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-8 border border-blue-200">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Enhanced Cleaning Protocols</h4>
                    <ul className="text-gray-700 space-y-3">
                      <li className="flex items-start">
                        <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                        <span>Professional cleaning between stays</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                        <span>Disinfection of high-touch surfaces</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                        <span>Use of hospital-grade cleaning products</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                        <span>72-hour vacancy period between bookings</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Contactless Experience</h4>
                    <ul className="text-gray-700 space-y-3">
                      <li className="flex items-start">
                        <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                        <span>Contactless check-in and check-out</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                        <span>Digital key access where available</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                        <span>Virtual property tours</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                        <span>Online communication with hosts</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Safety Reporting */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Report Safety Concerns</h2>
              <div className="bg-red-50 rounded-xl p-8 border border-red-200">
                <div className="text-center">
                  <ExclamationTriangleIcon className="w-16 h-16 text-red-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-red-900 mb-4">Safety is Our Priority</h3>
                  <p className="text-red-800 mb-6">
                    If you encounter any safety issues or concerns during your stay, please report them immediately. 
                    We take all safety reports seriously and will respond promptly.
                  </p>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-red-900 mb-2">Emergency Hotline</h4>
                      <p className="text-red-800 font-semibold text-lg">+91 8976662177</p>
                      <p className="text-red-700 text-sm">Available 24/7</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-red-900 mb-2">Safety Email</h4>
                      <p className="text-red-800 font-semibold text-lg">safety@ejahomestay.com</p>
                      <p className="text-red-700 text-sm">Response within 1 hour</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Contact */}
            <section className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-8 border border-red-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions About Safety?</h2>
              <p className="text-gray-700 mb-6">
                Our safety team is here to address any concerns and ensure your peace of mind. 
                Don't hesitate to reach out for assistance.
              </p>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Safety Team</h4>
                  <p className="text-red-600">safety@ejahomestay.com</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Emergency Line</h4>
                  <p className="text-red-600">+91 8976662177</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">WhatsApp</h4>
                  <p className="text-red-600">+91 8976662177</p>
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
