const express = require('express')
const router = express.Router()
const { authenticate, authorize } = require('../middleware/auth')
const { searchMovies, getMovieDetails, getMoviePosters, selectMoviePoster } = require('../controllers/movieController')

router.get('/search', authenticate, authorize('admin'), searchMovies)
router.get('/tmdb/:id', authenticate, authorize('admin'), getMovieDetails)
router.get('/tmdb/:id/posters', authenticate, authorize('admin'), getMoviePosters)
router.post('/tmdb-poster', authenticate, authorize('admin'), selectMoviePoster)

module.exports = router
