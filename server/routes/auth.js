const express = require('express')
const router = express.Router()
const {authenticate} = require('../middleware/auth')

const {signup, login, fetchUser, forgotPassword, resetPassword, verifyEmail, resendEmail} = require('../controllers/authController')

router.post('/signup', signup)
router.post('/login', login)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)
router.post('/verify-email', verifyEmail)
router.post('/resend-verification', resendEmail)
router.get('/me', authenticate, fetchUser)

module.exports = router