import request from 'supertest';
import { app } from '../src/index';
import { AppDataSource } from '../src/db';
import { Agent } from '../src/entities/Agent';

describe('Auth Endpoints', () => {
  describe('POST /api/auth/signup', () => {
    it('should create a new user account', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'user',
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', userData.email);
      expect(response.body.user).not.toHaveProperty('password');

      // Verify user was created in database
      const userRepository = AppDataSource.getRepository(Agent);
      const savedUser = await userRepository.findOne({
        where: { email: userData.email },
      });

      expect(savedUser).toBeDefined();
      expect(savedUser?.email).toBe(userData.email);
      expect(savedUser?.role).toBe(userData.role);
    });

    it('should not create user with existing email', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'user',
      };

      // First signup
      await request(app)
        .post('/api/auth/signup')
        .send(userData);

      // Try to signup again with same email
      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
}); 