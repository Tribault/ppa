const jwt = require('jsonwebtoken')
const User = require('../../models/User')

// Creates a user directly in the DB and marks them as verified.
// We skip the API signup flow (which would send a verification email)
// and instead seed the DB directly — this is faster and deterministic.
async function createUser(overrides = {}) {
  return User.create({
    username: 'testuser',
    email: 'user@test.com',
    password: 'password123',
    role: 'user',
    isVerified: true,
    ...overrides,
  })
}

// Generates a signed JWT the same way the app does, so the authenticate
// middleware will accept it exactly as it would accept a real login token.
function tokenFor(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  )
}

module.exports = { createUser, tokenFor }
