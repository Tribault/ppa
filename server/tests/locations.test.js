const request = require('supertest')
const app = require('../app')
const { createUser, tokenFor } = require('./helpers/auth')
const Location = require('../models/Location')

describe('Locations', () => {
  let adminToken
  let userToken

  beforeEach(async () => {
    const admin = await createUser({ email: 'admin@test.com', role: 'admin' })
    const user = await createUser({ email: 'user@test.com', role: 'user' })
    adminToken = tokenFor(admin)
    userToken = tokenFor(user)
  })

  describe('GET /api/locations', () => {
    it('rejects anonymous requests', async () => {
      const res = await request(app).get('/api/locations')
      expect(res.status).toBe(401)
    })

    it('rejects non-admin users', async () => {
      const res = await request(app).get('/api/locations').set('Authorization', `Bearer ${userToken}`)
      expect(res.status).toBe(403)
    })

    it('returns locations for an admin', async () => {
      await Location.create({ name: 'Réserve' })
      const res = await request(app).get('/api/locations').set('Authorization', `Bearer ${adminToken}`)
      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(1)
      expect(res.body[0].name).toBe('Réserve')
    })
  })

  describe('POST /api/locations', () => {
    it('rejects non-admin users', async () => {
      const res = await request(app)
        .post('/api/locations')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Réserve' })
      expect(res.status).toBe(403)
    })

    it('lets an admin create a location', async () => {
      const res = await request(app)
        .post('/api/locations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Réserve' })
      expect(res.status).toBe(200)
      expect(res.body.name).toBe('Réserve')
    })
  })
})
