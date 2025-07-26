const express = require('express')
const router = express.Router()
const upload = require('../middleware/upload')
const {authenticate, authorize} = require('../middleware/auth')

const {createBooking} = require('../controllers/posterController')

router.post('/bookings', authenticate,createBooking)