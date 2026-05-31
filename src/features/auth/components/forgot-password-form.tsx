import { useState } from 'react';
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import { api, getApiErrorMessage } from '../../../lib/api';

export default function ForgetPasswordForm() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await api.post('/api/auth/forgot-password', { email: email.trim() });
      setIsSubmitted(true);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not send the reset code. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  // Success State View
  if (isSubmitted) {
    return (
      <div className='min-h-screen bg-[#FAFAFB] flex items-center justify-center p-4'>
        <div className='w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-xl p-8 text-center space-y-6 animate-fade-in'>
          <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600'>
            <CheckCircle2 size={28} />
          </div>
          <div className='space-y-2'>
            <h1 className='text-2xl font-bold tracking-tight text-gray-900'>
              Check your email
            </h1>
            <p className='text-sm text-gray-500 leading-relaxed'>
              We have sent a secure password reset code to{' '}
              <span className='font-semibold text-gray-900'>{email}</span>.
            </p>
          </div>
          <div className='pt-2'>
            <a
              href={`/ResetPassword?email=${encodeURIComponent(email)}`}
              className='w-full inline-flex items-center justify-center gap-2 bg-[#127058] hover:bg-[#0e5845] text-white font-semibold py-3 px-4 rounded-xl transition-colors text-sm'
            >
              Enter reset code
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Initial Form View
  return (
    <div className='min-h-screen bg-[#FAFAFB] flex items-center justify-center p-4'>
      <div className='w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-xl p-8 space-y-6'>
        {/* Header section with brand context */}
        <div className='text-center space-y-1.5'>
          <h1 className='text-2xl font-bold tracking-tight text-gray-900'>
            Forgot Your Password?
          </h1>
          <p className='text-sm text-gray-500 leading-relaxed'>
            No worries! Enter your registered email address below and we'll send
            you a secure link to reset it.
          </p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          {error && (
            <div className='p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium'>
              {error}
            </div>
          )}
          {/* Email Field Wrapper */}
          <div className='space-y-1.5'>
            <label className='text-sm font-semibold text-gray-700 block'>
              Email address
            </label>
            <div className='relative flex items-center'>
              <span className='absolute left-3.5 text-gray-400'>
                <Mail size={18} />
              </span>
              <input
                type='email'
                placeholder='name@company.com'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className='w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#127058] focus:bg-white focus:ring-2 focus:ring-[#127058]/10 transition-all'
              />
            </div>
          </div>

          {/* Submit Button using custom orange color #ef9f27 */}
          <button
            type='submit'
            disabled={isLoading}
            className='w-full !mt-6 bg-[#ef9f27] hover:bg-[#d68a1d] text-white font-semibold py-3 px-4 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 group shadow-sm'
          >
            <span>{isLoading ? 'Sending...' : 'Send Reset Code'}</span>
          </button>
        </form>

        {/* Simplified and integrated bottom link section */}
        <div className='border-t border-gray-100 pt-5 text-center'>
          <a
            href='/login'
            className='inline-flex items-center justify-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#127058] transition-colors group'
          >
            <ArrowLeft
              size={16}
              className='transform group-hover:-translate-x-0.5 transition-transform text-gray-400 group-hover:text-[#127058]'
            />
            <span>Back to login</span>
          </a>
        </div>
      </div>
    </div>
  );
}
