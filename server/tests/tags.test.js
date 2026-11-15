const request = require('supertest')
const app = require('../app')
const { createUser, tokenFor } = require('./helpers/auth')
const Tag = require('../models/Tag')
const Poster = require('../models/Poster')

const posterData = { title: 'Affiche Test', size: '40x60', price: 20, totalStock: 10, forSale: true }

describe('Tags', () => {
  let adminToken
  let userToken

  beforeEach(async () => {
    const admin = await createUser({ email: 'admin@test.com', role: 'admin' })
    const user = await createUser({ email: 'user@test.com', role: 'user' })
    adminToken = tokenFor(admin)
    userToken = tokenFor(user)
  })

  describe('GET /api/tags', () => {
    it('is publicly readable without authentication', async () => {
      await Tag.create({ name: 'Culte' })
      const res = await request(app).get('/api/tags')
      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(1)
      expect(res.body[0].name).toBe('Culte')
    })
  })

  describe('POST /api/tags', () => {
    it('rejects non-admin users', async () => {
      const res = await request(app)
        .post('/api/tags')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Culte' })
      expect(res.status).toBe(403)
    })

    it('lets an admin create a tag', async () => {
      const res = await request(app)
        .post('/api/tags')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Culte' })
      expect(res.status).toBe(200)
      expect(res.body.name).toBe('Culte')
    })

    it('rejects a missing name with a localized message', async () => {
      const res = await request(app)
        .post('/api/tags')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
      expect(res.status).toBe(400)
      expect(res.body.message).toBe('Le nom est requis.')
    })

    it('rejects a duplicate name with a localized message, in English when requested', async () => {
      await Tag.create({ name: 'Culte' })
      const res = await request(app)
        .post('/api/tags')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Accept-Language', 'en')
        .send({ name: 'Culte' })
      expect(res.status).toBe(400)
      expect(res.body.message).toBe('This name is already in use.')
    })
  })

  describe('DELETE /api/tags/:id', () => {
    it('rejects anonymous requests', async () => {
      const tag = await Tag.create({ name: 'Culte' })
      const res = await request(app).delete(`/api/tags/${tag._id}`)
      expect(res.status).toBe(401)
    })

    it('rejects non-admin users', async () => {
      const tag = await Tag.create({ name: 'Culte' })
      const res = await request(app)
        .delete(`/api/tags/${tag._id}`)
        .set('Authorization', `Bearer ${userToken}`)
      expect(res.status).toBe(403)
    })

    it('lets an admin delete a tag', async () => {
      const tag = await Tag.create({ name: 'Culte' })
      const res = await request(app)
        .delete(`/api/tags/${tag._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.status).toBe(200)
      expect(await Tag.findById(tag._id)).toBeNull()
    })

    it('removes the deleted tag from any poster referencing it', async () => {
      const tag = await Tag.create({ name: 'Culte' })
      const poster = await Poster.create({ ...posterData, tags: [tag._id] })

      await request(app)
        .delete(`/api/tags/${tag._id}`)
        .set('Authorization', `Bearer ${adminToken}`)

      const updated = await Poster.findById(poster._id)
      expect(updated.tags).toEqual([])
    })

    it('returns 404 for an unknown tag', async () => {
      const res = await request(app)
        .delete('/api/tags/000000000000000000000001')
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.status).toBe(404)
    })
  })

  describe('PUT /api/tags/:id', () => {
    it('lets an admin rename a tag, and posters show the new name', async () => {
      const item = await Tag.create({ name: 'Ancien nom' })
      const poster = await Poster.create({ ...posterData, tags: [item._id] })
      const res = await request(app)
        .put(`/api/tags/${item._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: '  Nouveau nom  ' })
      expect(res.status).toBe(200)
      expect(res.body.name).toBe('Nouveau nom')
      const updated = await Poster.findById(poster._id).populate('tags')
      expect(updated.tags[0].name).toBe('Nouveau nom')
    })

    it('rejects an empty name, a duplicate name, a missing id and non-admins', async () => {
      const a = await Tag.create({ name: 'A' })
      await Tag.create({ name: 'B' })
      const put = (id, body, token = adminToken) =>
        request(app).put(`/api/tags/${id}`).set('Authorization', `Bearer ${token}`).send(body)
      expect((await put(a._id, { name: '   ' })).status).toBe(400)
      expect((await put(a._id, { name: 'B' })).status).toBe(400)
      expect((await put('000000000000000000000001', { name: 'C' })).status).toBe(404)
      expect((await put(a._id, { name: 'C' }, userToken)).status).toBe(403)
      expect((await Tag.findById(a._id)).name).toBe('A')
    })
  })
})
