import { EVM_EVENT } from './events.constants'

export type TSdkEvmEvent = (typeof EVM_EVENT)[keyof typeof EVM_EVENT]
