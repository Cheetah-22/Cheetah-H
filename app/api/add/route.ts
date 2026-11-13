import { NextResponse } from "next/server";
import { addToPlaylist, TRACK_URI } from "@/lib/spotify";
import { supabase } from "@/lib/supabase";

const UUID = /^[0-9a-f-]{36}$/i;
const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

// POST /api/add { uri, name, artists, image?, guestId?, addedBy? } → agrega la canción a la playlist de la casa.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const uri = str(body.uri, 60);
  if (!TRACK_URI.test(uri)) return NextResponse.json({ error: "bad uri" }, { status: 400 });

  try {
    await addToPlaylist(uri);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "spotify" }, { status: 502 });
  }

  // Registro en Supabase (si falla, la canción ya quedó en la playlist igual).
  const guestId = str(body.guestId, 36);
  const { error } = await supabase()
    .from("songs")
    .insert({
      track_uri: uri,
      track_name: str(body.name, 200) || uri,
      artists: str(body.artists, 200),
      image: str(body.image, 500) || null,
      guest_id: UUID.test(guestId) ? guestId : null,
      added_by: str(body.addedBy, 40) || null,
    });
  if (error) console.error(error);

  return NextResponse.json({ ok: true });
}
