import { Router, Request, Response } from 'express';
import pool from '../config/database';
import { QueryResult } from 'pg';
import nodemailer from 'nodemailer';

const router = Router();


const otpStore: Map<string, { otp: string; expires: Date }> = new Map();


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Generate 6-digit OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result: QueryResult = await pool.query(
      'SELECT id, name, email, role, contact_info, flat_number FROM users WHERE email = $1 AND password = $2',
      [email, password]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        fullName: user.name,
        email: user.email,
        role: user.role,
        contactInfo: user.contact_info,
        flatNumber: user.flat_number
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, contactInfo, flatNumber } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password, and role are required' });
    }

    const existing: QueryResult = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    await pool.query(
      'INSERT INTO users (name, email, password, role, contact_info, flat_number) VALUES ($1, $2, $3, $4, $5, $6)',
      [name, email, password, role, contactInfo || null, flatNumber || null]
    );

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.post('/google-login', async (req: Request, res: Response) => {
  try {
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: 'Email and name are required' });
    }

   
    const result: QueryResult = await pool.query(
      'SELECT id, name, email, role, contact_info, flat_number FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      
      return res.status(404).json({ error: 'Account not found. Please sign up first.' });
    }

   
    const user = result.rows[0];
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        fullName: user.name,
        email: user.email,
        role: user.role,
        contactInfo: user.contact_info,
        flatNumber: user.flat_number
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/send-otp', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    
    const result: QueryResult = await pool.query(
      'SELECT id, name FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Email not found' });
    }

    const otp = generateOTP();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    otpStore.set(email, { otp, expires });

  
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Password Reset OTP - Visitor Management System',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px;">
          <h2 style="color: #667eea;">Password Reset OTP</h2>
          <p>Hello ${result.rows[0].name},</p>
          <p>Your OTP for password reset is:</p>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #333;">
            ${otp}
          </div>
          <p style="color: #666; margin-top: 20px;">This OTP is valid for 10 minutes.</p>
          <p style="color: #999;">If you didn't request this, please ignore this email.</p>
        </div>
      `
    });

    res.json({ message: 'OTP sent to your email' });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});


router.post('/verify-otp', async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const storedData = otpStore.get(email);

    if (!storedData) {
      return res.status(400).json({ error: 'OTP expired or not found. Please request a new one.' });
    }

    if (new Date() > storedData.expires) {
      otpStore.delete(email);
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    if (storedData.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'Email, OTP and new password are required' });
    }

  
    const storedData = otpStore.get(email);
    if (!storedData || storedData.otp !== otp || new Date() > storedData.expires) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

   
    await pool.query(
      'UPDATE users SET password = $1 WHERE email = $2',
      [newPassword, email]
    );

 
    otpStore.delete(email);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

export default router;
