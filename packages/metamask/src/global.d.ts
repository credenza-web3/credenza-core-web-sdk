import type { MetaMaskInpageProvider } from "@metamask/providers"

declare global {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface Window {
    ethereum?: MetaMaskInpageProvider;
  }
}
