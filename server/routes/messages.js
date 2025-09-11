const express = require('express')
const router = express.Router()
const {getMessage, upsertMessage} = require('../controllers/messageController')

router.get('/', getMessage)

router.post('/', upsertMessage)

module.exports = router
