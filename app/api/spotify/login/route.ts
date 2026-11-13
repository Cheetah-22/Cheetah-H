import { NextResponse } from "next/server";
import { authorizeUrl, TOKEN_KEY } from "@/lib/spotify";
import { getSetting } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// Paso único de configuración: el anfitrión abre /api/spotify/login y conecta su cuenta.
// Una vez conectada, esta ruta se desactiva (para reconectar, borra la fila en la tabla settings).
export async function GET(req: Request) {
  if (await getSetting(TOKEN_KEY)) return new NextResponse("Spotify already connected.", { status: 404 });
  return NextResponse.redirect(authorizeUrl(new URL(req.url).origin));
}
