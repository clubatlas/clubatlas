/**
 * Firestore database access functions
 */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  DocumentData,
  QueryConstraint,
} from 'firebase/firestore';
import { firestore } from './config';

/**
 * Get document
 */
export async function getDocument<T = DocumentData>(
  collectionPath: string,
  documentId: string
): Promise<T | null> {
  const docRef = doc(firestore, collectionPath, documentId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as T;
  }
  return null;
}

/**
 * Get all documents in a collection
 */
export async function getCollection<T = DocumentData>(
  collectionPath: string,
  ...queryConstraints: QueryConstraint[]
): Promise<T[]> {
  const collectionRef = collection(firestore, collectionPath);
  const q = queryConstraints.length > 0 
    ? query(collectionRef, ...queryConstraints)
    : collectionRef;
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as T[];
}

/**
 * Create or update document
 */
export async function setDocument(
  collectionPath: string,
  documentId: string,
  data: any
): Promise<void> {
  const docRef = doc(firestore, collectionPath, documentId);
  await setDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  }, { merge: true });
}

/**
 * Update document
 */
export async function updateDocument(
  collectionPath: string,
  documentId: string,
  data: Partial<any>
): Promise<void> {
  const docRef = doc(firestore, collectionPath, documentId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Delete document
 */
export async function deleteDocument(
  collectionPath: string,
  documentId: string
): Promise<void> {
  const docRef = doc(firestore, collectionPath, documentId);
  await deleteDoc(docRef);
}

/**
 * Query helper functions
 */
export const firestoreQuery = {
  where,
  orderBy,
  limit,
};










