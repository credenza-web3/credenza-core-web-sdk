import { SUI_NETWORK } from './main.constants'

export type TSuiNetwork = (typeof SUI_NETWORK)[keyof typeof SUI_NETWORK]
