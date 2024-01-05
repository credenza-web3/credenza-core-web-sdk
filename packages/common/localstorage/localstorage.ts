const PREFIX = 'credenza_web_sdk:'

export function set(key:string, value:string) {
  return localStorage.setItem(`${PREFIX}${key}`, value)
}

export function get(key:string) {
  return localStorage.getItem(`${PREFIX}${key}`)
}

export function remove(key:string) {
  return localStorage.removeItem(`${PREFIX}${key}`)
}
