const express = require('express')
const router = express.Router()
const upload = require('../middleware/upload')
const {authenticate, authorize} = require('../middleware/auth')
const {
    getAllPosters, createPoster, updatePoster, deletePoster, bookPoster
} = require('../controllers/posterController')

router.get('/', getAllPosters)
router.post('/', authenticate, authorize('admin'), upload.single('image'), createPoster)
router.put('/:id', authenticate, authorize('admin'), updatePoster)
router.delete('/:id', authenticate, authorize('admin'), deletePoster)
router.post('/:id/book', authenticate, bookPoster)

module.exports = router