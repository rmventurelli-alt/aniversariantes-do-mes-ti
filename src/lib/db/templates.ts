import { prisma } from "@/lib/prisma";
import { deleteUploadedFile, isDataUrl, saveImageFromDataUrl } from "@/lib/uploads";
import type { Asset } from "@/types/asset";

type TemplateInput = {
  id: string;
  name: string;
  type: "template";
  imageDataUrl: string;
  createdAt?: string;
};

type TemplateRecord = Awaited<ReturnType<typeof prisma.templateAsset.findFirst>>;

function toAsset(template: NonNullable<TemplateRecord>): Asset {
  return {
    id: template.id,
    name: template.name,
    type: "template",
    imageDataUrl: template.templatePath,
    createdAt: template.createdAt.toISOString()
  };
}

export async function listTemplates() {
  const templates = await prisma.templateAsset.findMany({
    orderBy: { createdAt: "asc" }
  });

  return templates.map(toAsset);
}

export async function saveTemplate(input: TemplateInput) {
  const current = await prisma.templateAsset.findUnique({ where: { id: input.id } });

  if (current) {
    const uploaded = isDataUrl(input.imageDataUrl)
      ? await saveImageFromDataUrl("templates", input.imageDataUrl, "template")
      : {
          fileName: current.fileName,
          publicPath: current.templatePath
        };

    const template = await prisma.templateAsset.update({
      where: { id: input.id },
      data: {
        name: input.name,
        fileName: uploaded.fileName,
        templatePath: uploaded.publicPath
      }
    });

    if (uploaded.publicPath !== current.templatePath) {
      await deleteUploadedFile(current.templatePath);
    }

    return toAsset(template);
  }

  const uploaded = await saveImageFromDataUrl("templates", input.imageDataUrl, "template");
  const template = await prisma.templateAsset.create({
    data: {
      id: input.id,
      name: input.name,
      type: input.type,
      fileName: uploaded.fileName,
      templatePath: uploaded.publicPath,
      createdAt: input.createdAt ? new Date(input.createdAt) : undefined
    }
  });

  return toAsset(template);
}

export async function deleteTemplate(id: string) {
  const current = await prisma.templateAsset.findUnique({ where: { id } });

  if (!current) {
    return false;
  }

  await prisma.templateAsset.delete({ where: { id } });
  await deleteUploadedFile(current.templatePath);

  return true;
}
