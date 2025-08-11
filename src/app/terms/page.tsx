"use client";

import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { 
  ShieldCheckIcon,
  DocumentTextIcon,
  UserIcon,
  CreditCardIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  EnvelopeIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />
      
      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center mb-6">
              <DocumentTextIcon className="w-16 h-16 text-white/90" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Terms & Conditions</h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Please read these terms carefully. By using EJA Homestay, you agree to be bound by these terms and conditions.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          
          {/* Introduction */}
          <section className="mb-12">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Welcome to EJA Homestay</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                These Terms & Conditions govern your use of the EJA Homestay platform and services. 
                By accessing or using our platform, you acknowledge that you have read, understood, 
                and agree to be bound by these terms. If you do not agree with any part of these terms, 
                please do not use our services.
              </p>
            </div>
          </section>

          {/* Terms Sections */}
          <div className="space-y-8">
            
            {/* Acceptance of Terms */}
            <section className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">1. Acceptance of Terms</h3>
              </div>
              <div className="text-gray-700 space-y-4">
                <p>
                  By accessing or using our services, you agree to be bound by these Terms & Conditions 
                  and our Privacy Policy. These terms apply to all users of the platform, including guests, 
                  hosts, and visitors.
                </p>
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                  <p className="text-blue-800 font-medium">
                    <strong>Important:</strong> Your continued use of the platform after any changes to these 
                    terms constitutes acceptance of the updated terms.
                  </p>
                </div>
              </div>
            </section>

            {/* Use of Platform */}
            <section className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                  <UserIcon className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">2. Use of the Platform</h3>
              </div>
              <div className="text-gray-700 space-y-4">
                <p>To use our platform, you must meet the following requirements:</p>
                <ul className="space-y-3 ml-6">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>You must be at least 18 years old to create an account and use our services.</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>You agree to provide accurate, current, and complete information during registration and booking.</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>You are responsible for maintaining the confidentiality of your account credentials.</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>You agree not to use the platform for any unlawful purpose or in violation of these terms.</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Bookings & Payments */}
            <section className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                  <CreditCardIcon className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">3. Bookings & Payments</h3>
              </div>
              <div className="text-gray-700 space-y-4">
                <p>Our booking and payment policies ensure a smooth experience for all users:</p>
                <ul className="space-y-3 ml-6">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>All bookings are subject to availability and confirmation by the host.</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Payments are processed securely through our trusted payment partners.</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Refunds and cancellations are subject to our cancellation policy and host terms.</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Service fees and taxes will be clearly displayed before booking confirmation.</span>
                  </li>
                </ul>
                <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
                  <p className="text-orange-800">
                    <strong>Note:</strong> Please review the specific cancellation policy for each property 
                    before making a booking.
                  </p>
                </div>
              </div>
            </section>

            {/* User Conduct */}
            <section className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">4. User Conduct</h3>
              </div>
              <div className="text-gray-700 space-y-4">
                <p>We expect all users to maintain respectful and appropriate behavior:</p>
                <ul className="space-y-3 ml-6">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>No unlawful, harmful, threatening, abusive, or harassing behavior is permitted.</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Respect the property, hosts, and other guests at all times.</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Do not engage in any activity that could damage or interfere with the platform.</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Provide honest and accurate reviews and feedback.</span>
                  </li>
        </ul>
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                  <p className="text-red-800">
                    <strong>Violation:</strong> Failure to comply with these conduct guidelines may result 
                    in account suspension or termination.
                  </p>
                </div>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mr-4">
                  <ShieldCheckIcon className="w-6 h-6 text-gray-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">5. Limitation of Liability</h3>
              </div>
              <div className="text-gray-700 space-y-4">
                <p>
                  EJA Homestay acts as a platform connecting guests and hosts. Our liability is limited as follows:
                </p>
                <ul className="space-y-3 ml-6">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-gray-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>We are not liable for any indirect, incidental, or consequential damages.</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-gray-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Our total liability shall not exceed the amount paid for the specific booking.</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-gray-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>We are not responsible for disputes between guests and hosts.</span>
                  </li>
        </ul>
              </div>
            </section>

            {/* Changes to Terms */}
            <section className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
                  <ClockIcon className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">6. Changes to Terms</h3>
              </div>
              <div className="text-gray-700 space-y-4">
                <p>
                  We reserve the right to modify these terms at any time. When we make changes:
                </p>
                <ul className="space-y-3 ml-6">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>We will notify users of significant changes via email or platform notification.</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Updated terms will be posted on this page with a new effective date.</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Continued use of the platform constitutes acceptance of the new terms.</span>
                  </li>
        </ul>
              </div>
            </section>

            {/* Contact Information */}
            <section className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <EnvelopeIcon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">7. Contact Information</h3>
              </div>
              <div className="text-gray-700 space-y-4">
                <p>
                  If you have any questions about these Terms & Conditions, please contact us:
                </p>
                <div className="bg-blue-50 p-6 rounded-lg">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">Email Support</h4>
                      <p className="text-blue-800">support@eja.com</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">Legal Inquiries</h4>
                      <p className="text-blue-800">legal@eja.com</p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  <strong>Last updated:</strong> December 2024
                </p>
              </div>
            </section>
          </div>
      </div>
    </main>

      <Footer />
    </div>
  );
} 