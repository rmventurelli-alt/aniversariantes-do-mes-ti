import { prisma } from "@/lib/prisma";
import type { WhatsAppMessageTemplate } from "@/types/whatsapp";

type WhatsAppTemplateInput = {
  id?: unknown;
  name?: unknown;
  message?: unknown;
  active?: unknown;
};

type WhatsAppTemplateRecord = Awaited<ReturnType<typeof prisma.whatsAppMessageTemplate.findFirst>>;

function requiredString(value: unknown, message: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(message);
  }

  return value.trim();
}

function optionalId(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : "";
}

function toTemplate(template: NonNullable<WhatsAppTemplateRecord>): WhatsAppMessageTemplate {
  return {
    id: template.id,
    name: template.name,
    message: template.message,
    active: template.active,
    createdAt: template.createdAt.toISOString(),
    updatedAt: template.updatedAt.toISOString()
  };
}

function normalizeTemplateInput(input: WhatsAppTemplateInput, fallbackId?: string) {
  const id = fallbackId ?? optionalId(input.id);
  const name = requiredString(input.name, "Nome do template obrigatorio.");
  const message = requiredString(input.message, "Texto da mensagem obrigatorio.");
  const active = input.active === true;

  if (!message.includes("{{nome}}")) {
    throw new Error("A mensagem deve conter a variavel {{nome}}.");
  }

  return { id, name, message, active };
}

export async function listWhatsAppTemplates() {
  const templates = await prisma.whatsAppMessageTemplate.findMany({
    orderBy: [{ active: "desc" }, { updatedAt: "desc" }]
  });

  return templates.map(toTemplate);
}

export async function getActiveWhatsAppTemplate() {
  const template = await prisma.whatsAppMessageTemplate.findFirst({
    where: { active: true },
    orderBy: { updatedAt: "desc" }
  });

  return template ? toTemplate(template) : null;
}

export async function saveWhatsAppTemplate(input: WhatsAppTemplateInput) {
  const normalized = normalizeTemplateInput(input);
  const id = normalized.id || `whatsapp-template-${crypto.randomUUID()}`;

  const template = await prisma.$transaction(async (tx) => {
    if (normalized.active) {
      await tx.whatsAppMessageTemplate.updateMany({ data: { active: false } });
    }

    return tx.whatsAppMessageTemplate.upsert({
      where: { id },
      create: {
        id,
        name: normalized.name,
        message: normalized.message,
        active: normalized.active
      },
      update: {
        name: normalized.name,
        message: normalized.message,
        active: normalized.active
      }
    });
  });

  return toTemplate(template);
}

export async function updateWhatsAppTemplate(id: string, input: WhatsAppTemplateInput) {
  const current = await prisma.whatsAppMessageTemplate.findUnique({ where: { id } });

  if (!current) {
    return null;
  }

  const normalized = normalizeTemplateInput(input, id);
  const template = await prisma.$transaction(async (tx) => {
    if (normalized.active) {
      await tx.whatsAppMessageTemplate.updateMany({
        where: { id: { not: id } },
        data: { active: false }
      });
    }

    return tx.whatsAppMessageTemplate.update({
      where: { id },
      data: {
        name: normalized.name,
        message: normalized.message,
        active: normalized.active
      }
    });
  });

  return toTemplate(template);
}

export async function deleteWhatsAppTemplate(id: string) {
  const current = await prisma.whatsAppMessageTemplate.findUnique({ where: { id } });

  if (!current) {
    return false;
  }

  await prisma.whatsAppMessageTemplate.delete({ where: { id } });
  return true;
}
