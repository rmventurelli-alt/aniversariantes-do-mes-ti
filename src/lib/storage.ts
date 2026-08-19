import type { Asset, AssetType } from "@/types/asset";
import type { BirthdayPerson } from "@/types/birthday";
import type {
  WhatsAppArtTemplate,
  WhatsAppBirthdayStatus,
  WhatsAppMessageTemplate,
  WhatsAppSendSummary
} from "@/types/whatsapp";

export type BirthdaySaveInput = {
  id: string;
  photoDataUrl: string;
  name: string;
  role: string;
  whatsapp: string;
  birthday: string;
};

async function requestJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    cache: "no-store",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers
    }
  });

  if (!response.ok) {
    const fallback = "Falha na requisicao.";
    let message = fallback;

    try {
      const errorBody = (await response.json()) as { message?: string };
      message = errorBody.message ?? fallback;
    } catch {
      message = fallback;
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getBirthdayPeople() {
  return requestJson<BirthdayPerson[]>("/api/aniversariantes");
}

export function createBirthdayPerson(person: BirthdaySaveInput) {
  return requestJson<BirthdayPerson>("/api/aniversariantes", {
    method: "POST",
    body: JSON.stringify(person)
  });
}

export function updateBirthdayPerson(person: BirthdaySaveInput) {
  return requestJson<BirthdayPerson>(`/api/aniversariantes/${person.id}`, {
    method: "PUT",
    body: JSON.stringify(person)
  });
}

export async function deleteBirthdayPerson(id: string) {
  await requestJson<{ ok: true }>(`/api/aniversariantes/${id}`, {
    method: "DELETE"
  });
}

export async function getStoredAssets(type?: AssetType) {
  const assets = await requestJson<Asset[]>("/api/templates");
  return type ? assets.filter((asset) => asset.type === type) : assets;
}

export function saveStoredAsset(asset: Asset) {
  return requestJson<Asset>("/api/templates", {
    method: "POST",
    body: JSON.stringify(asset)
  });
}

export async function deleteStoredAsset(id: string) {
  await requestJson<{ ok: true }>(`/api/templates/${id}`, {
    method: "DELETE"
  });
}

export async function getSelectedAssetId(type: AssetType) {
  const result = await requestJson<{ id: string }>("/api/settings/selected-template");
  return result.id;
}

export async function setSelectedAssetId(type: AssetType, id: string) {
  await requestJson<{ ok: true }>("/api/settings/selected-template", {
    method: "PUT",
    body: JSON.stringify({ id })
  });
}

export type WhatsAppTemplateSaveInput = {
  id?: string;
  name: string;
  message: string;
  active: boolean;
};

export type WhatsAppArtTemplateSaveInput = {
  id?: string;
  name: string;
  imageDataUrl: string;
  active: boolean;
};

export function getWhatsAppTemplates() {
  return requestJson<WhatsAppMessageTemplate[]>("/api/whatsapp/templates");
}

export function saveWhatsAppTemplate(template: WhatsAppTemplateSaveInput) {
  return requestJson<WhatsAppMessageTemplate>("/api/whatsapp/templates", {
    method: "POST",
    body: JSON.stringify(template)
  });
}

export function updateWhatsAppTemplate(template: WhatsAppTemplateSaveInput & { id: string }) {
  return requestJson<WhatsAppMessageTemplate>(`/api/whatsapp/templates/${template.id}`, {
    method: "PUT",
    body: JSON.stringify(template)
  });
}

export async function deleteWhatsAppTemplate(id: string) {
  await requestJson<{ ok: true }>(`/api/whatsapp/templates/${id}`, {
    method: "DELETE"
  });
}

export function getWhatsAppArtTemplates() {
  return requestJson<WhatsAppArtTemplate[]>("/api/whatsapp/art-templates");
}

export function saveWhatsAppArtTemplate(template: WhatsAppArtTemplateSaveInput) {
  return requestJson<WhatsAppArtTemplate>("/api/whatsapp/art-templates", {
    method: "POST",
    body: JSON.stringify(template)
  });
}

export function updateWhatsAppArtTemplate(template: WhatsAppArtTemplateSaveInput & { id: string }) {
  return requestJson<WhatsAppArtTemplate>(`/api/whatsapp/art-templates/${template.id}`, {
    method: "PUT",
    body: JSON.stringify(template)
  });
}

export async function deleteWhatsAppArtTemplate(id: string) {
  await requestJson<{ ok: true }>(`/api/whatsapp/art-templates/${id}`, {
    method: "DELETE"
  });
}

export function getWhatsAppStatus() {
  return requestJson<{
    activeMessageTemplate: WhatsAppMessageTemplate | null;
    activeArtTemplate: WhatsAppArtTemplate | null;
    birthdays: WhatsAppBirthdayStatus[];
  }>("/api/whatsapp/status");
}

export function runWhatsAppBirthdaySend() {
  return requestJson<WhatsAppSendSummary>("/api/whatsapp/run", {
    method: "POST",
    body: JSON.stringify({})
  });
}
