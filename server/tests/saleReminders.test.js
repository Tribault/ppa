jest.mock('../utils/mailer')

const sendEmail = require('../utils/mailer')
const { createUser } = require('./helpers/auth')
const Poster = require('../models/Poster')
const Booking = require('../models/Booking')
const SaleDate = require('../models/SaleDate')
const { runSaleReminderCheck, daysBetween } = require('../jobs/saleReminders')

const posterData = { title: 'Affiche Test', size: '40x60', price: 20, totalStock: 10, forSale: true }

async function makeBooking(user, overrides = {}) {
  const poster = await Poster.create(posterData)
  return Booking.create({
    user: user._id,
    poster: poster._id,
    quantity: 1,
    status: 'pending',
    priceAtBooking: poster.price,
    ...overrides,
  })
}

beforeEach(() => {
  sendEmail.mockClear()
  sendEmail.mockResolvedValue(undefined)
})

describe('daysBetween', () => {
  it('counts whole calendar days regardless of time of day', () => {
    const from = new Date('2026-06-01T23:00:00')
    const to = new Date('2026-06-08T01:00:00')
    expect(daysBetween(from, to)).toBe(7)
  })
})

describe('runSaleReminderCheck', () => {
  it('does nothing when no sale date has been set', async () => {
    const user = await createUser()
    await makeBooking(user)
    await runSaleReminderCheck(new Date('2026-06-01'))
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it('does nothing when today is not exactly 7 or 1 day(s) before the sale', async () => {
    const user = await createUser()
    await makeBooking(user)
    await SaleDate.create({ date: new Date('2026-06-15') })
    await runSaleReminderCheck(new Date('2026-06-01')) // 14 days out
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it('sends the 7-day reminder to a user with a pending booking', async () => {
    const user = await createUser({ email: 'reserver@test.com' })
    const booking = await makeBooking(user)
    await SaleDate.create({ date: new Date('2026-06-15') })

    await runSaleReminderCheck(new Date('2026-06-08')) // exactly 7 days before

    expect(sendEmail).toHaveBeenCalledTimes(1)
    expect(sendEmail.mock.calls[0][0]).toBe('reserver@test.com')

    const updated = await Booking.findById(booking._id)
    expect(updated.reminder7SentAt).not.toBeNull()
    expect(updated.reminder1SentAt).toBeNull()
  })

  it('sends the 1-day reminder independently of the 7-day one', async () => {
    const user = await createUser({ email: 'reserver@test.com' })
    await makeBooking(user)
    await SaleDate.create({ date: new Date('2026-06-15') })

    await runSaleReminderCheck(new Date('2026-06-14')) // exactly 1 day before

    expect(sendEmail).toHaveBeenCalledTimes(1)
  })

  it('is idempotent — does not re-send the same reminder on a second run', async () => {
    const user = await createUser()
    await makeBooking(user)
    await SaleDate.create({ date: new Date('2026-06-15') })

    await runSaleReminderCheck(new Date('2026-06-08'))
    await runSaleReminderCheck(new Date('2026-06-08'))

    expect(sendEmail).toHaveBeenCalledTimes(1)
  })

  it('sends one combined email per user even with multiple pending bookings', async () => {
    const user = await createUser({ email: 'reserver@test.com' })
    await makeBooking(user)
    await makeBooking(user)
    await SaleDate.create({ date: new Date('2026-06-15') })

    await runSaleReminderCheck(new Date('2026-06-08'))

    expect(sendEmail).toHaveBeenCalledTimes(1)
  })

  it('ignores validated and cancelled bookings', async () => {
    const user = await createUser()
    await makeBooking(user, { status: 'validated' })
    const poster2 = await Poster.create(posterData)
    await Booking.create({
      user: user._id,
      poster: poster2._id,
      quantity: 1,
      status: 'cancelled',
      priceAtBooking: poster2.price,
    })
    await SaleDate.create({ date: new Date('2026-06-15') })

    await runSaleReminderCheck(new Date('2026-06-08'))

    expect(sendEmail).not.toHaveBeenCalled()
  })
})
