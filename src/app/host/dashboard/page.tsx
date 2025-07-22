'use client';

import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { useEffect, useState, useMemo } from 'react';
import { getHostBookings } from '@/lib/database';
import { useAuth } from '@/contexts/AuthContext';
import { saveAs } from 'file-saver';

export default function HostDashboard() {
  const { user, profile } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const fetchBookings = async () => {
      if (!profile?.id) return;
      setLoading(true);
      const data = await getHostBookings(profile.id);
      setBookings(data || []);
      setLoading(false);
    };
    if (profile?.id) fetchBookings();
  }, [profile?.id]);

  const filteredBookings = useMemo(() => {
    if (statusFilter === 'all') return bookings;
    return bookings.filter(b => b.status === statusFilter);
  }, [bookings, statusFilter]);

  const exportCSV = () => {
    const rows = [
      ['Booking ID', 'Guest', 'Property', 'Check-in', 'Check-out', 'Guests', 'Total Price', 'Status', 'Payment Ref'],
      ...filteredBookings.map(b => [
        b.id,
        b.guest_id,
        b.property?.title || '',
        b.check_in_date,
        b.check_out_date,
        b.guests_count,
        b.total_price,
        b.status,
        b.payment_ref || b.razorpay_payment_id || ''
      ])
    ];
    const csv = rows.map(r => r.map(String).map(x => `"${x.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'host_bookings.csv');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Host Dashboard</h1>
        <div className="mb-6 flex flex-wrap gap-2 items-center">
          <span className="font-semibold text-gray-700 mr-2">Filter by status:</span>
          {['all', 'paid', 'pending', 'failed', 'cancelled'].map((status) => (
            <button
              key={status}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${statusFilter === status ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'}`}
              onClick={() => setStatusFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
          <button
            className="ml-auto px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition-colors text-sm font-semibold"
            onClick={exportCSV}
            disabled={filteredBookings.length === 0}
          >
            Export CSV
          </button>
        </div>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-lg text-gray-700">No bookings found for this status.</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Booking ID</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Guest</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Property</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Check-in</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Check-out</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Guests</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Total Price</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Payment Ref</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map(b => (
                  <tr key={b.id} className="border-b">
                    <td className="px-4 py-2 text-xs text-gray-700">{b.id}</td>
                    <td className="px-4 py-2 text-xs text-gray-700">{b.guest_id}</td>
                    <td className="px-4 py-2 text-xs text-gray-700">{b.property?.title || ''}</td>
                    <td className="px-4 py-2 text-xs text-gray-700">{b.check_in_date}</td>
                    <td className="px-4 py-2 text-xs text-gray-700">{b.check_out_date}</td>
                    <td className="px-4 py-2 text-xs text-gray-700">{b.guests_count}</td>
                    <td className="px-4 py-2 text-xs text-gray-700">₹{b.total_price}</td>
                    <td className="px-4 py-2 text-xs text-gray-700">{b.status}</td>
                    <td className="px-4 py-2 text-xs text-gray-700">{b.payment_ref || b.razorpay_payment_id || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
} 