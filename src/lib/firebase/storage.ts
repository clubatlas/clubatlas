/**
 * Firebase Storage 파일 업로드/다운로드
 */
import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  UploadResult,
  UploadTask,
} from 'firebase/storage';
import { storage } from './config';

/**
 * 파일 업로드 (바이트 단위)
 */
export async function uploadFile(
  path: string,
  file: Blob | Uint8Array | ArrayBuffer
): Promise<UploadResult> {
  const storageRef = ref(storage, path);
  return uploadBytes(storageRef, file);
}

/**
 * 파일 업로드 (진행률 추적 가능)
 */
export function uploadFileWithProgress(
  path: string,
  file: Blob | Uint8Array | ArrayBuffer
): UploadTask {
  const storageRef = ref(storage, path);
  return uploadBytesResumable(storageRef, file);
}

/**
 * 파일 다운로드 URL 가져오기
 */
export async function getFileUrl(path: string): Promise<string> {
  const storageRef = ref(storage, path);
  return getDownloadURL(storageRef);
}

/**
 * 파일 삭제
 */
export async function deleteFile(path: string): Promise<void> {
  const storageRef = ref(storage, path);
  return deleteObject(storageRef);
}

/**
 * 이미지 업로드 헬퍼 (File 객체용)
 */
export async function uploadImage(
  path: string,
  file: File
): Promise<string> {
  const result = await uploadFile(path, file);
  return getDownloadURL(result.ref);
}










