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

export default { auth, db }
