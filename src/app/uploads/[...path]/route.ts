import { NextRequest, NextResponse } from "next/server";
import { getContentType, readUploadedFile } from "@/lib/uploads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: {
    path: string[];
  };
};

export async function GET(_: NextRequest, { params }: RouteContext) {
  try {
    const file = await readUploadedFile(params.path);

    if (!file) {
      return new NextResponse(null, { status: 404 });
    }

    return new NextResponse(file, {
      headers: {
        "Content-Type": getContentType(params.path.at(-1) ?? ""),
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
