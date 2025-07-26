import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { User, UserRecord } from '@/types/auth';

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

// Configuration
const SALT_ROUNDS = 12;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const JWT_EXPIRES_IN = '7d';
const RESET_TOKEN_EXPIRES_IN = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against its hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Generate a JWT token for a user
 */
export function generateJWTToken(user: User): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify and decode a JWT token
 */
export function verifyJWTToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Generate a unique user ID
 */
export function generateUserId(): string {
  return uuidv4();
}

/**
 * Generate a password reset token
 */
export function generateResetToken(): string {
  return uuidv4();
}

/**
 * Check if a reset token is expired
 */
export function isResetTokenExpired(expiryDate: string): boolean {
  return new Date() > new Date(expiryDate);
}

/**
 * Generate reset token expiry date (1 hour from now)
 */
export function generateResetTokenExpiry(): string {
  return new Date(Date.now() + RESET_TOKEN_EXPIRES_IN).toISOString();
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

/**
 * Get password validation error message
 */
export function getPasswordValidationError(password: string): string | null {
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  return null;
}

/**
 * Get email validation error message
 */
export function getEmailValidationError(email: string): string | null {
  if (!email) {
    return 'Email is required';
  }
  if (!isValidEmail(email)) {
    return 'Please enter a valid email address';
  }
  return null;
}