/**
 * Agent Routes
 * 
 * Handles all agent-related operations:
 * - Creating new agents
 * - Retrieving agent lists
 * - Getting individual agent details
 * 
 * All routes are prefixed with /api/agents
 */

import express, { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../db';
import { Agent } from '../entities/Agent';
import { validate } from 'class-validator';

const router = express.Router();

// Error handling middleware
const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Agent route error:', err);
  console.error('Error stack:', err.stack);
  res.status(500).json({ 
    message: 'Internal server error',
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

// Create new agent
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Creating agent with data:', req.body);
    const agentRepository = AppDataSource.getRepository(Agent);
    const agent = agentRepository.create({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      password: req.body.password // Note: In production, this should be hashed
    });

    // Validate the agent data
    const errors = await validate(agent);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    // Save the agent
    const savedAgent = await agentRepository.save(agent);
    return res.status(201).json(savedAgent);
  } catch (error) {
    console.error('Error in POST /:', error);
    next(error);
  }
});

// Get all agents
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const agentRepository = AppDataSource.getRepository(Agent);
    const agents = await agentRepository.find({
      select: ['id', 'name', 'email', 'phone', 'isVerified', 'createdAt'] // Exclude password
    });
    return res.json(agents);
  } catch (error) {
    console.error('Error in GET /:', error);
    next(error);
  }
});

// Get agent by ID
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const agentRepository = AppDataSource.getRepository(Agent);
    const agent = await agentRepository.findOne({
      where: { id: parseInt(req.params.id) },
      select: ['id', 'name', 'email', 'phone', 'isVerified', 'createdAt'] // Exclude password
    });

    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    return res.json(agent);
  } catch (error) {
    console.error('Error in GET /:id:', error);
    next(error);
  }
});

// Apply error handling middleware
router.use(errorHandler);

export default router; 