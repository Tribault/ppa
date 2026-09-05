export default {
  appTitle: 'Movie Poster Registry',
  nav: {
    loginSignup: 'Login / Sign up',
    admin: 'Admin',
    myBookings: 'My bookings',
    logoutTitle: 'log out',
    logout: '[Log out]',
    help: 'Help',
    viewBasket: 'View basket',
  },

  help: {
    title: 'Help',
    paragraphUser1:
      "Welcome to the poster sales website for the Arvor cinema in Rennes! The purpose of this site is to browse and, if you'd like, reserve posters put up for sale by Arvor staff. All proceeds go directly to actively funding the cinema.",
    paragraphUser2:
      "Unlike other sites you may be used to, you cannot pay on this site — you can only reserve. You'll need to come collect and pay for your posters during the sales held at the cinema. The place and time are indicated. These sales happen on a recurring basis.",
    paragraphUser3:
      "Why this system? To preserve the collaborative and collective spirit of this community-run cinema, we involve volunteers and staff in storing and selling the posters.",
    howto: 'How does it work?',
    tickUser1:
      "To reserve a poster, you need to create an account. A confirmation email will be sent to you once you've signed up. In accordance with GDPR, the Arvor cinema does not keep your data.",
    tickUser2:
      "Reserve a poster either from its individual page or directly from the catalogue. Several copies can be reserved. The total price will be shown and a confirmation will be requested.",
    tickUser3: 'By reserving one or more posters, you commit to paying for and coming to collect them.',
    tickUser4:
      "Once your reservation is confirmed, an email will be sent to remind you of your reservation as well as the date and time of the sale.",
    tickUser5: 'Further reminders will be sent to you before the sale takes place.',
    tickUser6: 'Before the sale, you can change the number of reserved posters or cancel the reservation.',
    tickUser7:
      "A reservation remains valid for two weeks after the sale. If you're unavailable, please contact l'Arvor at the following address: BLA BLA. Since poster stock is large, posters may still be picked up after the sale, but payment must be made at l'Arvor's box office beforehand.",
    tickUser8: 'If you have any questions at all, feel free to send an email to: BLA BLA.',
    adminContent: `
      <p>The admin side has a somewhat different interface than the public side. Here are the different tabs and what you can do in each of them.</p>

      <h3>Posters</h3>
      <p>This tab lets you create, edit and delete posters. You can also search here, and create or delete tags.</p>

      <p><b>Global actions:</b></p>

      <h4>Tags</h4>
      <p>Tags are purely cosmetic and appear as small badges in the top-right corner of posters. Avoid adding too many, or the whole thing becomes unreadable.</p>

      <h4>Locations</h4>
      <p>Same system as tags. Location lets you quickly find where posters are stored.</p>

      <h4>Poster creation / edit form</h4>
      <p>There are two ways to create a poster: by hand, or by pulling data from an API. An API is a remote "menu" maintained by a website to "serve" a third-party site. The two sites used to automatically fill in our information are The Movie Database and WikiMedia.</p>
      <p>By searching for a movie, you can fill in all of its information at once. The automatic search (movie, then poster) lets you select and import a poster visual directly.</p>
      <p>If you can't find the matching visual or the movie's information, you can upload an image from your computer instead.</p>

      <p>A poster's fields are:</p>
      <ul>
        <li>The movie's title</li>
        <li>The poster (hidden by default)</li>
        <li>Director</li>
        <li>The movie's release year (for re-releases, add a note in the comment field for that)</li>
        <li>Main actors</li>
        <li>Genre</li>
        <li>Country</li>
        <li>Poster size</li>
        <li>Sale price</li>
        <li>Poster condition</li>
        <li>Stock</li>
        <li>Comment: free text where you can put whatever you like</li>
        <li>Location: one or several</li>
        <li>Tags</li>
        <li>For sale or not: if a poster isn't for sale, it isn't visible on the public side!</li>
      </ul>

      <p>Per-poster actions:</p>
      <ul>
        <li>View the poster's visual</li>
        <li>Edit the poster</li>
        <li>Delete the poster</li>
      </ul>

      <h3>Bookings</h3>
      <p>In this tab you can view and edit the bookings made by the site's users. As a reminder, it isn't possible to pay online, so bookings are just that: reservations. A person therefore has to come to the cinema in person to pay. Each booking has one of two states: pending and validated. A pending booking hasn't been paid for yet; a validated booking means it has been paid for and the poster sold.</p>

      <p>Global actions:</p>
      <ul>
        <li>Welcome message: to change the messages shown on the home page</li>
        <li>New booking: to create a booking</li>
        <li>Block bookings: to block ALL new bookings at a global level</li>
      </ul>

      <p>A booking has the following fields:</p>
      <ul>
        <li>A poster</li>
        <li>A customer</li>
        <li>A status</li>
        <li>A quantity</li>
      </ul>

      <h3>Sales</h3>
      <p>Sales are a record of bookings that were completed. They serve no real function on their own. You can download them as CSV. If you cancel a booking, the linked sale is cancelled too.</p>

      <h3>Users</h3>
      <p>All users registered on the site. There are two types of users: users and administrators. The former can only browse posters and book them. Administrators have access to the entire admin interface.</p>
      <p>You can't change your own data! Otherwise, you can change a user's status or delete a user.</p>
    `,
  },

  home: {
    searchPlaceholder: 'Search for a poster...',
    gridView: 'Grid view',
    listView: 'List view',
    noResults: 'No poster matches your search. 😭',
    browseNew: 'New arrivals',
    browseAll: 'All posters',
    browseCountry: 'By country',
    browseGenre: 'By genre',
    browseTag: 'By tag',
    showMore: 'Show more',
  },

  account: {
    title: 'My bookings',
    loading: 'Loading...',
    noBookings: "You don't have any bookings yet.",
    saleDateReminder: 'Come collect and pay for your posters on {date}.',
  },

  posterDetails: {
    loading: 'Loading...',
    notFound: 'Poster not found 😭',
    price: 'Price:',
    size: 'Size:',
    totalStock: 'Poster stock:',
    availableStock: 'Available posters:',
    comment: 'Comment:',
    filmmaker: 'Director:',
    year: 'Release year:',
    mainActors: 'Main actors:',
    genre: 'Genre:',
    country: 'Country:',
    adminDashboard: 'Admin dashboard →',
    bookTitle: 'Add to basket',
    quantityLabel: 'Number of posters:',
    totalPrice: 'Total price',
    book: 'Add to basket',
    bookSuccess: 'Added to basket!',
    bookError: 'An error occurred while adding to basket.',
    bookConfirmedTitle: 'Added to basket!',
    close: 'Close',
  },

  basket: {
    title: 'Your basket',
    empty: 'Your basket is empty.',
    quantityLabel: 'Quantity:',
    total: 'Total:',
    remove: 'Remove',
    confirm: 'Confirm basket',
    confirming: 'Confirming...',
    confirmError: 'An error occurred while confirming the basket.',
    confirmedTitle: 'Basket confirmed!',
    saleDateReminder: 'Come collect and pay for your posters on {date}.',
    pickupNotice: 'Posters are not shipped. They must be collected and paid for in cash on site, at the following address:',
    pickupAddress: 'Cinéma Arvor\n11 rue de Chatillon\n35000 Rennes',
    bookingDisabled: 'Bookings are currently disabled.',
    close: 'Close',
  },

  admin: {
    title: 'Administration',
    tabs: {
      posters: 'Posters',
      bookings: 'Bookings',
      sales: 'Sales',
      users: 'Users',
    },
    posters: {
      search: 'Search poster...',
      new: 'New poster',
      tags: 'Tags',
    },
    users: {
      search: 'Search user...',
    },
    bookings: {
      search: 'Search booking...',
      message: 'Welcome message',
      new: 'New booking',
      block: 'Block bookings',
      allow: 'Allow bookings',
    },
    sales: {
      reset: 'Reset',
      download: 'Download sales',
    },
  },

  auth: {
    login: {
      title: 'Login',
      emailPlaceholder: 'Email address',
      passwordPlaceholder: 'Password',
      submit: 'Log in',
      signup: 'Create an account',
      forgotPassword: 'Forgot password?',
      errorNotVerified: 'Please verify your email address before logging in.',
      errorFailed: 'Incorrect credentials.',
    },
    signup: {
      title: 'Create an account',
      emailPlaceholder: 'Email address',
      passwordPlaceholder: 'Password',
      confirmPlaceholder: 'Confirm password',
      rules: {
        length: 'At least 8 characters',
        upper: 'One uppercase letter',
        lower: 'One lowercase letter',
        number: 'One number',
      },
      success: '✅ Your account has been created.',
      checkEmail: 'Please check your inbox ({email}) and click the confirmation link to activate your account.',
      noEmail: "Didn't receive an email?",
      resend: 'Resend verification email',
      alreadyRegistered: 'Already registered? Log in',
      errorRules: "The password doesn't meet the required criteria.",
      errorMatch: 'Passwords do not match.',
      errorGeneric: 'An error occurred.',
      resendSuccess: 'A new verification email has been sent.',
      resendError: 'Unable to resend the verification email.',
    },
    forgotPassword: {
      title: 'Forgot password?',
      emailPlaceholder: 'Enter your email',
      submit: 'Send link',
      sending: 'Sending...',
    },
    resetPassword: {
      title: 'Reset password',
      passwordPlaceholder: 'New password',
      submit: 'Reset password',
      sending: 'Sending...',
    },
    verifyEmail: {
      title: 'Email verification',
      verifying: 'Verifying, please wait...',
      success: '✅ Your email address has been verified! You can now',
      loginLink: 'log in',
      errorMissing: 'Missing verification token.',
      errorInvalid: 'Invalid or expired verification link.',
    },
    resendVerification: {
      title: 'Your email has not been verified yet.',
      emailPlaceholder: 'Enter your email',
      submit: 'Resend',
      success: "✅ If your account exists and isn't verified yet, a new email has been sent.",
      error: 'An error occurred.',
      action: 'Resend verification email',
    },
  },

  table: {
    booking: {
      reference: 'Reference',
      email: 'Email',
      poster: 'Poster',
      quantity: 'Quantity',
      totalPrice: 'Total price',
      date: 'Booking date',
      status: 'Status',
      actions: 'Actions',
      deleteConfirm: 'Delete the booking.',
      basketToReady: 'Mark the whole basket as ready',
      basketToValidated: 'Validate the whole basket',
      basketUpdateSuccess: 'Basket updated.',
      basketUpdateError: 'An error occurred while updating the basket.',
    },
    poster: {
      title: 'Title',
      size: 'Size',
      price: 'Price',
      stock: 'Stock',
      tags: 'Tags',
      locations: 'Position',
      comment: 'Comment',
      forSale: 'For sale',
      createdAt: 'Creation date',
      actions: 'Actions',
      deleteConfirm: 'Delete the poster.',
    },
    sale: {
      poster: 'Poster',
      buyer: 'Buyer',
      unitPrice: 'Unit price',
      quantity: 'Quantity',
      totalPrice: 'Total price',
      soldBy: 'Sold by',
      date: 'Date',
    },
    user: {
      email: 'Email',
      role: 'Role',
      actions: 'Actions',
      deleteConfirm: 'Delete the user.',
    },
  },

  form: {
    poster: {
      editTitle: 'Edit poster',
      createTitle: 'Create poster',
      titleLabel: 'Title',
      titlePlaceholder: 'Title',
      searchMovie: 'Search for the movie',
      noMovieResults: 'No movie found.',
      suggestedPosters: 'Suggested posters — click to use',
      viewSuggestedPosters: 'View suggested posters ({count})',
      uploadManually: 'Upload an image manually',
      duplicateWarning: 'A poster already exists for this movie.',
      viewExistingPoster: 'View the existing poster',
      filmmakerLabel: 'Director',
      filmmakerPlaceholder: 'Director',
      yearLabel: 'Release year',
      yearPlaceholder: 'Release year',
      mainActorsLabel: 'Main actors',
      mainActorsPlaceholder: 'Actors separated by commas',
      genreLabel: 'Genre',
      genrePlaceholder: 'Genre',
      countryLabel: 'Country',
      countryPlaceholder: 'Country',
      sizeLabel: 'Size',
      size120: '120x160 cm',
      size60: '60x80 cm',
      sizeOther: 'Other',
      sizeOtherPlaceholder: 'Specify the size',
      priceLabel: 'Price',
      pricePlaceholder: 'Price',
      stockLabel: 'Stock',
      stockPlaceholder: 'Stock',
      available: 'available',
      reserved: 'reserved',
      ready: 'ready',
      sold: 'sold',
      commentLabel: 'Comment',
      commentPlaceholder: 'Comment',
      tagsLabel: 'Tags',
      tagsPlaceholder: 'Add a tag...',
      locationsLabel: 'Position',
      locationsPlaceholder: 'Add a position...',
      forSale: 'For sale?',
      yes: 'Yes',
      no: 'No',
      save: 'Save',
      updateSuccess: 'Poster updated ✅',
      createSuccess: 'Poster created 🎉',
      error: 'An error occurred ❌',
    },
    booking: {
      editTitle: 'Edit booking',
      createTitle: 'Create booking',
      posterLabel: 'Poster',
      clientLabel: 'Customer',
      statusLabel: 'Status',
      statusPending: 'Pending',
      statusReady: 'Ready for sale',
      statusValidated: 'Validated',
      quantityLabel: 'Quantity',
      quantityPlaceholder: 'Quantity',
      available: 'available',
      reserved: 'reserved',
      ready: 'ready',
      sold: 'sold',
      save: 'Save',
      updateSuccess: 'Booking updated ✅',
      createSuccess: 'Booking created 🎉',
      error: 'An error occurred ❌',
    },
    user: {
      editTitle: 'Edit user',
      emailLabel: 'Email',
      roleLabel: 'Role',
      roleAdmin: 'Administrator',
      roleUser: 'User',
      save: 'Save',
      updateSuccess: 'User updated ✅',
      updateError: 'Error while updating ❌',
    },
    tag: {
      title: 'Manage tags',
      placeholder: 'New tag',
      add: 'Add',
      createError: 'Unable to create the tag',
      deleteConfirm: 'Delete this tag? It will be removed from any poster using it.',
      deleteError: 'Unable to delete the tag',
    },
    location: {
      title: 'Manage positions',
      placeholder: 'New position',
      add: 'Add',
      createError: 'Unable to create the position',
      deleteConfirm: 'Delete this position? It will be removed from any poster using it.',
      deleteError: 'Unable to delete the position',
    },
    message: {
      title: 'Edit message',
      placeholder: 'Type your message in markdown...',
      preview: 'Preview',
      save: 'Save',
      updateSuccess: 'Message updated ✅',
      error: 'Error while saving.',
    },
    saleDate: {
      title: 'Next sale date',
      save: 'Save',
      updateSuccess: 'Sale date updated ✅',
      error: 'Error while saving.',
    },
  },

  modal: {
    confirm: 'Are you sure you want to do this?',
    cancel: 'Cancel',
    yes: 'Yes',
  },

  search: {
    clientEmail: "Customer's email",
    poster: 'Poster',
  },
}
