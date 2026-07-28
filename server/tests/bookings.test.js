const request = require('supertest')
const app = require('../app')
const { createUser, tokenFor } = require('./helpers/auth')
const Poster = require('../models/Poster')
const Booking = require('../models/Booking')
const Sale = require('../models/Sale')

describe('Bookings', () => {
  let admin, adminToken
  let user, userToken
  let poster

  beforeEach(async () => {
    admin = await createUser({ email: 'admin@test.com', role: 'admin' })
    user  = await createUser({ email: 'user@test.com',  role: 'user' })
    adminToken = tokenFor(admin)
    userToken  = tokenFor(user)
    // A poster with 10 units in stock, needed for every booking test
    poster = await Poster.create({ title: 'Affiche', price: 20, totalStock: 10, forSale: true })
  })

  // Helper: create a pending booking via the API
  async function bookPoster(quantity = 2, token = userToken, userId = null) {
    return request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({ posterId: poster._id, userId: userId ?? user._id, quantity })
  }

  // ── CREATE ─────────────────────────────────────────────────────────────────

  describe('POST /api/bookings (create)', () => {
    it('user creates a pending booking and price is captured from poster', async () => {
      const res = await bookPoster(3)
      expect(res.status).toBe(201)
      expect(res.body.quantity).toBe(3)
      expect(res.body.status).toBe('pending')
      // priceAtBooking is set by the controller from poster.price, not from the request body
      expect(res.body.priceAtBooking).toBe(20)
    })

    it('rejects a booking that exceeds available stock', async () => {
      const res = await bookPoster(11) // totalStock is 10
      expect(res.status).toBe(400)
      expect(res.body.error).toMatch(/stock/i)
    })

    it('requires authentication', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .send({ posterId: poster._id, userId: user._id, quantity: 1 })
      expect(res.status).toBe(401)
    })

    it('returns 404 for an unknown poster', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ posterId: '000000000000000000000001', userId: user._id, quantity: 1 })
      expect(res.status).toBe(404)
    })

    it('returns 404 for an unknown user (admin targeting another user)', async () => {
      // Non-admins can't target an arbitrary userId at all (it's ignored and forced to their
      // own id — see the "cannot book on behalf of another user" test below), so this
      // validation path is only reachable by an admin.
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ posterId: poster._id, userId: '000000000000000000000001', quantity: 1 })
      expect(res.status).toBe(404)
    })

    it('cannot book on behalf of another user — userId is ignored for non-admins', async () => {
      const other = await createUser({ email: 'other-target@test.com', role: 'user' })
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ posterId: poster._id, userId: other._id, quantity: 1 })
      expect(res.status).toBe(201)
      // Booking must belong to the authenticated user, not the spoofed target
      expect(res.body.user._id ?? res.body.user).toBe(String(user._id))
    })

    it('cannot set status directly as a non-admin — new booking always starts pending', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ posterId: poster._id, userId: user._id, quantity: 1, status: 'validated' })
      expect(res.status).toBe(201)
      expect(res.body.status).toBe('pending')
      expect(await Sale.countDocuments()).toBe(0)
    })
  })

  // ── UPDATE (same endpoint, same user+poster) ────────────────────────────────

  describe('POST /api/bookings (update existing)', () => {
    it('updates quantity when the same user books the same poster again', async () => {
      await bookPoster(2)
      // Second call updates the existing booking instead of creating a new one
      const res = await bookPoster(4)
      expect(res.status).toBe(200)
      expect(res.body.quantity).toBe(4)
      // Still only one booking record in the DB
      expect(await Booking.countDocuments()).toBe(1)
    })

    it('validates a booking and automatically creates a Sale record', async () => {
      await bookPoster(2) // first: create pending booking
      // Second call by admin: set status to validated
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ posterId: poster._id, userId: user._id, quantity: 2, status: 'validated' })
      expect(res.status).toBe(200)
      expect(res.body.status).toBe('validated')
      // A Sale must have been created automatically
      const sales = await Sale.find({ user: user._id, poster: poster._id })
      expect(sales).toHaveLength(1)
      expect(sales[0].quantity).toBe(2)
      expect(sales[0].priceAtSale).toBe(20)
    })

    it('does not create a duplicate Sale if validated twice', async () => {
      await bookPoster(2)
      const body = { posterId: poster._id, userId: user._id, quantity: 2, status: 'validated' }
      await request(app).post('/api/bookings').set('Authorization', `Bearer ${adminToken}`).send(body)
      await request(app).post('/api/bookings').set('Authorization', `Bearer ${adminToken}`).send(body)
      // Only one Sale should exist
      expect(await Sale.countDocuments()).toBe(1)
    })

    it('removes the Sale when a validated booking is set back to pending', async () => {
      await bookPoster(2)
      const validate = { posterId: poster._id, userId: user._id, quantity: 2, status: 'validated' }
      await request(app).post('/api/bookings').set('Authorization', `Bearer ${adminToken}`).send(validate)
      expect(await Sale.countDocuments()).toBe(1)

      const revert = { posterId: poster._id, userId: user._id, quantity: 2, status: 'pending' }
      await request(app).post('/api/bookings').set('Authorization', `Bearer ${adminToken}`).send(revert)
      // Sale must have been deleted
      expect(await Sale.countDocuments()).toBe(0)
    })

    it('respects available stock when updating quantity', async () => {
      await bookPoster(2) // pending booking of 2 holds 2 units
      // Trying to jump to 11 when only 10 total (8 available + 2 already reserved = 10 max)
      const res = await bookPoster(11)
      expect(res.status).toBe(400)
    })
  })

  // ── LIST ───────────────────────────────────────────────────────────────────

  describe('GET /api/bookings', () => {
    it('user only sees their own bookings', async () => {
      // Create a second user with their own booking
      const other = await createUser({ email: 'other@test.com', role: 'user' })
      const otherPoster = await Poster.create({ title: 'Autre', price: 10, totalStock: 5 })
      await Booking.create({
        user: other._id, poster: otherPoster._id, quantity: 1, status: 'pending', priceAtBooking: 10
      })
      await bookPoster(2) // booking for our user

      const res = await request(app)
        .get('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
      expect(res.status).toBe(200)
      expect(res.body.total).toBe(1) // only the one booking belonging to `user`
    })

    it('admin with ?all=true sees every booking', async () => {
      const other = await createUser({ email: 'other@test.com', role: 'user' })
      const otherPoster = await Poster.create({ title: 'Autre', price: 10, totalStock: 5 })
      await Booking.create({
        user: other._id, poster: otherPoster._id, quantity: 1, status: 'pending', priceAtBooking: 10
      })
      await bookPoster(2)

      const res = await request(app)
        .get('/api/bookings?all=true')
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.status).toBe(200)
      expect(res.body.total).toBe(2)
    })

    it('requires authentication', async () => {
      const res = await request(app).get('/api/bookings')
      expect(res.status).toBe(401)
    })
  })

  // ── DELETE ─────────────────────────────────────────────────────────────────

  describe('DELETE /api/bookings/:id', () => {
    it('user can cancel their own pending booking', async () => {
      await bookPoster(2)
      const booking = await Booking.findOne({ user: user._id })
      const res = await request(app)
        .delete(`/api/bookings/${booking._id}`)
        .set('Authorization', `Bearer ${userToken}`)
      expect(res.status).toBe(200)
      expect(await Booking.findById(booking._id)).toBeNull()
    })

    it('cannot cancel a validated booking', async () => {
      // Create and immediately validate
      await bookPoster(2)
      const booking = await Booking.findOneAndUpdate(
        { user: user._id },
        { status: 'validated' },
        { new: true }
      )
      const res = await request(app)
        .delete(`/api/bookings/${booking._id}`)
        .set('Authorization', `Bearer ${userToken}`)
      expect(res.status).toBe(400)
      // Booking must still exist
      expect(await Booking.findById(booking._id)).not.toBeNull()
    })

    it("user cannot delete another user's booking", async () => {
      const other = await createUser({ email: 'other@test.com', role: 'user' })
      const otherPoster = await Poster.create({ title: 'Autre', price: 10, totalStock: 5 })
      const booking = await Booking.create({
        user: other._id, poster: otherPoster._id, quantity: 1, status: 'pending', priceAtBooking: 10
      })
      const res = await request(app)
        .delete(`/api/bookings/${booking._id}`)
        .set('Authorization', `Bearer ${userToken}`)
      expect(res.status).toBe(403)
    })

    it('admin can delete any booking', async () => {
      await bookPoster(2)
      const booking = await Booking.findOne({ user: user._id })
      const res = await request(app)
        .delete(`/api/bookings/${booking._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.status).toBe(200)
    })
  })
})
