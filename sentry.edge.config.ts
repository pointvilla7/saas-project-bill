// This file configures the initialization of Sentry for Edge runtime functions.

const edgeSentryDsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

if (edgeSentryDsn) {
  try {
    const Sentry = require('@sentry/nextjs');
    Sentry.init({
      dsn: edgeSentryDsn,
      tracesSampleRate: 0.1,
      debug: false,
    });
  } catch (err) {
    console.warn('Sentry edge init skipped or failed:', err);
  }
}

export {};
