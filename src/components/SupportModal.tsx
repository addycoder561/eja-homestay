import { useState } from 'react';

interface SupportModalProps {
  open: boolean;
  onClose: () => void;
}

export function SupportModal({ open, onClose }: SupportModalProps) {
  const [tripId, setTripId] = useState('');
  const [otp, setOtp] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={onClose}>&times;</button>
        <h2 className="text-2xl font-bold mb-4 text-center">Support</h2>
        {!submitted ? (
          <form
            onSubmit={e => {
              e.preventDefault();
              setSubmitted(true);
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1">Trip ID</label>
              <input
                type="text"
                value={tripId}
                onChange={e => setTripId(e.target.value)}
                required
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="Enter your Trip ID"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1">OTP</label>
              <input
                type="text"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                required
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="Enter OTP"
              />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white rounded py-2 font-bold hover:bg-blue-700 transition">Check Status</button>
          </form>
        ) : (
          <div className="text-center">
            <div className="text-3xl mb-4">⏳</div>
            <div className="font-bold text-lg mb-2">Support Request Received</div>
            <div className="text-gray-700 mb-4">Your request for Trip ID <span className="font-mono">{tripId}</span> is being processed.</div>
            <div className="text-blue-600 font-semibold">Resolution ETA: 24 hours</div>
            <button className="mt-6 bg-gray-200 rounded px-4 py-2 font-bold" onClick={onClose}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
} 