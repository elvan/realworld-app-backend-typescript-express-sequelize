import request from 'supertest';
import app from '../app';
import db from '../models';

// Mock data for testing
const testUser = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123'
};

describe('User Authentication', () => {
  // Before all tests, sync the database
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
  });

  // After all tests, close the database connection
  afterAll(async () => {
    await db.sequelize.close();
  });

  describe('POST /api/users/register', () => {
    it('should register a new user and return user with token', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({ user: testUser })
        .expect(201);

      expect(response.body.user).toHaveProperty('token');
      expect(response.body.user.username).toBe(testUser.username);
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should return validation error if username is taken', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({ user: testUser })
        .expect(422);

      expect(response.body.errors).toHaveProperty('username');
    });
  });

  describe('POST /api/users/login', () => {
    it('should log in an existing user and return user with token', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          user: {
            email: testUser.email,
            password: testUser.password
          }
        })
        .expect(200);

      expect(response.body.user).toHaveProperty('token');
      expect(response.body.user.username).toBe(testUser.username);
      expect(response.body.user.email).toBe(testUser.email);
    });

    it('should return error with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          user: {
            email: testUser.email,
            password: 'wrongpassword'
          }
        })
        .expect(401);

      expect(response.body.errors).toHaveProperty('message');
    });
  });
});
