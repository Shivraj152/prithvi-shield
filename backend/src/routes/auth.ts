import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db/db';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_prithvi_shield_key_123';

// Cache for simulated OTPs (phone -> otp)
const otpCache = new Map<string, string>();

// Helper to sign JWT
const generateToken = (user: { id: number; email: string | null; phone: string | null; role: string }) => {
  return jwt.sign(
    { id: user.id, email: user.email, phone: user.phone, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// 1. REGISTER
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { email, phone, password, role, preferred_language } = req.body;

  if (!password || (!email && !phone)) {
    res.status(400).json({ error: 'Password and at least Email or Phone is required.' });
    return;
  }

  const selectedRole = role || 'Citizen';
  const selectedLang = preferred_language || 'en';

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO users (email, phone, password_hash, role, preferred_language)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, phone, role, preferred_language, created_at
    `;
    const values = [email || null, phone || null, passwordHash, selectedRole, selectedLang];
    
    const result = await pool.query(query, values);
    const newUser = result.rows[0];

    const token = generateToken(newUser);

    res.status(201).json({
      message: 'User registered successfully.',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        preferred_language: newUser.preferred_language,
        created_at: newUser.created_at
      }
    });
  } catch (error: any) {
    console.error('[Auth Register] Error:', error);
    if (error.code === '23505') {
      res.status(409).json({ error: 'User with this email or phone already exists.' });
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});

// 2. LOGIN (Email/Phone + Password)
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { identity, password } = req.body; // identity can be email or phone

  if (!identity || !password) {
    res.status(400).json({ error: 'Identity (email/phone) and password are required.' });
    return;
  }

  try {
    const query = `
      SELECT * FROM users 
      WHERE email = $1 OR phone = $1
    `;
    const result = await pool.query(query, [identity]);
    
    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Invalid credentials.' });
      return;
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid credentials.' });
      return;
    }

    const token = generateToken(user);

    res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        preferred_language: user.preferred_language,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('[Auth Login] Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 3. REQUEST OTP (for phone-based authentication)
router.post('/otp-request', async (req: Request, res: Response): Promise<void> => {
  const { phone } = req.body;

  if (!phone) {
    res.status(400).json({ error: 'Phone number is required.' });
    return;
  }

  try {
    // Generate a simple 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpCache.set(phone, otp);

    console.log(`[SMS Gateway Mock] Sending OTP ${otp} to phone ${phone}`);
    // In production, this would triggerMSG91/Twilio.

    res.json({
      message: 'OTP dispatched successfully.',
      phone,
      // We expose the OTP in development mode for easy testing without reading terminal logs
      debugOtp: process.env.NODE_ENV !== 'production' ? otp : undefined
    });
  } catch (error) {
    console.error('[Auth OTP Request] Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 4. VERIFY OTP (OTP login / signup)
router.post('/otp-verify', async (req: Request, res: Response): Promise<void> => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    res.status(400).json({ error: 'Phone number and OTP are required.' });
    return;
  }

  try {
    const cachedOtp = otpCache.get(phone);

    if (!cachedOtp || cachedOtp !== otp) {
      res.status(401).json({ error: 'Invalid or expired OTP.' });
      return;
    }

    // OTP verified, clear it from cache
    otpCache.delete(phone);

    // Check if user already exists
    const checkUserQuery = `SELECT * FROM users WHERE phone = $1`;
    const checkResult = await pool.query(checkUserQuery, [phone]);

    let user;

    if (checkResult.rows.length === 0) {
      // Auto-register citizen if doesn't exist
      const defaultHash = await bcrypt.hash('password123', 10);
      const insertUserQuery = `
        INSERT INTO users (phone, password_hash, role, preferred_language)
        VALUES ($1, $2, 'Citizen', 'en')
        RETURNING id, email, phone, role, preferred_language, created_at
      `;
      const insertResult = await pool.query(insertUserQuery, [phone, defaultHash]);
      user = insertResult.rows[0];
    } else {
      user = checkResult.rows[0];
    }

    const token = generateToken(user);

    res.json({
      message: 'OTP verified and login successful.',
      token,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        preferred_language: user.preferred_language,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('[Auth OTP Verify] Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
