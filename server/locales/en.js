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
  },

  poster: {
    notFound: 'Poster not found.',
    deleted: 'Poster deleted.',
    serverError: 'Server error.',
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
  },

  sale: {
    exportError: 'Unable to export sales.',
  },

  message: {
    defaultContent: 'Welcome message',
  },

  movie: {
    notFound: 'Movie not found.',
    missingPosterPath: 'Missing poster path.',
    posterFetchError: 'Unable to fetch this poster.',
  },
}
