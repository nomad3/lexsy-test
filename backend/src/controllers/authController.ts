import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../config/knex';
import { config } from '../config/app';
import { UserRole } from '@smartdocs/common';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import { asyncHandler, createError } from '../middleware/errorHandler';

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password, fullName, role, organization } = req.body;

  // Validate required fields
  if (!email || !password || !fullName || !role) {
    throw createError('Email, password, full name, and role are required', 400, 'MISSING_FIELDS');
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw createError('Invalid email format', 400, 'INVALID_EMAIL');
  }

  // Validate password strength (min 8 characters)
  if (password.length < 8) {
    throw createError('Password must be at least 8 characters long', 400, 'WEAK_PASSWORD');
  }

  // Validate role
  if (!Object.values(UserRole).includes(role)) {
    throw createError('Invalid role. Must be either lawyer or admin', 400, 'INVALID_ROLE');
  }

  // Check if user already exists
  const existingUser = await db('users').where({ email: email.toLowerCase() }).first();
  if (existingUser) {
    throw createError('User with this email already exists', 409, 'USER_EXISTS');
  }

  // Hash password
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // Create user
  const userId = uuidv4();
  const [user] = await db('users')
    .insert({
      id: userId,
      email: email.toLowerCase(),
      password_hash: passwordHash,
      full_name: fullName,
      role,
      organization: organization || null,
      is_active: true,
    })
    .returning(['id', 'email', 'full_name', 'role', 'organization', 'created_at']);

  // Generate JWT token
  const tokenPayload = { userId: user.id, role: user.role };
  // @ts-ignore - jwt.sign types are too strict
  const token = jwt.sign(tokenPayload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

  logger.info('New user registered', { userId: user.id, email: user.email });

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        organization: user.organization,
        createdAt: user.created_at,
      },
      token,
    },
  });
});

/**
 * Login user
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    throw createError('Email and password are required', 400, 'MISSING_CREDENTIALS');
  }

  // Find user
  const user = await db('users')
    .where({ email: email.toLowerCase() })
    .first();

  if (!user) {
    throw createError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  // Check if user is active
  if (!user.is_active) {
    throw createError('Account is inactive. Please contact support', 403, 'ACCOUNT_INACTIVE');
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    throw createError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  // Update last login
  await db('users')
    .where({ id: user.id })
    .update({ last_login: db.fn.now() });

  // Generate JWT token
  const tokenPayload = { userId: user.id, role: user.role };
  // @ts-ignore - jwt.sign types are too strict
  const token = jwt.sign(tokenPayload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

  logger.info('User logged in', { userId: user.id, email: user.email });

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        organization: user.organization,
        lastLogin: new Date(),
      },
      token,
    },
  });
});
