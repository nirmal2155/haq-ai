import { adminStorage } from './firestore';
import crypto from 'crypto';

export type AllowedMimeType = 'application/pdf' | 'image/jpeg' | 'image/png' | 'image/webp';

export interface FileValidationResult {
  valid: boolean;
  mime?: AllowedMimeType;
  error?: string;
}

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8 MB

export function validateMagicBytes(buffer: Buffer): FileValidationResult {
  if (buffer.length === 0) {
    return { valid: false, error: 'Empty file' };
  }
  if (buffer.length > MAX_FILE_SIZE) {
    return { valid: false, error: 'File exceeds maximum size of 8 MB' };
  }

  // Check PDF (%PDF)
  if (
    buffer.length >= 4 &&
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46
  ) {
    return { valid: true, mime: 'application/pdf' };
  }

  // Check JPEG (FF D8 FF)
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return { valid: true, mime: 'image/jpeg' };
  }

  // Check PNG (89 50 4E 47 0D 0A 1A 0A)
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { valid: true, mime: 'image/png' };
  }

  // Check WEBP (RIFF....WEBP)
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
  ) {
    return { valid: true, mime: 'image/webp' };
  }

  return { valid: false, error: 'Invalid file format. Only PDF, JPEG, PNG, and WEBP are permitted.' };
}

export function computeSha256(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

export async function uploadPrivateDocument(
  buffer: Buffer,
  userId: string,
  mime: AllowedMimeType
): Promise<{ storagePath: string; sha256: string }> {
  const validation = validateMagicBytes(buffer);
  if (!validation.valid || validation.mime !== mime) {
    throw new Error(validation.error || 'Magic byte validation failed');
  }

  const sha256 = computeSha256(buffer);
  const randomId = crypto.randomUUID();
  const ext = mime === 'application/pdf' ? 'pdf' : mime.split('/')[1];
  const storagePath = `uploads/${userId}/${randomId}.${ext}`;

  const bucket = adminStorage.bucket();
  const file = bucket.file(storagePath);

  await file.save(buffer, {
    metadata: {
      contentType: mime,
      metadata: {
        uploaderUid: userId,
        sha256,
      },
    },
    resumable: false,
  });

  return { storagePath, sha256 };
}

export async function getSignedDownloadUrl(storagePath: string): Promise<string> {
  const bucket = adminStorage.bucket();
  const file = bucket.file(storagePath);

  // Signed URL expiring in 5 minutes (300 seconds)
  const [url] = await file.getSignedUrl({
    version: 'v4',
    action: 'read',
    expires: Date.now() + 5 * 60 * 1000,
  });

  return url;
}

export async function deletePrivateDocument(storagePath: string): Promise<void> {
  const bucket = adminStorage.bucket();
  const file = bucket.file(storagePath);
  await file.delete({ ignoreNotFound: true });
}

/**
 * Deletes all private files uploaded by a user (uploads/{userId}/)
 * Required for DPDP compliance right to erasure.
 */
export async function deleteUserStorageFolder(userId: string): Promise<number> {
  const bucket = adminStorage.bucket();
  const prefix = `uploads/${userId}/`;
  const [files] = await bucket.getFiles({ prefix });

  let deletedCount = 0;
  for (const file of files) {
    await file.delete({ ignoreNotFound: true });
    deletedCount++;
  }

  return deletedCount;
}

