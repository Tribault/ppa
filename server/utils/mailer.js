// utils/mailer.js
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: 'gmail', // or "Outlook", "Yahoo", etc.
  auth: {
    user: process.env.EMAIL_USER, // your email address
    pass: process.env.EMAIL_PASS, // app password (not your normal password!)
  },
})

async function sendEmail(to, subject, html) {
  return transporter.sendMail({
    from: `"Poster Store" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  })
}

module.exports = sendEmail
