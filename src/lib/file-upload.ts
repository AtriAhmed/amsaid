// lib/file-upload.ts
import { v4 as uuidv4 } from "uuid";
import fs from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

// Ensure the uploads directory exists
async function ensureUploadDir() {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  } catch (error) {
    console.error("Error ensuring upload dir:", error);
  }
}

/**
 * Save a single file to the uploads folder with a UUID name.
 * @param file The File object from request.formData()
 * @returns The new file name
 */
export async function uploadFile(file: File): Promise<string> {
  await ensureUploadDir();

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const ext = path.extname(file.name) || "";
  const uuidName = `${uuidv4()}${ext}`;
  const filePath = path.join(UPLOAD_DIR, uuidName);

  await fs.writeFile(filePath, buffer);

  return uuidName;
}

/**
 * Save multiple files.
 * @param files An array of File objects
 * @returns Array of new file names
 */
export async function uploadFiles(files: File[]): Promise<string[]> {
  return Promise.all(files.map((file) => uploadFile(file)));
}

/**
 * Delete a single file from the uploads folder.
 * @param fileName The file name (UUID one returned by uploadFile)
 */
export async function deleteFile(fileName: string): Promise<void> {
  const filePath = path.join(UPLOAD_DIR, fileName);

  try {
    await fs.unlink(filePath);
  } catch (error: any) {
    if (error.code !== "ENOENT") {
      throw error; // ignore missing files, rethrow other errors
    }
  }
}

/**
 * Delete multiple files.
 * @param fileNames Array of file names
 */
export async function deleteFiles(fileNames: string[]): Promise<void> {
  await Promise.all(fileNames.map((name) => deleteFile(name)));
}
