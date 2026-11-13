import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const UUID = /^[0-9a-f-]{36}$/i;

// POST /api/guests { id?, name } → registra (o actualiza) el nombre opcional del invitado.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 40) : "";
  if (!name) return NextResponse.json({ error: "missing name" }, { status: 400 });
  const id = typeof body.id === "string" && UUID.test(body.id) ? body.id : null;

  const db = supabase().from("guests");
  const { data, error } = id
    ? await db.update({ name }).eq("id", id).select("id").maybeSingle()
    : await db.insert({ name }).select("id").single();

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "db" }, { status: 500 });
  }
  if (!data) {
    // El id guardado en el teléfono ya no existe: crear uno nuevo.
    const { data: created, error: e2 } = await supabase().from("guests").insert({ name }).select("id").single();
    if (e2) return NextResponse.json({ error: "db" }, { status: 500 });
    return NextResponse.json({ id: created.id });
  }
  return NextResponse.json({ id: data.id });
}
