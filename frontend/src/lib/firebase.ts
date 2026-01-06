/**
 * Firebase utility stub
 * TODO: Implement actual Firebase integration
 */

export const auth = {
  signInWithEmailAndPassword: async () => ({ user: null }),
  createUserWithEmailAndPassword: async () => ({ user: null }),
  signOut: async () => {},
  onAuthStateChanged: () => () => {},
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

export default { auth, db, loginUser, registerUser }
