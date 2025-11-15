import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User, { IUser } from '../models/User';
import nodemailer from 'nodemailer';
import { MailtrapTransport } from 'mailtrap';
import { sendEmail } from '../utils/sendEmail';
import { validate } from '../middleware/validate';
import {
  ForgotPasswordSchema,
  LoginSchema,
  RegisterSchema,
  ResetPasswordSchema,
} from '../schemas/auth';

const router = express.Router();

// Generate JWT
const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.APP_JWT_SECRET!, { expiresIn: '7d' });
};

// --- REGISTER ---
router.post('/register', validate(RegisterSchema), async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, password });

    // Generate email verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    // Verification URL
    const verificationUrl = `${process.env.APP_BASE_URL}/api/auth/verify-email/${verificationToken}`;

    // Send verification email
    await sendEmail({
      to: user.email,
      subject: 'Verify Your Email',
      text: `Hello ${user.name},\n\nPlease verify your email by clicking the link below:\n\n${verificationUrl}\n\nThis link expires in 24 hours.`,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(String(user._id)),
      message: 'Registration successful. Please check your email to verify your account.',
      verificationUrl, // For testing
    });
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    } else {
      res.status(500).json({ message: String(err) });
    }
  }
});

// --- VERIFY EMAIL ---
router.get('/verify-email/:token', async (req: Request, res: Response) => {
  const { token } = req.params;
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  try {
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    console.error('Email verification error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// --- LOGIN ---
router.post('/login', validate(LoginSchema), async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      token: generateToken(String(user._id)),
    });
  } catch (err) {
    console.error('Registration error:', err);

    res.status(500).json({
      message: err instanceof Error ? err.message : String(err),
    });
  }
});

// --- RESET PASSWORD REQUEST ---
router.post(
  '/forgot-password',
  validate(ForgotPasswordSchema),
  async (req: Request, res: Response) => {
    const { email } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: 'User not found' });

      const resetToken = user.generateResetToken();
      await user.save();

      // Send email
      const resetUrl = `${process.env.APP_BASE_URL}/reset-password/${resetToken}`;

      await sendEmail({
        to: user.email,
        subject: 'Verify Your Email',
        text: `Hello ${user.name},\n\nPlease verify your email by clicking the link below:\n\n${resetUrl}\n\nThis link expires in 24 hours.`,
      });

      res.json({ message: 'Email sent' });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// --- RESET PASSWORD ---
router.post(
  '/reset-password/:token',
  validate(ResetPasswordSchema),
  async (req: Request, res: Response) => {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    try {
      const user = await User.findOne({
        resetPasswordToken: hashedToken,
      });

      if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      res.json({ message: 'Password reset successful' });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

export default router;
