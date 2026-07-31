// This file configures the initialization of Sentry on the Node.js server runtime.

const serverSentryDsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

if (serverSentryDsn) {
  try {
    const Sentry = require('@sentry/nextjs');
    Sentry.init({
      dsn: serverSentryDsn,
      tracesSampleRate: 0.1,
      debug: false,
    });
  } catch (err) {
    console.warn('Sentry server init skipped or failed:', err);
  }
}

export {};
