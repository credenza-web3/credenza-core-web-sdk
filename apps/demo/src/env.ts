import { defineEnvVars } from '@sveltejs/kit/env'

// Static SPA (adapter-static): values are read from `.env` and inlined at build time.
export const variables = defineEnvVars({
  PUBLIC_CLIENT_ID: { public: true, static: true, description: 'Credenza OAuth client id' },
  PUBLIC_ENV: { public: true, static: true, description: 'Credenza SDK environment (e.g. local, staging, prod)' },
})
