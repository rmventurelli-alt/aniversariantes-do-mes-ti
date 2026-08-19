import { randomUUID } from "crypto";
import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";

export type UploadDirectory = "fotos" | "templates" | "whatsapp-templates" | "whatsapp-generated";

const uploadRoot = path.join(process.cwd(), "uploads");
const mimeToExtension: Record<string, string> = {
  "image/gif": "gif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp"
};

function getUploadDirectory(directory: UploadDirectory) {
  return path.join(uploadRoot, directory);
}

function getPublicPath(directory: UploadDirectory, fileName: string) {
  return `/uploads/${directory}/${fileName}`;
}

function parseDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);

  if (!match) {
    throw new Error("Arquivo de imagem invalido.");
  }

  const [, mimeType, base64] = match;
  const extension = mimeToExtension[mimeType];

  if (!extension) {
    throw new Error("Tipo de imagem nao suportado.");
  }

  return {
    buffer: Buffer.from(base64, "base64"),
    extension
  };
}

export function isDataUrl(value: string) {
  return value.startsWith("data:image/");
}

export async function saveImageFromDataUrl(directory: UploadDirectory, dataUrl: string, namePrefix: string) {
  const { buffer, extension } = parseDataUrl(dataUrl);
  const fileName = `${namePrefix}-${randomUUID()}.${extension}`;
  const targetDirectory = getUploadDirectory(directory);
  const targetPath = path.join(targetDirectory, fileName);

  await mkdir(targetDirectory, { recursive: true });
  await writeFile(targetPath, buffer);

  return {
    fileName,
    publicPath: getPublicPath(directory, fileName)
  };
}

export async function saveBufferToUpload(directory: UploadDirectory, buffer: Buffer, fileName: string) {
  const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const targetDirectory = getUploadDirectory(directory);
  const targetPath = path.join(targetDirectory, safeFileName);

  await mkdir(targetDirectory, { recursive: true });
  await writeFile(targetPath, buffer);

  return {
    fileName: safeFileName,
    publicPath: getPublicPath(directory, safeFileName)
  };
}

export async function deleteUploadedFile(publicPath?: string | null) {
  if (!publicPath || !publicPath.startsWith("/uploads/")) {
    return;
  }

  const relativePath = publicPath.replace(/^\/uploads\//, "");
  const targetPath = path.resolve(uploadRoot, relativePath);

  if (!targetPath.startsWith(path.resolve(uploadRoot))) {
    return;
  }

  try {
    await unlink(targetPath);
  } catch {
    // File may have already been removed manually. The database delete should still proceed.
  }
}

export async function readUploadedFile(parts: string[]) {
  const relativePath = parts.join(path.sep);
  const targetPath = path.resolve(uploadRoot, relativePath);

  if (!targetPath.startsWith(path.resolve(uploadRoot))) {
    return null;
  }

  return readFile(targetPath);
}

export function getContentType(fileName: string) {
  const extension = path.extname(fileName).toLowerCase();

  if (extension === ".jpg" || extension === ".jpeg") {
    return "image/jpeg";
  }

  if (extension === ".png") {
    return "image/png";
  }

  if (extension === ".webp") {
    return "image/webp";
  }

  if (extension === ".gif") {
    return "image/gif";
  }

  return "application/octet-stream";
}
