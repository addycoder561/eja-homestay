'use client';

import { useEffect, useState } from 'react';
import supabase from '@/lib/supabase';

export default function TestListingsPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchListings() {
      const { data, error } = await supabase.from('listings').select('*');
      if (error) {
        console.error('Error fetching listings:', error.message);
      } else {
        setListings(data || []);
      }
      setLoading(false);
    }

    fetchListings();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Listings (Test)</h1>
      <ul className="space-y-2">
        {listings.map((listing) => (
          <li key={listing.id} className="border p-4 rounded-md">
            <strong>{listing.title}</strong><br />
            {listing.description}
          </li>
        ))}
      </ul>
    </div>
  );
}
