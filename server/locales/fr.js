module.exports = {
  auth: {
    emailAlreadyInUse: 'Adresse e-mail déjà utilisée.',
    signupSuccess: "Inscription réussie — vérifiez votre e-mail pour activer votre compte.",
    missingToken: 'Jeton manquant.',
    invalidOrExpiredVerificationToken: 'Lien de vérification invalide ou expiré.',
    emailVerifiedSuccess: 'Adresse e-mail vérifiée ! Vous pouvez maintenant vous connecter.',
    invalidCredentials: 'Identifiants incorrects.',
    notVerified: 'Compte non vérifié.',
    resetLinkSent: "Si un compte existe, un lien de réinitialisation a été envoyé.",
    verificationEmailSent: "Si votre compte existe, un nouvel e-mail de vérification a été envoyé.",
    emailAlreadyVerified: 'Votre adresse e-mail est déjà vérifiée.',
    invalidOrExpiredToken: 'Jeton invalide ou expiré.',
    passwordResetSuccess: 'Mot de passe réinitialisé avec succès.',
    serverError: 'Erreur serveur.',
  },

  email: {
    verifySubject: 'Vérifiez votre adresse e-mail',
    verifyBody: (email, link) => `
      <p>Bonjour ${email},</p>
      <p>Cliquez sur le lien ci-dessous pour vérifier votre adresse e-mail :</p>
      <a href="${link}">${link}</a>
      <p>Ce lien expire dans 24 heures.</p>
    `,
    resendSubject: 'Vérifiez votre adresse e-mail',
    resendBody: (email, link) => `
      <p>Bonjour ${email},</p>
      <p>Cliquez ci-dessous pour vérifier votre adresse e-mail :</p>
      <a href="${link}">${link}</a>
      <p>Ce lien expire dans 1 heure.</p>
    `,
    resetSubject: 'Réinitialisation du mot de passe',
    resetBody: (email, link) => `
      <p>Bonjour ${email},</p>
      <p>Vous avez demandé une réinitialisation de mot de passe. Cliquez ci-dessous :</p>
      <a href="${link}">${link}</a>
      <p>Ce lien expire dans 15 minutes.</p>
      <p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.</p>
    `,
  },

  poster: {
    notFound: 'Affiche introuvable.',
    deleted: 'Affiche supprimée.',
    serverError: 'Erreur serveur.',
  },

  booking: {
    missingFields: 'posterId, userId et quantité sont requis.',
    posterNotFound: 'Affiche introuvable.',
    userNotFound: 'Client introuvable.',
    notEnoughStock: 'Stock insuffisant pour cette réservation.',
    notFound: 'Réservation introuvable.',
    notAuthorized: 'Action non autorisée.',
    onlyPendingCanBeCancelled: 'Seules les réservations en attente peuvent être annulées.',
    cancelled: 'Réservation annulée.',
    serverError: 'Erreur serveur.',
  },

  user: {
    emailAlreadyInUse: 'Adresse e-mail déjà utilisée.',
    created: 'Utilisateur créé.',
    notFound: 'Utilisateur introuvable.',
    notAuthorized: 'Action non autorisée.',
    updated: 'Utilisateur mis à jour.',
    deleted: 'Utilisateur supprimé.',
    failedToFetch: 'Impossible de récupérer les utilisateurs.',
    failedToFetchOne: "Impossible de récupérer l'utilisateur.",
    failedToUpdate: "Impossible de mettre à jour l'utilisateur.",
    failedToDelete: "Impossible de supprimer l'utilisateur.",
  },

  sale: {
    exportError: 'Impossible d\'exporter les ventes.',
  },

  message: {
    defaultContent: 'Message de bienvenue',
  },
}
