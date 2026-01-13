export const SDK_ENV = {
  LOCAL: 'local',
  STAGING: 'staging',
  PROD: 'prod',
} as const

export const GENERAL_API_URL = {
  PROD: 'https://api.credenza3.com',
  STAGING: 'https://api.staging.credenza3.com',
  LOCAL: 'http://localhost:8082',
}
