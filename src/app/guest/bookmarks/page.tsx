"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getBookmarks, getProperty, removeBookmark } from "@/lib/database";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { PropertyWithHost } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";
import { useRef } from "react";

export default function MyBookmarksPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingIds, setRemovingIds] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getBookmarks(user.id).then(async (bms) => {
      setBookmarks(bms);
      // Fetch all item details in parallel
      const propertyIds = bms.filter(b => b.item_type === 'property').map(b => b.item_id);
      const experienceIds = bms.filter(b => b.item_type === 'experience').map(b => b.item_id);
      const tripIds = bms.filter(b => b.item_type === 'trip').map(b => b.item_id);
      const propertyDetails = await Promise.all(propertyIds.map(id => getProperty(id)));
      // Fetch experience details
      const experienceDetails = experienceIds.length > 0 ? await Promise.all(experienceIds.map(async id => {
        const { data } = await supabase.from('experiences').select('*').eq('id', id).single();
        return data ? { ...data, _type: 'experience' } : null;
      })) : [];
      // Fetch trip details
      const tripDetails = tripIds.length > 0 ? await Promise.all(tripIds.map(async id => {
        const { data } = await supabase.from('trips').select('*').eq('id', id).single();
        return data ? { ...data, _type: 'trip' } : null;
      })) : [];
      setItems([
        ...propertyDetails.filter(Boolean).map(p => ({ ...p, _type: 'property' })),
        ...experienceDetails.filter(Boolean),
        ...tripDetails.filter(Boolean),
      ]);
      setLoading(false);
    });
  }, [user]);

  if (!user) {
    return <div className="max-w-2xl mx-auto py-16 text-center text-gray-600">Please sign in to view your bookmarks.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">My Bookmarks</h1>
      {loading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-center text-gray-500">You have no bookmarks yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {items.map(item => {
            const isRemoving = removingIds.includes(item.id + '-' + item._type);
            return (
              <Card
                key={item.id + '-' + item._type}
                className={`group hover:shadow-lg transition-shadow duration-300 cursor-pointer relative transition-all duration-500 ${isRemoving ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}
                onClick={() => {
                  if (item._type === 'property') router.push(`/property/${item.id}`);
                  else if (item._type === 'experience') router.push(`/experiences/${item.id}`);
                  else if (item._type === 'trip') router.push(`/trips/${item.id}`);
                }}
              >
                <div className="relative h-40 overflow-hidden rounded-t-lg">
                  <img
                    src={item.images?.[0] || item.image || '/placeholder-property.jpg'}
                    alt={item.title}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                  <button
                    className="absolute top-2 right-2 z-10 p-1 rounded-full bg-white shadow hover:bg-red-100"
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (!user) return;
                      setRemovingIds(ids => [...ids, item.id + '-' + item._type]);
                      await removeBookmark(user.id, item.id, item._type);
                      setTimeout(() => {
                        setItems(items => items.filter(i => i.id !== item.id || i._type !== item._type));
                        setRemovingIds(ids => ids.filter(id => id !== item.id + '-' + item._type));
                      }, 400);
                    }}
                    aria-label="Remove bookmark"
                  >
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path d="M6 2a2 2 0 00-2 2v14l6-3 6 3V4a2 2 0 00-2-2H6z" /></svg>
                  </button>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors mb-2">{item.title}</h3>
                  {item._type === 'property' && (
                    <div className="text-gray-600 text-sm mb-1">{item.city}, {item.country}</div>
                  )}
                  {item._type === 'experience' && (
                    <div className="text-gray-600 text-sm mb-1">{item.location}</div>
                  )}
                  {item._type === 'trip' && (
                    <div className="text-gray-600 text-sm mb-1">{item.location}</div>
                  )}
                  <div className="text-gray-700 text-sm">{item.description?.slice(0, 80)}...</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
} 