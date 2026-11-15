const request = require('supertest')
const app = require('../app')
const { createUser, tokenFor } = require('./helpers/auth')
const Location = require('../models/Location')
const Poster = require('../models/Poster')

const posterData = { title: 'Affiche Test', size: '40x60', price: 20, totalStock: 10, forSale: true }

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

    it('rejects a missing name with a localized message', async () => {
      const res = await request(app)
        .post('/api/locations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
      expect(res.status).toBe(400)
      expect(res.body.message).toBe('Le nom est requis.')
    })

    it('rejects a duplicate name with a localized message, in English when requested', async () => {
      await Location.create({ name: 'Réserve' })
      const res = await request(app)
        .post('/api/locations')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Accept-Language', 'en')
        .send({ name: 'Réserve' })
      expect(res.status).toBe(400)
      expect(res.body.message).toBe('This name is already in use.')
    })
  })

  describe('DELETE /api/locations/:id', () => {
    it('rejects anonymous requests', async () => {
      const location = await Location.create({ name: 'Réserve' })
      const res = await request(app).delete(`/api/locations/${location._id}`)
      expect(res.status).toBe(401)
    })

    it('rejects non-admin users', async () => {
      const location = await Location.create({ name: 'Réserve' })
      const res = await request(app)
        .delete(`/api/locations/${location._id}`)
        .set('Authorization', `Bearer ${userToken}`)
      expect(res.status).toBe(403)
    })

    it('lets an admin delete a location', async () => {
      const location = await Location.create({ name: 'Réserve' })
      const res = await request(app)
        .delete(`/api/locations/${location._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.status).toBe(200)
      expect(await Location.findById(location._id)).toBeNull()
    })

    it('removes the deleted location from any poster referencing it', async () => {
      const location = await Location.create({ name: 'Réserve' })
      const poster = await Poster.create({ ...posterData, locations: [location._id] })

      await request(app)
        .delete(`/api/locations/${location._id}`)
        .set('Authorization', `Bearer ${adminToken}`)

      const updated = await Poster.findById(poster._id)
      expect(updated.locations).toEqual([])
    })

    it('returns 404 for an unknown location', async () => {
      const res = await request(app)
        .delete('/api/locations/000000000000000000000001')
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.status).toBe(404)
    })
  })

  describe('PUT /api/locations/:id', () => {
    it('lets an admin rename a location, and posters show the new name', async () => {
      const item = await Location.create({ name: 'Ancien nom' })
      const poster = await Poster.create({ ...posterData, locations: [item._id] })
      const res = await request(app)
        .put(`/api/locations/${item._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: '  Nouveau nom  ' })
      expect(res.status).toBe(200)
      expect(res.body.name).toBe('Nouveau nom')
      const updated = await Poster.findById(poster._id).populate('locations')
      expect(updated.locations[0].name).toBe('Nouveau nom')
    })

    it('rejects an empty name, a duplicate name, a missing id and non-admins', async () => {
      const a = await Location.create({ name: 'A' })
      await Location.create({ name: 'B' })
      const put = (id, body, token = adminToken) =>
        request(app).put(`/api/locations/${id}`).set('Authorization', `Bearer ${token}`).send(body)
      expect((await put(a._id, { name: '   ' })).status).toBe(400)
      expect((await put(a._id, { name: 'B' })).status).toBe(400)
      expect((await put('000000000000000000000001', { name: 'C' })).status).toBe(404)
      expect((await put(a._id, { name: 'C' }, userToken)).status).toBe(403)
      expect((await Location.findById(a._id)).name).toBe('A')
    })
  })
})
