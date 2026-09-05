const request = require('supertest')
const app = require('../app')
const { createUser, tokenFor } = require('./helpers/auth')
const Poster = require('../models/Poster')
const Booking = require('../models/Booking')

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

    it('assigns a unique, human-readable reference to each new booking', async () => {
      const res = await bookPoster(1)
      expect(res.body.reference).toMatch(/^RES-\d{6}$/)

      const other = await createUser({ email: 'other-ref@test.com', role: 'user' })
      const res2 = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ posterId: poster._id, userId: other._id, quantity: 1 })
      expect(res2.body.reference).not.toBe(res.body.reference)
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
      const booking = await Booking.findOne({ user: user._id, poster: poster._id })
      expect(booking.validatedAt).toBeNull()
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

    it('validates a booking and stamps validatedAt/validatedBy', async () => {
      await bookPoster(2) // first: create pending booking
      // Second call by admin: set status to validated
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ posterId: poster._id, userId: user._id, quantity: 2, status: 'validated' })
      expect(res.status).toBe(200)
      expect(res.body.status).toBe('validated')
      const booking = await Booking.findOne({ user: user._id, poster: poster._id })
      expect(booking.validatedAt).not.toBeNull()
      expect(String(booking.validatedBy)).toBe(String(admin._id))
      expect(booking.quantity).toBe(2)
      expect(booking.priceAtBooking).toBe(20)
    })

    it('keeps the original validatedAt if validated twice', async () => {
      await bookPoster(2)
      const body = { posterId: poster._id, userId: user._id, quantity: 2, status: 'validated' }
      await request(app).post('/api/bookings').set('Authorization', `Bearer ${adminToken}`).send(body)
      const first = await Booking.findOne({ user: user._id, poster: poster._id })
      await request(app).post('/api/bookings').set('Authorization', `Bearer ${adminToken}`).send(body)
      const second = await Booking.findOne({ user: user._id, poster: poster._id })
      expect(second.validatedAt.getTime()).toBe(first.validatedAt.getTime())
    })

    it('clears validatedAt/validatedBy when a validated booking is set back to pending', async () => {
      await bookPoster(2)
      const validate = { posterId: poster._id, userId: user._id, quantity: 2, status: 'validated' }
      await request(app).post('/api/bookings').set('Authorization', `Bearer ${adminToken}`).send(validate)
      expect((await Booking.findOne({ user: user._id, poster: poster._id })).validatedAt).not.toBeNull()

      const revert = { posterId: poster._id, userId: user._id, quantity: 2, status: 'pending' }
      await request(app).post('/api/bookings').set('Authorization', `Bearer ${adminToken}`).send(revert)
      const booking = await Booking.findOne({ user: user._id, poster: poster._id })
      expect(booking.validatedAt).toBeNull()
      expect(booking.validatedBy).toBeNull()
    })

    it('respects available stock when updating quantity', async () => {
      await bookPoster(2) // pending booking of 2 holds 2 units
      // Trying to jump to 11 when only 10 total (8 available + 2 already reserved = 10 max)
      const res = await bookPoster(11)
      expect(res.status).toBe(400)
    })
  })

  describe('POST /api/bookings ("ready" status)', () => {
    it('an admin can move a booking to ready', async () => {
      await bookPoster(2)
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ posterId: poster._id, userId: user._id, quantity: 2, status: 'ready' })
      expect(res.status).toBe(200)
      expect(res.body.status).toBe('ready')
    })

    it('does not stamp validatedAt when a booking is marked ready', async () => {
      await bookPoster(2)
      await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ posterId: poster._id, userId: user._id, quantity: 2, status: 'ready' })
      expect((await Booking.findOne({ user: user._id, poster: poster._id })).validatedAt).toBeNull()
    })

    it('clears validatedAt when a validated booking is set back to ready', async () => {
      await bookPoster(2)
      const validate = { posterId: poster._id, userId: user._id, quantity: 2, status: 'validated' }
      await request(app).post('/api/bookings').set('Authorization', `Bearer ${adminToken}`).send(validate)
      expect((await Booking.findOne({ user: user._id, poster: poster._id })).validatedAt).not.toBeNull()

      const revert = { posterId: poster._id, userId: user._id, quantity: 2, status: 'ready' }
      await request(app).post('/api/bookings').set('Authorization', `Bearer ${adminToken}`).send(revert)
      expect((await Booking.findOne({ user: user._id, poster: poster._id })).validatedAt).toBeNull()
    })

    it('a non-admin cannot set a booking to ready', async () => {
      await bookPoster(2)
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ posterId: poster._id, userId: user._id, quantity: 2, status: 'ready' })
      expect(res.status).toBe(200)
      expect(res.body.status).toBe('pending')
    })

    it('counts ready bookings against available stock', async () => {
      await bookPoster(4)
      await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ posterId: poster._id, userId: user._id, quantity: 4, status: 'ready' })

      const res = await request(app).get(`/api/posters/${poster._id}`)
      expect(res.body.stockInfo.ready).toBe(4)
      expect(res.body.stockInfo.availableStock).toBe(6)
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

  describe('GET /api/bookings sorting', () => {
    async function seedTwoBookings() {
      const alice = await createUser({ email: 'alice@test.com', role: 'user' })
      const bob = await createUser({ email: 'bob@test.com', role: 'user' })
      const cheapPoster = await Poster.create({ title: 'A Poster', price: 5, totalStock: 10 })
      const pricyPoster = await Poster.create({ title: 'Z Poster', price: 50, totalStock: 10 })
      await Booking.create({
        user: alice._id, poster: pricyPoster._id, quantity: 1, status: 'pending', priceAtBooking: 50,
      })
      await Booking.create({
        user: bob._id, poster: cheapPoster._id, quantity: 3, status: 'pending', priceAtBooking: 5,
      })
    }

    it('sorts by user email ascending', async () => {
      await seedTwoBookings()
      const res = await request(app)
        .get('/api/bookings?all=true&sortBy=userEmail&sortDir=asc')
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.body.data.map((b) => b.user.email)).toEqual(['alice@test.com', 'bob@test.com'])
    })

    it('sorts by poster title descending', async () => {
      await seedTwoBookings()
      const res = await request(app)
        .get('/api/bookings?all=true&sortBy=posterTitle&sortDir=desc')
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.body.data.map((b) => b.poster.title)).toEqual(['Z Poster', 'A Poster'])
    })

    it('sorts by computed total price (quantity × priceAtBooking)', async () => {
      await seedTwoBookings()
      const res = await request(app)
        .get('/api/bookings?all=true&sortBy=totalPrice&sortDir=asc')
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.body.data.map((b) => b.totalPrice)).toEqual([15, 50])
    })

    it('never leaks the user password hash', async () => {
      await seedTwoBookings()
      const res = await request(app)
        .get('/api/bookings?all=true')
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.body.data[0].user.password).toBeUndefined()
    })

    it('defaults to bookedAt descending when no sortBy is given', async () => {
      const older = await Booking.create({
        user: user._id, poster: poster._id, quantity: 1, status: 'pending', priceAtBooking: 20,
        bookedAt: new Date('2024-01-01'),
      })
      const otherPoster = await Poster.create({ title: 'Autre', price: 1, totalStock: 5 })
      const newer = await Booking.create({
        user: user._id, poster: otherPoster._id,
        quantity: 1, status: 'pending', priceAtBooking: 1,
        bookedAt: new Date('2026-01-01'),
      })
      const res = await request(app)
        .get('/api/bookings?all=true')
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.body.data[0]._id).toBe(newer._id.toString())
      expect(res.body.data[1]._id).toBe(older._id.toString())
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

  describe('Basket system', () => {
    let poster2

    beforeEach(async () => {
      poster2 = await Poster.create({ title: 'Autre affiche', price: 30, totalStock: 10, forSale: true })
    })

    it('two separate bookings by the same user share the same reference while both are open', async () => {
      const first = await bookPoster(2)
      const second = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ posterId: poster2._id, userId: user._id, quantity: 1 })

      expect(first.body.reference).toBe(second.body.reference)
    })

    it('starts a new reference once the previous basket is fully validated', async () => {
      const first = await bookPoster(2)
      await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ posterId: poster._id, userId: user._id, quantity: 2, status: 'validated' })

      const second = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ posterId: poster2._id, userId: user._id, quantity: 1 })

      expect(second.body.reference).not.toBe(first.body.reference)
    })

    describe('POST /api/bookings/basket', () => {
      it('creates several bookings sharing one reference in a single request', async () => {
        const res = await request(app)
          .post('/api/bookings/basket')
          .set('Authorization', `Bearer ${userToken}`)
          .send({ items: [
            { posterId: poster._id, quantity: 2 },
            { posterId: poster2._id, quantity: 3 },
          ] })

        expect(res.status).toBe(201)
        expect(res.body.bookings).toHaveLength(2)
        expect(res.body.bookings[0].reference).toBe(res.body.reference)
        expect(res.body.bookings[1].reference).toBe(res.body.reference)
        expect(await Booking.countDocuments({ reference: res.body.reference })).toBe(2)
      })

      it('joins the user\'s already-open basket', async () => {
        const existing = await bookPoster(1)
        const res = await request(app)
          .post('/api/bookings/basket')
          .set('Authorization', `Bearer ${userToken}`)
          .send({ items: [{ posterId: poster2._id, quantity: 1 }] })

        expect(res.body.reference).toBe(existing.body.reference)
      })

      it('rejects the whole basket if one item exceeds stock, without saving any of it', async () => {
        const res = await request(app)
          .post('/api/bookings/basket')
          .set('Authorization', `Bearer ${userToken}`)
          .send({ items: [
            { posterId: poster._id, quantity: 2 },
            { posterId: poster2._id, quantity: 999 },
          ] })

        expect(res.status).toBe(400)
        expect(await Booking.countDocuments()).toBe(0)
      })

      it('ignores a userId in the body and always books for the authenticated user', async () => {
        const other = await createUser({ email: 'other@test.com', role: 'user' })
        const res = await request(app)
          .post('/api/bookings/basket')
          .set('Authorization', `Bearer ${userToken}`)
          .send({ items: [{ posterId: poster._id, quantity: 1, userId: other._id }] })

        expect(res.body.bookings[0].user._id ?? res.body.bookings[0].user).toBe(String(user._id))
      })

      it('rejects an empty basket', async () => {
        const res = await request(app)
          .post('/api/bookings/basket')
          .set('Authorization', `Bearer ${userToken}`)
          .send({ items: [] })
        expect(res.status).toBe(400)
      })

      it('requires authentication', async () => {
        const res = await request(app)
          .post('/api/bookings/basket')
          .send({ items: [{ posterId: poster._id, quantity: 1 }] })
        expect(res.status).toBe(401)
      })
    })

    describe('PATCH /api/bookings/reference/:reference', () => {
      it('admin can validate an entire basket at once', async () => {
        const created = await request(app)
          .post('/api/bookings/basket')
          .set('Authorization', `Bearer ${userToken}`)
          .send({ items: [
            { posterId: poster._id, quantity: 2 },
            { posterId: poster2._id, quantity: 1 },
          ] })
        const reference = created.body.reference

        const res = await request(app)
          .patch(`/api/bookings/reference/${reference}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ status: 'validated' })
        expect(res.status).toBe(200)

        const bookings = await Booking.find({ reference })
        expect(bookings).toHaveLength(2)
        for (const b of bookings) {
          expect(b.status).toBe('validated')
          expect(b.validatedAt).not.toBeNull()
          expect(String(b.validatedBy)).toBe(String(admin._id))
        }
      })

      it('admin can move an entire basket to ready', async () => {
        const created = await request(app)
          .post('/api/bookings/basket')
          .set('Authorization', `Bearer ${userToken}`)
          .send({ items: [
            { posterId: poster._id, quantity: 2 },
            { posterId: poster2._id, quantity: 1 },
          ] })

        const res = await request(app)
          .patch(`/api/bookings/reference/${created.body.reference}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ status: 'ready' })
        expect(res.status).toBe(200)

        const bookings = await Booking.find({ reference: created.body.reference })
        for (const b of bookings) expect(b.status).toBe('ready')
      })

      it('does not affect the individual-validation ability: a single booking in the basket can still be set independently', async () => {
        const created = await request(app)
          .post('/api/bookings/basket')
          .set('Authorization', `Bearer ${userToken}`)
          .send({ items: [
            { posterId: poster._id, quantity: 2 },
            { posterId: poster2._id, quantity: 1 },
          ] })
        const [b1] = created.body.bookings

        await request(app)
          .post('/api/bookings')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ posterId: poster._id, userId: user._id, quantity: 2, status: 'validated' })

        const updatedB1 = await Booking.findById(b1._id)
        const updatedB2 = await Booking.findOne({ poster: poster2._id })
        expect(updatedB1.status).toBe('validated')
        expect(updatedB2.status).toBe('pending')
      })

      it('rejects a non-admin', async () => {
        const created = await request(app)
          .post('/api/bookings/basket')
          .set('Authorization', `Bearer ${userToken}`)
          .send({ items: [{ posterId: poster._id, quantity: 1 }] })
        const res = await request(app)
          .patch(`/api/bookings/reference/${created.body.reference}`)
          .set('Authorization', `Bearer ${userToken}`)
          .send({ status: 'validated' })
        expect(res.status).toBe(403)
      })

      it('rejects an invalid status', async () => {
        const created = await bookPoster(1)
        const res = await request(app)
          .patch(`/api/bookings/reference/${created.body.reference}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ status: 'pending' })
        expect(res.status).toBe(400)
      })

      it('returns 404 for an unknown reference', async () => {
        const res = await request(app)
          .patch('/api/bookings/reference/RES-999999')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ status: 'validated' })
        expect(res.status).toBe(404)
      })
    })
  })
})
