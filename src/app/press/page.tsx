'use client';

import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { 
  DocumentTextIcon, 
  PhotoIcon, 
  VideoCameraIcon,
  EnvelopeIcon,
  PhoneIcon,
  GlobeAltIcon,
  CalendarIcon,
  UserIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  MapPinIcon,
  HeartIcon,
  UsersIcon,
  StarIcon
} from '@heroicons/react/24/outline';

export default function PressPage() {
  const pressReleases = [
    {
      id: 1,
              title: 'EJA Raises $5M Series A Funding to Expand Authentic Travel Experiences',
      date: 'December 15, 2024',
      category: 'Funding',
      excerpt: 'Leading homestay platform secures funding to enhance technology platform and expand to new markets across India.',
      readMore: '#'
    },
    {
      id: 2,
              title: 'EJA Launches Local Experiences Platform',
      date: 'November 20, 2024',
      category: 'Product Launch',
      excerpt: 'Platform expands beyond homestays to offer curated local experiences, connecting travelers with authentic cultural activities.',
      readMore: '#'
    },
    {
      id: 3,
              title: 'EJA Partners with 500+ Local Hosts Across India',
      date: 'October 8, 2024',
      category: 'Partnership',
      excerpt: 'Strategic partnerships bring diverse homestay options to travelers, from mountain retreats to coastal getaways.',
      readMore: '#'
    },
    {
      id: 4,
              title: 'EJA Introduces Wellness Retreats Program',
      date: 'September 12, 2024',
      category: 'Product Launch',
      excerpt: 'New wellness-focused retreats offer travelers opportunities for rejuvenation and authentic local experiences.',
      readMore: '#'
    }
  ];

  const mediaResources = [
    {
      title: 'Brand Guidelines',
      description: 'Our brand identity, logo usage, and design standards',
      icon: DocumentTextIcon,
      download: '#'
    },
    {
      title: 'High-Resolution Logos',
      description: 'PNG, SVG, and vector formats of our logo',
      icon: PhotoIcon,
      download: '#'
    },
    {
      title: 'Product Screenshots',
      description: 'High-quality screenshots of our platform',
      icon: PhotoIcon,
      download: '#'
    },
    {
      title: 'Team Photos',
      description: 'Professional photos of our leadership team',
      icon: PhotoIcon,
      download: '#'
    },
    {
      title: 'Company Video',
      description: 'Brand video and product demos',
      icon: VideoCameraIcon,
      download: '#'
    }
  ];

  const companyStats = [
    {
      icon: UsersIcon,
      number: '10,000+',
      label: 'Happy Guests'
    },
    {
      icon: BuildingOfficeIcon,
      number: '500+',
      label: 'Partner Hosts'
    },
    {
      icon: MapPinIcon,
      number: '50+',
      label: 'Cities Covered'
    },
    {
      icon: StarIcon,
      number: '4.8',
      label: 'Average Rating'
    }
  ];

  const leadership = [
    {
      name: 'Aditya Sharma',
      title: 'Founder & CEO',
      bio: 'Former tech executive with 10+ years experience in travel and hospitality. Passionate about creating authentic travel experiences.',
      email: 'aditya@ejahomestay.com'
    },
    {
      name: 'Priya Patel',
      title: 'Chief Operating Officer',
      bio: 'Hospitality industry veteran with expertise in operations and guest experience optimization.',
      email: 'priya@ejahomestay.com'
    },
    {
      name: 'Rahul Verma',
      title: 'Chief Technology Officer',
      bio: 'Tech leader with experience building scalable platforms and innovative travel solutions.',
      email: 'rahul@ejahomestay.com'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Press & Media
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Stay updated with the latest news, announcements, and resources about EJA. 
              We're transforming how people experience authentic travel in India.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2" />
                <span>Latest Updates</span>
              </div>
              <div className="flex items-center">
                <DocumentTextIcon className="w-5 h-5 mr-2" />
                <span>Press Resources</span>
              </div>
              <div className="flex items-center">
                <EnvelopeIcon className="w-5 h-5 mr-2" />
                <span>Media Contact</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Overview Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">About EJA</h2>
              <p className="text-lg text-gray-600 mb-6">
                EJA is India's leading platform for authentic homestay experiences, 
                connecting travelers with local hosts to create meaningful connections and 
                unforgettable memories.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Founded in 2023, we've grown from a small startup to a trusted platform 
                serving thousands of travelers across India. Our mission is to make authentic 
                travel accessible to everyone while supporting local communities.
              </p>
              <p className="text-lg text-gray-600">
                We offer homestays, local experiences, and wellness retreats, all carefully 
                curated to provide genuine cultural immersion and exceptional hospitality.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {companyStats.map((stat, index) => (
                <div key={index} className="text-center p-6 bg-gray-50 rounded-lg">
                  <stat.icon className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.number}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Press Releases Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Latest Press Releases</h2>
            <p className="text-lg text-gray-600">Stay updated with our latest news and announcements</p>
          </div>
          <div className="space-y-6">
            {pressReleases.map((release) => (
              <div key={release.id} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                        {release.category}
                      </span>
                      <span className="text-sm text-gray-500">{release.date}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{release.title}</h3>
                    <p className="text-gray-600 mb-4">{release.excerpt}</p>
                  </div>
                  <button className="lg:ml-6 mt-4 lg:mt-0 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Read More
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Media Resources Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Media Resources</h2>
            <p className="text-lg text-gray-600">Download high-quality assets for your coverage</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mediaResources.map((resource, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition-colors">
                <resource.icon className="w-12 h-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{resource.title}</h3>
                <p className="text-gray-600 mb-4">{resource.description}</p>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Leadership Team</h2>
            <p className="text-lg text-gray-600">Meet the team driving our mission forward</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {leadership.map((leader, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <UserIcon className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">{leader.name}</h3>
                <p className="text-blue-600 font-medium mb-3">{leader.title}</p>
                <p className="text-gray-600 mb-4">{leader.bio}</p>
                <a 
                  href={`mailto:${leader.email}`}
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
                >
                  <EnvelopeIcon className="w-4 h-4 mr-2" />
                  {leader.email}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Media Contact</h2>
            <p className="text-lg text-gray-600">
              For press inquiries, interviews, or media partnerships, please reach out to our team.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Press Inquiries</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <EnvelopeIcon className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="text-gray-600">press@ejahomestay.com</span>
                </div>
                <div className="flex items-center">
                  <PhoneIcon className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="text-gray-600">+91 8976662177</span>
                </div>
                <div className="flex items-center">
                  <GlobeAltIcon className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="text-gray-600">www.ejahomestay.com</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Company Information</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <BuildingOfficeIcon className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="text-gray-600">EJA Pvt. Ltd.</span>
                </div>
                <div className="flex items-center">
                  <MapPinIcon className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="text-gray-600">Delhi, India</span>
                </div>
                <div className="flex items-center">
                  <CalendarIcon className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="text-gray-600">Founded 2023</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Facts Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Quick Facts</h2>
            <p className="text-lg text-gray-600">Key information about our platform and impact</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg text-center">
              <ChartBarIcon className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-gray-900 mb-1">95%</div>
              <div className="text-gray-600">Guest Satisfaction Rate</div>
            </div>
            <div className="bg-white p-6 rounded-lg text-center">
              <HeartIcon className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-gray-900 mb-1">200+</div>
              <div className="text-gray-600">Local Experiences</div>
            </div>
            <div className="bg-white p-6 rounded-lg text-center">
              <UsersIcon className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-gray-900 mb-1">25+</div>
              <div className="text-gray-600">Wellness Retreats</div>
            </div>
            <div className="bg-white p-6 rounded-lg text-center">
              <StarIcon className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-gray-900 mb-1">4.8/5</div>
              <div className="text-gray-600">Average Host Rating</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
