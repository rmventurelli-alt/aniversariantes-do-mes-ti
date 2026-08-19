import { prisma } from "@/lib/prisma";

const selectedTemplateKey = "selected-template";

export async function getSelectedTemplateId() {
  const setting = await prisma.appSetting.findUnique({
    where: { key: selectedTemplateKey }
  });

  return setting?.value ?? "";
}

export async function setSelectedTemplateId(id: string) {
  await prisma.appSetting.upsert({
    where: { key: selectedTemplateKey },
    create: {
      key: selectedTemplateKey,
      value: id
    },
    update: {
      value: id
    }
  });
}
