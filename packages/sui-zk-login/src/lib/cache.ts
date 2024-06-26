import { get, set } from '@packages/common/localstorage/localstorage'
import { LS_ZK_EPHEMERAL_KEY, LS_ZK_RANDOMNESS_KEY } from '../constants/localstorage'

export const setZkCache = (pb: number[], sk: number[], randomness: string) => {
  set(
    LS_ZK_EPHEMERAL_KEY,
    JSON.stringify({
      publicKey: pb,
      secretKey: sk,
    }),
  )

  set(LS_ZK_RANDOMNESS_KEY, randomness)
}

export const getZkKeysFromCache = (): { publicKey: Uint8Array; secretKey: Uint8Array } => {
  const parsedkey = JSON.parse(get(LS_ZK_EPHEMERAL_KEY) as string)

  const publicKey = Uint8Array.from(parsedkey.publicKey)
  const secretKey = Uint8Array.from(parsedkey.secretKey)
  return {
    publicKey,
    secretKey,
  }
}

export const getZkRandomnessFromCache = () => get(LS_ZK_RANDOMNESS_KEY)
