// This file configures the initialization of Sentry on the client side.
// The config passed here will be used whenever a user visits a page in their browser.

const clientSentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;

if (clientSentryDsn) {
  try {
    const Sentry = require('@sentry/nextjs');
    Sentry.init({
      dsn: clientSentryDsn,
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      debug: false,
    });
  } catch (err) {
    console.warn('Sentry client init skipped or failed:', err);
  }
}

export {};
