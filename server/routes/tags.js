const express = require('express')
const router = express.Router()
const {authenticate, authorize} = require('../middleware/auth')
const { createTag, getTags, deleteTag } = require('../controllers/tagController')

router.post('/', authenticate, authorize('admin'), createTag)

router.get('/', getTags)

router.delete('/:id', authenticate, authorize('admin'), deleteTag)

module.exports = router
