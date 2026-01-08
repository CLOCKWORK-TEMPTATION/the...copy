import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  type QueryConstraint,
} from "firebase/firestore";
import { db } from "../firebase";

export const addDocument = (collectionName: string, data: any) =>
  addDoc(collection(db, collectionName), data);

export const getDocument = (collectionName: string, docId: string) =>
  getDoc(doc(db, collectionName, docId));

export const getDocuments = (collectionName: string, ...constraints: QueryConstraint[]) =>
  getDocs(query(collection(db, collectionName), ...constraints));

export const updateDocument = (collectionName: string, docId: string, data: any) =>
  updateDoc(doc(db, collectionName, docId), data);

export const deleteDocument = (collectionName: string, docId: string) =>
  deleteDoc(doc(db, collectionName, docId));

export { where, orderBy, limit };
