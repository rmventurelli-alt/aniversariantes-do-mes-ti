export function normalizeBrazilianWhatsApp(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  const digits = value.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  const withoutInternationalPrefix = digits.startsWith("00") ? digits.slice(2) : digits;
  const normalized = withoutInternationalPrefix.startsWith("55")
    ? withoutInternationalPrefix
    : `55${withoutInternationalPrefix}`;

  if (!/^55\d{10,11}$/.test(normalized)) {
    throw new Error("WhatsApp invalido. Use DDD e numero brasileiro.");
  }

  const ddd = Number(normalized.slice(2, 4));

  if (ddd < 11 || ddd > 99) {
    throw new Error("WhatsApp invalido. Informe um DDD brasileiro valido.");
  }

  return normalized;
}

export function formatBrazilianWhatsApp(value: string) {
  const normalized = normalizeBrazilianWhatsApp(value);

  if (!normalized) {
    return "";
  }

  const local = normalized.slice(4);
  const ddd = normalized.slice(2, 4);

  if (local.length === 9) {
    return `(${ddd}) ${local.slice(0, 5)}-${local.slice(5)}`;
  }

  return `(${ddd}) ${local.slice(0, 4)}-${local.slice(4)}`;
}
