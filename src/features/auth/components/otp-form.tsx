import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { api, getApiErrorMessage } from '../../../lib/api';

export default function VerifyOtpForm() {
  const [searchParams] = useSearchParams();
  const initialOtp = searchParams.get('otp') ?? '';
  const [email, setEmail] = useState(searchParams.get('email') ?? '');
  const [otp, setOtp] = useState<string[]>(initialOtp.length === 6 ? initialOtp.split('') : new Array(6).fill(''));
  const [timer, setTimer] = useState<number>(59);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer logic for code resend trigger
  useEffect(() => {
    if (timer === 0) return;
    const intervalId = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(intervalId);
  }, [timer]);

  // Handle number keystroke injection
  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return;

    const newOtp = [...otp];
    newOtp[index] = element.value.substring(element.value.length - 1);
    setOtp(newOtp);

    // Auto-focus next sequential box layout string
    if (element.value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle destructive deletions safely
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle structural clipboard drops (Pasting codes)
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (!/^\d{6}$/.test(pastedData)) return;

    const digits = pastedData.split('');
    setOtp(digits);
    inputRefs.current[5]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = otp.join('');
    if (fullCode.length === 6 && email.trim()) {
      setError(null);
      setIsSubmitting(true);
      try {
        await api.post('/api/auth/verify-otp', {
          email: email.trim(),
          otpCode: fullCode,
        });
      setIsVerified(true);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Verification failed. Please check your code.'));
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleResend = () => {
    setOtp(new Array(6).fill(''));
    setTimer(59);
    inputRefs.current[0]?.focus();
  };

  // Success view block layout
  if (isVerified) {
    return (
      <div className='min-h-screen bg-[#FAFAFB] flex items-center justify-center p-4'>
        <div className='w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-xl p-8 text-center space-y-6'>
          <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600'>
            <CheckCircle2 size={28} />
          </div>
          <div className='space-y-2'>
            <h1 className='text-2xl font-bold tracking-tight text-gray-900'>Identity Verified</h1>
            <p className='text-sm text-gray-500'>
              Your account is verified. You can now sign in with your new credentials.
            </p>
          </div>
          <button
            onClick={() => window.location.href = '/login'}
            className='w-full bg-[#127058] hover:bg-[#0e5845] text-white font-semibold py-3 px-4 rounded-xl transition-colors text-sm shadow-sm'
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[#FAFAFB] flex items-center justify-center p-4'>
      <div className='w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-xl p-8 space-y-6'>
        
        {/* Header Block with context rules */}
        <div className='text-center space-y-1.5'>
          <h1 className='text-2xl font-bold tracking-tight text-gray-900'>
            Verify Your Identity
          </h1>
          <p className='text-sm text-gray-500 leading-relaxed'>
            We've transmitted a 6-digit confirmation code to your secure inbox. Please enter the numbers below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='space-y-1.5'>
            <label className='text-sm font-semibold text-gray-700 block'>Email address</label>
            <input
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#127058] focus:bg-white focus:ring-2 focus:ring-[#127058]/10 transition-all'
              required
            />
          </div>
          {error && (
            <div className='p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium'>
              {error}
            </div>
          )}
          
          {/* Box Fields Row Grid */}
          <div className='flex justify-between items-center gap-2' onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                type='text'
                inputMode='numeric'
                maxLength={1}
                value={digit}
                ref={(el) => { inputRefs.current[index] = el; }}
                onChange={(e) => handleChange(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className='w-12 h-14 text-center text-xl font-bold bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#127058] focus:bg-white focus:ring-2 focus:ring-[#127058]/10 transition-all text-gray-900'
                required
              />
            ))}
          </div>

          {/* Code Dispatch Resend Trigger Context */}
          <div className='flex items-center justify-between text-xs font-medium px-0.5'>
            <span className='text-gray-400 flex items-center gap-1.5'>
              <ShieldAlert size={14} /> Expires soon
            </span>
            {timer > 0 ? (
              <span className='text-gray-500'>
                Resend code in <span className='font-bold text-gray-700'>0:{timer < 10 ? `0${timer}` : timer}</span>
              </span>
            ) : (
              <button
                type='button'
                onClick={handleResend}
                className='text-[#ef9f27] hover:text-[#d68a1d] font-bold transition-colors focus:outline-none'
              >
                Resend Code
              </button>
            )}
          </div>

          {/* Submission CTA using brand green */}
          <button
            type='submit'
            disabled={otp.some(val => val === '') || !email.trim() || isSubmitting}
            className='w-full bg-[#127058] hover:bg-[#0e5845] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-colors text-sm shadow-sm'
          >
            {isSubmitting ? 'Verifying...' : 'Verify Security Code'}
          </button>
        </form>

        {/* Back navigation loop bar */}
        <div className='border-t border-gray-100 pt-5 text-center'>
          <a 
            href='/forget-password' 
            className='inline-flex items-center justify-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#127058] transition-colors group'
          >
            <ArrowLeft size={16} className='transform group-hover:-translate-x-0.5 transition-transform text-gray-400 group-hover:text-[#127058]' />
            <span>Change email address</span>
          </a>
        </div>

      </div>
    </div>
  );
}
