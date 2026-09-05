module.exports = {
  auth: {
    emailAlreadyInUse: 'Email address already in use.',
    signupSuccess: 'Sign up successful — check your email to activate your account.',
    missingToken: 'Missing token.',
    invalidOrExpiredVerificationToken: 'Invalid or expired verification link.',
    emailVerifiedSuccess: 'Email address verified! You can now log in.',
    invalidCredentials: 'Incorrect credentials.',
    notVerified: 'Account not verified.',
    resetLinkSent: 'If an account exists, a reset link has been sent.',
    verificationEmailSent: 'If your account exists, a new verification email has been sent.',
    emailAlreadyVerified: 'Your email address is already verified.',
    invalidOrExpiredToken: 'Invalid or expired token.',
    passwordResetSuccess: 'Password reset successfully.',
    serverError: 'Server error.',
    noToken: 'No token provided.',
    userNotFound: 'User not found.',
    emailNotVerified: 'Email not verified.',
    notAuthenticated: 'Not authenticated.',
    forbidden: 'Forbidden.',
  },

  validation: {
    emailRequired: 'Email address is required.',
    invalidEmail: 'Invalid email address.',
    passwordRequired: 'Password is required.',
    nameRequired: 'Name is required.',
    nameAlreadyInUse: 'This name is already in use.',
  },

  email: {
    verifySubject: 'Verify your email address',
    verifyBody: (email, link) => `
      <p>Hello ${email},</p>
      <p>Click the link below to verify your email address:</p>
      <a href="${link}">${link}</a>
      <p>This link expires in 24 hours.</p>
    `,
    resendSubject: 'Verify your email address',
    resendBody: (email, link) => `
      <p>Hello ${email},</p>
      <p>Click below to verify your email address:</p>
      <a href="${link}">${link}</a>
      <p>This link expires in 1 hour.</p>
    `,
    resetSubject: 'Password reset',
    resetBody: (email, link) => `
      <p>Hello ${email},</p>
      <p>You requested a password reset. Click below:</p>
      <a href="${link}">${link}</a>
      <p>This link expires in 15 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
    `,
    saleReminderSubject: 'Reminder: upcoming poster sale',
    saleReminderBody: (email, date, bookings) => `
      <p>Hello ${email},</p>
      <p>Just a reminder that the next poster sale at the Arvor cinema will take place on
      <strong>${new Date(date).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</strong>.</p>
      <p>You have reserved:</p>
      <ul>
        ${bookings.map((b) => `<li>${b.quantity} × ${b.poster.title}</li>`).join('')}
      </ul>
      <p>Please come collect and pay for your posters on that date.</p>
    `,
    overdueReminderSubject: 'Reminder: booking still pending',
    overdueReminderBody: (email, date, bookings) => `
      <p>Hello ${email},</p>
      <p>The poster sale on
      <strong>${new Date(date).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</strong>
      was more than 30 days ago, but you still have a pending booking:</p>
      <ul>
        ${bookings.map((b) => `<li>${b.quantity} × ${b.poster.title}</li>`).join('')}
      </ul>
      <p>Please get in touch with us soon to come collect and pay for your posters, or to cancel your booking.</p>
    `,
    newBookingAdminSubject: 'New booking',
    newBookingAdminBody: (userEmail, reference, bookings) => `
      <p>New booking from <strong>${userEmail}</strong> (reference <strong>${reference}</strong>):</p>
      <ul>
        ${bookings.map((b) => `<li>${b.quantity} × ${b.poster.title} — ${(b.quantity * b.priceAtBooking).toFixed(2)} €</li>`).join('')}
      </ul>
    `,
    overdueAdminSubject: (days) => `Unpaid bookings for ${days} days`,
    overdueAdminBody: (days, saleDate, bookings) => `
      <p>The following bookings are still not validated ${days} days after the sale on
      <strong>${new Date(saleDate).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</strong>:</p>
      <ul>
        ${bookings.map((b) => `<li>${b.user.email} — ${b.quantity} × ${b.poster.title} (ref. ${b.reference})</li>`).join('')}
      </ul>
    `,
  },

  poster: {
    notFound: 'Poster not found.',
    deleted: 'Poster deleted.',
    serverError: 'Server error.',
    unsupportedFormat: 'Unsupported format. Use JPEG, PNG, WebP or GIF.',
    fileTooLarge: 'File too large (10 MB max).',
  },

  location: {
    notFound: 'Location not found.',
    deleted: 'Location deleted.',
    serverError: 'Server error.',
  },

  tag: {
    notFound: 'Tag not found.',
    deleted: 'Tag deleted.',
    serverError: 'Server error.',
  },

  saleDate: {
    invalidDate: 'Invalid date.',
  },

  booking: {
    missingFields: 'posterId, userId and quantity are required.',
    posterNotFound: 'Poster not found.',
    userNotFound: 'Customer not found.',
    notEnoughStock: 'Not enough stock for this booking.',
    notFound: 'Booking not found.',
    notAuthorized: 'Action not authorized.',
    onlyPendingCanBeCancelled: 'Only pending bookings can be cancelled.',
    cancelled: 'Booking cancelled.',
    serverError: 'Server error.',
    invalidStatus: 'Invalid status.',
    basketUpdated: 'Basket updated.',
  },

  user: {
    emailAlreadyInUse: 'Email address already in use.',
    created: 'User created.',
    notFound: 'User not found.',
    notAuthorized: 'Action not authorized.',
    updated: 'User updated.',
    deleted: 'User deleted.',
    failedToFetch: 'Unable to fetch users.',
    failedToFetchOne: 'Unable to fetch the user.',
    failedToUpdate: 'Unable to update the user.',
    failedToDelete: 'Unable to delete the user.',
    failedToCreate: 'Unable to create the user.',
  },

  sale: {
    exportError: 'Unable to export sales.',
  },

  message: {
    defaultContent: 'Welcome message',
    serverError: 'Server error.',
  },

  movie: {
    notFound: 'Movie not found.',
    missingPosterPath: 'Missing poster path.',
    posterFetchError: 'Unable to fetch this poster.',
  },
}
