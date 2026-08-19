import { NextRequest, NextResponse } from "next/server";
import { deleteWhatsAppTemplate, updateWhatsAppTemplate } from "@/lib/db/whatsappTemplates";

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
    const template = await updateWhatsAppTemplate(params.id, body);

    if (!template) {
      return NextResponse.json({ message: "Mensagem de WhatsApp nao encontrada." }, { status: 404 });
    }

    return NextResponse.json(template);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nao foi possivel atualizar a mensagem de WhatsApp.";
    return NextResponse.json({ message }, { status: 400 });
  }
}

export async function DELETE(_: NextRequest, { params }: RouteContext) {
  const deleted = await deleteWhatsAppTemplate(params.id);

  if (!deleted) {
    return NextResponse.json({ message: "Mensagem de WhatsApp nao encontrada." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
