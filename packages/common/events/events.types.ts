// eslint-disable-next-line @typescript-eslint/ban-types
export type TSdkEventCallbackFn = Function
export type TSdkMapArgs = {
  id: number
  callback: TSdkEventCallbackFn
  once?: boolean
}
