import { useState } from 'react';

interface SupportModalProps {
  open: boolean;
  onClose: () => void;
}

type SupportAction = 'check-status' | 'raise-ticket';

export function SupportModal({ open, onClose }: SupportModalProps) {
  const [action, setAction] = useState<SupportAction>('raise-ticket');
  const [tripId, setTripId] = useState('');
  const [otp, setOtp] = useState('');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleClose = () => {
    setSubmitted(false);
    setTripId('');
    setOtp('');
    setTicketSubject('');
    setTicketDescription('');
    setAction('raise-ticket');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={handleClose}>&times;</button>
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-900">Support</h2>
        
        {!submitted ? (
          <div className="space-y-6">
            {/* Action Selection */}
            <div>
              <div className="flex space-x-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="action"
                    value="raise-ticket"
                    checked={action === 'raise-ticket'}
                    onChange={(e) => setAction(e.target.value as SupportAction)}
                    className="h-4 w-4 text-yellow-500 focus:ring-yellow-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-900">Raise Ticket</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="action"
                    value="check-status"
                    checked={action === 'check-status'}
                    onChange={(e) => setAction(e.target.value as SupportAction)}
                    className="h-4 w-4 text-yellow-500 focus:ring-yellow-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-900">Check Status</span>
                </label>
              </div>
            </div>

            {/* Check Status Form */}
            {action === 'check-status' && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">Trip ID</label>
                  <input
                    type="text"
                    value={tripId}
                    onChange={e => setTripId(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-600"
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
                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-600"
                    placeholder="Enter OTP"
                  />
                </div>
                <button type="submit" className="w-full bg-yellow-500 text-white rounded py-2 font-bold hover:bg-yellow-600 transition">
                  Check Status
                </button>
              </form>
            )}

            {/* Raise Ticket Form */}
            {action === 'raise-ticket' && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">Trip ID (Optional)</label>
                  <input
                    type="text"
                    value={tripId}
                    onChange={e => setTripId(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-600"
                    placeholder="Enter your Trip ID (if applicable)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">Subject</label>
                  <input
                    type="text"
                    value={ticketSubject}
                    onChange={e => setTicketSubject(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-600"
                    placeholder="Brief description of your issue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">Description</label>
                  <textarea
                    value={ticketDescription}
                    onChange={e => setTicketDescription(e.target.value)}
                    required
                    rows={4}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-600 resize-none"
                    placeholder="Please provide detailed information about your issue..."
                  />
                </div>
                <button type="submit" className="w-full bg-yellow-500 text-white rounded py-2 font-bold hover:bg-yellow-600 transition">
                  Raise Ticket
                </button>
              </form>
            )}
          </div>
        ) : (
          <div className="text-center">
            <div className="text-3xl mb-4">
              {action === 'check-status' ? '⏳' : '📋'}
            </div>
            <div className="font-bold text-lg mb-2 text-gray-900">
              {action === 'check-status' ? 'Status Check Requested' : 'Support Ticket Raised'}
            </div>
            <div className="text-gray-800 mb-4">
              {action === 'check-status' ? (
                <>
                  Your status check for Trip ID <span className="font-mono font-semibold">{tripId}</span> is being processed.
                </>
              ) : (
                <>
                  Your support ticket has been submitted successfully.
                  {tripId && (
                    <div className="mt-2">
                      Trip ID: <span className="font-mono font-semibold">{tripId}</span>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="text-yellow-600 font-semibold">
              {action === 'check-status' ? 'Status ETA: 5 minutes' : 'Resolution ETA: 24 hours'}
            </div>
            <button className="mt-6 bg-gray-200 rounded px-4 py-2 font-bold" onClick={handleClose}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 