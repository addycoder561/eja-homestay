"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { CollabFormModal } from "@/components/ui/CollabFormModal";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { 
  HeartIcon,
  SparklesIcon,
  GlobeAltIcon,
  UserGroupIcon,
  ArrowRightIcon,
  PlayIcon,
  PauseIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  StarIcon,
  MapPinIcon,
  CalendarIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

const carouselItems = [
  {
    img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800",
    phrase: "Share a Story",
    description: "Tell us about your travel adventures and inspire others",
    icon: HeartIcon
  },
  {
    img: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800",
    phrase: "Scout New Hidden Gems",
    description: "Help us discover amazing off-the-beaten-path destinations",
    icon: MapPinIcon
  },
  {
    img: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800",
    phrase: "Host an Experience",
    description: "Share your skills and create unforgettable moments",
    icon: SparklesIcon
  },
  {
    img: "https://images.unsplash.com/photo-1464983953574-0892a716854b?w=800",
    phrase: "Tell Us About Your Village",
    description: "Showcase the beauty and culture of your hometown",
    icon: GlobeAltIcon
  },
  {
    img: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800",
    phrase: "Create Unforgettable Retreats",
    description: "Design transformative wellness and adventure experiences",
    icon: CalendarIcon
  },
  {
    img: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=800",
    phrase: "Inspire with Your Journey",
    description: "Share your personal growth and transformation stories",
    icon: StarIcon
  },
  {
    img: "https://images.unsplash.com/photo-1519121782439-2c5f2c2a3b89?w=800",
    phrase: "Bring Impactful Campaigns",
    description: "Help us create meaningful social impact initiatives",
    icon: UserGroupIcon
  },
];

const collaborationTypes = [
  {
    type: "create" as const,
    title: "Content Creation",
    description: "Share your stories, photos, and travel experiences",
    icon: HeartIcon,
    color: "from-pink-500 to-rose-500",
    features: [
      "Write travel blogs and articles",
      "Share stunning photography",
      "Create video content",
      "Document cultural experiences"
    ]
  },
  {
    type: "retreat" as const,
    title: "Retreat Hosting",
    description: "Design and lead transformative wellness experiences",
    icon: SparklesIcon,
    color: "from-purple-500 to-indigo-500",
    features: [
      "Wellness and yoga retreats",
      "Adventure and outdoor experiences",
      "Cultural immersion programs",
      "Skill-building workshops"
    ]
  },
  {
    type: "campaign" as const,
    title: "Campaign Collaboration",
    description: "Partner with us on impactful social initiatives",
    icon: UserGroupIcon,
    color: "from-green-500 to-emerald-500",
    features: [
      "Sustainable tourism campaigns",
      "Community development projects",
      "Environmental conservation",
      "Cultural preservation"
    ]
  }
];

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Travel Blogger",
    content: "Collaborating with EJA Homestay has been incredible. They truly value authentic stories and experiences.",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150"
  },
  {
    name: "Rajesh Kumar",
    role: "Retreat Host",
    content: "The platform has helped me reach amazing people and create meaningful wellness experiences.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
  },
  {
    name: "Maria Garcia",
    role: "Community Leader",
    content: "Working together on sustainable tourism initiatives has made a real difference in our village.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150"
  }
];

export default function CollaboratePage() {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [modalType, setModalType] = useState<null | "create" | "retreat" | "campaign">(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Auto-advance carousel
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setCarouselIndex((i) => (i + 1) % carouselItems.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPlaying, carouselItems.length]);

  // Auto-advance testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((i) => (i + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const nextSlide = () => {
    setCarouselIndex((i) => (i + 1) % carouselItems.length);
  };

  const prevSlide = () => {
    setCarouselIndex((i) => (i - 1 + carouselItems.length) % carouselItems.length);
  };

  const goToSlide = (index: number) => {
    setCarouselIndex(index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation />
      
      <main className="flex flex-col">
        {/* Hero Section */}
        <section className="relative py-20 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
          <div className="relative max-w-7xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mr-4">
                <HeartIcon className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Collaborate with Us
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto mb-8 leading-relaxed">
              Join our community of creators, hosts, and changemakers. Together, we're building a more connected and sustainable travel world.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold px-8 py-4 text-xl rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                onClick={() => setModalType("create")}
              >
                Start Creating
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-bold px-8 py-4 text-xl rounded-xl transition-all duration-300"
                onClick={() => setModalType("retreat")}
              >
                Host a Retreat
              </Button>
            </div>
          </div>
        </section>

        {/* Enhanced Carousel Section */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Ways to Collaborate</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover the many ways you can contribute to our growing community
              </p>
            </div>
            
            <div className="relative">
              {/* Carousel Container */}
              <div className="overflow-hidden rounded-2xl shadow-2xl bg-white">
                <div className="relative h-96 md:h-[500px]">
                  <Image
                    src={carouselItems[carouselIndex].img}
                    alt={carouselItems[carouselIndex].phrase}
                    fill
                    className="object-cover transition-all duration-700"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  
                  {/* Content Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
                        {(() => {
                          const IconComponent = carouselItems[carouselIndex].icon;
                          return <IconComponent className="w-6 h-6 text-white" />;
                        })()}
                      </div>
                      <h3 className="text-3xl md:text-4xl font-bold text-white">
                        {carouselItems[carouselIndex].phrase}
                      </h3>
                    </div>
                    <p className="text-white/90 text-lg md:text-xl max-w-2xl">
                      {carouselItems[carouselIndex].description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Carousel Controls */}
              <div className="absolute top-1/2 -translate-y-1/2 left-4">
                <button
                  onClick={prevSlide}
                  className="w-12 h-12 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110"
                >
                  <ChevronLeftIcon className="w-6 h-6 text-gray-700" />
                </button>
              </div>
              
              <div className="absolute top-1/2 -translate-y-1/2 right-4">
                <button
                  onClick={nextSlide}
                  className="w-12 h-12 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110"
                >
                  <ChevronRightIcon className="w-6 h-6 text-gray-700" />
                </button>
              </div>

              {/* Play/Pause Button */}
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300"
                >
                  {isPlaying ? (
                    <PauseIcon className="w-5 h-5 text-gray-700" />
                  ) : (
                    <PlayIcon className="w-5 h-5 text-gray-700" />
                  )}
                </button>
              </div>

              {/* Carousel Indicators */}
              <div className="flex justify-center gap-3 mt-6">
                {carouselItems.map((_, idx) => (
                  <button
                    key={idx}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      idx === carouselIndex 
                        ? "bg-blue-600 scale-125" 
                        : "bg-gray-300 hover:bg-gray-400"
                    }`}
                    onClick={() => goToSlide(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Collaboration Types Section */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Choose Your Path</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Select the type of collaboration that best fits your passion and expertise
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {collaborationTypes.map((collab) => (
                <div 
                  key={collab.type}
                  className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 overflow-hidden"
                >
                  <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${collab.color}`}></div>
                  
                  <div className="p-8">
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${collab.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      {(() => {
                        const IconComponent = collab.icon;
                        return <IconComponent className="w-8 h-8 text-white" />;
                      })()}
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{collab.title}</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">{collab.description}</p>
                    
                    <ul className="space-y-3 mb-8">
                      {collab.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-gray-700">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    
                    <Button
                      onClick={() => setModalType(collab.type)}
                      className={`w-full bg-gradient-to-r ${collab.color} hover:opacity-90 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform group-hover:scale-105`}
                    >
                      Get Started
                      <ArrowRightIcon className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 px-4 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Our Collaborators Say</h2>
              <p className="text-lg text-gray-600">
                Hear from amazing people who have joined our community
              </p>
            </div>
            
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 rounded-full overflow-hidden mr-4">
                    <Image
                      src={testimonials[currentTestimonial].avatar}
                      alt={testimonials[currentTestimonial].name}
                      width={64}
                      height={64}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">{testimonials[currentTestimonial].name}</h4>
                    <p className="text-blue-600 font-medium">{testimonials[currentTestimonial].role}</p>
                  </div>
                </div>
                
                <blockquote className="text-lg md:text-xl text-gray-700 italic leading-relaxed">
                  "{testimonials[currentTestimonial].content}"
                </blockquote>
                
                <div className="flex justify-center gap-2 mt-6">
                  {testimonials.map((_, idx) => (
                    <button
                      key={idx}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        idx === currentTestimonial 
                          ? "bg-blue-600 scale-125" 
                          : "bg-gray-300 hover:bg-gray-400"
                      }`}
                      onClick={() => setCurrentTestimonial(idx)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join our community of creators, hosts, and changemakers. Let's build something amazing together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-gray-100 font-bold px-8 py-4 text-xl rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                onClick={() => setModalType("create")}
              >
                Start Your Journey
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-bold px-8 py-4 text-xl rounded-xl transition-all duration-300"
                onClick={() => setModalType("retreat")}
              >
                Learn More
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
      
      <CollabFormModal 
        open={!!modalType} 
        onClose={() => setModalType(null)} 
        type={modalType || "create"} 
      />
    </div>
  );
} 