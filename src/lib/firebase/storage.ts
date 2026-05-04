/**
 * Firebase Storage file upload/download
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
 * Upload file (bytes)
 */
export async function uploadFile(
  path: string,
  file: Blob | Uint8Array | ArrayBuffer
): Promise<UploadResult> {
  const storageRef = ref(storage, path);
  return uploadBytes(storageRef, file);
}

/**
 * Upload file (with progress tracking)
 */
export function uploadFileWithProgress(
  path: string,
  file: Blob | Uint8Array | ArrayBuffer
): UploadTask {
  const storageRef = ref(storage, path);
  return uploadBytesResumable(storageRef, file);
}

/**
 * Get file download URL
 */
export async function getFileUrl(path: string): Promise<string> {
  const storageRef = ref(storage, path);
  return getDownloadURL(storageRef);
}

/**
 * Delete file
 */
export async function deleteFile(path: string): Promise<void> {
  const storageRef = ref(storage, path);
  return deleteObject(storageRef);
}

/**
 * Image upload helper (for File objects)
 */
export async function uploadImage(
  path: string,
  file: File
): Promise<string> {
  const result = await uploadFile(path, file);
  return getDownloadURL(result.ref);
}










