import { NextRequest, NextResponse } from "next/server";
import { createBirthdayPerson, listBirthdayPeople } from "@/lib/db/birthdays";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const people = await listBirthdayPeople();
  return NextResponse.json(people);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const person = await createBirthdayPerson(body);

    return NextResponse.json(person, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nao foi possivel salvar o aniversariante.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
