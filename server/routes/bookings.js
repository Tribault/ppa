const express = require('express')
const router = express.Router()
const {authenticate} = require('../middleware/auth')

const {createOrUpdateBooking, getBookings, deleteBooking }  = require('../controllers/bookingController')

router.post('/', authenticate,createOrUpdateBooking)
router.put('/:id', authenticate, createOrUpdateBooking)
router.get('/', authenticate, getBookings)
router.delete('/:id', authenticate, deleteBooking)

module.exports = router