import { NextRequest, NextResponse } from "next/server";
import { deleteTemplate, saveTemplate } from "@/lib/db/templates";

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
    const template = await saveTemplate({ ...body, id: params.id });

    return NextResponse.json(template);
  } catch {
    return NextResponse.json({ message: "Nao foi possivel atualizar o template." }, { status: 400 });
  }
}

export async function DELETE(_: NextRequest, { params }: RouteContext) {
  const deleted = await deleteTemplate(params.id);

  if (!deleted) {
    return NextResponse.json({ message: "Template nao encontrado." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
