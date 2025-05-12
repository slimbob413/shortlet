/**
 * Authentication Routes
 * 
 * Handles user authentication:
 * - User registration (signup)
 * - User login
 * 
 * All routes are prefixed with /api/auth
 */

import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { AppDataSource } from '../db';
import { Agent } from '../entities/Agent';

const router = express.Router();

// Validation schemas
const signupSchema = z.object({
  name: z.string().min(2).max(255),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Error handling middleware
const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Auth route error:', err);
  console.error('Error stack:', err.stack);
  res.status(500).json({ 
    message: 'Internal server error',
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

// Signup route
router.post('/signup', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request body
    const validatedData = signupSchema.parse(req.body);

    const agentRepository = AppDataSource.getRepository(Agent);

    // Check if agent already exists
    const existingAgent = await agentRepository.findOne({
      where: { email: validatedData.email }
    });

    if (existingAgent) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(validatedData.password, saltRounds);

    // Create new agent
    const agent = agentRepository.create({
      name: validatedData.name,
      email: validatedData.email,
      password: passwordHash,
      phone: validatedData.phone || '',
    });

    // Save the agent
    const savedAgent = await agentRepository.save(agent);

    // Generate JWT token
    const token = jwt.sign(
      { userId: savedAgent.id, role: 'agent' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Agent created successfully',
      agent: {
        id: savedAgent.id,
        name: savedAgent.name,
        email: savedAgent.email,
        phone: savedAgent.phone,
      },
      token,
    });
  } catch (error) {
    console.error('Signup error:', error);
    next(error);
  }
});

// Login route
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request body
    const validatedData = loginSchema.parse(req.body);

    const agentRepository = AppDataSource.getRepository(Agent);

    // Find agent by email
    const agent = await agentRepository.findOne({
      where: { email: validatedData.email }
    });

    if (!agent) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(
      validatedData.password,
      agent.password
    );

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: agent.id, role: 'agent' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      agent: {
        id: agent.id,
        name: agent.name,
        email: agent.email,
        phone: agent.phone,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
});

// Apply error handling middleware
router.use(errorHandler);

export default router; 