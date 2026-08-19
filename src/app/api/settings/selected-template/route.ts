import { NextRequest, NextResponse } from "next/server";
import { getSelectedTemplateId, setSelectedTemplateId } from "@/lib/db/settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const id = await getSelectedTemplateId();
  return NextResponse.json({ id });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  await setSelectedTemplateId(String(body.id ?? ""));

  return NextResponse.json({ ok: true });
}
