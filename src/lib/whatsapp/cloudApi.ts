type WhatsAppCloudApiResponse = {
  messages?: Array<{ id?: string }>;
  id?: string;
  error?: {
    message?: string;
    type?: string;
    code?: number;
  };
};

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Variavel de ambiente ${name} nao configurada.`);
  }

  return value;
}

export async function sendWhatsAppTextMessage(input: { to: string; message: string }) {
  const token = getRequiredEnv("WHATSAPP_TOKEN");
  const phoneNumberId = getRequiredEnv("WHATSAPP_PHONE_NUMBER_ID");
  const version = process.env.WHATSAPP_API_VERSION || "v20.0";
  const response = await fetch(`https://graph.facebook.com/${version}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: input.to,
      type: "text",
      text: {
        body: input.message
      }
    })
  });

  let body: WhatsAppCloudApiResponse | null = null;

  try {
    body = (await response.json()) as WhatsAppCloudApiResponse;
  } catch {
    body = null;
  }

  if (!response.ok) {
    const message = body?.error?.message ?? `WhatsApp Cloud API retornou HTTP ${response.status}.`;
    throw new Error(message);
  }

  return body;
}

export async function uploadWhatsAppImage(input: { buffer: Buffer; fileName: string; contentType: string }) {
  const token = getRequiredEnv("WHATSAPP_TOKEN");
  const phoneNumberId = getRequiredEnv("WHATSAPP_PHONE_NUMBER_ID");
  const version = process.env.WHATSAPP_API_VERSION || "v20.0";
  const formData = new FormData();
  const bytes = new Uint8Array(input.buffer.byteLength);

  bytes.set(input.buffer);

  formData.append("messaging_product", "whatsapp");
  formData.append("file", new Blob([bytes], { type: input.contentType }), input.fileName);

  const response = await fetch(`https://graph.facebook.com/${version}/${phoneNumberId}/media`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });
  const body = (await response.json().catch(() => null)) as WhatsAppCloudApiResponse | null;

  if (!response.ok || !body?.id) {
    const message = body?.error?.message ?? `Upload de imagem retornou HTTP ${response.status}.`;
    throw new Error(message);
  }

  return body.id;
}

export async function sendWhatsAppImageMessage(input: { to: string; mediaId: string }) {
  const token = getRequiredEnv("WHATSAPP_TOKEN");
  const phoneNumberId = getRequiredEnv("WHATSAPP_PHONE_NUMBER_ID");
  const version = process.env.WHATSAPP_API_VERSION || "v20.0";
  const response = await fetch(`https://graph.facebook.com/${version}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: input.to,
      type: "image",
      image: {
        id: input.mediaId
      }
    })
  });
  const body = (await response.json().catch(() => null)) as WhatsAppCloudApiResponse | null;

  if (!response.ok) {
    const message = body?.error?.message ?? `Envio de imagem retornou HTTP ${response.status}.`;
    throw new Error(message);
  }

  return body;
}
