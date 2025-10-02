import { v4 as uuidv4 } from "uuid";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

async function ensureUploadDir() {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  } catch (error) {
    console.error("Error ensuring upload dir:", error);
  }
}

/**
 * Convert supported images to WebP using sharp.
 * Returns an object with the resulting buffer and the chosen extension (e.g. '.webp').
 * If conversion is not appropriate (non-image, gif, or conversion failure) returns original buffer and original extension.
 */
async function convertImageToWebpIfPossible(
  buffer: Buffer,
  originalName: string,
  mimeType?: string
): Promise<{ buffer: Buffer; ext: string }> {
  const ext = path.extname(originalName).toLowerCase();
  const type = (mimeType || "").toLowerCase();

  // Quick checks: not an image -> return original
  const knownImageExts = [
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".avif",
    ".gif",
    ".tiff",
  ];
  const isImage = type.startsWith("image/") || knownImageExts.includes(ext);
  if (!isImage) {
    return { buffer, ext: ext || "" };
  }

  // Skip GIFs because they may be animated and sharp would drop frames
  if (type === "image/gif" || ext === ".gif") {
    return { buffer, ext: ".gif" };
  }

  try {
    // Use sharp to re-encode to webp. Keep `animated: false` to avoid multi-frame behavior.
    const webpBuffer = await sharp(buffer, { animated: false })
      .webp({ quality: 80 })
      .toBuffer();
    return { buffer: webpBuffer, ext: ".webp" };
  } catch (err) {
    console.warn("webp conversion failed, saving original. Error:", err);
    return { buffer, ext: ext || "" };
  }
}

/**
 * Save a single file to the uploads folder with a UUID name.
 * Image files that can be converted to WebP will be converted and saved with a .webp extension.
 * Non-image files or animated GIFs will be saved unchanged.
 * @param file The File object from request.formData()
 * @returns The new file name
 */
export async function uploadFile(file: File): Promise<string> {
  await ensureUploadDir();

  const arrayBuffer = await file.arrayBuffer();
  const originalBuffer = Buffer.from(arrayBuffer);

  const originalExt = path.extname(file.name) || "";

  const { buffer: finalBuffer, ext: chosenExt } =
    await convertImageToWebpIfPossible(originalBuffer, file.name, file.type);

  const uuidName = `${uuidv4()}${chosenExt || originalExt}`;
  const filePath = path.join(UPLOAD_DIR, uuidName);

  await fs.writeFile(filePath, finalBuffer);

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
