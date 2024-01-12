import type { TSdkEvent, TSdkMapArgs, TSdkEventCallbackFn } from './events.types'
export { SDK_EVENT } from './events.constants'

const passportEventsMap = new Map<TSdkEvent, TSdkMapArgs[]>()
let id: number = 0

function off(eventName: TSdkEvent, id: number) {
  const list = passportEventsMap.get(eventName)
  if (!list?.length) return

  for (let i = list.length - 1; i >= 0; i--) {
    if (list[i].id === id) {
      list.splice(i, 1)
      passportEventsMap.set(eventName, list)
      return
    }
  }
}

export function once(eventName: TSdkEvent, callback: TSdkEventCallbackFn) {
  const list = passportEventsMap.get(eventName) ?? []
  id = id + 1
  list.push({ callback, id, once: true })
  passportEventsMap.set(eventName, list)
  return () => off(eventName, id)
}

export function on(eventName: TSdkEvent, callback: TSdkEventCallbackFn) {
  const list = passportEventsMap.get(eventName) ?? []
  id = id + 1
  list.push({ callback, id })
  passportEventsMap.set(eventName, list)
  return () => off(eventName, id)
}

export function emit(eventName: TSdkEvent, data?: unknown) {
  const list = passportEventsMap.get(eventName)
  if (!list?.length) return

  for (const evt of list) {
    evt.callback(data)
    if (evt.once) off(eventName, evt.id)
  }
}
