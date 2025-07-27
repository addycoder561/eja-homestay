import { useState } from "react";
import { Modal } from "./Modal";
import { Input } from "./Input";
import { Button } from "./Button";
import { submitCollaboration } from "@/lib/database";
import { sendCollaborationNotification } from "@/lib/notifications";
import toast from "react-hot-toast";

const ROLE_OPTIONS = ["Host", "Traveler", "Corporate", "Brand"];
const TYPE_LABELS = {
  create: "Share your reel/story link or idea",
  retreat: "Describe your retreat idea",
  campaign: "Describe your impact campaign idea",
};

export function CollabFormModal({ open, onClose, type, onSuccess }: {
  open: boolean;
  onClose: () => void;
  type: "create" | "retreat" | "campaign";
  onSuccess?: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(ROLE_OPTIONS[0]);
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await submitCollaboration({ type, name, email, role, details });
    if (!error) {
      await sendCollaborationNotification({ type, name, email, role, details });
    }
    setLoading(false);
    if (error) {
      console.error('Collaboration submission error:', error);
      if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' && error.message.includes('table not found')) {
        toast.error("Database setup incomplete. Please contact support.");
      } else {
        toast.error("Submission failed. Please try again.");
      }
    } else {
      setSubmitted(true);
      if (onSuccess) onSuccess();
    }
  };

  const reset = () => {
    setName("");
    setEmail("");
    setRole(ROLE_OPTIONS[0]);
    setDetails("");
    setSubmitted(false);
    onClose();
  };

  return (
    <Modal open={open} onClose={reset} title={submitted ? "Thank You!" : `Collaborate: ${type.charAt(0).toUpperCase() + type.slice(1)}` }>
      {submitted ? (
        <div className="text-center py-8">
          <div className="text-3xl mb-4">🎉</div>
          <div className="text-lg font-semibold mb-2">Thank you for your interest!</div>
          <div className="text-gray-600 mb-6">We&apos;ll get in touch soon to explore this collaboration.</div>
          <Button onClick={reset} className="w-full">Close</Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Who are you?</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              value={role}
              onChange={e => setRole(e.target.value)}
              required
            >
              {ROLE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <Input
            label={TYPE_LABELS[type]}
            value={details}
            onChange={e => setDetails(e.target.value)}
            required
          />
          <Button type="submit" className="w-full" loading={loading} disabled={loading}>
            Submit
          </Button>
        </form>
      )}
    </Modal>
  );
} 