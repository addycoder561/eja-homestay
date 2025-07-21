'use client';

import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

export default function HostDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Host Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-2">Stats</h2>
            <p className="text-gray-600">(Coming soon) Overview of your bookings, revenue, and occupancy.</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-2">Bookings</h2>
            <p className="text-gray-600">(Coming soon) Manage your bookings and guest messages.</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-2">Listings</h2>
            <p className="text-gray-600">(Coming soon) View, edit, or delete your property listings.</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-2">Profile</h2>
            <p className="text-gray-600">(Coming soon) Update your name, email, phone, and password.</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-2">Payments</h2>
            <p className="text-gray-600">(Coming soon) Withdraw funds and view payment history.</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-2">Calendar</h2>
            <p className="text-gray-600">(Coming soon) Manage your property availability.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 