import { SDK_EVENT } from './events.constants'

export type TSdkEvent = (typeof SDK_EVENT)[keyof typeof SDK_EVENT]
