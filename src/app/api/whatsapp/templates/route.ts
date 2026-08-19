import { NextRequest, NextResponse } from "next/server";
import { listWhatsAppTemplates, saveWhatsAppTemplate } from "@/lib/db/whatsappTemplates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const templates = await listWhatsAppTemplates();
  return NextResponse.json(templates);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const template = await saveWhatsAppTemplate(body);

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nao foi possivel salvar a mensagem de WhatsApp.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
