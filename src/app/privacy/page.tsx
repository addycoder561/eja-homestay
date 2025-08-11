"use client";

import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { 
  ShieldCheckIcon,
  LockClosedIcon,
  EyeIcon,
  UserIcon,
  CogIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />
      
      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center mb-6">
              <LockClosedIcon className="w-16 h-16 text-white/90" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Privacy Policy</h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Your privacy is our priority. Learn how we collect, use, and protect your personal information.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          
          {/* Introduction */}
          <section className="mb-12">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <ShieldCheckIcon className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Your Privacy Matters</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                At EJA Homestay, we are committed to protecting your privacy and ensuring the security of your personal information. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your data when you use our platform. 
                By using our services, you consent to the practices described in this policy.
              </p>
            </div>
          </section>

          {/* Privacy Sections */}
          <div className="space-y-8">
            
            {/* Information We Collect */}
            <section className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <DocumentTextIcon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">1. Information We Collect</h3>
              </div>
              <div className="text-gray-700 space-y-4">
                <p>We collect various types of information to provide and improve our services:</p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                      <UserIcon className="w-5 h-5 mr-2" />
                      Personal Information
                    </h4>
                    <ul className="space-y-2 text-blue-800">
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span>Name, email address, phone number</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span>Profile information and preferences</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span>Payment and billing information</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span>Government-issued identification (for verification)</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                      <EyeIcon className="w-5 h-5 mr-2" />
                      Usage Information
                    </h4>
                    <ul className="space-y-2 text-green-800">
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span>Pages visited and actions taken</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span>Search queries and preferences</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span>Device and browser information</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span>IP address and location data</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* How We Use Information */}
            <section className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                  <CogIcon className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">2. How We Use Your Information</h3>
              </div>
              <div className="text-gray-700 space-y-4">
                <p>We use your information for the following purposes:</p>
                <ul className="space-y-3 ml-6">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span><strong>Service Provision:</strong> To provide, maintain, and improve our platform and services.</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span><strong>Booking Processing:</strong> To process bookings, payments, and manage reservations.</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span><strong>Communication:</strong> To send booking confirmations, updates, and support messages.</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span><strong>Security:</strong> To verify identities, prevent fraud, and ensure platform security.</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span><strong>Personalization:</strong> To personalize your experience and show relevant content.</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span><strong>Analytics:</strong> To analyze usage patterns and improve our services.</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Data Sharing */}
            <section className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                  <ExclamationTriangleIcon className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">3. Data Sharing & Disclosure</h3>
              </div>
              <div className="text-gray-700 space-y-4">
                <p>We are committed to protecting your privacy and do not sell your personal information. We may share your data in the following circumstances:</p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-orange-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-orange-900 mb-3">When We Share</h4>
                    <ul className="space-y-2 text-orange-800">
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span>With hosts to facilitate bookings</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span>With payment processors for transactions</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span>With service providers who assist our operations</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span>When required by law or legal process</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-red-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-red-900 mb-3">We Never Share</h4>
                    <ul className="space-y-2 text-red-800">
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span>Your personal information with third-party advertisers</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span>Your data for marketing purposes without consent</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span>Sensitive information unless legally required</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Data Security */}
            <section className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <LockClosedIcon className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">4. Data Security</h3>
              </div>
              <div className="text-gray-700 space-y-4">
                <p>We implement industry-standard security measures to protect your data:</p>
                <ul className="space-y-3 ml-6">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span><strong>Encryption:</strong> All data is encrypted in transit and at rest using SSL/TLS protocols.</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span><strong>Access Controls:</strong> Strict access controls limit who can access your personal information.</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span><strong>Regular Audits:</strong> We conduct regular security audits and assessments.</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span><strong>Incident Response:</strong> We have procedures in place to respond to security incidents.</span>
                  </li>
        </ul>
                <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                  <p className="text-green-800">
                    <strong>Security Commitment:</strong> We continuously monitor and update our security measures 
                    to protect against emerging threats.
                  </p>
                </div>
              </div>
            </section>

            {/* Your Rights */}
            <section className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <CheckCircleIcon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">5. Your Privacy Rights</h3>
              </div>
              <div className="text-gray-700 space-y-4">
                <p>You have the following rights regarding your personal information:</p>
                <div className="grid md:grid-cols-2 gap-6">
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span><strong>Access:</strong> Request a copy of your personal data</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span><strong>Correction:</strong> Update or correct inaccurate information</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span><strong>Deletion:</strong> Request deletion of your personal data</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span><strong>Portability:</strong> Receive your data in a portable format</span>
                    </li>
        </ul>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span><strong>Restriction:</strong> Limit how we process your data</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span><strong>Objection:</strong> Object to certain processing activities</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span><strong>Withdrawal:</strong> Withdraw consent at any time</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span><strong>Complaint:</strong> Lodge a complaint with authorities</span>
                    </li>
        </ul>
                </div>
                <div className="bg-blue-50 p-6 rounded-lg">
                  <p className="text-blue-800">
                    <strong>To exercise these rights:</strong> Contact us at privacy@eja.com. We will respond 
                    to your request within 30 days.
                  </p>
                </div>
              </div>
            </section>

            {/* Changes to Policy */}
            <section className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
                  <ClockIcon className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">6. Changes to This Policy</h3>
              </div>
              <div className="text-gray-700 space-y-4">
                <p>
                  We may update this Privacy Policy from time to time to reflect changes in our practices or applicable laws:
                </p>
                <ul className="space-y-3 ml-6">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>We will notify you of significant changes via email or platform notification.</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Updated policies will be posted on this page with a new effective date.</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Continued use of the platform constitutes acceptance of the updated policy.</span>
                  </li>
        </ul>
              </div>
            </section>

            {/* Contact Information */}
            <section className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <EnvelopeIcon className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">7. Contact Us</h3>
              </div>
              <div className="text-gray-700 space-y-4">
                <p>
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="bg-green-50 p-6 rounded-lg">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-green-900 mb-2">Privacy Inquiries</h4>
                      <p className="text-green-800">privacy@eja.com</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-900 mb-2">Data Protection Officer</h4>
                      <p className="text-green-800">dpo@eja.com</p>
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