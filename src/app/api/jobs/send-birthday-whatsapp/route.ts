import { NextRequest, NextResponse } from "next/server";
import { sendBirthdayWhatsAppMessages } from "@/lib/whatsapp/sendBirthdayMessages";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const configuredSecret = process.env.JOB_SECRET;
  const receivedSecret = request.nextUrl.searchParams.get("secret");

  if (!configuredSecret || receivedSecret !== configuredSecret) {
    return NextResponse.json({ message: "Nao autorizado." }, { status: 401 });
  }

  const summary = await sendBirthdayWhatsAppMessages();
  return NextResponse.json(summary);
}
