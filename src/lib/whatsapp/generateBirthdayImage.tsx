import { ImageResponse } from "next/og";
import { getContentType, readUploadedFile, saveBufferToUpload } from "@/lib/uploads";
import type { WhatsAppArtTemplate } from "@/types/whatsapp";

function publicPathParts(publicPath: string) {
  return publicPath.replace(/^\/uploads\//, "").split("/").filter(Boolean);
}

function toDataUrl(buffer: Buffer, fileName: string) {
  return `data:${getContentType(fileName)};base64,${buffer.toString("base64")}`;
}

function parsePngDimensions(buffer: Buffer) {
  if (buffer.length >= 24 && buffer.toString("ascii", 1, 4) === "PNG") {
    return {
      width: buffer.readUInt32BE(16),
      height: buffer.readUInt32BE(20)
    };
  }

  return null;
}

function parseJpegDimensions(buffer: Buffer) {
  if (buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    return null;
  }

  let offset = 2;

  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = buffer[offset + 1];
    const length = buffer.readUInt16BE(offset + 2);

    if (marker >= 0xc0 && marker <= 0xc3) {
      return {
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7)
      };
    }

    offset += 2 + length;
  }

  return null;
}

function getImageDimensions(buffer: Buffer) {
  return parsePngDimensions(buffer) ?? parseJpegDimensions(buffer) ?? { width: 1080, height: 1080 };
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
}

export async function generateBirthdayWhatsAppImage(input: {
  artTemplate: WhatsAppArtTemplate;
  personName: string;
  year: number;
}) {
  const templateParts = publicPathParts(input.artTemplate.filePath);
  const templateBuffer = await readUploadedFile(templateParts);

  if (!templateBuffer) {
    throw new Error("Arquivo do template de arte WhatsApp nao encontrado.");
  }

  const { width, height } = getImageDimensions(templateBuffer);
  const nameFontSize = Math.round(Math.min(width, height) * 0.07);
  const response = new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          position: "relative",
          width: "100%"
        }}
      >
        <img
          src={toDataUrl(templateBuffer, input.artTemplate.fileName)}
          style={{ height: "100%", left: 0, objectFit: "cover", position: "absolute", top: 0, width: "100%" }}
        />
        <div
          style={{
            color: "#111827",
            fontFamily: "Arial",
            fontSize: nameFontSize,
            fontWeight: 700,
            lineHeight: 1.1,
            maxWidth: width * 0.82,
            textAlign: "center",
            textShadow: "0 2px 8px rgba(255,255,255,0.7)",
            zIndex: 1
          }}
        >
          {input.personName}
        </div>
      </div>
    ),
    { height, width }
  );
  const imageBuffer = Buffer.from(await response.arrayBuffer());
  const fileName = `aniversario_${slugify(input.personName) || "aniversariante"}_${input.year}.png`;

  return saveBufferToUpload("whatsapp-generated", imageBuffer, fileName);
}
