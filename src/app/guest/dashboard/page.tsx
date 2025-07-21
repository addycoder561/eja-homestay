'use client';

import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

export default function GuestDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-2">My Trips</h2>
            <p className="text-gray-600">(Coming soon) View and manage your upcoming and past trips.</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-2">Bookmarks</h2>
            <p className="text-gray-600">(Coming soon) View your saved properties.</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-2">Messages</h2>
            <p className="text-gray-600">(Coming soon) View and send messages to hosts.</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-2">Profile</h2>
            <p className="text-gray-600">(Coming soon) Update your name, email, phone, and password.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 