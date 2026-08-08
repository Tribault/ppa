const request = require('supertest')
const app = require('../app')
const { createUser, tokenFor } = require('./helpers/auth')
const SaleDate = require('../models/SaleDate')

describe('Sale date', () => {
  let adminToken
  let userToken

  beforeEach(async () => {
    const admin = await createUser({ email: 'admin@test.com', role: 'admin' })
    const user = await createUser({ email: 'user@test.com', role: 'user' })
    adminToken = tokenFor(admin)
    userToken = tokenFor(user)
  })

  describe('GET /api/sale-date', () => {
    it('returns null when no sale date has been set', async () => {
      const res = await request(app).get('/api/sale-date')
      expect(res.status).toBe(200)
      expect(res.body).toBeNull()
    })

    it('is publicly readable without authentication', async () => {
      await SaleDate.create({ date: new Date('2026-06-15') })
      const res = await request(app).get('/api/sale-date')
      expect(res.status).toBe(200)
      expect(new Date(res.body.date).toISOString()).toBe(new Date('2026-06-15').toISOString())
    })
  })

  describe('POST /api/sale-date', () => {
    it('rejects anonymous requests', async () => {
      const res = await request(app).post('/api/sale-date').send({ date: '2026-06-15' })
      expect(res.status).toBe(401)
    })

    it('rejects non-admin users', async () => {
      const res = await request(app)
        .post('/api/sale-date')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ date: '2026-06-15' })
      expect(res.status).toBe(403)
    })

    it('rejects an invalid date', async () => {
      const res = await request(app)
        .post('/api/sale-date')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ date: 'not-a-date' })
      expect(res.status).toBe(400)
    })

    it('lets an admin create the sale date', async () => {
      const res = await request(app)
        .post('/api/sale-date')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ date: '2026-06-15' })
      expect(res.status).toBe(200)
      expect(new Date(res.body.date).toISOString()).toBe(new Date('2026-06-15').toISOString())
    })

    it('lets an admin update the existing sale date instead of duplicating it', async () => {
      await request(app)
        .post('/api/sale-date')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ date: '2026-06-15' })

      const res = await request(app)
        .post('/api/sale-date')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ date: '2026-07-01' })

      expect(res.status).toBe(200)
      expect(new Date(res.body.date).toISOString()).toBe(new Date('2026-07-01').toISOString())
      expect(await SaleDate.countDocuments()).toBe(1)
    })
  })
})
