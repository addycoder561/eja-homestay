"use client";

import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { 
  QuestionMarkCircleIcon, 
  MagnifyingGlassIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  BookOpenIcon,
  CreditCardIcon,
  CalendarIcon,
  MapPinIcon,
  UserIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Topics', icon: BookOpenIcon },
    { id: 'booking', name: 'Booking', icon: CalendarIcon },
    { id: 'payment', name: 'Payment', icon: CreditCardIcon },
    { id: 'account', name: 'Account', icon: UserIcon },
    { id: 'safety', name: 'Safety', icon: ShieldCheckIcon },
    { id: 'technical', name: 'Technical', icon: InformationCircleIcon },
  ];

  const faqs = [
    {
      id: 1,
      category: 'booking',
      question: 'How do I book a homestay?',
      answer: 'Booking a homestay is easy! Simply search for your destination, select your dates, choose your preferred property, and complete the booking process. You can pay securely online and receive instant confirmation.'
    },
    {
      id: 2,
      category: 'booking',
      question: 'Can I modify or cancel my booking?',
      answer: 'Yes, you can modify or cancel your booking through your account dashboard. Cancellation policies vary by property and are clearly stated during the booking process. Most properties offer free cancellation up to 24-48 hours before check-in.'
    },
    {
      id: 3,
      category: 'payment',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, debit cards, UPI, net banking, and digital wallets including Paytm, Google Pay, and PhonePe. All payments are processed securely through our trusted payment partners.'
    },
    {
      id: 4,
      category: 'payment',
      question: 'Is my payment information secure?',
      answer: 'Absolutely! We use industry-standard SSL encryption and work with trusted payment gateways like Razorpay to ensure your payment information is always secure and protected.'
    },
    {
      id: 5,
      category: 'account',
      question: 'How do I create an account?',
      answer: 'Creating an account is simple! Click the "Sign Up" button in the top right corner, enter your email address, create a password, and verify your email. You can also sign up using your Google or Facebook account.'
    },
    {
      id: 6,
      category: 'account',
      question: 'I forgot my password. How do I reset it?',
      answer: 'Click on "Sign In" and then "Forgot Password?" Enter your email address, and we\'ll send you a secure link to reset your password. The link will expire after 24 hours for security.'
    },
    {
      id: 7,
      category: 'safety',
      question: 'How do you verify hosts and properties?',
      answer: 'We have a comprehensive verification process for all hosts and properties. This includes identity verification, property inspections, background checks, and guest reviews. We also have a 24/7 support team to ensure your safety.'
    },
    {
      id: 8,
      category: 'safety',
      question: 'What if I have an emergency during my stay?',
      answer: 'In case of an emergency, you can contact our 24/7 support team immediately. We also provide emergency contact numbers for each property and have local support available in most areas.'
    },
    {
      id: 9,
      category: 'technical',
      question: 'The website is not loading properly. What should I do?',
      answer: 'Try refreshing the page or clearing your browser cache. If the issue persists, try using a different browser or device. You can also contact our technical support team for immediate assistance.'
    },
    {
      id: 10,
      category: 'technical',
      question: 'How do I contact customer support?',
      answer: 'You can reach our customer support team through multiple channels: phone (+91 8976662177), email (support@ejahomestay.com), WhatsApp, or live chat. We\'re available 24/7 to help you.'
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />
      
      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center mb-6">
              <QuestionMarkCircleIcon className="w-16 h-16 text-white/90" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Help Center</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
              Find answers to your questions and get the support you need
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for help articles, FAQs, or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-gray-900 bg-white rounded-xl shadow-lg border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none text-lg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          
          {/* Quick Contact */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 text-center">
              <PhoneIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Call Us</h3>
              <p className="text-gray-600 mb-3">24/7 Support Available</p>
              <p className="text-blue-600 font-semibold">+91 8976662177</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 text-center">
              <ChatBubbleLeftRightIcon className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Live Chat</h3>
              <p className="text-gray-600 mb-3">Instant Support</p>
              <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
                Start Chat
              </button>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 text-center">
              <EnvelopeIcon className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Email Us</h3>
              <p className="text-gray-600 mb-3">Response within 2 hours</p>
              <p className="text-purple-600 font-semibold">support@ejahomestay.com</p>
            </div>
          </div>

          {/* Categories */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Browse by Category</h2>
            <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      activeCategory === category.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <Icon className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm font-medium">{category.name}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* FAQs */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
            
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-12">
                <QuestionMarkCircleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your search terms or browse by category</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('all');
                  }}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View All FAQs
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredFaqs.map((faq) => (
                  <div key={faq.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Popular Topics */}
          <div className="mt-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Popular Topics</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <CalendarIcon className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Booking Guide</h3>
                <p className="text-gray-600 mb-4">Learn how to book your perfect homestay with our step-by-step guide.</p>
                <button className="text-blue-600 font-medium hover:text-blue-700">Read More →</button>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <CreditCardIcon className="w-10 h-10 text-green-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Payment & Refunds</h3>
                <p className="text-gray-600 mb-4">Everything you need to know about payments, refunds, and cancellations.</p>
                <button className="text-green-600 font-medium hover:text-green-700">Read More →</button>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <ShieldCheckIcon className="w-10 h-10 text-purple-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Safety & Security</h3>
                <p className="text-gray-600 mb-4">Learn about our safety measures and how we protect our guests.</p>
                <button className="text-purple-600 font-medium hover:text-purple-700">Read More →</button>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <UserIcon className="w-10 h-10 text-orange-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Account Management</h3>
                <p className="text-gray-600 mb-4">Manage your account, update preferences, and view booking history.</p>
                <button className="text-orange-600 font-medium hover:text-orange-700">Read More →</button>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <MapPinIcon className="w-10 h-10 text-red-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Property Information</h3>
                <p className="text-gray-600 mb-4">Find detailed information about our properties and amenities.</p>
                <button className="text-red-600 font-medium hover:text-red-700">Read More →</button>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <InformationCircleIcon className="w-10 h-10 text-indigo-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Technical Support</h3>
                <p className="text-gray-600 mb-4">Get help with website issues, app problems, and technical questions.</p>
                <button className="text-indigo-600 font-medium hover:text-indigo-700">Read More →</button>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="mt-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-200">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Still Need Help?</h2>
              <p className="text-gray-700 mb-8 max-w-2xl mx-auto">
                Our customer support team is here to help you 24/7. Don't hesitate to reach out 
                if you can't find the answer you're looking for.
              </p>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <ClockIcon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-2">24/7 Support</h4>
                  <p className="text-gray-600 text-sm">We're always here when you need us</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <CheckCircleIcon className="w-8 h-8 text-green-600 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-2">Quick Response</h4>
                  <p className="text-gray-600 text-sm">Get help within minutes, not hours</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <ExclamationTriangleIcon className="w-8 h-8 text-orange-600 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-2">Emergency Support</h4>
                  <p className="text-gray-600 text-sm">Immediate assistance for urgent issues</p>
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
