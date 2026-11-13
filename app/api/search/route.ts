import { NextResponse } from "next/server";
import { searchTracks } from "@/lib/spotify";

// GET /api/search?q=texto → canciones para que el invitado elija.
export async function GET(req: Request) {
  const q = (new URL(req.url).searchParams.get("q") ?? "").trim().slice(0, 100);
  if (!q) return NextResponse.json({ error: "missing q" }, { status: 400 });
  try {
    return NextResponse.json({ tracks: await searchTracks(q) });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "spotify", detail: String((e as Error).message).slice(0, 300) }, { status: 502 });
  }
}
