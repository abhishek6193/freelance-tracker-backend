import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import BlacklistedToken from '../models/BlacklistedToken';
import RefreshToken from '../models/RefreshToken';
import mongoose from 'mongoose';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
const ACCESS_TOKEN_EXPIRY = '24h';
const REFRESH_TOKEN_EXPIRY = 365 * 24 * 60 * 60 * 1000; // 1 year in ms

export const logout = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const refreshToken = req.body.refreshToken;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(400).json({ message: 'No access token provided.' });
    }
    const accessToken = authHeader.split(' ')[1];
    // Blacklist access token
    const decoded: any = jwt.decode(accessToken);
    await BlacklistedToken.create({
      token: accessToken,
      expiresAt: new Date(decoded.exp * 1000),
    });
    // Remove refresh token from DB
    if (refreshToken) {
      await RefreshToken.deleteOne({ token: refreshToken });
    }
    res.json({ message: 'Logged out successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: 'No refresh token provided.' });
    }
    const stored = await RefreshToken.findOne({ token: refreshToken });
    if (!stored || stored.expiresAt < new Date()) {
      return res.status(401).json({ message: 'Invalid or expired refresh token.' });
    }
    const user = await User.findById(stored.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }
    // Issue new access token
    const newAccessToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
    const accessTokenExpiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes
    res.json({ token: newAccessToken, expiresAt: accessTokenExpiresAt });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Update signup and login to issue refresh tokens
export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
    // Create refresh token
    const refreshTokenValue = crypto.randomBytes(40).toString('hex');
    const refreshTokenDoc = new RefreshToken({
      userId: user._id,
      token: refreshTokenValue,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY),
    });
    await refreshTokenDoc.save();
    const accessTokenExpiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes
    res.status(201).json({
      token,
      refreshToken: refreshTokenValue,
      user: { id: user._id, name: user.name, email: user.email },
      expiresAt: accessTokenExpiresAt,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
    // Create refresh token
    const refreshTokenValue = crypto.randomBytes(40).toString('hex');
    const refreshTokenDoc = new RefreshToken({
      userId: user._id,
      token: refreshTokenValue,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY),
    });
    await refreshTokenDoc.save();
    const accessTokenExpiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes
    res.json({
      token,
      refreshToken: refreshTokenValue,
      user: { id: user._id, name: user.name, email: user.email },
      expiresAt: accessTokenExpiresAt,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};
