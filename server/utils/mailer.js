// utils/mailer.js
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === 'true', // true for port 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

async function sendEmail(to, subject, html) {
  return transporter.sendMail({
    from: `"${process.env.EMAIL_FROM_NAME || 'Poster Store'}" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  })
}

module.exports = sendEmail
