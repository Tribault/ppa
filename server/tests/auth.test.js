const request = require('supertest')
const app = require('../app')
const { createUser, tokenFor } = require('./helpers/auth')

describe('Auth', () => {
  describe('POST /api/auth/signup', () => {
    it('rejects a missing password with a localized message', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({ email: 'new@test.com' })
      expect(res.status).toBe(400)
      expect(res.body.message).toBe('Le mot de passe est requis.')
    })

    it('rejects an invalid email with a localized message, in English when requested', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .set('Accept-Language', 'en')
        .send({ email: 'not-an-email', password: 'password123' })
      expect(res.status).toBe(400)
      expect(res.body.message).toBe('Invalid email address.')
    })

    it('rejects a missing email with a localized message', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .set('Accept-Language', 'en')
        .send({ password: 'password123' })
      expect(res.status).toBe(400)
      expect(res.body.message).toBe('Email address is required.')
    })
  })

  describe('authenticate middleware', () => {
    it('returns a localized message when no token is provided', async () => {
      const res = await request(app).get('/api/users')
      expect(res.status).toBe(401)
      expect(res.body.message).toBe('Aucun jeton fourni.')
    })

    it('returns a localized message for an invalid token, in English when requested', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', 'Bearer not-a-real-token')
        .set('Accept-Language', 'en')
      expect(res.status).toBe(401)
      expect(res.body.message).toBe('Invalid or expired token.')
    })
  })

  describe('authorize middleware', () => {
    it('returns a localized forbidden message for the wrong role, in English when requested', async () => {
      const user = await createUser({ email: 'user@test.com', role: 'user' })
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${tokenFor(user)}`)
        .set('Accept-Language', 'en')
      expect(res.status).toBe(403)
      expect(res.body.message).toBe('Forbidden.')
    })
  })
})
