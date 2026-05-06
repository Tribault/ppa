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
        .send({ username: 'nouveau', email: 'nouveau@test.com', password: 'pass123', role: 'user' })
      expect(res.status).toBe(201)
      expect(res.body.user.email).toBe('nouveau@test.com')
      // Password must never be returned in the response
      expect(res.body.user.password).toBeUndefined()
    })

    it('rejects duplicate email with 400', async () => {
      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ username: 'dup', email: 'user@test.com', password: 'pass123' })
      expect(res.status).toBe(400)
    })

    it('rejects non-admin with 403', async () => {
      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ username: 'x', email: 'x@test.com', password: 'pass123' })
      expect(res.status).toBe(403)
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
    it('user can update their own username', async () => {
      const res = await request(app)
        .put(`/api/users/${user._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ username: 'nouveau_nom' })
      expect(res.status).toBe(200)
      expect(res.body.user.username).toBe('nouveau_nom')
    })

    it('admin can update any user', async () => {
      const res = await request(app)
        .put(`/api/users/${user._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ username: 'mis_a_jour_par_admin' })
      expect(res.status).toBe(200)
      expect(res.body.user.username).toBe('mis_a_jour_par_admin')
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
        .send({ username: 'x' })
      expect(res.status).toBe(404)
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
