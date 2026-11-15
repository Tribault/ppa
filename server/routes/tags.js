const express = require('express')
const router = express.Router()
const {authenticate, authorize} = require('../middleware/auth')
const { createTag, getTags, updateTag, deleteTag } = require('../controllers/tagController')

router.post('/', authenticate, authorize('admin'), createTag)

router.get('/', getTags)

router.put('/:id', authenticate, authorize('admin'), updateTag)

router.delete('/:id', authenticate, authorize('admin'), deleteTag)

module.exports = router
