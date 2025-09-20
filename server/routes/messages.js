const express = require('express')
const router = express.Router()
const {getMessage, upsertMessage, toggleBooking} = require('../controllers/messageController')

router.get('/', getMessage)
router.post('/toggle-booking', toggleBooking)
router.post('/', upsertMessage)

module.exports = router
