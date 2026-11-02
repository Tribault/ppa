// App-wide feature switches, set at build time through Vite env variables.

// Catalog mode: the site is browse-only. Booking, the basket, signup and the
// login link are hidden. Admins can still sign in by going to /login directly.
export const CATALOG_MODE = import.meta.env.VITE_CATALOG_MODE === 'true'
