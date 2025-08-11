'use client';

import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { 
  CalendarIcon, 
  UserIcon, 
  ClockIcon,
  TagIcon,
  ArrowRightIcon,
  MapPinIcon,
  HeartIcon,
  StarIcon,
  CameraIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';

export default function BlogPage() {
  const featuredPosts = [
    {
      id: 1,
      title: '10 Hidden Homestays in the Himalayas You Need to Visit',
      excerpt: 'Discover secluded mountain retreats that offer authentic local experiences and breathtaking views of the world\'s highest peaks.',
      author: 'Travel Team',
      date: 'December 20, 2024',
      readTime: '8 min read',
      category: 'Destinations',
      image: '/api/placeholder/600/400',
      featured: true
    },
    {
      id: 2,
      title: 'The Ultimate Guide to Experiencing Local Culture Through Homestays',
      excerpt: 'Learn how to immerse yourself in local traditions, cuisine, and customs while staying with welcoming host families.',
      author: 'Cultural Expert',
      date: 'December 18, 2024',
      readTime: '12 min read',
      category: 'Culture',
      image: '/api/placeholder/600/400',
      featured: true
    }
  ];

  const recentPosts = [
    {
      id: 3,
      title: 'Sustainable Travel: How Homestays Are Leading the Eco-Tourism Movement',
      excerpt: 'Explore how community-based homestays are promoting sustainable tourism and preserving local environments.',
      author: 'Eco Traveler',
      date: 'December 15, 2024',
      readTime: '6 min read',
      category: 'Sustainability',
      image: '/api/placeholder/400/250'
    },
    {
      id: 4,
      title: 'From Host to Friend: Building Meaningful Connections on the Road',
      excerpt: 'Heartwarming stories of travelers who found lifelong friendships through their homestay experiences.',
      author: 'Community Stories',
      date: 'December 12, 2024',
      readTime: '5 min read',
      category: 'Stories',
      image: '/api/placeholder/400/250'
    },
    {
      id: 5,
      title: 'The Art of Slow Travel: Why Homestays Beat Hotels Every Time',
      excerpt: 'Discover the benefits of slow travel and how homestays provide deeper, more meaningful travel experiences.',
      author: 'Slow Travel Expert',
      date: 'December 10, 2024',
      readTime: '7 min read',
      category: 'Travel Tips',
      image: '/api/placeholder/400/250'
    },
    {
      id: 6,
      title: 'Cooking with Locals: Homestay Culinary Adventures Across India',
      excerpt: 'Join us on a culinary journey through India\'s diverse regional cuisines, learned directly from local home chefs.',
      author: 'Food Explorer',
      date: 'December 8, 2024',
      readTime: '9 min read',
      category: 'Food & Culture',
      image: '/api/placeholder/400/250'
    },
    {
      id: 7,
      title: 'Digital Nomads Guide: Best Homestays for Remote Work in India',
      excerpt: 'Find the perfect homestays with reliable internet, peaceful workspaces, and inspiring environments for digital nomads.',
      author: 'Digital Nomad',
      date: 'December 5, 2024',
      readTime: '10 min read',
      category: 'Digital Nomads',
      image: '/api/placeholder/400/250'
    },
    {
      id: 8,
      title: 'Family Travel Made Easy: Kid-Friendly Homestays Across India',
      excerpt: 'Discover homestays that welcome families with open arms, offering safe and engaging experiences for children.',
      author: 'Family Traveler',
      date: 'December 3, 2024',
      readTime: '6 min read',
      category: 'Family Travel',
      image: '/api/placeholder/400/250'
    }
  ];

  const categories = [
    { name: 'All', count: 8, active: true },
    { name: 'Destinations', count: 1 },
    { name: 'Culture', count: 1 },
    { name: 'Sustainability', count: 1 },
    { name: 'Stories', count: 1 },
    { name: 'Travel Tips', count: 1 },
    { name: 'Food & Culture', count: 1 },
    { name: 'Digital Nomads', count: 1 },
    { name: 'Family Travel', count: 1 }
  ];

  const popularTags = [
    'Himalayas', 'Local Culture', 'Sustainable Travel', 'Cooking Classes', 
    'Digital Nomads', 'Family Travel', 'Mountain Retreats', 'Cultural Immersion',
    'Eco-Tourism', 'Slow Travel', 'Local Cuisine', 'Community Stories'
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Travel Stories & Insights
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Discover authentic travel experiences, local culture, and inspiring stories 
              from our community of hosts and travelers across India.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <BookOpenIcon className="w-5 h-5 mr-2" />
                <span>Travel Guides</span>
              </div>
              <div className="flex items-center">
                <HeartIcon className="w-5 h-5 mr-2" />
                <span>Local Stories</span>
              </div>
              <div className="flex items-center">
                <CameraIcon className="w-5 h-5 mr-2" />
                <span>Photo Stories</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Posts Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Stories</h2>
            <p className="text-lg text-gray-600">Our most popular and inspiring travel content</p>
          </div>
          <div className="grid lg:grid-cols-2 gap-8">
            {featuredPosts.map((post) => (
              <article key={post.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                  <div className="w-full h-64 bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
                    <CameraIcon className="w-16 h-16 text-blue-600" />
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-3">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                      {post.category}
                    </span>
                    <span className="text-sm text-gray-500">{post.date}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{post.title}</h3>
                  <p className="text-gray-600 mb-4">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <UserIcon className="w-4 h-4 mr-1" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center">
                      Read More
                      <ArrowRightIcon className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Categories and Content Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Categories */}
              <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
                <div className="space-y-2">
                  {categories.map((category, index) => (
                    <button
                      key={index}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        category.active 
                          ? 'bg-blue-100 text-blue-800 font-medium' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{category.name}</span>
                        <span className="text-sm text-gray-500">({category.count})</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Popular Tags */}
              <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag, index) => (
                    <button
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-blue-100 hover:text-blue-800 transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Newsletter Signup */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Stay Updated</h3>
                <p className="text-gray-600 mb-4 text-sm">
                  Get the latest travel stories and tips delivered to your inbox.
                </p>
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Latest Articles</h3>
                <p className="text-gray-600">Discover fresh perspectives on travel, culture, and authentic experiences</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {recentPosts.map((post) => (
                  <article key={post.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                      <div className="w-full h-48 bg-gradient-to-br from-green-100 to-blue-200 flex items-center justify-center">
                        <CameraIcon className="w-12 h-12 text-blue-600" />
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          {post.category}
                        </span>
                        <span className="text-xs text-gray-500">{post.date}</span>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{post.title}</h4>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-3">{post.excerpt}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <div className="flex items-center">
                            <UserIcon className="w-3 h-3 mr-1" />
                            <span>{post.author}</span>
                          </div>
                          <div className="flex items-center">
                            <ClockIcon className="w-3 h-3 mr-1" />
                            <span>{post.readTime}</span>
                          </div>
                        </div>
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                          Read More
                          <ArrowRightIcon className="w-3 h-3 ml-1" />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Load More Button */}
              <div className="text-center mt-12">
                <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                  Load More Articles
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Share Your Story</h2>
          <p className="text-lg text-gray-600 mb-8">
            Have a memorable homestay experience or travel story to share? 
            We'd love to hear from our community of travelers and hosts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              Submit Your Story
            </button>
            <button className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors">
              Become a Contributor
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
