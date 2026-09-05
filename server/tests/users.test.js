const request = require('supertest')
const app = require('../app')
const { createUser, tokenFor } = require('./helpers/auth')
const User = require('../models/User')

describe('Users', () => {
  let admin, adminToken
  let user, userToken

  beforeEach(async () => {
    admin = await createUser({ email: 'admin@test.com', role: 'admin' })
    user  = await createUser({ email: 'user@test.com',  role: 'user' })
    adminToken = tokenFor(admin)
    userToken  = tokenFor(user)
  })

  // ── CREATE ─────────────────────────────────────────────────────────────────

  describe('POST /api/users', () => {
    it('admin can create a new user', async () => {
      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email: 'nouveau@test.com', password: 'pass123', role: 'user' })
      expect(res.status).toBe(201)
      expect(res.body.user.email).toBe('nouveau@test.com')
      // Password must never be returned in the response
      expect(res.body.user.password).toBeUndefined()
    })

    it('rejects duplicate email with 400', async () => {
      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email: 'user@test.com', password: 'pass123' })
      expect(res.status).toBe(400)
    })

    it('rejects non-admin with 403', async () => {
      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ email: 'x@test.com', password: 'pass123' })
      expect(res.status).toBe(403)
    })

    it('rejects a missing password with a localized message', async () => {
      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email: 'nopass@test.com' })
      expect(res.status).toBe(400)
      expect(res.body.error).toBe('Le mot de passe est requis.')
    })

    it('rejects an invalid email with a localized message, in English when requested', async () => {
      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Accept-Language', 'en')
        .send({ email: 'not-an-email', password: 'pass123' })
      expect(res.status).toBe(400)
      expect(res.body.error).toBe('Invalid email address.')
    })
  })

  // ── LIST ───────────────────────────────────────────────────────────────────

  describe('GET /api/users', () => {
    it('admin gets a paginated list of users', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.status).toBe(200)
      // admin + user were created in beforeEach
      expect(res.body.total).toBe(2)
      // Passwords must be stripped from list results
      res.body.data.forEach((u) => expect(u.password).toBeUndefined())
    })

    it('filters by email with ?q=', async () => {
      const res = await request(app)
        .get('/api/users?q=admin')
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.status).toBe(200)
      expect(res.body.data).toHaveLength(1)
      expect(res.body.data[0].email).toBe('admin@test.com')
    })

    it('rejects non-admin with 403', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${userToken}`)
      expect(res.status).toBe(403)
    })
  })

  describe('GET /api/users sorting', () => {
    it('sorts by email ascending by default', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.body.data.map((u) => u.email)).toEqual(['admin@test.com', 'user@test.com'])
    })

    it('sorts by email descending', async () => {
      const res = await request(app)
        .get('/api/users?sortBy=email&sortDir=desc')
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.body.data.map((u) => u.email)).toEqual(['user@test.com', 'admin@test.com'])
    })

    it('sorts by role', async () => {
      const res = await request(app)
        .get('/api/users?sortBy=role&sortDir=asc')
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.body.data.map((u) => u.role)).toEqual(['admin', 'user'])
    })

    it('ignores an unrecognized sortBy field and falls back to email', async () => {
      const res = await request(app)
        .get('/api/users?sortBy=notAField')
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.body.data.map((u) => u.email)).toEqual(['admin@test.com', 'user@test.com'])
    })
  })

  // ── GET ONE ────────────────────────────────────────────────────────────────

  describe('GET /api/users/:id', () => {
    it('admin can fetch a single user without password', async () => {
      const res = await request(app)
        .get(`/api/users/${user._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.status).toBe(200)
      expect(res.body.email).toBe('user@test.com')
      expect(res.body.password).toBeUndefined()
    })

    it('rejects non-admin with 403', async () => {
      const res = await request(app)
        .get(`/api/users/${admin._id}`)
        .set('Authorization', `Bearer ${userToken}`)
      expect(res.status).toBe(403)
    })
  })

  // ── UPDATE ─────────────────────────────────────────────────────────────────

  describe('PUT /api/users/:id', () => {
    it('user can update their own email', async () => {
      const res = await request(app)
        .put(`/api/users/${user._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ email: 'updated@test.com' })
      expect(res.status).toBe(200)
      expect(res.body.user.email).toBe('updated@test.com')
    })

    it('admin can update any user', async () => {
      const res = await request(app)
        .put(`/api/users/${user._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email: 'admin-updated@test.com' })
      expect(res.status).toBe(200)
      expect(res.body.user.email).toBe('admin-updated@test.com')
    })

    it('hashes the new password when updated', async () => {
      await request(app)
        .put(`/api/users/${user._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ password: 'nouveauMotDePasse' })
      // Fetch raw doc from DB and verify the stored value is not plaintext
      const updated = await User.findById(user._id)
      expect(updated.password).not.toBe('nouveauMotDePasse')
      expect(updated.password).toMatch(/^\$2/) // bcrypt hash prefix
    })

    it('returns 404 for a non-existent user', async () => {
      const fakeId = '000000000000000000000001'
      const res = await request(app)
        .put(`/api/users/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email: 'nonexistent@test.com' })
      expect(res.status).toBe(404)
    })

    it('rejects a user updating another user\'s account', async () => {
      const other = await createUser({ email: 'other@test.com', role: 'user' })
      const res = await request(app)
        .put(`/api/users/${other._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ email: 'hijacked@test.com' })
      expect(res.status).toBe(403)
    })

    it('does not let a user escalate their own role to admin', async () => {
      const res = await request(app)
        .put(`/api/users/${user._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ role: 'admin' })
      expect(res.status).toBe(200)
      const updated = await User.findById(user._id)
      expect(updated.role).toBe('user')
    })
  })

  // ── DELETE ─────────────────────────────────────────────────────────────────

  describe('DELETE /api/users/:id', () => {
    it('admin can delete a user', async () => {
      const res = await request(app)
        .delete(`/api/users/${user._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.status).toBe(200)
      expect(await User.findById(user._id)).toBeNull()
    })

    it('rejects non-admin with 403', async () => {
      const res = await request(app)
        .delete(`/api/users/${admin._id}`)
        .set('Authorization', `Bearer ${userToken}`)
      expect(res.status).toBe(403)
    })
  })
})
