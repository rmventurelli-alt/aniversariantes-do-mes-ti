import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { deleteUploadedFile, isDataUrl, saveImageFromDataUrl } from "@/lib/uploads";
import { normalizeBrazilianWhatsApp } from "@/lib/whatsapp/phone";
import type { BirthdayPerson } from "@/types/birthday";

type BirthdayInput = {
  id?: unknown;
  photoDataUrl?: unknown;
  name?: unknown;
  role?: unknown;
  whatsapp?: unknown;
  birthday?: unknown;
  birthdayDay?: unknown;
  birthdayMonth?: unknown;
};

type NormalizedBirthdayInput = {
  id: string;
  photoDataUrl: string;
  name: string;
  role: string;
  whatsapp: string;
  birthdayDay: number;
  birthdayMonth: number;
};

type BirthdayRecord = Awaited<ReturnType<typeof prisma.birthdayPerson.findFirst>>;

function toBirthdayPerson(person: NonNullable<BirthdayRecord>): BirthdayPerson {
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

function getRequiredString(value: unknown, message: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(message);
  }

  return value.trim();
}

function getOptionalString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function parseBirthdayValue(input: BirthdayInput) {
  if (typeof input.birthday === "string") {
    const match = /^(\d{1,2})\/(\d{1,2})$/.exec(input.birthday.trim());

    if (!match) {
      throw new Error("Data invalida. Use o formato dd/mm.");
    }

    return {
      day: Number(match[1]),
      month: Number(match[2])
    };
  }

  const day = Number(input.birthdayDay);
  const month = Number(input.birthdayMonth);

  if (!Number.isInteger(day) || !Number.isInteger(month)) {
    throw new Error("Data invalida.");
  }

  return { day, month };
}

function validateBirthdayDate(input: BirthdayInput) {
  const { day, month } = parseBirthdayValue(input);

  if (month < 1 || month > 12) {
    throw new Error("Mes invalido.");
  }

  if (day < 1) {
    throw new Error("Dia invalido.");
  }

  const maxDayByMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  if (day > maxDayByMonth[month - 1]) {
    throw new Error("Dia invalido.");
  }

  return {
    birthdayDay: day,
    birthdayMonth: month
  };
}

function normalizeBirthdayInput(input: BirthdayInput, fallbackId?: string): NormalizedBirthdayInput {
  const id = fallbackId ?? getRequiredString(input.id, "Id obrigatorio.");
  const name = getRequiredString(input.name, "Nome obrigatorio.");

  if (name.length > 20) {
    throw new Error("Nome deve ter no maximo 20 caracteres.");
  }

  const role = getRequiredString(input.role, "Funcao obrigatoria.");
  const whatsapp = normalizeBrazilianWhatsApp(getOptionalString(input.whatsapp));
  const photoDataUrl = getRequiredString(input.photoDataUrl, "Foto obrigatoria.");
  const birthday = validateBirthdayDate(input);

  return {
    id,
    photoDataUrl,
    name,
    role,
    whatsapp,
    ...birthday
  };
}

function formatPrismaError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return `Erro do Prisma (${error.code}): ${error.message}`;
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return `Erro do Prisma: ${error.message}`;
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return `Erro do Prisma: ${error.message}`;
  }

  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    return `Erro do Prisma: ${error.message}`;
  }

  if (error instanceof Prisma.PrismaClientRustPanicError) {
    return `Erro do Prisma: ${error.message}`;
  }

  return null;
}

function formatError(error: unknown) {
  return error instanceof Error ? error.message : "Erro desconhecido.";
}

export async function listBirthdayPeople() {
  const people = await prisma.birthdayPerson.findMany({
    orderBy: [{ birthdayMonth: "asc" }, { birthdayDay: "asc" }, { name: "asc" }]
  });

  return people.map(toBirthdayPerson);
}

export async function createBirthdayPerson(input: BirthdayInput) {
  const normalized = normalizeBirthdayInput(input);
  let uploaded: Awaited<ReturnType<typeof saveImageFromDataUrl>>;

  try {
    uploaded = await saveImageFromDataUrl("fotos", normalized.photoDataUrl, "foto");
  } catch (error) {
    throw new Error(`Erro ao salvar foto: ${formatError(error)}`);
  }

  try {
    const person = await prisma.birthdayPerson.create({
      data: {
        id: normalized.id,
        name: normalized.name,
        role: normalized.role,
        whatsapp: normalized.whatsapp,
        birthdayDay: normalized.birthdayDay,
        birthdayMonth: normalized.birthdayMonth,
        photoFileName: uploaded.fileName,
        photoPath: uploaded.publicPath
      }
    });

    return toBirthdayPerson(person);
  } catch (error) {
    await deleteUploadedFile(uploaded.publicPath);
    throw new Error(formatPrismaError(error) ?? formatError(error));
  }
}

export async function updateBirthdayPerson(id: string, input: BirthdayInput) {
  const normalized = normalizeBirthdayInput(input, id);
  const current = await prisma.birthdayPerson.findUnique({ where: { id } });

  if (!current) {
    return null;
  }

  let uploaded: Awaited<ReturnType<typeof saveImageFromDataUrl>> | { fileName: string; publicPath: string };

  try {
    uploaded = isDataUrl(normalized.photoDataUrl)
      ? await saveImageFromDataUrl("fotos", normalized.photoDataUrl, "foto")
      : {
          fileName: current.photoFileName,
          publicPath: current.photoPath
        };
  } catch (error) {
    throw new Error(`Erro ao salvar foto: ${formatError(error)}`);
  }

  try {
    const person = await prisma.birthdayPerson.update({
      where: { id },
      data: {
        name: normalized.name,
        role: normalized.role,
        whatsapp: normalized.whatsapp,
        birthdayDay: normalized.birthdayDay,
        birthdayMonth: normalized.birthdayMonth,
        photoFileName: uploaded.fileName,
        photoPath: uploaded.publicPath
      }
    });

    if (uploaded.publicPath !== current.photoPath) {
      await deleteUploadedFile(current.photoPath);
    }

    return toBirthdayPerson(person);
  } catch (error) {
    if (uploaded.publicPath !== current.photoPath) {
      await deleteUploadedFile(uploaded.publicPath);
    }

    throw new Error(formatPrismaError(error) ?? formatError(error));
  }
}

export async function deleteBirthdayPerson(id: string) {
  const current = await prisma.birthdayPerson.findUnique({ where: { id } });

  if (!current) {
    return false;
  }

  await prisma.birthdayPerson.delete({ where: { id } });
  await deleteUploadedFile(current.photoPath);

  return true;
}
