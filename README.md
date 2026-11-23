# Credenza Core Web SDK

The Core Web SDK is the primary browser integration layer for the Credenza platform. It provides a small core runtime plus optional extensions for OAuth, accounts, EVM, Sui, zkLogin, and an EIP-1193 provider.

## Published packages

- `@credenza3/core-web` — SDK runtime and environment configuration.
- `@credenza3/core-web-oauth-ext` — OAuth authorization and session operations.
- `@credenza3/core-web-account-ext` — profile and account operations.
- `@credenza3/core-web-evm-ext` and `@credenza3/evm-provider` — EVM accounts and provider support.
- `@credenza3/core-web-sui-ext` — Sui accounts and signing.
- `@credenza3/core-web-sui-zklogin-ext` — Sui zkLogin support.

The repository is a pnpm/Turborepo workspace with a demo application under `apps/`. It requires Node.js 26+ and pnpm 12+.

```
pnpm install
pnpm run dev
```

Linting and formatting use [oxlint](https://oxc.rs/docs/guide/usage/linter) (type-aware) and [oxfmt](https://oxc.rs/docs/guide/usage/formatter); [lefthook](https://lefthook.dev) runs both on staged files before each commit.

```
pnpm run lint          # oxlint --type-aware
pnpm run format        # oxfmt (write)
pnpm run format:check  # oxfmt --check
```

[https://credenza-web-sdk.pages.dev](https://credenza-web-sdk.pages.dev)
Test page Staging env

## Extensions

[SDKCore](https://www.npmjs.com/package/@credenza3/core-web)

- [OAuthExtension](https://www.npmjs.com/package/@credenza3/core-web-oauth-ext)

- [AccountExtension](https://www.npmjs.com/package/@credenza3/core-web-account-ext)

- [SuiExtension](https://www.npmjs.com/package/@credenza3/core-web-sui-ext)

  - [ZkExtension](https://www.npmjs.com/package/@credenza3/core-web-sui-zklogin-ext)

- [EvmExtension](https://www.npmjs.com/package/@credenza3/core-web-evm-ext)
