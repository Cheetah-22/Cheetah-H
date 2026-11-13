import { NextResponse } from "next/server";
import { connectAccount, TOKEN_KEY } from "@/lib/spotify";
import { getSetting } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const page = (title: string, msg: string) =>
  new NextResponse(
    `<!doctype html><meta name="viewport" content="width=device-width"><body style="font-family:system-ui;padding:16px;max-width:640px;margin:auto"><h1>${title}</h1><p>${msg}</p><p><a href="/">← Cheetahs House</a></p></body>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } },
  );

// Spotify vuelve aquí después del login del anfitrión; el token se guarda en Supabase.
export async function GET(req: Request) {
  if (await getSetting(TOKEN_KEY)) return new NextResponse("Spotify already connected.", { status: 404 });
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  if (!code) return page("❌ Spotify login failed", "Try again from /api/spotify/login.");
  try {
    await connectAccount(code, url.origin);
    return page("✅ Spotify connected", "Guests can now add songs to the playlist.");
  } catch (e) {
    console.error(e);
    return page("❌ Could not connect to Spotify", "Check the Client ID, Client Secret and Redirect URI.");
  }
}
