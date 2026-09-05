export default {
  appTitle: "Gestionnaire d'affiches de cinéma",
  nav: {
    loginSignup: 'Identification / Inscription',
    admin: 'Admin',
    myBookings: 'Mes réservations',
    logoutTitle: 'se déconnecter',
    logout: '[Déconnexion]',
    help: 'Aide',
    viewBasket: 'Voir le panier',
  },

  help: {
    title: 'Aide',
    paragraphUser1:
      "Bienvenue sur le site de ventes des affiches du cinéma l'Arvor à Rennes ! Le but de ce site est de pouvoir consulter et éventuellement réserver des affiches mises en vente par le personnel de l'Arvor. L'intégralité des fonds reviendra au financement actif du cinéma.",
    paragraphUser2:
      "Contrairement à d'autres sites dont vous avez surement l'habitude, vous ne pouvez pas payer sur ce site mais simplement réserver. Il est donc nécessaire de venir chercher et payer ses affiches lors des ventes faites au cinéma. Le lieu et le temps est indiqué. Ces ventes ont lieu de manière cyclique.",
    paragraphUser3:
      "Pourquoi ce système ? Afin de préserver l'aspect collaboratif et collectif du cinéma associatif, nous impliquons les bénévoles et les salariés dans l'exercice du stockage et de la vente des affiches.",
    howto: 'Comment ça marche ?',
    tickUser1:
      "Afin de réserver une affiche, vous devez créer un compte. Un email de confirmation vous sera envoyé à l'issue de cette inscription. Conformément au RGPD, le cinéma l'Arvor ne conserve pas vos données.",
    tickUser2:
      'Réserver une affiche soit par sa page individuelle, soit directement depuis le catalogue. Plusieurs exemplaires peuvent être réservés. Le prix total sera affiché et une confirmation vous sera demandée.',
    tickUser3:
      'En réservant une ou plusieurs affiches, vous vous engagez à payer et à venir chercher vos affiches par principe.',
    tickUser4:
      "A l'issue de la confirmation de la réservation, un email vous sera envoyé pour vous rappeler votre réservation ainsi que l'heure et la date de la vente.",
    tickUser5: "Des rappels successifs vous seront envoyés avant l'issue de la vente.",
    tickUser6: "Avant la vente, vous pouvez modifier le nombre d'affiches réservées ou annuler la réservation.",
    tickUser7:
      "Une réservation reste valide deux semaines après la vente. Si vous n'êtes pas disponible, merci de contacter l'arvor à l'adresse suivante : BLA BLA. Le stock des affiches étant important, les affiches pourront être retirées après la vente mais le paiement devra être réalisé auprès de la billeterie de l'Arvor auparavant.",
    tickUser8: "Si vous avez la moindre question, n'hésitez pas à envoyer un email à : BLA BLA.",
    adminContent: `
      <p>L'administration possède une interface un peu différente du côté client. Voici les différents onglets et les choses que vous pouvez réaliser.</p>

      <h3>Affiches</h3>
      <p>Cet onglet permet de créer, modifier et supprimer des affiches. Vous pouvez également y faire des recherches et créer ou supprimer des étiquettes.</p>

      <p><b>Actions globales :</b></p>

      <h4>Etiquettes</h4>
      <p>Les étiquettes n'ont qu'un but cosmétique et apparaissent comme des pastilles en haut à droite des posters. Evitez d'en mettre trop sous peine de rendre le tout illisible.</p>

      <h4>Localisations</h4>
      <p>Même système que les étiquettes. La localisation permet de trouver rapidement où sont les affiches.</p>

      <h4>Formulaire de création / édition d'affiche</h4>
      <p>Deux modes sont possibles pour créer une affiche : à la main ou en piochant dans une API. Une API est un "menu" distant maintenu par un site internet pour "servir" un site tiers. Les deux sites utilisés pour remplir automatiquement nos informations sont The MovieDatabase et WikiMedia.</p>
      <p>En recherchant un film, vous pouvez ainsi remplir toutes les informations à son propos. La recherche automatique (de film puis d'affiche) permet de sélectionner et importer directement un visuel d'affiche.</p>
      <p>Si jamais vous ne trouvez pas le visuel correspondant ou les informations relatives au film, vous pouvez importer une image depuis votre ordinateur.</p>

      <p>Les champs d'une affiche sont :</p>
      <ul>
        <li>Le titre du film</li>
        <li>L'affiche (caché de base)</li>
        <li>Réalisateur</li>
        <li>Année de sortie du film (pour les ressorties, mettez un commentaire dans la zone prévue à cette effet)</li>
        <li>Les acteurs principaux</li>
        <li>Le genre</li>
        <li>Le pays</li>
        <li>La taille de l'affiche</li>
        <li>Le prix de vente</li>
        <li>L'état de l'affiche</li>
        <li>Le stock</li>
        <li>Le commentaire : un texte libre où vous pouvez mettre ce que vous voulez</li>
        <li>La localisation : à un endroit ou plusieurs</li>
        <li>Les étiquettes</li>
        <li>A vendre ou non : si une affiche n'est pas à vendre, elle n'est pas visible côté public !</li>
      </ul>

      <p>Actions individuelles :</p>
      <ul>
        <li>Voir le visuel de l'affiche</li>
        <li>Modifier l'affiche</li>
        <li>Supprimer l'affiche</li>
      </ul>

      <h3>Réservations</h3>
      <p>Dans cet onglet, vous pouvez observer et modifier les réservations réalisées par les usagers du site. On rappelle qu'il n'est pas possible de payer en ligne donc les réservations sont juste cela : des réservations. Par conséquent, une personne doit se rendre physiquement dans le cinéma pour payer. Il y a donc deux états pour chaque réservation : en cours et validées. Une réservation en cours n'a pas été payée, une réservation validée implique qu'elle a été payée et l'affiche vendue.</p>

      <p>Actions globales :</p>
      <ul>
        <li>Message d'accueil : pour changer les messages sur la page d'accueil</li>
        <li>Nouvelle réservation : pour créer une réservation</li>
        <li>Bloquer les réservations : pour bloquer à un niveau global TOUTES les nouvelles réservations</li>
      </ul>

      <p>Une réservation possède les champs suivants :</p>
      <ul>
        <li>Une affiche</li>
        <li>Un client</li>
        <li>Un statut</li>
        <li>Une quantité</li>
      </ul>

      <h3>Ventes</h3>
      <p>Les ventes sont une trace des réservations réalisées. Elles n'ont aucune fonction réelle. Vous pouvez les télécharger en CSV. Si vous annulez une réservation, vous annulez la vente liée.</p>

      <h3>Utilisateurs</h3>
      <p>L'ensemble des utilisateurs enregistrées sur le site. Il existe deux types d'utilisateurs : les utilisateurs et les administrateurs. Les premiers ne peuvent que consulter les affiches et les réserver. Les administrateurs ont accès à toute l'interface administrateur.</p>
      <p>On ne peut pas changer ses propres données ! Sinon on peut changer son statut ou supprimer un utilisateur.</p>
    `,
  },

  home: {
    searchPlaceholder: 'Rechercher une affiche...',
    gridView: 'Vue grille',
    listView: 'Vue liste',
    noResults: 'Aucune affiche ne correspond à votre recherche. 😭',
    browseNew: 'Nouveautés',
    browseAll: 'Toutes les affiches',
    browseCountry: 'Par pays',
    browseGenre: 'Par genre',
    browseTag: 'Par étiquette',
    showMore: 'Voir plus',
  },

  account: {
    title: 'Mes réservations',
    loading: 'Chargement en cours...',
    noBookings: "Vous n'avez pas encore de réservations.",
    saleDateReminder: 'Rendez-vous le {date} pour venir chercher et régler vos affiches.',
  },

  posterDetails: {
    loading: 'Chargement...',
    notFound: 'Affiche introuvable 😭',
    price: 'Prix :',
    size: 'Taille :',
    totalStock: "Stock d'affiches :",
    availableStock: 'Affiches disponibles :',
    comment: 'Commentaire :',
    filmmaker: 'Réalisateur :',
    year: 'Année de sortie :',
    mainActors: 'Acteurs principaux :',
    genre: 'Genre :',
    country: 'Pays :',
    adminDashboard: 'Tableau de bord admin →',
    bookTitle: 'Ajouter au panier',
    quantityLabel: "Nombre d'affiches :",
    totalPrice: 'Prix total',
    book: 'Ajouter au panier',
    bookSuccess: 'Ajouté au panier !',
    bookError: "Une erreur est survenue lors de l'ajout au panier.",
    bookConfirmedTitle: 'Ajouté au panier !',
    close: 'Fermer',
  },

  basket: {
    title: 'Votre panier',
    empty: 'Votre panier est vide.',
    quantityLabel: 'Quantité :',
    total: 'Total :',
    remove: 'Retirer',
    confirm: 'Valider le panier',
    confirming: 'Validation...',
    confirmError: 'Une erreur est survenue lors de la validation du panier.',
    confirmedTitle: 'Panier confirmé !',
    saleDateReminder: 'Rendez-vous le {date} pour venir chercher et régler vos affiches.',
    pickupNotice: "Les affiches ne sont pas expédiées. Elles doivent être récupérées et réglées en espèces sur place, à l'adresse suivante :",
    pickupAddress: 'Cinéma Arvor\n11 rue de Chatillon\n35000 Rennes',
    bookingDisabled: 'Les réservations sont actuellement désactivées.',
    close: 'Fermer',
  },

  admin: {
    title: 'Administration',
    tabs: {
      posters: 'Affiches',
      bookings: 'Réservations',
      sales: 'Ventes',
      users: 'Utilisateurs',
    },
    posters: {
      search: 'Chercher affiche...',
      new: 'Nouveau poster',
      tags: 'Étiquettes',
    },
    users: {
      search: 'Chercher utilisateur...',
    },
    bookings: {
      search: 'Chercher réservation...',
      message: "Message d'accueil",
      new: 'Nouvelle réservation',
      block: 'Bloquer les réservations',
      allow: 'Autoriser les réservations',
    },
    sales: {
      reset: 'Réinitialiser',
      download: 'Télécharger les ventes',
    },
  },

  auth: {
    login: {
      title: 'Connexion',
      emailPlaceholder: 'Adresse e-mail',
      passwordPlaceholder: 'Mot de passe',
      submit: 'Se connecter',
      signup: 'Créer un compte',
      forgotPassword: 'Mot de passe oublié ?',
      errorNotVerified: 'Veuillez vérifier votre adresse e-mail avant de vous connecter.',
      errorFailed: 'Identifiants incorrects.',
    },
    signup: {
      title: 'Créer un compte',
      emailPlaceholder: 'Adresse e-mail',
      passwordPlaceholder: 'Mot de passe',
      confirmPlaceholder: 'Confirmer le mot de passe',
      rules: {
        length: '8 caractères minimum',
        upper: 'Une majuscule',
        lower: 'Une minuscule',
        number: 'Un chiffre',
      },
      success: '✅ Votre compte a été créé.',
      checkEmail: 'Veuillez vérifier votre boîte mail ({email}) et cliquer sur le lien de confirmation pour activer votre compte.',
      noEmail: "Pas reçu d'email ?",
      resend: 'Renvoyer le mail de vérification',
      alreadyRegistered: 'Déjà inscrit ? Identifiez-vous',
      errorRules: 'Le mot de passe ne respecte pas les critères requis.',
      errorMatch: 'Les mots de passe ne correspondent pas.',
      errorGeneric: 'Une erreur est survenue.',
      resendSuccess: 'Un nouvel email de vérification a été envoyé.',
      resendError: "Impossible de renvoyer l'email de vérification.",
    },
    forgotPassword: {
      title: 'Mot de passe oublié ?',
      emailPlaceholder: 'Entrez votre e-mail',
      submit: 'Envoyer le lien',
      sending: 'Envoi en cours...',
    },
    resetPassword: {
      title: 'Réinitialiser le mot de passe',
      passwordPlaceholder: 'Nouveau mot de passe',
      submit: 'Réinitialiser le mot de passe',
      sending: 'Envoi en cours...',
    },
    verifyEmail: {
      title: 'Vérification de l\'adresse e-mail',
      verifying: 'Vérification en cours, veuillez patienter...',
      success: '✅ Votre adresse e-mail a été vérifiée ! Vous pouvez maintenant',
      loginLink: 'vous connecter',
      errorMissing: 'Jeton de vérification manquant.',
      errorInvalid: 'Lien de vérification invalide ou expiré.',
    },
    resendVerification: {
      title: 'Votre email n\'a pas encore été validé.',
      emailPlaceholder: 'Entrez votre e-mail',
      submit: 'Renvoyer',
      success: '✅ Si votre compte existe et n\'est pas encore vérifié, un nouvel e-mail a été envoyé.',
      error: 'Une erreur est survenue.',
      action:"Renvoyer l\'e-mail de vérification"
    },
  },

  table: {
    booking: {
      reference: 'Référence',
      email: 'E-mail',
      poster: 'Affiche',
      quantity: 'Quantité',
      totalPrice: 'Prix total',
      date: 'Date de réservation',
      status: 'Statut',
      actions: 'Actions',
      deleteConfirm: 'Supprimer la réservation.',
      basketToReady: 'Marquer tout le panier comme prêt',
      basketToValidated: 'Valider tout le panier',
      basketUpdateSuccess: 'Panier mis à jour.',
      basketUpdateError: 'Une erreur est survenue lors de la mise à jour du panier.',
    },
    poster: {
      title: 'Titre',
      size: 'Taille',
      price: 'Prix',
      stock: 'Stock',
      tags: 'Étiquettes',
      locations: 'Localisation',
      comment: 'Commentaire',
      forSale: 'À vendre',
      createdAt: 'Date de création',
      actions: 'Actions',
      deleteConfirm: "Supprimer l'affiche.",
    },
    sale: {
      poster: 'Affiche',
      buyer: 'Acheteur',
      unitPrice: 'Prix unitaire',
      quantity: 'Quantité',
      totalPrice: 'Prix total',
      soldBy: 'Vente par',
      date: 'Date',
    },
    user: {
      email: 'E-mail',
      role: 'Rôle',
      actions: 'Actions',
      deleteConfirm: "Supprimer l'utilisateur.",
    },
  },

  form: {
    poster: {
      editTitle: "Modification d'affiche",
      createTitle: "Création d'affiche",
      titleLabel: 'Titre',
      titlePlaceholder: 'Titre',
      searchMovie: 'Rechercher le film',
      noMovieResults: 'Aucun film trouvé.',
      suggestedPosters: 'Affiches suggérées — cliquez pour utiliser',
      viewSuggestedPosters: 'Voir les affiches suggérées ({count})',
      uploadManually: 'Uploader une image manuellement',
      duplicateWarning: 'Une affiche existe déjà pour ce film.',
      viewExistingPoster: "Voir l'affiche existante",
      filmmakerLabel: 'Réalisateur',
      filmmakerPlaceholder: 'Réalisateur',
      yearLabel: 'Année de sortie',
      yearPlaceholder: 'Année de sortie',
      mainActorsLabel: 'Acteurs principaux',
      mainActorsPlaceholder: 'Acteurs séparés par des virgules',
      genreLabel: 'Genre',
      genrePlaceholder: 'Genre',
      countryLabel: 'Pays',
      countryPlaceholder: 'Pays',
      sizeLabel: 'Taille',
      size120: '120x160 cm',
      size60: '60x80 cm',
      sizeOther: 'Autre',
      sizeOtherPlaceholder: 'Précisez la taille',
      priceLabel: 'Prix',
      pricePlaceholder: 'Prix',
      stockLabel: 'Stock',
      stockPlaceholder: 'Stock',
      available: 'disponible',
      reserved: 'réservé',
      ready: 'prêt',
      sold: 'vendu',
      commentLabel: 'Commentaire',
      commentPlaceholder: 'Commentaire',
      tagsLabel: 'Étiquettes',
      tagsPlaceholder: 'Ajouter une étiquette...',
      locationsLabel: 'Localisation',
      locationsPlaceholder: 'Ajouter une localisation...',
      forSale: 'À vendre ?',
      yes: 'Oui',
      no: 'Non',
      save: 'Sauvegarder',
      updateSuccess: 'Affiche mise à jour ✅',
      createSuccess: 'Affiche créée 🎉',
      error: 'Une erreur est survenue ❌',
    },
    booking: {
      editTitle: 'Modification de réservation',
      createTitle: 'Création de réservation',
      posterLabel: 'Affiche',
      clientLabel: 'Client',
      statusLabel: 'Statut',
      statusPending: 'En cours',
      statusReady: 'Prêt pour la vente',
      statusValidated: 'Validée',
      quantityLabel: 'Quantité',
      quantityPlaceholder: 'Quantité',
      available: 'disponible',
      reserved: 'réservé',
      ready: 'prêt',
      sold: 'vendu',
      save: 'Sauvegarder',
      updateSuccess: 'Réservation mise à jour ✅',
      createSuccess: 'Réservation créée 🎉',
      error: 'Une erreur est survenue ❌',
    },
    user: {
      editTitle: "Modification d'utilisateur",
      emailLabel: 'E-mail',
      roleLabel: 'Rôle',
      roleAdmin: 'Administrateur',
      roleUser: 'Utilisateur',
      save: 'Sauvegarder',
      updateSuccess: 'Utilisateur mis à jour ✅',
      updateError: 'Erreur durant la mise à jour ❌',
    },
    tag: {
      title: 'Gestion des étiquettes',
      placeholder: 'Nouvelle étiquette',
      add: 'Ajouter',
      createError: "Impossible de créer l'étiquette",
      deleteConfirm: "Supprimer l'étiquette ? Elle sera retirée des affiches concernées.",
      deleteError: "Impossible de supprimer l'étiquette",
    },
    location: {
      title: 'Gestion des localisations',
      placeholder: 'Nouvelle localisation',
      add: 'Ajouter',
      createError: 'Impossible de créer la localisation',
      deleteConfirm: 'Supprimer la localisation ? Elle sera retirée des affiches concernées.',
      deleteError: 'Impossible de supprimer la localisation',
    },
    message: {
      title: 'Modifier le message',
      placeholder: 'Tapez votre message en markdown...',
      preview: 'Prévisualisation',
      save: 'Sauvegarder',
      updateSuccess: 'Message mis à jour ✅',
      error: 'Erreur lors de la sauvegarde.',
    },
    saleDate: {
      title: 'Date de la prochaine vente',
      save: 'Sauvegarder',
      updateSuccess: 'Date de vente mise à jour ✅',
      error: 'Erreur lors de la sauvegarde.',
    },
  },

  modal: {
    confirm: 'Êtes-vous sûr de vouloir faire cette action ?',
    cancel: 'Annuler',
    yes: 'Oui',
  },

  search: {
    clientEmail: 'E-mail du client',
    poster: 'Affiche',
  },
}
