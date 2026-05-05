const express = require('express')
const router = express.Router()
const {getMessage, upsertMessage, toggleBooking} = require('../controllers/messageController')
const { authenticate, authorize } = require('../middleware/auth')

router.get('/', getMessage)
router.post('/toggle-booking', authenticate, authorize('admin'), toggleBooking)
router.post('/', authenticate, authorize('admin'), upsertMessage)

module.exports = router
