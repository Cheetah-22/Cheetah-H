import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// GET /api/songs → últimas canciones agregadas por invitados.
export async function GET() {
  try {
    const { data, error } = await supabase()
      .from("songs")
      .select("track_name, artists, image, added_by, created_at")
      .order("created_at", { ascending: false })
      .limit(10);
    if (error) throw error;
    return NextResponse.json({ songs: data });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ songs: [] });
  }
}
