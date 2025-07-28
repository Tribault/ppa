const express = require('express')
const router = express.Router()
const {authenticate} = require('../middleware/auth')

const {signup, login, fetchUser} = require('../controllers/authController')

router.post('/signup', signup)
router.post('/login', login)
router.get('/me', authenticate, fetchUser)

module.exports = router