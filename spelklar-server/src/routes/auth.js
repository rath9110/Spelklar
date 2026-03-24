const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const https = require('https');
const { generateToken, verifyAuth } = require('../middleware/auth');
const { prisma } = require('../db');

// Store for OTP codes (in production, use a cache like Redis)
const otpStore = new Map();

// Send SMS via 46elks API
async function sendSmsVia46elks(phone, message) {
  return new Promise((resolve, reject) => {
    const postData = new URLSearchParams({
      from: 'Spelklar',
      to: phone,
      message: message,
    });

    const options = {
      hostname: 'api.46elks.com',
      path: '/a1/SMS',
      method: 'POST',
      auth: `${process.env.SMS_USERNAME}:${process.env.SMS_PASSWORD}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': postData.toString().length,
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(body);
        } else {
          reject(new Error(`46elks API error: ${res.statusCode}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData.toString());
    req.end();
  });
}

// Request OTP
router.post('/request-otp', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || !phone.match(/^\+46\d{6,9}$/)) {
      return res.status(400).json({ error: 'Invalid Swedish phone number (format: +46XXXXXXXXX)' });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Store code with 5-minute expiry
    otpStore.set(phone, {
      code,
      createdAt: Date.now(),
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    // Send via 46elks SMS API (if configured)
    if (process.env.SMS_USERNAME && process.env.SMS_PASSWORD) {
      try {
        await sendSmsVia46elks(phone, `Din Spelklar kod: ${code}`);
      } catch (smsErr) {
        console.error('Failed to send SMS:', smsErr);
        // Still allow them to continue (log to console instead)
        console.log(`🔐 OTP for ${phone}: ${code}`);
      }
    } else {
      // Development mode: log it (unsafe for production!)
      console.log(`🔐 OTP for ${phone}: ${code}`);
    }

    res.json({
      success: true,
      message: 'OTP sent to phone',
      // In demo mode, return the code for testing; remove for production
      ...(process.env.DEMO_MODE === 'true' || process.env.NODE_ENV === 'development') && { code },
    });
  } catch (err) {
    console.error('Error requesting OTP:', err);
    res.status(500).json({ error: 'Failed to request OTP' });
  }
});

// Verify OTP and create/update user
router.post('/verify-otp', async (req, res) => {
  console.log('=== /verify-otp endpoint called ===');
  console.log('Body:', req.body);

  try {
    const { phone, code } = req.body;
    console.log(`[1] Extracted phone=${phone}, code=${code}`);

    if (!phone || !code) {
      console.log('[2] Missing phone or code');
      return res.status(400).json({ error: 'Phone and code are required' });
    }

    // In demo mode, accept any OTP code (useful for testing)
    // Explicit DEMO_MODE env var takes precedence, otherwise check development or missing SMS creds
    const isDemoMode =
      process.env.DEMO_MODE?.toLowerCase() === 'true' ||
      process.env.NODE_ENV === 'development' ||
      !process.env.SMS_USERNAME;

    console.log(`[3] isDemoMode=${isDemoMode}`);
    console.log(`    NODE_ENV=${process.env.NODE_ENV}`);
    console.log(`    DEMO_MODE=${process.env.DEMO_MODE}`);
    console.log(`    SMS_USERNAME exists: ${!!process.env.SMS_USERNAME}`);

    if (!isDemoMode) {
      console.log('[4a] PRODUCTION MODE - validating OTP code');
      // Production mode: strict OTP validation
      const otpData = otpStore.get(phone);
      console.log(`[4b] otpData found: ${!!otpData}`);
      if (!otpData || otpData.code !== code || Date.now() > otpData.expiresAt) {
        console.log('[4c] OTP validation failed');
        return res.status(401).json({ error: 'Invalid or expired OTP' });
      }
      // OTP is valid, delete it
      otpStore.delete(phone);
    } else {
      console.log('[4a] DEMO MODE - accepting any code');
      // Demo mode: accept any code, just log it
      const otpData = otpStore.get(phone);
      if (otpData) {
        otpStore.delete(phone);
      }
      console.log(`[4b] ✓ Demo mode: OTP accepted (${code}) for ${phone}`);
    }

    // Find or create user
    console.log('[5] Finding or creating user');
    let user = await prisma.user.findUnique({
      where: { phone },
    });
    console.log(`[6] User lookup result: ${user ? 'found' : 'not found'}`);

    if (!user) {
      console.log('[7] Creating new user');
      user = await prisma.user.create({
        data: {
          phone,
          displayName: `User ${phone.slice(-4)}`, // Placeholder
          role: 'visitor',
        },
      });
      console.log('[8] User created:', user.id);
    }

    // Update last login
    console.log('[9] Updating last login');
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });
    console.log('[10] Login timestamp updated');

    // Generate JWT
    console.log('[11] Generating JWT');
    const token = generateToken(user.id, user.role);
    console.log('[12] JWT generated');

    // Set httpOnly cookie
    console.log('[13] Setting httpOnly cookie');
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    console.log('[14] Cookie set');

    console.log('[15] Sending success response');
    res.json({
      success: true,
      user: {
        id: user.id,
        phone: user.phone,
        displayName: user.displayName,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('=== ERROR in /verify-otp ===');
    console.error('Error message:', err.message);
    console.error('Error code:', err.code);
    console.error('Full error:', err);
    res.status(500).json({ error: 'Failed to verify OTP', details: err.message });
  }
});

// Get current user
router.get('/me', verifyAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      id: user.id,
      phone: user.phone,
      displayName: user.displayName,
      role: user.role,
    });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out' });
});

module.exports = router;
