'use client';

import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { ErrorBoundary } from '@/components/ErrorBoundary';
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

export default function CareersPage() {
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
    },
    {
      id: 2,
      title: 'Backend Developer',
      department: 'Engineering',
      location: 'Remote / Bangalore',
      type: 'Full-time',
      experience: '3-5 years',
      salary: '₹12-20 LPA',
      description: 'Develop robust backend services and APIs to power our homestay booking platform using Node.js and PostgreSQL.',
      requirements: [
        'Expertise in Node.js, Express, and TypeScript',
        'Strong knowledge of PostgreSQL and database design',
        'Experience with Supabase or similar backend-as-a-service',
        'Understanding of authentication, authorization, and security',
        'Knowledge of microservices architecture and API design'
      ]
    },
    {
      id: 3,
      title: 'Product Manager',
      department: 'Product',
      location: 'Delhi / Mumbai',
      type: 'Full-time',
      experience: '4-6 years',
      salary: '₹15-25 LPA',
      description: 'Lead product strategy and development for our homestay platform, focusing on user experience and business growth.',
      requirements: [
        'Proven experience in product management for B2C platforms',
        'Strong analytical skills and data-driven decision making',
        'Experience with user research and product discovery',
        'Knowledge of agile methodologies and product development lifecycle',
        'Excellent communication and stakeholder management skills'
      ]
    },
    {
      id: 4,
      title: 'Customer Success Manager',
      department: 'Operations',
      location: 'Delhi / Bangalore',
      type: 'Full-time',
      experience: '2-4 years',
      salary: '₹6-12 LPA',
      description: 'Ensure exceptional guest and host experiences by providing support and building strong relationships.',
      requirements: [
        'Excellent communication and problem-solving skills',
        'Experience in customer service or hospitality industry',
        'Ability to handle multiple priorities and work under pressure',
        'Knowledge of CRM systems and customer support tools',
        'Passion for creating memorable travel experiences'
      ]
    },
    {
      id: 5,
      title: 'Marketing Specialist',
      department: 'Marketing',
      location: 'Remote / Delhi',
      type: 'Full-time',
      experience: '2-4 years',
      salary: '₹5-10 LPA',
      description: 'Drive brand awareness and user acquisition through digital marketing campaigns and content strategy.',
      requirements: [
        'Experience in digital marketing and social media management',
        'Knowledge of SEO, SEM, and content marketing',
        'Proficiency in marketing analytics and reporting tools',
        'Creative thinking and content creation skills',
        'Understanding of the travel and hospitality industry'
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
    },
    {
      icon: GlobeAltIcon,
      title: 'Travel Perks',
      description: 'Discounted stays at our partner homestays and travel allowances'
    },
    {
      icon: SparklesIcon,
      title: 'Learning & Growth',
      description: 'Professional development budget, training programs, and career advancement'
    },
    {
      icon: UserGroupIcon,
      title: 'Team Culture',
      description: 'Collaborative environment, team events, and inclusive workplace culture'
    },
    {
      icon: RocketLaunchIcon,
      title: 'Innovation',
      description: 'Work on cutting-edge technology and shape the future of travel'
    }
  ];

  const values = [
    {
      title: 'Authenticity',
      description: 'We believe in genuine connections and authentic travel experiences'
    },
    {
      title: 'Innovation',
      description: 'Continuously improving our platform to enhance user experiences'
    },
    {
      title: 'Community',
      description: 'Building a supportive community of hosts, guests, and team members'
    },
    {
      title: 'Excellence',
      description: 'Striving for excellence in everything we do, from code to customer service'
    }
  ];

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white">
        <Navigation />
        
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
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <UsersIcon className="w-5 h-5 mr-2" />
                <span>50+ Team Members</span>
              </div>
              <div className="flex items-center">
                <GlobeAltIcon className="w-5 h-5 mr-2" />
                <span>Remote First</span>
              </div>
              <div className="flex items-center">
                <HeartIcon className="w-5 h-5 mr-2" />
                <span>Inclusive Culture</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-lg text-gray-600">The principles that guide everything we do</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center p-6 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
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

      {/* Application Process Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Application Process</h2>
            <p className="text-lg text-gray-600">Simple steps to join our team</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Apply</h3>
              <p className="text-gray-600">Submit your resume and cover letter through our application portal</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Interview</h3>
              <p className="text-gray-600">Meet with our team to discuss your experience and fit</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Assessment</h3>
              <p className="text-gray-600">Complete a practical assessment relevant to the role</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Offer</h3>
              <p className="text-gray-600">Receive your offer and join our amazing team!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Don't See the Right Role?</h2>
          <p className="text-lg text-gray-600 mb-8">
            We're always looking for talented individuals to join our team. 
            Send us your resume and let's discuss how you can contribute to our mission.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              Send Resume
            </button>
            <button className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors">
              Contact HR
            </button>
          </div>
        </div>
      </section>

        <Footer />
      </div>
    </ErrorBoundary>
  );
}
