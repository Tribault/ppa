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
    saleReminderSubject: "Rappel : prochaine vente d'affiches",
    saleReminderBody: (email, date, bookings) => `
      <p>Bonjour ${email},</p>
      <p>Pour rappel, la prochaine vente d'affiches au cinéma l'Arvor aura lieu le
      <strong>${new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</strong>.</p>
      <p>Vous avez réservé :</p>
      <ul>
        ${bookings.map((b) => `<li>${b.quantity} × ${b.poster.title}</li>`).join('')}
      </ul>
      <p>Merci de venir chercher et régler vos affiches à cette date.</p>
    `,
  },
  help: {
    paragraphUser1: `Bienvenue sur le site de ventes des affiches du cinéma l'Arvor à Rennes !
          Le but de ce site est de pouvoir consulter et éventuellement réserver des affiches mises en vente par le
          personnel de l'Arvor. L'intégralité des fonds reviendra au financement actif du cinéma.`,
    paragraphUser2: `Contrairement à d'autres sites dont vous avez surement l'habitude, vous ne pouvez pas payer sur ce site mais
          simplement réserver. Il est donc nécessaire de venir chercher et payer ses affiches lors des ventes faites au
          cinéma. Le lieu et le temps est indiqué. Ces ventes ont lieu de manière cyclique.`,
    paragraphUser3: `Pourquoi ce système ? Afin de préserver l'aspect collaboratif et collectif du cinéma associatif, nous
          impliquons les bénévoles et les salariés dans l'exercice du stockage et de la vente des affiches.`,
    howto: 'Comment ça marche ?',
    tickUser1: `Afin de réserver une affiche, vous devez créer un compte. Un email de confirmation vous sera envoyé à
            l'issue de cette inscription. Conformément au RGPD, le cinéma l'Arvor ne conserve pas vos données.`,
    tickUser2: `Réserver une affiche soit par sa page individuelle, soit directement depuis le catalogue. Plusieurs
            exemplaires peuvent être réservés. Le prix total sera affiché et une confirmation vous sera demandée.`,
    tickUser3: `En réservant une ou plusieurs affiches, vous vous engagez à payer et à venir chercher vos affiches par
            principe.`,
    tickUser4: `A l'issue de la confirmation de la réservation, un email vous sera envoyé pour vous rappeler votre
            réservation ainsi que l'heure et la date de la vente.`,
    tickUser5: `Des rappels successifs vous seront envoyés avant l'issue de la vente.`,
    tickUser6: `Avant la vente, vous pouvez modifier le nombre d'affiches réservées ou annuler la réservation.`,
    tickUser7: `Une réservation reste valide deux semaines après la vente. Si vous n'êtes pas disponible, merci de
            contacter l'arvor à l'adresse suivante : BLA BLA. Le stock des affiches étant important, les affiches
            pourront être retirées après la vente mais le paiement devra être réalisé auprès de la billeterie de l'Arvor
            auparavant.`,
    tickUser8: `Si vous avez la moindre question, n'hésitez pas à envoyer un email à : BLA BLA.`,

  },
  poster: {
    notFound: 'Affiche introuvable.',
    deleted: 'Affiche supprimée.',
    serverError: 'Erreur serveur.',
  },

  saleDate: {
    invalidDate: 'Date invalide.',
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

  movie: {
    notFound: 'Film introuvable.',
    missingPosterPath: "Chemin de l'affiche manquant.",
    posterFetchError: 'Impossible de récupérer cette affiche.',
  },
}
