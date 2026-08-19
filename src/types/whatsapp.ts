export type WhatsAppMessageTemplate = {
  id: string;
  name: string;
  message: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type WhatsAppArtTemplate = {
  id: string;
  name: string;
  fileName: string;
  filePath: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type WhatsAppSendStatus = "sent" | "skipped" | "failed";

export type WhatsAppSendLog = {
  id: string;
  birthdayPersonId: string;
  phone: string;
  messageText: string;
  imagePath: string;
  status: WhatsAppSendStatus;
  errorMessage: string;
  sentAt: string;
  year: number;
  createdAt: string;
};

export type WhatsAppBirthdayStatus = {
  birthdayPersonId: string;
  name: string;
  whatsapp: string;
  alreadySent: boolean;
  lastStatus: WhatsAppSendStatus | "";
  lastErrorMessage: string;
  lastSentAt: string;
};

export type WhatsAppSendSummary = {
  sent: number;
  skipped: number;
  failed: number;
  results: Array<{
    birthdayPersonId: string;
    name: string;
    phone: string;
    status: WhatsAppSendStatus;
    messageText: string;
    imagePath: string;
    errorMessage: string;
  }>;
};
