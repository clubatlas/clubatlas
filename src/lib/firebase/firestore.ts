/**
 * Firestore 데이터베이스 접근 함수
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
 * 문서 가져오기
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
 * 컬렉션의 모든 문서 가져오기
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
 * 문서 생성 또는 업데이트
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
 * 문서 업데이트
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
 * 문서 삭제
 */
export async function deleteDocument(
  collectionPath: string,
  documentId: string
): Promise<void> {
  const docRef = doc(firestore, collectionPath, documentId);
  await deleteDoc(docRef);
}

/**
 * 쿼리 헬퍼 함수들
 */
export const firestoreQuery = {
  where,
  orderBy,
  limit,
};










