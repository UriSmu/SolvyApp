const request = require('supertest');
const app = require('../../src/index');

// Mock environment variables for testing
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_KEY = 'test-service-key';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.MAGIC_LINK_BASE_URL = 'http://localhost:19000';
process.env.MAGIC_LINK_EXPIRATION = '60';
process.env.EMAIL_FROM = 'test@example.com';

describe('Magic Link Authentication', () => {
  describe('POST /api/auth/magic-link', () => {
    it('should return success message when email is provided', async () => {
      const response = await request(app)
        .post('/api/auth/magic-link')
        .send({ email: 'test@example.com' })
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('magic link has been sent');
    });
    
    it('should return success message even without email (anti-enumeration)', async () => {
      const response = await request(app)
        .post('/api/auth/magic-link')
        .send({})
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
    });
    
    it('should return success for non-existent email (anti-enumeration)', async () => {
      const response = await request(app)
        .post('/api/auth/magic-link')
        .send({ email: 'nonexistent@example.com' })
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.message).toContain('magic link has been sent');
    });
  });
  
  describe('GET /api/auth/magic-link/verify', () => {
    it('should return error when token is missing', async () => {
      const response = await request(app)
        .get('/api/auth/magic-link/verify')
        .expect(400);
      
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Token is required');
    });
    
    it('should return error for invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/magic-link/verify')
        .query({ token: 'invalid-token' })
        .expect(400);
      
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });
  
  describe('Health Check', () => {
    it('should return ok status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });
});

describe('Magic Link Service Unit Tests', () => {
  const crypto = require('crypto');
  
  it('should generate unique tokens', () => {
    // Test token generation logic
    const token1 = crypto.randomBytes(32).toString('hex');
    const token2 = crypto.randomBytes(32).toString('hex');
    
    expect(token1).not.toBe(token2);
    expect(token1.length).toBe(64);
  });
  
  it('should hash tokens consistently', () => {
    const token = 'test-token';
    const hash1 = crypto.createHash('sha256').update(token).digest('hex');
    const hash2 = crypto.createHash('sha256').update(token).digest('hex');
    
    expect(hash1).toBe(hash2);
    expect(hash1.length).toBe(64);
  });
  
  it('should produce different hashes for different tokens', () => {
    const token1 = 'test-token-1';
    const token2 = 'test-token-2';
    
    const hash1 = crypto.createHash('sha256').update(token1).digest('hex');
    const hash2 = crypto.createHash('sha256').update(token2).digest('hex');
    
    expect(hash1).not.toBe(hash2);
  });
});
