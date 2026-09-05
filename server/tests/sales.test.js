const request = require('supertest')
const app = require('../app')
const { createUser, tokenFor } = require('./helpers/auth')
const Poster = require('../models/Poster')
const Booking = require('../models/Booking')

describe('Sales', () => {
  let admin, adminToken
  let user, userToken
  let poster, sale

  beforeEach(async () => {
    admin = await createUser({ email: 'admin@test.com', role: 'admin' })
    user  = await createUser({ email: 'user@test.com',  role: 'user' })
    adminToken = tokenFor(admin)
    userToken  = tokenFor(user)
    poster = await Poster.create({ title: 'Affiche', price: 20, totalStock: 10, forSale: true })
    sale = await Booking.create({
      user: user._id,
      poster: poster._id,
      quantity: 2,
      status: 'validated',
      priceAtBooking: 20,
      validatedBy: admin._id,
      validatedAt: new Date(),
    })
  })

  // ── LIST ───────────────────────────────────────────────────────────────────

  describe('GET /api/sales', () => {
    it('admin gets a paginated list of all sales', async () => {
      const res = await request(app)
        .get('/api/sales')
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.status).toBe(200)
      expect(res.body.total).toBe(1)
      expect(res.body.data[0].quantity).toBe(2)
      expect(res.body.data[0].reference).toMatch(/^RES-\d{6}$/)
    })

    it('filters by date range (startDate / endDate)', async () => {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
      const tomorrow  = new Date(Date.now() + 86400000).toISOString().split('T')[0]
      const res = await request(app)
        .get(`/api/sales?startDate=${yesterday}&endDate=${tomorrow}`)
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.status).toBe(200)
      expect(res.body.total).toBe(1)
    })

    it('returns nothing for a date range that excludes the sale', async () => {
      const future = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
      const res = await request(app)
        .get(`/api/sales?startDate=${future}`)
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.status).toBe(200)
      expect(res.body.total).toBe(0)
    })

    it('excludes non-validated bookings', async () => {
      await Booking.create({
        user: admin._id, poster: poster._id, quantity: 1, status: 'pending', priceAtBooking: 20,
      })
      const res = await request(app)
        .get('/api/sales')
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.body.total).toBe(1)
    })

    it('rejects a regular user with 403', async () => {
      const res = await request(app)
        .get('/api/sales')
        .set('Authorization', `Bearer ${userToken}`)
      expect(res.status).toBe(403)
    })

    it('rejects unauthenticated requests with 401', async () => {
      const res = await request(app).get('/api/sales')
      expect(res.status).toBe(401)
    })
  })

  describe('GET /api/sales sorting', () => {
    async function seedSecondSale() {
      const other = await createUser({ email: 'alice@test.com', role: 'user' })
      const otherPoster = await Poster.create({ title: 'A Poster', price: 100, totalStock: 5 })
      await Booking.create({
        user: other._id,
        poster: otherPoster._id,
        quantity: 1,
        status: 'validated',
        priceAtBooking: 100,
        validatedBy: admin._id,
        validatedAt: new Date(),
      })
    }

    it('sorts by buyer email ascending', async () => {
      await seedSecondSale()
      const res = await request(app)
        .get('/api/sales?sortBy=buyerEmail&sortDir=asc')
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.body.data.map((s) => s.user.email)).toEqual(['alice@test.com', 'user@test.com'])
    })

    it('sorts by poster title descending', async () => {
      await seedSecondSale()
      const res = await request(app)
        .get('/api/sales?sortBy=posterTitle&sortDir=desc')
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.body.data.map((s) => s.poster.title)).toEqual(['Affiche', 'A Poster'])
    })

    it('sorts by computed total price (quantity × priceAtSale)', async () => {
      await seedSecondSale()
      const res = await request(app)
        .get('/api/sales?sortBy=totalPrice&sortDir=asc')
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.body.data.map((s) => s.totalPrice)).toEqual([40, 100])
    })

    it('never leaks user password hashes for either user or validatedBy', async () => {
      const res = await request(app)
        .get('/api/sales')
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.body.data[0].user.password).toBeUndefined()
      expect(res.body.data[0].validatedBy.password).toBeUndefined()
    })

    it('defaults to validatedAt descending when no sortBy is given', async () => {
      await Booking.updateOne({ _id: sale._id }, { validatedAt: new Date('2020-01-01') })
      const otherPoster = await Poster.create({ title: 'A Poster', price: 5, totalStock: 5 })
      const newer = await Booking.create({
        user: user._id, poster: otherPoster._id, quantity: 1, status: 'validated', priceAtBooking: 5,
        validatedBy: admin._id, validatedAt: new Date('2030-01-01'),
      })
      const res = await request(app)
        .get('/api/sales')
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.body.data[0]._id).toBe(newer._id.toString())
    })
  })

  // ── BY USER ────────────────────────────────────────────────────────────────

  describe('GET /api/sales/user/:userId', () => {
    it('admin gets all sales for a specific user', async () => {
      const res = await request(app)
        .get(`/api/sales/user/${user._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(1)
      expect(res.body[0].quantity).toBe(2)
    })

    it('returns an empty array for a user with no sales', async () => {
      const other = await createUser({ email: 'other@test.com', role: 'user' })
      const res = await request(app)
        .get(`/api/sales/user/${other._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(0)
    })

    it('rejects non-admin with 403', async () => {
      const res = await request(app)
        .get(`/api/sales/user/${user._id}`)
        .set('Authorization', `Bearer ${userToken}`)
      expect(res.status).toBe(403)
    })
  })

  // ── BY POSTER ──────────────────────────────────────────────────────────────

  describe('GET /api/sales/poster/:posterId', () => {
    it('admin gets all sales for a specific poster', async () => {
      const res = await request(app)
        .get(`/api/sales/poster/${poster._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(1)
    })

    it('returns empty for a poster with no sales', async () => {
      const otherPoster = await Poster.create({ title: 'Autre', price: 5, totalStock: 5 })
      const res = await request(app)
        .get(`/api/sales/poster/${otherPoster._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(0)
    })

    it('rejects non-admin with 403', async () => {
      const res = await request(app)
        .get(`/api/sales/poster/${poster._id}`)
        .set('Authorization', `Bearer ${userToken}`)
      expect(res.status).toBe(403)
    })
  })

  // ── CSV EXPORT ─────────────────────────────────────────────────────────────

  describe('GET /api/sales/export/csv', () => {
    it('admin receives a CSV file with correct headers', async () => {
      const res = await request(app)
        .get('/api/sales/export/csv')
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.status).toBe(200)
      expect(res.headers['content-type']).toMatch(/text\/csv/)
      // Verify the CSV contains the expected column names
      expect(res.text).toMatch(/user/)
      expect(res.text).toMatch(/quantity/)
      expect(res.text).toMatch(/priceAtSale/)
    })

    it('filters CSV by buyerId', async () => {
      // Create a second user + sale to confirm filtering works
      const other = await createUser({ email: 'other@test.com', role: 'user' })
      await Booking.create({
        user: other._id, poster: poster._id, quantity: 5, status: 'validated',
        priceAtBooking: 20, validatedBy: admin._id, validatedAt: new Date(),
      })
      const res = await request(app)
        .get(`/api/sales/export/csv?buyerId=${user._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.status).toBe(200)
      // The CSV body must contain the first user's data but not the other's
      expect(res.text).toMatch(/user@test\.com/)
      expect(res.text).not.toMatch(/other@test\.com/)
    })

    it('rejects non-admin with 403', async () => {
      const res = await request(app)
        .get('/api/sales/export/csv')
        .set('Authorization', `Bearer ${userToken}`)
      expect(res.status).toBe(403)
    })
  })
})
