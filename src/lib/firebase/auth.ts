/**
 * Firebase 인증 관련 함수
 */
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  onAuthStateChanged,
  User,
  UserCredential,
} from 'firebase/auth';
import { auth } from './config';

/**
 * 이메일/비밀번호로 로그인
 */
export async function signIn(email: string, password: string): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, email, password);
}

/**
 * 이메일/비밀번호로 회원가입
 */
export async function signUp(email: string, password: string): Promise<UserCredential> {
  return createUserWithEmailAndPassword(auth, email, password);
}

/**
 * 로그아웃
 */
export async function logout(): Promise<void> {
  return signOut(auth);
}

/**
 * 현재 사용자 가져오기
 */
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

/**
 * ID 토큰 가져오기 (API 요청 시 사용)
 */
export async function getIdToken(forceRefresh = false): Promise<string | null> {
  if (!auth) return null;
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken(forceRefresh);
}

/**
 * 이메일 인증 메일 발송
 */
export async function sendVerificationEmail(user: User): Promise<void> {
  return sendEmailVerification(user);
}

/**
 * 인증 상태 변경 감지
 */
export function onAuthChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}










