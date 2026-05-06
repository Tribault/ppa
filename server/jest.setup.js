// Set env vars before any module is required, so middleware/controllers
// pick up the right JWT_SECRET when they're first imported.
process.env.JWT_SECRET = 'test-jwt-secret'
process.env.NODE_ENV = 'test'

const { MongoMemoryServer } = require('mongodb-memory-server')
const mongoose = require('mongoose')

let mongod

// Spin up a real but temporary MongoDB instance before the suite starts.
// Why real MongoDB and not mocks? Because mocks would skip Mongoose validators,
// unique indexes, and pre-save hooks — all things we want to catch here.
beforeAll(async () => {
  mongod = await MongoMemoryServer.create()
  await mongoose.connect(mongod.getUri())
})

// Wipe every collection after each test so state never leaks between cases.
afterEach(async () => {
  for (const col of Object.values(mongoose.connection.collections)) {
    await col.deleteMany()
  }
})

afterAll(async () => {
  await mongoose.connection.close()
  await mongod.stop()
})
