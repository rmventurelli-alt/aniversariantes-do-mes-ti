import { NextRequest, NextResponse } from "next/server";
import { deleteBirthdayPerson, updateBirthdayPerson } from "@/lib/db/birthdays";

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
    const person = await updateBirthdayPerson(params.id, body);

    if (!person) {
      return NextResponse.json({ message: "Aniversariante nao encontrado." }, { status: 404 });
    }

    return NextResponse.json(person);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nao foi possivel atualizar o aniversariante.";
    return NextResponse.json({ message }, { status: 400 });
  }
}

export async function DELETE(_: NextRequest, { params }: RouteContext) {
  const deleted = await deleteBirthdayPerson(params.id);

  if (!deleted) {
    return NextResponse.json({ message: "Aniversariante nao encontrado." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
