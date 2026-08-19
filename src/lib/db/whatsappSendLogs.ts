import { prisma } from "@/lib/prisma";
import type { WhatsAppSendLog, WhatsAppSendStatus } from "@/types/whatsapp";

type WhatsAppSendLogRecord = Awaited<ReturnType<typeof prisma.whatsAppSendLog.findFirst>>;

function toSendLog(log: NonNullable<WhatsAppSendLogRecord>): WhatsAppSendLog {
  return {
    id: log.id,
    birthdayPersonId: log.birthdayPersonId,
    phone: log.phone ?? "",
    messageText: log.messageText,
    imagePath: log.imagePath ?? "",
    status: log.status as WhatsAppSendStatus,
    errorMessage: log.errorMessage ?? "",
    sentAt: log.sentAt?.toISOString() ?? "",
    year: log.year,
    createdAt: log.createdAt.toISOString()
  };
}

export async function hasSentWhatsAppThisYear(birthdayPersonId: string, year: number) {
  const log = await prisma.whatsAppSendLog.findFirst({
    where: {
      birthdayPersonId,
      year,
      status: "sent"
    }
  });

  return Boolean(log);
}

export async function createWhatsAppSendLog(input: {
  birthdayPersonId: string;
  phone?: string;
  messageText: string;
  imagePath?: string;
  status: WhatsAppSendStatus;
  errorMessage?: string;
  sentAt?: Date;
  year: number;
}) {
  const log = await prisma.whatsAppSendLog.create({
    data: {
      id: `whatsapp-log-${crypto.randomUUID()}`,
      birthdayPersonId: input.birthdayPersonId,
      phone: input.phone,
      messageText: input.messageText,
      imagePath: input.imagePath,
      status: input.status,
      errorMessage: input.errorMessage,
      sentAt: input.sentAt,
      year: input.year
    }
  });

  return toSendLog(log);
}

export async function getWhatsAppSendLogsForPeople(birthdayPersonIds: string[], year: number) {
  if (birthdayPersonIds.length === 0) {
    return [];
  }

  const logs = await prisma.whatsAppSendLog.findMany({
    where: {
      birthdayPersonId: { in: birthdayPersonIds },
      year
    },
    orderBy: { createdAt: "desc" }
  });

  return logs.map(toSendLog);
}
