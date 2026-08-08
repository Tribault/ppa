require('dotenv').config()
const mongoose = require('mongoose')
const cron = require('node-cron')
const app = require('./app')
const { runSaleReminderCheck } = require('./jobs/saleReminders')

mongoose.connect(process.env.MONGO_URI).then(()=> {
    console.log('MongoDB connected')
    app.listen(process.env.PORT, '127.0.0.1', () => {
        console.log(`Server running on http://localhost:${process.env.PORT}`)
    })

    cron.schedule('0 8 * * *', () => {
        runSaleReminderCheck().catch((err) => console.error('Sale reminder job failed', err))
    })
})