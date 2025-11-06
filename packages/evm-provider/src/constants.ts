export enum EVM_PROVIDER_STATE {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
}

export enum EVM_PROVIDER_EVENT {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  ACCOUNTS_CHANGED = 'accountsChanged',
  CHAIN_CHANGED = 'chainChanged',
}
