import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import RefreshToken from '../models/RefreshToken';
import crypto from 'crypto';
import axios from 'axios';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
const ACCESS_TOKEN_EXPIRY = '24h';
const REFRESH_TOKEN_EXPIRY = 365 * 24 * 60 * 60 * 1000; // 1 year in ms

// Google OAuth: expects { idToken } in body
export const googleAuth = async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: 'No Google ID token provided.' });
    }
    // Verify Google ID token
    const googleClientId = process.env.GOOGLE_CLIENT_ID || "539208614876-mrofeakeld7p9p16ra3pbpotjiistcq4.apps.googleusercontent.com";
    const googleApiUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`;
    const googleRes = await axios.get(googleApiUrl);
    const payload = googleRes.data;
    if (!payload || payload.aud !== googleClientId) {
      return res.status(401).json({ message: 'Invalid Google ID token.' });
    }
    // Find or create user
    let user = await User.findOne({ email: payload.email });
    if (!user) {
      user = new User({
        name: payload.name || payload.email.split('@')[0],
        email: payload.email,
        googleId: payload.sub,
        role: 'user',
      });
      await user.save();
    }
    // Issue tokens
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
    const refreshTokenValue = crypto.randomBytes(40).toString('hex');
    const refreshTokenDoc = new RefreshToken({
      userId: user._id,
      token: refreshTokenValue,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY),
    });
    await refreshTokenDoc.save();
    // Calculate expiresAt for access token (in ms since epoch)
    const accessTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    res.json({
      token,
      refreshToken: refreshTokenValue,
      user: { id: user._id, name: user.name, email: user.email },
      expiresAt: accessTokenExpiresAt,
    });
  } catch (err) {
    res.status(500).json({ message: 'Google authentication failed.' });
  }
};
