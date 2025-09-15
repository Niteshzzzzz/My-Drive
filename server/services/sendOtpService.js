import OTP from "../models/otpModel.js"
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

export const sendOtpService = async (email) => {
    const otp = Math.floor(Math.random() * 9000 + 1000).toString()

    await OTP.findOneAndUpdate({ email }, { otp, createdAt: new Date() }, { upsert: true })

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '465', 10),
    secure: (process.env.EMAIL_SECURE || 'true') === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

    const html = `
<div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px;">
  <div style="max-width: 500px; margin: auto; background: #ffffff; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); padding: 25px; text-align: center;">
    
    <h2 style="color: #333;">🔐 Your One-Time Password (OTP)</h2>
    
    <p style="font-size: 16px; color: #555;">
      Use the OTP below to complete your verification:
    </p>
    
    <div style="font-size: 28px; font-weight: bold; color: #2e86de; background: #eaf3ff; display: inline-block; padding: 12px 24px; border-radius: 8px; margin: 20px 0;">
      ${otp}
    </div>
    
    <p style="font-size: 14px; color: #666;">
      ⏳ This OTP is valid for <strong>5 minutes</strong>.
    </p>
    
    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
    
    <p style="font-size: 12px; color: #999;">
      ⚠️ Do not share this OTP with anyone. Our team will never ask you for it.
    </p>
  </div>
</div>
`;

  try {
    const info = await transporter.sendMail({
      from: `"Storage App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your One Time Password (OTP) for Storage App",
      html: html,
    });
    console.log("Message sent:", info.messageId);
  } catch (err) {
    console.error('Failed to send OTP email', err);
    throw err;
  }

}