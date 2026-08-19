export const monthNames = [
  "Janeiro",
  "Fevereiro",
  "Marco",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro"
];

export function formatBirthday(day: number, month: number) {
  return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}`;
}

export function parseBirthday(value: string) {
  const match = /^(\d{1,2})\/(\d{1,2})$/.exec(value.trim());

  if (!match) {
    return null;
  }

  const day = Number(match[1]);
  const month = Number(match[2]);

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  const maxDayByMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  if (day > maxDayByMonth[month - 1]) {
    return null;
  }

  return { day, month };
}
