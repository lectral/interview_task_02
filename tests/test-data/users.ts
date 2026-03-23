const PASSWORDS = {
  valid: 'secret_sauce',
  invalid: 'invalid_secret_sauce',
  empty: ''
} as const;

export const USERS = {
  standard: {
    username: 'standard_user',
    password: PASSWORDS.valid
  },
  lockedOut: {
    username: 'locked_out_user',
    password: PASSWORDS.valid
  }
} as const;

export const LOGIN_ATTEMPTS = {
  standardWithInvalidPassword: {
    username: USERS.standard.username,
    password: PASSWORDS.invalid
  },
  standardWithEmptyPassword: {
    username: USERS.standard.username,
    password: PASSWORDS.empty
  }
} as const;

export type UserCredentials =
  | (typeof USERS)[keyof typeof USERS]
  | (typeof LOGIN_ATTEMPTS)[keyof typeof LOGIN_ATTEMPTS];
