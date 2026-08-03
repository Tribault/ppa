const express = require('express')
const cors = require('cors')
const authRoutes = require('./routes/auth')
const posterRoutes = require('./routes/posters')
const bookingRoutes = require('./routes/bookings')
const saleRoutes = require('./routes/sales')
const userRoutes = require('./routes/users')
const tagRoutes = require('./routes/tags')
const messageRoutes = require('./routes/messages')
const movieRoutes = require('./routes/movies')
const locale = require('./middleware/locale')



const multer = require('multer')

const app = express()
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }))
app.use(express.json())
app.use(locale)
app.use('/uploads', express.static('uploads'))

app.use('/api/auth', authRoutes)
app.use('/api/posters', posterRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/sales', saleRoutes)
app.use('/api/users', userRoutes)
app.use('/api/tags', tagRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/movies', movieRoutes)

// Catch Multer errors (bad file type, file too large) and return a clean 400
// instead of letting them bubble up as an unhandled 500.
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message?.includes('Format non supporté')) {
    return res.status(400).json({ error: err.message })
  }
  next(err)
})

module.exports = app