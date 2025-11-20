import { describe, it, expect } from 'vitest';
import supertest from 'supertest';
import { app } from '@/server';

const request = supertest(app);

describe('Controllers Integration Tests', () => {
  let token: string;
  let projectId: string;
  let sceneId: string;
  const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'password123',
  };

  describe('Auth Controller', () => {
    it('should signup a new user', async () => {
      const response = await request.post('/api/auth/signup').send(testUser);
      expect(response.status).toBe(201);
      expect(response.body.data.user.email).toBe(testUser.email);
    });

    it('should login the user', async () => {
      const response = await request.post('/api/auth/login').send(testUser);
      expect(response.status).toBe(200);
      expect(response.body.data.token).toBeDefined();
      token = response.body.data.token;
    });
  });

  describe('Projects Controller', () => {
    it('should create a new project', async () => {
      const response = await request
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Test Project', scriptContent: 'This is a test script.' });
      expect(response.status).toBe(201);
      expect(response.body.data.title).toBe('Test Project');
      projectId = response.body.data.id;
    });
  });

  describe('Scenes Controller', () => {
    it('should create a new scene', async () => {
      const response = await request
        .post('/api/scenes')
        .set('Authorization', `Bearer ${token}`)
        .send({
          projectId,
          sceneNumber: 1,
          title: 'Test Scene',
          location: 'Test Location',
          timeOfDay: 'Day',
          characters: ['Test Character'],
        });
      expect(response.status).toBe(201);
      expect(response.body.data.title).toBe('Test Scene');
      sceneId = response.body.data.id;
    });
  });

  describe('Analysis Controller', () => {
    it('should analyze a script from a project', async () => {
      const response = await request
        .post(`/api/projects/${projectId}/analyze`)
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(200);
      expect(response.body.data.analysis).toBeDefined();
    });

    it('should get analysis stations', async () => {
      const response = await request
        .get('/api/analysis/stations')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });
});
