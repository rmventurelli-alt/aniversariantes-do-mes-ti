import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const secret = process.env.JOB_SECRET;

    if (!secret) {
      return NextResponse.json({ message: "JOB_SECRET nao configurado." }, { status: 500 });
    }

    const response = await fetch(
      `${request.nextUrl.origin}/api/jobs/send-birthday-whatsapp?secret=${encodeURIComponent(secret)}`,
      { cache: "no-store" }
    );
    const body = await response.json();

    return NextResponse.json(body, { status: response.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nao foi possivel executar o envio.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
