import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import toast from 'react-hot-toast';

interface AuthModalProps {
  open: boolean;
  mode: 'login' | 'signup';
  onClose: () => void;
  onSwitchMode: (mode: 'login' | 'signup') => void;
}

export function AuthModal({ open, mode, onClose, onSwitchMode }: AuthModalProps) {
  const { signIn, signUp } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [formError, setFormError] = useState('');
  const [showSignupLink, setShowSignupLink] = useState(false);

  if (!open) return null;

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, email: e.target.value });
    setEmailError('');
    setFormError('');
    setShowSignupLink(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError('');
    setShowSignupLink(false);

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setEmailError('Please enter a valid email address');
      setLoading(false);
      return;
    } else {
      setEmailError('');
    }

    if (mode === 'login') {
      try {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          if (error.message && error.message.toLowerCase().includes('user')) {
            setFormError("User doesn’t exist");
            setShowSignupLink(true);
          } else {
            setFormError(error.message || 'Failed to sign in');
          }
        } else {
          toast.success('Signed in successfully!');
          onClose();
        }
      } catch (err) {
        setFormError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    } else {
      // Signup
      if (formData.password !== formData.confirmPassword) {
        setFormError('Passwords do not match');
        setLoading(false);
        return;
      }
      if (formData.password.length < 6) {
        setFormError('Password must be at least 6 characters long');
        setLoading(false);
        return;
      }
      try {
        const { error } = await signUp(formData.email, formData.password, formData.fullName, 'guest');
        console.log('Signup error:', error); // DEBUG LOG
        if (error) {
          setFormError(error.message || 'Failed to create account');
        } else {
          toast.success('Account created and logged in!');
          onClose();
        }
      } catch (err) {
        setFormError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={onClose}>&times;</button>
        <h3 className="text-xl font-bold mb-4 text-center">{mode === 'login' ? 'Log In' : 'Sign Up'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <Input
              label="Full name"
              type="text"
              required
              value={formData.fullName}
              onChange={e => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Enter your full name"
            />
          )}
          <Input
            label="Email address"
            type="email"
            required
            value={formData.email}
            onChange={handleEmailChange}
            placeholder="Enter your email"
            error={emailError}
          />
          <Input
            label="Password"
            type="password"
            required
            value={formData.password}
            onChange={e => setFormData({ ...formData, password: e.target.value })}
            placeholder={mode === 'login' ? 'Enter your password' : 'Create a password'}
          />
          {mode === 'signup' && (
            <Input
              label="Confirm password"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="Confirm your password"
            />
          )}
          {formError && <div className="text-red-600 text-sm text-center font-semibold">{formError}</div>}
          <Button type="submit" loading={loading} className="w-full">
            {mode === 'login' ? 'Log In' : 'Sign Up'}
          </Button>
        </form>
        {showSignupLink && mode === 'login' && (
          <div className="mt-4 text-center">
            <span className="text-gray-700">Don’t have an account?</span>{' '}
            <button
              className="text-blue-600 font-bold underline ml-1 hover:text-blue-800"
              onClick={() => { setFormError(''); setShowSignupLink(false); onSwitchMode('signup'); }}
            >
              Sign up instead?
            </button>
          </div>
        )}
        {mode === 'signup' && (
          <div className="mt-4 text-center">
            <span className="text-gray-700">Already have an account?</span>{' '}
            <button
              className="text-blue-600 font-bold underline ml-1 hover:text-blue-800"
              onClick={() => { setFormError(''); setShowSignupLink(false); onSwitchMode('login'); }}
            >
              Log in instead
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 