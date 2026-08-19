import { NextRequest, NextResponse } from "next/server";
import { listWhatsAppArtTemplates, saveWhatsAppArtTemplate } from "@/lib/db/whatsappArtTemplates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const templates = await listWhatsAppArtTemplates();
  return NextResponse.json(templates);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const template = await saveWhatsAppArtTemplate(body);

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nao foi possivel salvar o template de arte WhatsApp.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
