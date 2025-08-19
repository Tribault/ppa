const express = require('express')
const router = express.Router()
const {authenticate, authorize} = require('../middleware/auth')
const { createTag, getTags} = require('../controllers/tagController')

router.post('/', authenticate, authorize('admin'), createTag)

router.get('/', getTags)

module.exports = router
