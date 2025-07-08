const PREFIX = 'credenza_web_sdk:'

export function sessionSet(key: string, value: string) {
  return sessionStorage.setItem(`${PREFIX}${key}`, value)
}

export function sessionGet(key: string) {
  return sessionStorage.getItem(`${PREFIX}${key}`)
}

export function sessionRemove(key: string) {
  return sessionStorage.removeItem(`${PREFIX}${key}`)
}
