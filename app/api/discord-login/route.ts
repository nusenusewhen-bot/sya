import { NextRequest, NextResponse } from 'next/server';
import fetch from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';

export async function POST(req: NextRequest) {
  const { email, password, code, proxy } = await req.json();
  
  try {
    const proxyUrl = `http://${proxy}:8080`;
    const agent = new HttpsProxyAgent(proxyUrl);
    
    const loginRes = await fetch('https://discord.com/api/v9/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'X-Super-Properties': 'eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiQ2hyb21lIiwiZGV2aWNlIjoiIn0'
      },
      body: JSON.stringify({ login: email, password }),
      agent: agent as any
    });
    
    const loginData = await loginRes.json();
    
    if (loginData.token) {
      return NextResponse.json({ token: loginData.token });
    }
    
    if (loginData.ticket) {
      const mfaRes = await fetch('https://discord.com/api/v9/auth/mfa/totp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        body: JSON.stringify({
          ticket: loginData.ticket,
          code: code
        }),
        agent: agent as any
      });
      
      const mfaData = await mfaRes.json();
      return NextResponse.json({ token: mfaData.token });
    }
    
    return NextResponse.json({ error: 'Login failed' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Proxy failed' }, { status: 500 });
  }
}
