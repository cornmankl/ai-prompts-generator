import request from 'supertest'
import app from '../server'
import User from '../models/User'

describe('Authentication', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      }

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.data.user.email).toBe(userData.email)
      expect(response.body.data.user.name).toBe(userData.name)
      expect(response.body.data.tokens.authToken).toBeDefined()
      expect(response.body.data.tokens.refreshToken).toBeDefined()
    })

    it('should fail with invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'password123',
        name: 'Test User'
      }

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Validation failed')
    })

    it('should fail with short password', async () => {
      const userData = {
        email: 'test@example.com',
        password: '123',
        name: 'Test User'
      }

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400)

      expect(response.body.success).toBe(false)
    })

    it('should fail with duplicate email', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      }

      // Create first user
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201)

      // Try to create second user with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('User already exists with this email')
    })
  })

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      }

      await request(app)
        .post('/api/auth/register')
        .send(userData)
    })

    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      }

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.user.email).toBe(loginData.email)
      expect(response.body.data.tokens.authToken).toBeDefined()
      expect(response.body.data.tokens.refreshToken).toBeDefined()
    })

    it('should fail with invalid email', async () => {
      const loginData = {
        email: 'wrong@example.com',
        password: 'password123'
      }

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Invalid email or password')
    })

    it('should fail with invalid password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      }

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Invalid email or password')
    })
  })

  describe('GET /api/auth/profile', () => {
    let authToken: string

    beforeEach(async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      }

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData)

      authToken = registerResponse.body.data.tokens.authToken
    })

    it('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.user.email).toBe('test@example.com')
      expect(response.body.data.user.name).toBe('Test User')
    })

    it('should fail without token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Access denied. No token provided.')
    })

    it('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Invalid token.')
    })
  })
})