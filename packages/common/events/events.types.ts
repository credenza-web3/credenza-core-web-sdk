export type TSdkEventCallbackFn = Function
export type TSdkMapArgs = {
  id: number
  callback: TSdkEventCallbackFn
  once?: boolean
}
