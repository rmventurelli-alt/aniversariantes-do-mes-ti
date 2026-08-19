import { NextResponse } from "next/server";
import { getActiveWhatsAppArtTemplate } from "@/lib/db/whatsappArtTemplates";
import { getActiveWhatsAppTemplate } from "@/lib/db/whatsappTemplates";
import { listTodayBirthdayWhatsAppStatuses } from "@/lib/whatsapp/sendBirthdayMessages";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const [activeMessageTemplate, activeArtTemplate, birthdays] = await Promise.all([
    getActiveWhatsAppTemplate(),
    getActiveWhatsAppArtTemplate(),
    listTodayBirthdayWhatsAppStatuses()
  ]);

  return NextResponse.json({ activeMessageTemplate, activeArtTemplate, birthdays });
}
