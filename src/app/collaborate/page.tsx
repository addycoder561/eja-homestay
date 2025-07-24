"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { CollabFormModal } from "@/components/ui/CollabFormModal";

const carouselItems = [
  {
    img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800",
    phrase: "Share a Story",
  },
  {
    img: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800",
    phrase: "Scout New Hidden Gems",
  },
  {
    img: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800",
    phrase: "Host an Experience",
  },
  {
    img: "https://images.unsplash.com/photo-1464983953574-0892a716854b?w=800",
    phrase: "Tell Us About Your Village",
  },
  {
    img: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800",
    phrase: "Create Unforgettable Retreats",
  },
  {
    img: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=800",
    phrase: "Inspire with Your Journey",
  },
  {
    img: "https://images.unsplash.com/photo-1519121782439-2c5f2c2a3b89?w=800",
    phrase: "Bring Impactful Campaigns",
  },
];

export default function CollaboratePage() {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [modalType, setModalType] = useState<null | "create" | "retreat" | "campaign">(null);

  // Simple auto-advance
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useState(() => {
    const interval = setInterval(() => {
      setCarouselIndex((i) => (i + 1) % carouselItems.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-4">
      <h1 className="text-4xl font-bold text-center mb-8 text-blue-700">Collaborate with Us</h1>
      {/* Carousel */}
      <div className="w-full max-w-2xl mx-auto mb-8 relative">
        <div className="overflow-hidden rounded-xl shadow-lg h-64 flex items-center justify-center bg-white">
          <Image
            src={carouselItems[carouselIndex].img}
            alt={carouselItems[carouselIndex].phrase}
            width={600}
            height={256}
            className="object-cover w-full h-full transition-all duration-700"
            priority
          />
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 py-4 px-6">
            <p className="text-white text-2xl font-semibold text-center">
              {carouselItems[carouselIndex].phrase}
            </p>
          </div>
        </div>
        {/* Carousel controls */}
        <div className="flex justify-center gap-2 mt-2">
          {carouselItems.map((_, idx) => (
            <button
              key={idx}
              className={`w-3 h-3 rounded-full ${idx === carouselIndex ? "bg-blue-600" : "bg-gray-300"}`}
              onClick={() => setCarouselIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
      {/* Collaboration Options */}
      <div className="flex flex-col md:flex-row gap-4 justify-center mb-12">
        <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 text-xl rounded-lg shadow" onClick={() => setModalType("create")}>Create</Button>
        <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-4 text-xl rounded-lg shadow" onClick={() => setModalType("retreat")}>Retreat</Button>
        <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-8 py-4 text-xl rounded-lg shadow" onClick={() => setModalType("campaign")}>Campaign</Button>
      </div>
      <p className="text-center text-gray-600 max-w-xl mx-auto text-lg">
        Hosts, Travelers, Corporates, Brands—everyone is welcome to collaborate. Let’s create something amazing together!
      </p>
      <CollabFormModal open={!!modalType} onClose={() => setModalType(null)} type={modalType || "create"} />
    </div>
  );
} 