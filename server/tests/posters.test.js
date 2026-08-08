// We use supertest to fire real HTTP requests at the Express app without
// binding to a port — faster and cleaner than starting a full server.
const request = require('supertest')
const app = require('../app')
const { createUser, tokenFor } = require('./helpers/auth')
const Poster = require('../models/Poster')
const Location = require('../models/Location')
const Tag = require('../models/Tag')

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

    it('never exposes locations to an anonymous request', async () => {
      const location = await Location.create({ name: 'Réserve' })
      await Poster.create({ ...posterData, locations: [location._id] })
      const res = await request(app).get('/api/posters')
      expect(res.status).toBe(200)
      expect(res.body.data[0].locations).toBeUndefined()
    })

    it('never exposes locations to a logged-in non-admin user', async () => {
      const location = await Location.create({ name: 'Réserve' })
      await Poster.create({ ...posterData, locations: [location._id] })
      const res = await request(app).get('/api/posters').set('Authorization', `Bearer ${userToken}`)
      expect(res.status).toBe(200)
      expect(res.body.data[0].locations).toBeUndefined()
    })

    it('includes populated locations for an admin request', async () => {
      const location = await Location.create({ name: 'Réserve' })
      await Poster.create({ ...posterData, locations: [location._id] })
      const res = await request(app).get('/api/posters').set('Authorization', `Bearer ${adminToken}`)
      expect(res.status).toBe(200)
      expect(res.body.data[0].locations).toHaveLength(1)
      expect(res.body.data[0].locations[0].name).toBe('Réserve')
    })
  })

  describe('GET /api/posters?sort=newest', () => {
    it('sorts by creation date, newest first', async () => {
      await Poster.create({ ...posterData, title: 'Older', createdAt: new Date('2020-01-01') })
      await Poster.create({ ...posterData, title: 'Newer', createdAt: new Date('2024-01-01') })
      const res = await request(app).get('/api/posters?sort=newest')
      expect(res.body.data.map((p) => p.title)).toEqual(['Newer', 'Older'])
    })

    it('defaults to alphabetical order when sort is omitted', async () => {
      await Poster.create({ ...posterData, title: 'Zebra' })
      await Poster.create({ ...posterData, title: 'Alpha' })
      const res = await request(app).get('/api/posters')
      expect(res.body.data.map((p) => p.title)).toEqual(['Alpha', 'Zebra'])
    })
  })

  describe('GET /api/posters filters', () => {
    it('filters by country', async () => {
      await Poster.create({ ...posterData, title: 'FR Poster', country: 'France' })
      await Poster.create({ ...posterData, title: 'US Poster', country: 'USA' })
      const res = await request(app).get('/api/posters?country=France')
      expect(res.body.data).toHaveLength(1)
      expect(res.body.data[0].title).toBe('FR Poster')
    })

    it('filters by genre', async () => {
      await Poster.create({ ...posterData, title: 'Comedy Poster', genre: 'Comédie' })
      await Poster.create({ ...posterData, title: 'Drama Poster', genre: 'Drame' })
      const res = await request(app).get('/api/posters?genre=Drame')
      expect(res.body.data).toHaveLength(1)
      expect(res.body.data[0].title).toBe('Drama Poster')
    })

    it('filters by tag id', async () => {
      const tag = await Tag.create({ name: 'Culte' })
      await Poster.create({ ...posterData, title: 'Tagged', tags: [tag._id] })
      await Poster.create({ ...posterData, title: 'Untagged' })
      const res = await request(app).get(`/api/posters?tags=${tag._id}`)
      expect(res.body.data).toHaveLength(1)
      expect(res.body.data[0].title).toBe('Tagged')
    })
  })

  describe('GET /api/posters/filters', () => {
    it('returns distinct, non-empty countries and genres', async () => {
      await Poster.create({ ...posterData, title: 'A', country: 'France', genre: 'Comédie' })
      await Poster.create({ ...posterData, title: 'B', country: 'USA', genre: 'Comédie' })
      await Poster.create({ ...posterData, title: 'C', country: '', genre: '' })
      const res = await request(app).get('/api/posters/filters')
      expect(res.status).toBe(200)
      expect(res.body.countries.sort()).toEqual(['France', 'USA'])
      expect(res.body.genres).toEqual(['Comédie'])
    })

    it('respects ?forSale=true', async () => {
      await Poster.create({ ...posterData, country: 'France', forSale: true })
      await Poster.create({ ...posterData, country: 'Japon', forSale: false })
      const res = await request(app).get('/api/posters/filters?forSale=true')
      expect(res.body.countries).toEqual(['France'])
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

    it('never exposes locations to an anonymous or non-admin request', async () => {
      const location = await Location.create({ name: 'Réserve' })
      const poster = await Poster.create({ ...posterData, locations: [location._id] })

      const anonRes = await request(app).get(`/api/posters/${poster._id}`)
      expect(anonRes.body.locations).toBeUndefined()

      const userRes = await request(app).get(`/api/posters/${poster._id}`).set('Authorization', `Bearer ${userToken}`)
      expect(userRes.body.locations).toBeUndefined()
    })

    it('includes populated locations for an admin request', async () => {
      const location = await Location.create({ name: 'Réserve' })
      const poster = await Poster.create({ ...posterData, locations: [location._id] })
      const res = await request(app).get(`/api/posters/${poster._id}`).set('Authorization', `Bearer ${adminToken}`)
      expect(res.body.locations).toHaveLength(1)
      expect(res.body.locations[0].name).toBe('Réserve')
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
