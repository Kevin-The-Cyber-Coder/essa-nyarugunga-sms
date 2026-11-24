// One source of truth for the backend URL. VITE_API_URL is baked into the Vite
// bundle at build time, so a production build must not depend on a local .env
// file being present on Vercel.
const PRODUCTION_API_URL = 'https://essa-api.onrender.com';
const DEVELOPMENT_API_URL = 'http://localhost:5001';

const configuredUrl = (import.meta.env.VITE_API_URL || '').trim();
const isLocalhostUrl = (value) => /^https?:\/\/(localhost|127\.0\.0\.1)(?::\d+)?/i.test(value);

// A stale Vercel variable pointing at localhost would silently break every
// request in the deployed app, so ignore it for production builds. Local
// development still honours whatever VITE_API_URL is set to.
const resolvedUrl =
  configuredUrl && !(import.meta.env.PROD && isLocalhostUrl(configuredUrl))
    ? configuredUrl
    : import.meta.env.PROD
      ? PRODUCTION_API_URL
      : DEVELOPMENT_API_URL;

const stripTrailingSlash = (value) => value.replace(/\/+$/, '');

export const API_URL = stripTrailingSlash(resolvedUrl);
