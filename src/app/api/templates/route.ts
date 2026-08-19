import { NextRequest, NextResponse } from "next/server";
import { listTemplates, saveTemplate } from "@/lib/db/templates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const templates = await listTemplates();
  return NextResponse.json(templates);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const template = await saveTemplate(body);

    return NextResponse.json(template, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Nao foi possivel salvar o template." }, { status: 400 });
  }
}
