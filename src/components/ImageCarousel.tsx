"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface ImageCarouselProps {
  images: string[];
  alt: string;
  className?: string;
  placeholder?: string;
}

export function ImageCarousel({ images, alt, className = "", placeholder = "/placeholder-experience.jpg" }: ImageCarouselProps) {
  const sourceImages = useMemo(() => {
    const arr = (images || []).filter(Boolean);
    return arr.length > 0 ? Array.from(new Set(arr)) : [placeholder];
  }, [images, placeholder]);

  const [index, setIndex] = useState(0);

  const goPrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIndex((prev) => (prev - 1 + sourceImages.length) % sourceImages.length);
  };

  const goNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIndex((prev) => (prev + 1) % sourceImages.length);
  };

  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`}>
      <Image
        src={sourceImages[index]}
        alt={alt}
        fill
        className="object-cover select-none"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />

      {sourceImages.length > 1 && (
        <>
          <button
            aria-label="Previous image"
            onClick={goPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/35 hover:bg-black/50 p-1.5 text-white transition"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <button
            aria-label="Next image"
            onClick={goNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/35 hover:bg-black/50 p-1.5 text-white transition"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1">
            {sourceImages.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-1.5 rounded-full ${i === index ? "bg-white" : "bg-white/50"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}


