/// <reference types="jest" />

import request from 'supertest';
import app from '../src/app';
import { User } from '../src/models/user.model';
import { Project } from '../src/models/portfolio.model';

describe('Admin API Integration Tests', () => {
  let adminToken: string;
  let regularToken: string;

  beforeEach(async () => {
    // Create admin user
    await User.create({
      name: 'System Admin',
      email: 'admin.test@portfolio.design',
      password: 'AdminPassword123!',
      role: 'admin',
    });

    const adminLoginRes = await request(app)
      .post('/api/v1/users/login')
      .send({
        email: 'admin.test@portfolio.design',
        password: 'AdminPassword123!',
      });
    adminToken = adminLoginRes.body.data.token;

    // Create regular user
    await User.create({
      name: 'Regular User',
      email: 'regular.test@portfolio.design',
      password: 'UserPassword123!',
      role: 'user',
    });

    const regularLoginRes = await request(app)
      .post('/api/v1/users/login')
      .send({
        email: 'regular.test@portfolio.design',
        password: 'UserPassword123!',
      });
    regularToken = regularLoginRes.body.data.token;
  });

  describe('Route Protection & RBAC', () => {
    it('should reject unauthenticated requests to /api/v1/admin/stats with 401', async () => {
      const res = await request(app).get('/api/v1/admin/stats');
      expect(res.status).toBe(401);
    });

    it('should forbid non-admin users from accessing /api/v1/admin/stats with 403', async () => {
      const res = await request(app)
        .get('/api/v1/admin/stats')
        .set('Authorization', `Bearer ${regularToken}`);
      expect(res.status).toBe(403);
    });

    it('should allow admin users to access /api/v1/admin/stats with 200', async () => {
      const res = await request(app)
        .get('/api/v1/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('counts');
    });
  });

  describe('Projects CRUD Operations', () => {
    it('should allow admin to create a new project', async () => {
      const res = await request(app)
        .post('/api/v1/admin/projects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Quantum Financial Portal',
          slug: 'quantum-portal',
          client: 'Quantum Capital',
          category: 'FinTech',
          year: '2026',
          tags: ['React', 'TypeScript', 'Tailwind'],
          summary: 'High-frequency trading terminal interface.',
          metrics: [{ label: 'Latency', value: '1.2ms' }],
          coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
          featured: true,
          order: 1,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data.slug).toBe('quantum-portal');
    });

    it('should allow admin to update the project', async () => {
      const created = await Project.create({
        title: 'Quantum Portal Initial',
        slug: 'quantum-portal-initial',
        client: 'Quantum Capital',
        category: 'FinTech',
        year: '2026',
        tags: ['React'],
        summary: 'Initial trading terminal interface.',
        coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
        metrics: [],
        featured: true,
        order: 1,
      });

      const res = await request(app)
        .put(`/api/v1/admin/projects/${created._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Quantum Financial Portal Pro',
          order: 2,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Quantum Financial Portal Pro');
      expect(res.body.data.order).toBe(2);
    });

    it('should allow admin to delete the project', async () => {
      const created = await Project.create({
        title: 'Project to Delete',
        slug: 'project-to-delete',
        client: 'Test Client',
        category: 'FinTech',
        year: '2026',
        tags: ['React'],
        summary: 'Temporary project.',
        coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
        metrics: [],
        featured: true,
        order: 1,
      });

      const res = await request(app)
        .delete(`/api/v1/admin/projects/${created._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const exists = await Project.findById(created._id);
      expect(exists).toBeNull();
    });
  });

  describe('Profile Updates', () => {
    it('should allow admin to get and update the profile', async () => {
      const getRes = await request(app)
        .get('/api/v1/admin/profile')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body.data).toHaveProperty('name');

      const updateRes = await request(app)
        .put('/api/v1/admin/profile')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          statusPill: 'Available for Q1 2027 advisory',
          isAvailable: true,
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.statusPill).toBe('Available for Q1 2027 advisory');
    });
  });
});
