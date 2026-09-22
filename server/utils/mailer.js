// utils/mailer.js
const { Resend } = require('resend')

let resend

async function sendEmail(to, subject, html) {
  resend ??= new Resend(process.env.RESEND_API_KEY)
  const { data, error } = await resend.emails.send({
    from: `"${process.env.EMAIL_FROM_NAME || 'Poster Store'}" <${process.env.EMAIL_FROM_ADDRESS}>`,
    to,
    subject,
    html,
  })
  if (error) throw new Error(`Resend send failed: ${error.name} - ${error.message}`)
  return data
}

module.exports = sendEmail
