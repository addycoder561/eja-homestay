"use client";

import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { 
  PhoneIcon, 
  EnvelopeIcon, 
  MapPinIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function ContactUsPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />
      
      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Contact Us</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Get in touch with our team. We're here to help make your homestay experience perfect.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          
          {/* Quick Contact Info */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 text-center">
              <PhoneIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Call Us</h3>
              <p className="text-gray-600 mb-4">24/7 Customer Support</p>
              <p className="text-blue-600 font-semibold text-lg">+91 8976662177</p>
              <p className="text-sm text-gray-500 mt-2">Available anytime, day or night</p>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 text-center">
              <EnvelopeIcon className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Email Us</h3>
              <p className="text-gray-600 mb-4">Quick Response Guaranteed</p>
              <p className="text-green-600 font-semibold text-lg">support@ejahomestay.com</p>
              <p className="text-sm text-gray-500 mt-2">Response within 2 hours</p>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 text-center">
              <ChatBubbleLeftRightIcon className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Live Chat</h3>
              <p className="text-gray-600 mb-4">Instant Support</p>
              <button className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium">
                Start Chat Now
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select a subject</option>
                      <option value="booking">Booking Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="payment">Payment Issue</option>
                      <option value="refund">Refund Request</option>
                      <option value="feedback">Feedback</option>
                      <option value="partnership">Partnership</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tell us how we can help you..."
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              {/* Office Hours */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <div className="flex items-center mb-4">
                  <ClockIcon className="w-8 h-8 text-blue-600 mr-3" />
                  <h3 className="text-xl font-semibold text-gray-900">Office Hours</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monday - Friday</span>
                    <span className="font-medium">9:00 AM - 8:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Saturday</span>
                    <span className="font-medium">10:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sunday</span>
                    <span className="font-medium">10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Emergency Support</span>
                      <span className="font-medium text-green-600">24/7 Available</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Department Contacts */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Department Contacts</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Customer Support</h4>
                      <p className="text-sm text-gray-600">General inquiries & booking help</p>
                    </div>
                    <p className="text-blue-600 font-medium">support@ejahomestay.com</p>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Technical Support</h4>
                      <p className="text-sm text-gray-600">Website & app issues</p>
                    </div>
                    <p className="text-blue-600 font-medium">tech@ejahomestay.com</p>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Partnership</h4>
                      <p className="text-sm text-gray-600">Host registration & business</p>
                    </div>
                    <p className="text-blue-600 font-medium">partners@ejahomestay.com</p>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Media & Press</h4>
                      <p className="text-sm text-gray-600">Press inquiries & media</p>
                    </div>
                    <p className="text-blue-600 font-medium">press@ejahomestay.com</p>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                <div className="flex items-center mb-4">
                  <ExclamationTriangleIcon className="w-8 h-8 text-red-600 mr-3" />
                  <h3 className="text-xl font-semibold text-red-900">Emergency Contact</h3>
                </div>
                <p className="text-red-800 mb-4">
                  For urgent issues during your stay, contact us immediately:
                </p>
                <div className="space-y-2">
                  <p className="text-red-900 font-semibold">Emergency Hotline: +91 8976662177</p>
                  <p className="text-red-800 text-sm">Available 24/7 for immediate assistance</p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-16 grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 border border-blue-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Response Times</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3" />
                  <span className="text-gray-700">Phone calls: Immediate</span>
                </div>
                <div className="flex items-center">
                  <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3" />
                  <span className="text-gray-700">Live chat: Within 2 minutes</span>
                </div>
                <div className="flex items-center">
                  <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3" />
                  <span className="text-gray-700">Email: Within 2 hours</span>
                </div>
                <div className="flex items-center">
                  <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3" />
                  <span className="text-gray-700">WhatsApp: Within 30 minutes</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-8 border border-green-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">What We Can Help With</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <InformationCircleIcon className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="text-gray-700">Booking modifications & cancellations</span>
                </div>
                <div className="flex items-center">
                  <InformationCircleIcon className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="text-gray-700">Payment & refund assistance</span>
                </div>
                <div className="flex items-center">
                  <InformationCircleIcon className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="text-gray-700">Property information & recommendations</span>
                </div>
                <div className="flex items-center">
                  <InformationCircleIcon className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="text-gray-700">Technical support & troubleshooting</span>
                </div>
                <div className="flex items-center">
                  <InformationCircleIcon className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="text-gray-700">Safety concerns & emergency assistance</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
