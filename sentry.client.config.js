import * as Sentry from "@sentry/astro";

Sentry.init({
  dsn: import.meta.env.PUBLIC_SENTRY_DSN,
  integrations: [new Sentry.Replay(), new Sentry.BrowserTracing()],
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.2,
  replaysOnErrorSampleRate: 1.0,
});
