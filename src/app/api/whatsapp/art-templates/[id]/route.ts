import { NextRequest, NextResponse } from "next/server";
import { deleteWhatsAppArtTemplate, updateWhatsAppArtTemplate } from "@/lib/db/whatsappArtTemplates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const body = await request.json();
    const template = await updateWhatsAppArtTemplate(params.id, body);

    if (!template) {
      return NextResponse.json({ message: "Template de arte WhatsApp nao encontrado." }, { status: 404 });
    }

    return NextResponse.json(template);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nao foi possivel atualizar o template de arte WhatsApp.";
    return NextResponse.json({ message }, { status: 400 });
  }
}

export async function DELETE(_: NextRequest, { params }: RouteContext) {
  const deleted = await deleteWhatsAppArtTemplate(params.id);

  if (!deleted) {
    return NextResponse.json({ message: "Template de arte WhatsApp nao encontrado." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
