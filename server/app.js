const express = require('express')
const cors = require('cors')
const authRoutes = require('./routes/auth')
const posterRoutes = require('./routes/posters')

const app = express()
app.use(cors())
app.use(express.json())
app.use('/uploads', express.static('uploads'))

app.use('/api/auth', authRoutes)
app.use('/api/posters', posterRoutes)

module.exports = app