import { prisma } from "@/lib/prisma";
import { deleteUploadedFile, isDataUrl, saveImageFromDataUrl } from "@/lib/uploads";
import type { WhatsAppArtTemplate } from "@/types/whatsapp";

type WhatsAppArtTemplateInput = {
  id?: unknown;
  name?: unknown;
  imageDataUrl?: unknown;
  active?: unknown;
};

type WhatsAppArtTemplateRecord = Awaited<ReturnType<typeof prisma.whatsAppArtTemplate.findFirst>>;

function requiredString(value: unknown, message: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(message);
  }

  return value.trim();
}

function optionalId(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : "";
}

function toArtTemplate(template: NonNullable<WhatsAppArtTemplateRecord>): WhatsAppArtTemplate {
  return {
    id: template.id,
    name: template.name,
    fileName: template.fileName,
    filePath: template.filePath,
    active: template.active,
    createdAt: template.createdAt.toISOString(),
    updatedAt: template.updatedAt.toISOString()
  };
}

function normalizeArtTemplateInput(input: WhatsAppArtTemplateInput) {
  return {
    id: optionalId(input.id),
    name: requiredString(input.name, "Nome do template de arte obrigatorio."),
    imageDataUrl: requiredString(input.imageDataUrl, "Imagem do template de arte obrigatoria."),
    active: input.active === true
  };
}

export async function listWhatsAppArtTemplates() {
  const templates = await prisma.whatsAppArtTemplate.findMany({
    orderBy: [{ active: "desc" }, { updatedAt: "desc" }]
  });

  return templates.map(toArtTemplate);
}

export async function getActiveWhatsAppArtTemplate() {
  const template = await prisma.whatsAppArtTemplate.findFirst({
    where: { active: true },
    orderBy: { updatedAt: "desc" }
  });

  return template ? toArtTemplate(template) : null;
}

export async function saveWhatsAppArtTemplate(input: WhatsAppArtTemplateInput) {
  const normalized = normalizeArtTemplateInput(input);
  const id = normalized.id || `whatsapp-art-template-${crypto.randomUUID()}`;
  const current = await prisma.whatsAppArtTemplate.findUnique({ where: { id } });
  const uploaded =
    current && !isDataUrl(normalized.imageDataUrl)
      ? {
          fileName: current.fileName,
          publicPath: current.filePath
        }
      : await saveImageFromDataUrl("whatsapp-templates", normalized.imageDataUrl, "whatsapp-template");

  try {
    const template = await prisma.$transaction(async (tx) => {
      if (normalized.active) {
        await tx.whatsAppArtTemplate.updateMany({ data: { active: false } });
      }

      return tx.whatsAppArtTemplate.upsert({
        where: { id },
        create: {
          id,
          name: normalized.name,
          fileName: uploaded.fileName,
          filePath: uploaded.publicPath,
          active: normalized.active
        },
        update: {
          name: normalized.name,
          fileName: uploaded.fileName,
          filePath: uploaded.publicPath,
          active: normalized.active
        }
      });
    });

    if (current && uploaded.publicPath !== current.filePath) {
      await deleteUploadedFile(current.filePath);
    }

    return toArtTemplate(template);
  } catch (error) {
    if (!current || uploaded.publicPath !== current.filePath) {
      await deleteUploadedFile(uploaded.publicPath);
    }

    throw error;
  }
}

export async function updateWhatsAppArtTemplate(id: string, input: WhatsAppArtTemplateInput) {
  const current = await prisma.whatsAppArtTemplate.findUnique({ where: { id } });

  if (!current) {
    return null;
  }

  return saveWhatsAppArtTemplate({ ...input, id });
}

export async function deleteWhatsAppArtTemplate(id: string) {
  const current = await prisma.whatsAppArtTemplate.findUnique({ where: { id } });

  if (!current) {
    return false;
  }

  await prisma.whatsAppArtTemplate.delete({ where: { id } });
  await deleteUploadedFile(current.filePath);

  return true;
}
