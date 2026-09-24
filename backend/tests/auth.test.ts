/// <reference types="jest" />

import request from 'supertest';
import app from '../src/app';
import { describe, it } from 'node:test';

describe('Auth & User API Integration Tests', () => {
  const testUser = {
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    password: 'Password123!',
  };

  describe('GET /api/v1/health', () => {
    it('should return 200 OK with server health information', async () => {
      const response = await request(app).get('/api/v1/health');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('Route Not Found Handling (404)', () => {
    it('should return 404 for undefined routes', async () => {
      const response = await request(app).get('/api/v1/random-undefined-endpoint');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Cannot find route');
    });
  });

  describe('POST /api/v1/users/register', () => {
    it('should successfully register a new user and return token and user without password', async () => {
      const response = await request(app)
        .post('/api/v1/users/register')
        .send(testUser);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user).toHaveProperty('_id');
      expect(response.body.data.user.email).toBe(testUser.email.toLowerCase());
      expect(response.body.data.user.name).toBe(testUser.name);
      // Critical security check: password must not be leaked
      expect(response.body.data.user.password).toBeUndefined();
    });

    it('should fail with 409 Conflict when attempting to register duplicate email', async () => {
      await request(app).post('/api/v1/users/register').send(testUser);

      const duplicateResponse = await request(app)
        .post('/api/v1/users/register')
        .send(testUser);

      expect(duplicateResponse.status).toBe(409);
      expect(duplicateResponse.body.success).toBe(false);
      expect(duplicateResponse.body.message).toContain('already exists');
    });

    it('should fail with 400 when email format is invalid', async () => {
      const response = await request(app)
        .post('/api/v1/users/register')
        .send({
          ...testUser,
          email: 'not-an-email',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('should fail with 400 when password is under 6 characters', async () => {
      const response = await request(app)
        .post('/api/v1/users/register')
        .send({
          ...testUser,
          password: '123',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should fail with 400 when name is empty or less than 2 characters', async () => {
      const response = await request(app)
        .post('/api/v1/users/register')
        .send({
          ...testUser,
          name: 'J',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/users/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/v1/users/register').send(testUser);
    });

    it('should login successfully with valid credentials and return JWT', async () => {
      const response = await request(app)
        .post('/api/v1/users/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.email).toBe(testUser.email.toLowerCase());
      expect(response.body.data.user.password).toBeUndefined();
    });

    it('should fail with 401 Unauthorized for incorrect password', async () => {
      const response = await request(app)
        .post('/api/v1/users/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid email or password');
    });

    it('should fail with 401 Unauthorized for non-existent email', async () => {
      const response = await request(app)
        .post('/api/v1/users/login')
        .send({
          email: 'unknown@example.com',
          password: testUser.password,
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid email or password');
    });
  });

  describe('Protected Routes & Profile Management', () => {
    let authToken: string;

    beforeEach(async () => {
      const registerRes = await request(app)
        .post('/api/v1/users/register')
        .send(testUser);
      authToken = registerRes.body.data.token;
    });

    it('should fail with 401 if Authorization header is missing', async () => {
      const response = await request(app).get('/api/v1/users/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Missing or invalid Bearer token');
    });

    it('should fail with 401 if token is malformed', async () => {
      const response = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', 'Bearer invalid.token.payload');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid authentication token');
    });

    it('should successfully get the logged-in user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(testUser.email.toLowerCase());
      expect(response.body.data.name).toBe(testUser.name);
    });

    it('should successfully update current user profile (bio and name)', async () => {
      const updatePayload = {
        name: 'Jane Updated',
        bio: 'Full Stack Engineer & Cloud Architect',
      };

      const response = await request(app)
        .put('/api/v1/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatePayload);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updatePayload.name);
      expect(response.body.data.bio).toBe(updatePayload.bio);
    });

    it('should allow updating password and logging in with new password', async () => {
      const newPassword = 'NewSecretPassword987!';

      const updateRes = await request(app)
        .put('/api/v1/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ password: newPassword });

      expect(updateRes.status).toBe(200);

      // Verify old password fails
      const oldLoginRes = await request(app)
        .post('/api/v1/users/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });
      expect(oldLoginRes.status).toBe(401);

      // Verify new password succeeds
      const newLoginRes = await request(app)
        .post('/api/v1/users/login')
        .send({
          email: testUser.email,
          password: newPassword,
        });
      expect(newLoginRes.status).toBe(200);
      expect(newLoginRes.body.data).toHaveProperty('token');
    });

    it('should successfully delete current user account', async () => {
      const deleteRes = await request(app)
        .delete('/api/v1/users/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.message).toContain('deleted successfully');

      // Subsequent access with that token should fail because user does not exist
      const checkRes = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(checkRes.status).toBe(401);
      expect(checkRes.body.message).toContain('no longer exists');
    });

    it('should handle CastError for invalid MongoDB ObjectId in /users/:id', async () => {
      const response = await request(app)
        .get('/api/v1/users/not-a-valid-mongo-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid resource identifier');
    });
  });
});
