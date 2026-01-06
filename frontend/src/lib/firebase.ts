/**
 * Firebase utility stub
 * TODO: Implement actual Firebase integration
 */

export const auth = {
  signInWithEmailAndPassword: async (_email?: string, _password?: string) => ({
    user: null,
  }),
  createUserWithEmailAndPassword: async (_email?: string, _password?: string) => ({
    user: null,
  }),
  signOut: async () => {},
  onAuthStateChanged: (_callback?: (user: any) => void) => () => {},
}

export const db = {
  collection: () => [],
  doc: () => ({}),
}

export async function loginUser(email: string, password: string) {
  return auth.signInWithEmailAndPassword(email, password)
}

export async function registerUser(email: string, password: string) {
  return auth.createUserWithEmailAndPassword(email, password)
}

export function onAuthChange(callback: (user: any) => void) {
  return auth.onAuthStateChanged(callback)
}

export default { auth, db, loginUser, registerUser, onAuthChange }
