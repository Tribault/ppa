// We use supertest to fire real HTTP requests at the Express app without
// binding to a port — faster and cleaner than starting a full server.
const request = require('supertest')
const app = require('../app')
const { createUser, tokenFor } = require('./helpers/auth')
const Poster = require('../models/Poster')

// Reusable poster fixture to avoid repeating the same fields everywhere.
const posterData = { title: 'Affiche Test', size: '40x60', price: 20, totalStock: 10, forSale: true }

describe('Posters', () => {
  let adminToken
  let userToken

  beforeEach(async () => {
    const admin = await createUser({ email: 'admin@test.com', role: 'admin' })
    const user  = await createUser({ email: 'user@test.com',  role: 'user' })
    adminToken = tokenFor(admin)
    userToken  = tokenFor(user)
  })

  // ── LIST ───────────────────────────────────────────────────────────────────

  describe('GET /api/posters', () => {
    it('returns an empty list when there are no posters', async () => {
      const res = await request(app).get('/api/posters')
      expect(res.status).toBe(200)
      expect(res.body.data).toEqual([])
      expect(res.body.total).toBe(0)
    })

    it('returns created posters with stockInfo attached', async () => {
      await Poster.create(posterData)
      const res = await request(app).get('/api/posters')
      expect(res.status).toBe(200)
      expect(res.body.data).toHaveLength(1)
      // stockInfo is computed server-side; verify the shape is present
      expect(res.body.data[0]).toHaveProperty('stockInfo')
      expect(res.body.data[0].stockInfo).toHaveProperty('availableStock', 10)
    })

    it('filters by ?forSale=true and ignores non-forSale posters', async () => {
      await Poster.create({ ...posterData, forSale: true })
      await Poster.create({ ...posterData, title: 'Not For Sale', forSale: false })
      const res = await request(app).get('/api/posters?forSale=true')
      expect(res.status).toBe(200)
      expect(res.body.data).toHaveLength(1)
      expect(res.body.data[0].title).toBe('Affiche Test')
    })

    it('filters by title search ?q=', async () => {
      await Poster.create({ ...posterData, title: 'Bretagne Classique' })
      await Poster.create({ ...posterData, title: 'Finistère Bleu' })
      const res = await request(app).get('/api/posters?q=bretagne')
      expect(res.status).toBe(200)
      expect(res.body.data).toHaveLength(1)
      expect(res.body.data[0].title).toBe('Bretagne Classique')
    })

    it('paginates results correctly', async () => {
      await Poster.insertMany([1, 2, 3].map(i => ({ ...posterData, title: `Poster ${i}` })))
      const res = await request(app).get('/api/posters?page=1&limit=2')
      expect(res.status).toBe(200)
      expect(res.body.data).toHaveLength(2)
      expect(res.body.pages).toBe(2)
    })
  })

  // ── GET ONE ────────────────────────────────────────────────────────────────

  describe('GET /api/posters/:id', () => {
    it('returns a single poster with stockInfo', async () => {
      const poster = await Poster.create(posterData)
      const res = await request(app).get(`/api/posters/${poster._id}`)
      expect(res.status).toBe(200)
      expect(res.body.title).toBe(posterData.title)
      expect(res.body.stockInfo.availableStock).toBe(10)
    })

    it('returns 404 for an unknown id', async () => {
      const fakeId = '000000000000000000000001'
      const res = await request(app).get(`/api/posters/${fakeId}`)
      expect(res.status).toBe(404)
    })
  })

  // ── CREATE ─────────────────────────────────────────────────────────────────

  describe('POST /api/posters', () => {
    it('admin can create a poster', async () => {
      const res = await request(app)
        .post('/api/posters')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('title', 'Nouvelle Affiche')
        .field('price', '15')
        .field('totalStock', '5')
      expect(res.status).toBe(200)
      expect(res.body.title).toBe('Nouvelle Affiche')
      expect(res.body.totalStock).toBe(5)
    })

    it('rejects unauthenticated requests with 401', async () => {
      const res = await request(app).post('/api/posters').send(posterData)
      expect(res.status).toBe(401)
    })

    it('rejects non-admin users with 403', async () => {
      const res = await request(app)
        .post('/api/posters')
        .set('Authorization', `Bearer ${userToken}`)
        .send(posterData)
      expect(res.status).toBe(403)
    })
  })

  // ── UPDATE ─────────────────────────────────────────────────────────────────

  describe('PUT /api/posters/:id', () => {
    it('admin can update a poster', async () => {
      const poster = await Poster.create(posterData)
      const res = await request(app)
        .put(`/api/posters/${poster._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .field('title', 'Titre Modifié')
        .field('price', '25')
      expect(res.status).toBe(200)
      expect(res.body.title).toBe('Titre Modifié')
      expect(res.body.price).toBe(25)
    })

    it('returns 404 when updating a non-existent poster', async () => {
      const fakeId = '000000000000000000000001'
      const res = await request(app)
        .put(`/api/posters/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'X' })
      expect(res.status).toBe(404)
    })

    it('rejects non-admin with 403', async () => {
      const poster = await Poster.create(posterData)
      const res = await request(app)
        .put(`/api/posters/${poster._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Hack' })
      expect(res.status).toBe(403)
    })
  })

  // ── DELETE ─────────────────────────────────────────────────────────────────

  describe('DELETE /api/posters/:id', () => {
    it('admin can delete a poster', async () => {
      const poster = await Poster.create(posterData)
      const res = await request(app)
        .delete(`/api/posters/${poster._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.status).toBe(200)
      expect(await Poster.findById(poster._id)).toBeNull()
    })

    it('rejects non-admin with 403', async () => {
      const poster = await Poster.create(posterData)
      const res = await request(app)
        .delete(`/api/posters/${poster._id}`)
        .set('Authorization', `Bearer ${userToken}`)
      expect(res.status).toBe(403)
      // Poster must still exist
      expect(await Poster.findById(poster._id)).not.toBeNull()
    })
  })
})
