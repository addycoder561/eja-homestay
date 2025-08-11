'use client';

import { 
  BriefcaseIcon, 
  HeartIcon, 
  UsersIcon, 
  GlobeAltIcon, 
  SparklesIcon,
  MapPinIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  AcademicCapIcon,
  UserGroupIcon,
  RocketLaunchIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function CareersSimplePage() {
  const openPositions = [
    {
      id: 1,
      title: 'Frontend Developer',
      department: 'Engineering',
      location: 'Remote / Delhi',
      type: 'Full-time',
      experience: '2-4 years',
      salary: '₹8-15 LPA',
      description: 'Build beautiful, responsive user interfaces for our homestay platform using React, Next.js, and modern web technologies.',
      requirements: [
        'Strong proficiency in React, TypeScript, and Next.js',
        'Experience with Tailwind CSS and modern UI/UX principles',
        'Knowledge of responsive design and cross-browser compatibility',
        'Understanding of REST APIs and state management',
        'Experience with Git and collaborative development'
      ]
    }
  ];

  const benefits = [
    {
      icon: HeartIcon,
      title: 'Health & Wellness',
      description: 'Comprehensive health insurance, mental health support, and wellness programs'
    },
    {
      icon: UsersIcon,
      title: 'Flexible Work',
      description: 'Remote work options, flexible hours, and work-life balance initiatives'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Join Our Mission to
              <span className="text-blue-600"> Transform Travel</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Help us create meaningful connections between travelers and local hosts, 
              making every journey an authentic and memorable experience.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Work With Us</h2>
            <p className="text-lg text-gray-600">We take care of our team so you can focus on doing your best work</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <benefit.icon className="w-12 h-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Open Positions</h2>
            <p className="text-lg text-gray-600">Join our growing team and help shape the future of travel</p>
          </div>
          <div className="space-y-6">
            {openPositions.map((position) => (
              <div key={position.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{position.title}</h3>
                    <p className="text-gray-600 mb-2">{position.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <BriefcaseIcon className="w-4 h-4 mr-1" />
                        <span>{position.department}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPinIcon className="w-4 h-4 mr-1" />
                        <span>{position.location}</span>
                      </div>
                      <div className="flex items-center">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        <span>{position.type}</span>
                      </div>
                      <div className="flex items-center">
                        <AcademicCapIcon className="w-4 h-4 mr-1" />
                        <span>{position.experience}</span>
                      </div>
                      <div className="flex items-center">
                        <CurrencyRupeeIcon className="w-4 h-4 mr-1" />
                        <span>{position.salary}</span>
                      </div>
                    </div>
                  </div>
                  <button className="mt-4 lg:mt-0 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Apply Now
                  </button>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Requirements:</h4>
                  <ul className="space-y-2">
                    {position.requirements.map((req, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
