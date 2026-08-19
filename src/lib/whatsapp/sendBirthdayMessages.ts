import { prisma } from "@/lib/prisma";
import { getActiveWhatsAppArtTemplate } from "@/lib/db/whatsappArtTemplates";
import { getActiveWhatsAppTemplate } from "@/lib/db/whatsappTemplates";
import {
  createWhatsAppSendLog,
  getWhatsAppSendLogsForPeople,
  hasSentWhatsAppThisYear
} from "@/lib/db/whatsappSendLogs";
import { normalizeBrazilianWhatsApp } from "@/lib/whatsapp/phone";
import { sendWhatsAppImageMessage, sendWhatsAppTextMessage, uploadWhatsAppImage } from "@/lib/whatsapp/cloudApi";
import { generateBirthdayWhatsAppImage } from "@/lib/whatsapp/generateBirthdayImage";
import { getContentType, readUploadedFile } from "@/lib/uploads";
import type { BirthdayPerson } from "@/types/birthday";
import type { WhatsAppBirthdayStatus, WhatsAppSendSummary } from "@/types/whatsapp";

function todayParts(now = new Date()) {
  return {
    day: now.getDate(),
    month: now.getMonth() + 1,
    year: now.getFullYear()
  };
}

function renderMessage(template: string, person: Pick<BirthdayPerson, "name">) {
  return template.split("{{nome}}").join(person.name);
}

function publicPathParts(publicPath: string) {
  return publicPath.replace(/^\/uploads\//, "").split("/").filter(Boolean);
}

function toBirthdayPerson(person: {
  id: string;
  photoPath: string;
  name: string;
  role: string;
  whatsapp: string | null;
  birthdayDay: number;
  birthdayMonth: number;
}): BirthdayPerson {
  return {
    id: person.id,
    photoDataUrl: person.photoPath,
    name: person.name,
    role: person.role,
    whatsapp: person.whatsapp ?? "",
    birthdayDay: person.birthdayDay,
    birthdayMonth: person.birthdayMonth
  };
}

export async function listTodayBirthdayWhatsAppStatuses(now = new Date()): Promise<WhatsAppBirthdayStatus[]> {
  const { day, month, year } = todayParts(now);
  const people = await prisma.birthdayPerson.findMany({
    where: {
      birthdayDay: day,
      birthdayMonth: month
    },
    orderBy: { name: "asc" }
  });
  const logs = await getWhatsAppSendLogsForPeople(
    people.map((person) => person.id),
    year
  );

  return people.map((person) => {
    const personLogs = logs.filter((log) => log.birthdayPersonId === person.id);
    const lastLog = personLogs[0];

    return {
      birthdayPersonId: person.id,
      name: person.name,
      whatsapp: person.whatsapp ?? "",
      alreadySent: personLogs.some((log) => log.status === "sent"),
      lastStatus: lastLog?.status ?? "",
      lastErrorMessage: lastLog?.errorMessage ?? "",
      lastSentAt: lastLog?.sentAt ?? ""
    };
  });
}

export async function sendBirthdayWhatsAppMessages(now = new Date()): Promise<WhatsAppSendSummary> {
  const { day, month, year } = todayParts(now);
  const summary: WhatsAppSendSummary = {
    sent: 0,
    skipped: 0,
    failed: 0,
    results: []
  };
  const [messageTemplate, artTemplate] = await Promise.all([getActiveWhatsAppTemplate(), getActiveWhatsAppArtTemplate()]);
  const people = await prisma.birthdayPerson.findMany({
    where: {
      birthdayDay: day,
      birthdayMonth: month
    },
    orderBy: { name: "asc" }
  });

  if (!messageTemplate) {
    summary.failed += 1;
    summary.results.push({
      birthdayPersonId: "",
      name: "",
      phone: "",
      status: "failed",
      messageText: "",
      imagePath: "",
      errorMessage: "Nenhum template de WhatsApp ativo encontrado."
    });
    return summary;
  }

  if (!artTemplate) {
    summary.failed += 1;
    summary.results.push({
      birthdayPersonId: "",
      name: "",
      phone: "",
      status: "failed",
      messageText: "",
      imagePath: "",
      errorMessage: "Nenhum template de arte WhatsApp ativo encontrado."
    });
    return summary;
  }

  for (const record of people) {
    const person = toBirthdayPerson(record);
    const messageText = renderMessage(messageTemplate.message, person);
    let imagePath = "";

    let phone = "";

    try {
      phone = normalizeBrazilianWhatsApp(person.whatsapp);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "WhatsApp invalido.";
      await createWhatsAppSendLog({
        birthdayPersonId: person.id,
        phone: person.whatsapp,
        messageText,
        imagePath,
        status: "failed",
        errorMessage,
        year
      });
      summary.failed += 1;
      summary.results.push({
        birthdayPersonId: person.id,
        name: person.name,
        phone: person.whatsapp,
        status: "failed",
        messageText,
        imagePath,
        errorMessage
      });
      continue;
    }

    if (!phone) {
      summary.skipped += 1;
      summary.results.push({
        birthdayPersonId: person.id,
        name: person.name,
        phone: "",
        status: "skipped",
        messageText,
        imagePath,
        errorMessage: "Aniversariante sem WhatsApp cadastrado."
      });
      continue;
    }

    if (await hasSentWhatsAppThisYear(person.id, year)) {
      summary.skipped += 1;
      summary.results.push({
        birthdayPersonId: person.id,
        name: person.name,
        phone,
        status: "skipped",
        messageText,
        imagePath,
        errorMessage: "Mensagem ja enviada neste ano."
      });
      continue;
    }

    try {
      const generatedImage = await generateBirthdayWhatsAppImage({
        artTemplate,
        personName: person.name,
        year
      });
      imagePath = generatedImage.publicPath;

      const imageBuffer = await readUploadedFile(publicPathParts(imagePath));

      if (!imageBuffer) {
        throw new Error("Imagem personalizada nao encontrada apos geracao.");
      }

      const mediaId = await uploadWhatsAppImage({
        buffer: imageBuffer,
        fileName: generatedImage.fileName,
        contentType: getContentType(generatedImage.fileName)
      });

      await sendWhatsAppImageMessage({ to: phone, mediaId });
      await sendWhatsAppTextMessage({ to: phone, message: messageText });
      await createWhatsAppSendLog({
        birthdayPersonId: person.id,
        phone,
        messageText,
        imagePath,
        status: "sent",
        sentAt: new Date(),
        year
      });
      summary.sent += 1;
      summary.results.push({
        birthdayPersonId: person.id,
        name: person.name,
        phone,
        status: "sent",
        messageText,
        imagePath,
        errorMessage: ""
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Falha desconhecida no envio.";
      await createWhatsAppSendLog({
        birthdayPersonId: person.id,
        phone,
        messageText,
        imagePath,
        status: "failed",
        errorMessage,
        year
      });
      summary.failed += 1;
      summary.results.push({
        birthdayPersonId: person.id,
        name: person.name,
        phone,
        status: "failed",
        messageText,
        imagePath,
        errorMessage
      });
    }
  }

  return summary;
}
