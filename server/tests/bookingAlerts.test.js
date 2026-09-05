jest.mock('../utils/mailer')

const request = require('supertest')
const app = require('../app')
const sendEmail = require('../utils/mailer')
const { createUser, tokenFor } = require('./helpers/auth')
const Poster = require('../models/Poster')

describe('Admin new-booking alerts', () => {
  let user, userToken, poster, poster2
  const originalAdminEmail = process.env.ADMIN_EMAIL

  beforeEach(async () => {
    process.env.ADMIN_EMAIL = 'admin-alerts@test.com'
    sendEmail.mockClear()
    sendEmail.mockResolvedValue(undefined)
    user = await createUser({ email: 'buyer@test.com', role: 'user' })
    userToken = tokenFor(user)
    poster = await Poster.create({ title: 'Affiche', price: 20, totalStock: 10, forSale: true })
    poster2 = await Poster.create({ title: 'Autre affiche', price: 30, totalStock: 10, forSale: true })
  })

  afterEach(() => {
    process.env.ADMIN_EMAIL = originalAdminEmail
  })

  it('alerts the configured admin email when a new booking is created', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ posterId: poster._id, userId: user._id, quantity: 2 })

    expect(res.status).toBe(201)
    expect(sendEmail).toHaveBeenCalledTimes(1)
    expect(sendEmail.mock.calls[0][0]).toBe('admin-alerts@test.com')
  })

  it('does not alert on a quantity update to an already-existing booking', async () => {
    await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ posterId: poster._id, userId: user._id, quantity: 2 })
    sendEmail.mockClear()

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ posterId: poster._id, userId: user._id, quantity: 4 })

    expect(res.status).toBe(200)
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it('does not attempt to send an alert when ADMIN_EMAIL is not configured', async () => {
    delete process.env.ADMIN_EMAIL

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ posterId: poster._id, userId: user._id, quantity: 1 })

    expect(res.status).toBe(201)
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it('still succeeds even if sending the admin alert fails', async () => {
    sendEmail.mockRejectedValue(new Error('SMTP down'))

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ posterId: poster._id, userId: user._id, quantity: 1 })

    expect(res.status).toBe(201)
  })

  it('sends one grouped alert covering every item in a basket checkout', async () => {
    const res = await request(app)
      .post('/api/bookings/basket')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ items: [
        { posterId: poster._id, quantity: 2 },
        { posterId: poster2._id, quantity: 1 },
      ] })

    expect(res.status).toBe(201)
    expect(sendEmail).toHaveBeenCalledTimes(1)
    expect(sendEmail.mock.calls[0][0]).toBe('admin-alerts@test.com')
    expect(sendEmail.mock.calls[0][2]).toEqual(expect.stringContaining('Affiche'))
    expect(sendEmail.mock.calls[0][2]).toEqual(expect.stringContaining('Autre affiche'))
  })
})
