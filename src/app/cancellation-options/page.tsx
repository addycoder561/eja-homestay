"use client";

import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { 
  XCircleIcon, 
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CreditCardIcon,
  CalendarIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

export default function CancellationOptionsPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />
      
      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center mb-6">
              <XCircleIcon className="w-16 h-16 text-white/90" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Cancellation Options</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Flexible cancellation policies designed to give you peace of mind
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            
            {/* Overview */}
            <section className="mb-12">
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-8 border border-orange-200 mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Cancellation Policy Overview</h2>
                <p className="text-gray-700 leading-relaxed mb-6">
                  We understand that travel plans can change unexpectedly. That's why we offer flexible 
                  cancellation options to accommodate your needs. Our cancellation policies are designed 
                  to be fair to both guests and hosts while providing you with the flexibility you need.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Each property may have slightly different cancellation terms, which are clearly displayed 
                  during the booking process. Please review the specific cancellation policy for your chosen property.
                </p>
              </div>
            </section>

            {/* Cancellation Types */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Cancellation Policy Types</h2>
              
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <CheckCircleIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Flexible</h3>
                  </div>
                  <p className="text-gray-700 mb-4">
                    Cancel up to 24 hours before check-in for a full refund.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• Full refund if cancelled 24+ hours before check-in</li>
                    <li>• 50% refund if cancelled 12-24 hours before</li>
                    <li>• No refund if cancelled less than 12 hours before</li>
                    <li>• Most popular option for peace of mind</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                      <ClockIcon className="w-6 h-6 text-yellow-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Moderate</h3>
                  </div>
                  <p className="text-gray-700 mb-4">
                    Cancel up to 5 days before check-in for a full refund.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• Full refund if cancelled 5+ days before check-in</li>
                    <li>• 50% refund if cancelled 2-5 days before</li>
                    <li>• No refund if cancelled less than 2 days before</li>
                    <li>• Good balance of flexibility and security</li>
                  </ul>
                </div>

                <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                      <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Strict</h3>
                  </div>
                  <p className="text-gray-700 mb-4">
                    Cancel up to 7 days before check-in for a full refund.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• Full refund if cancelled 7+ days before check-in</li>
                    <li>• 50% refund if cancelled 3-7 days before</li>
                    <li>• No refund if cancelled less than 3 days before</li>
                    <li>• Best for hosts who need booking security</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* How to Cancel */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Cancel Your Booking</h2>
              <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Online Cancellation</h4>
                    <ol className="text-gray-700 space-y-3">
                      <li className="flex items-start">
                        <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">1</span>
                        <span>Log into your EJA account</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">2</span>
                        <span>Go to "My Bookings" in your dashboard</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">3</span>
                        <span>Find the booking you want to cancel</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">4</span>
                        <span>Click "Cancel Booking" and confirm</span>
                      </li>
                    </ol>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Contact Support</h4>
                    <p className="text-gray-700 mb-4">
                      If you're unable to cancel online or need assistance, our support team is here to help.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <span className="text-gray-700">Phone Support</span>
                        <span className="text-blue-600 font-semibold">+91 8976662177</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <span className="text-gray-700">Email Support</span>
                        <span className="text-blue-600 font-semibold">support@ejahomestay.com</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <span className="text-gray-700">Live Chat</span>
                        <span className="text-blue-600 font-semibold">Available 24/7</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Refund Process */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Refund Process</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center mb-4">
                    <CreditCardIcon className="w-8 h-8 text-green-600 mr-3" />
                    <h4 className="font-semibold text-gray-900">Refund Timeline</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Credit/Debit Cards</span>
                      <span className="text-green-600 font-medium">3-5 business days</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">UPI Payments</span>
                      <span className="text-green-600 font-medium">1-2 business days</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Net Banking</span>
                      <span className="text-green-600 font-medium">2-3 business days</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Digital Wallets</span>
                      <span className="text-green-600 font-medium">1-3 business days</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center mb-4">
                    <InformationCircleIcon className="w-8 h-8 text-blue-600 mr-3" />
                    <h4 className="font-semibold text-gray-900">Important Notes</h4>
                  </div>
                  <ul className="text-gray-700 space-y-3">
                    <li className="flex items-start">
                      <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span>Refunds are processed automatically upon cancellation</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span>You'll receive an email confirmation when refund is initiated</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span>Processing times may vary based on your bank</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span>Service fees are non-refundable in most cases</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Special Circumstances */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Special Circumstances</h2>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 border border-blue-200">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Extenuating Circumstances</h4>
                    <p className="text-gray-700 mb-4">
                      We understand that certain situations may require special consideration. 
                      We may offer full refunds for:
                    </p>
                    <ul className="text-gray-700 space-y-3">
                      <li className="flex items-start">
                        <ExclamationTriangleIcon className="w-5 h-5 text-orange-600 mr-3 mt-0.5 flex-shrink-0" />
                        <span>Natural disasters or severe weather</span>
                      </li>
                      <li className="flex items-start">
                        <ExclamationTriangleIcon className="w-5 h-5 text-orange-600 mr-3 mt-0.5 flex-shrink-0" />
                        <span>Government travel restrictions</span>
                      </li>
                      <li className="flex items-start">
                        <ExclamationTriangleIcon className="w-5 h-5 text-orange-600 mr-3 mt-0.5 flex-shrink-0" />
                        <span>Medical emergencies with documentation</span>
                      </li>
                      <li className="flex items-start">
                        <ExclamationTriangleIcon className="w-5 h-5 text-orange-600 mr-3 mt-0.5 flex-shrink-0" />
                        <span>Death in the family</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Requesting Special Consideration</h4>
                    <p className="text-gray-700 mb-4">
                      To request a refund for extenuating circumstances:
                    </p>
                    <ol className="text-gray-700 space-y-3">
                      <li className="flex items-start">
                        <span className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">1</span>
                        <span>Contact our support team immediately</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">2</span>
                        <span>Provide relevant documentation</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">3</span>
                        <span>Allow 2-3 business days for review</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">4</span>
                        <span>We'll notify you of our decision</span>
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
            </section>

            {/* Host Cancellations */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Host Cancellations</h2>
              <div className="bg-red-50 rounded-xl p-8 border border-red-200">
                <div className="text-center mb-6">
                  <ExclamationTriangleIcon className="w-16 h-16 text-red-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-red-900 mb-2">What Happens If Your Host Cancels?</h3>
                  <p className="text-red-800">
                    While rare, host cancellations can occur. Here's what we do to protect you:
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold text-red-900 mb-4">Immediate Actions</h4>
                    <ul className="text-red-800 space-y-3">
                      <li className="flex items-start">
                        <CheckCircleIcon className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                        <span>Full refund processed immediately</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircleIcon className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                        <span>Email notification sent to you</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircleIcon className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                        <span>Alternative accommodation suggestions</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircleIcon className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                        <span>24/7 support to help you rebook</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-red-900 mb-4">Compensation</h4>
                    <ul className="text-red-800 space-y-3">
                      <li className="flex items-start">
                        <CheckCircleIcon className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                        <span>100% refund of your payment</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircleIcon className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                        <span>Additional compensation for inconvenience</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircleIcon className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                        <span>Priority booking assistance</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircleIcon className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                        <span>Special discounts on rebooking</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Contact */}
            <section className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-8 border border-orange-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Need Help with Cancellation?</h2>
              <p className="text-gray-700 mb-6">
                Our support team is here to help you with any cancellation-related questions or issues. 
                We're available 24/7 to assist you.
              </p>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Call Us</h4>
                  <p className="text-orange-600">+91 8976662177</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Email Us</h4>
                  <p className="text-orange-600">support@ejahomestay.com</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Live Chat</h4>
                  <p className="text-orange-600">Available 24/7</p>
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
