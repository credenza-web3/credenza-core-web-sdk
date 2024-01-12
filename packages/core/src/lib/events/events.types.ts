import { SDK_EVENT } from './events.constants'

// eslint-disable-next-line @typescript-eslint/ban-types
export type TSdkEventCallbackFn = Function
export type TSdkEvent = (typeof SDK_EVENT)[keyof typeof SDK_EVENT]
export type TSdkMapArgs = {
  id: number
  callback: TSdkEventCallbackFn
  once?: boolean
}
