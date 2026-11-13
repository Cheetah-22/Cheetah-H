import { describe, it, expect, beforeEach, vi } from "vitest";

// --- Supabase falso en memoria ---
const db = vi.hoisted(() => ({
  settings: new Map<string, string>(),
  songs: [] as Record<string, unknown>[],
  guests: [] as { id: string; name: string }[],
}));

vi.mock("@/lib/supabase", () => {
  const supabase = () => ({
    from(table: string) {
      if (table === "songs")
        return {
          insert: async (row: Record<string, unknown>) => (db.songs.push(row), { error: null }),
          select: () => ({ order: () => ({ limit: async () => ({ data: db.songs, error: null }) }) }),
        };
      if (table === "guests")
        return {
          insert: (row: { name: string }) => ({
            select: () => ({
              single: async () => {
                const g = { id: `00000000-0000-0000-0000-${String(db.guests.length).padStart(12, "0")}`, ...row };
                db.guests.push(g);
                return { data: { id: g.id }, error: null };
              },
            }),
          }),
          update: (row: { name: string }) => ({
            eq: (_: string, id: string) => ({
              select: () => ({
                maybeSingle: async () => {
                  const g = db.guests.find((x) => x.id === id);
                  if (g) g.name = row.name;
                  return { data: g ? { id } : null, error: null };
                },
              }),
            }),
          }),
        };
      throw new Error(table);
    },
  });
  return {
    supabase,
    getSetting: async (k: string) => db.settings.get(k) ?? null,
    setSetting: async (k: string, v: string) => void db.settings.set(k, v),
  };
});

import { GET as search } from "@/app/api/search/route";
import { POST as add } from "@/app/api/add/route";
import { POST as guests } from "@/app/api/guests/route";
import { GET as callback } from "@/app/api/spotify/callback/route";
import { GET as login } from "@/app/api/spotify/login/route";
import { _resetCache, TOKEN_KEY } from "@/lib/spotify";

const URI = "spotify:track:4uLU6hMCjMI75M1A2tKUQC";
let calls: { url: string; init: RequestInit }[];

beforeEach(() => {
  process.env.SPOTIFY_CLIENT_ID = "id";
  process.env.SPOTIFY_CLIENT_SECRET = "secret";
  process.env.SPOTIFY_PLAYLIST_ID = "PLAYLIST";
  db.settings.clear();
  db.settings.set(TOKEN_KEY, "refresh");
  db.songs.length = 0;
  db.guests.length = 0;
  _resetCache();
  calls = [];
  vi.stubGlobal("fetch", async (url: string, init: RequestInit = {}) => {
    calls.push({ url: String(url), init });
    const ok = (o: unknown) => new Response(JSON.stringify(o), { status: 200 });
    if (url.includes("/api/token")) {
      const body = String(init.body);
      if (body.includes("authorization_code")) return ok({ access_token: "AT", expires_in: 3600, refresh_token: "NEW" });
      return ok({ access_token: "AT", expires_in: 3600 });
    }
    if (url.includes("/search"))
      return ok({
        tracks: {
          items: [{ uri: URI, name: "Song", artists: [{ name: "A" }, { name: "B" }], album: { images: [{ url: "big" }, { url: "small" }] } }],
        },
      });
    if (url.includes("/items")) return ok({ snapshot_id: "x" });
    throw new Error("unexpected " + url);
  });
});

describe("search", () => {
  it("returns simplified tracks using the stored refresh token", async () => {
    const r = await search(new Request("https://x.test/api/search?q=song"));
    expect(r.status).toBe(200);
    expect((await r.json()).tracks[0]).toEqual({ uri: URI, name: "Song", artists: "A, B", image: "small" });
    expect(String(calls[0].init.body)).toContain("refresh_token=refresh");
    expect(calls[1].url).toContain("/v1/search?type=track&limit=10&q=song");
  });

  it("requires q", async () => {
    expect((await search(new Request("https://x.test/api/search"))).status).toBe(400);
  });

  it("fails cleanly when Spotify is not connected", async () => {
    db.settings.clear();
    expect((await search(new Request("https://x.test/api/search?q=a"))).status).toBe(502);
  });
});

describe("add", () => {
  const post = (body: unknown) =>
    add(new Request("https://x.test/api/add", { method: "POST", body: JSON.stringify(body) }));

  it("adds to /playlists/{id}/items and logs who added it", async () => {
    const r = await post({ uri: URI, name: "Song", artists: "A", addedBy: "Ana" });
    expect(r.status).toBe(200);
    const call = calls.find((c) => c.url.includes("/items"))!;
    expect(call.url).toBe("https://api.spotify.com/v1/playlists/PLAYLIST/items");
    expect(JSON.parse(String(call.init.body))).toEqual({ uris: [URI] });
    expect(db.songs[0]).toMatchObject({ track_uri: URI, track_name: "Song", added_by: "Ana", guest_id: null });
  });

  it("rejects invalid uri", async () => {
    expect((await post({ uri: "spotify:album:x" })).status).toBe(400);
    expect(db.songs).toHaveLength(0);
  });
});

describe("guests", () => {
  const post = (body: unknown) =>
    guests(new Request("https://x.test/api/guests", { method: "POST", body: JSON.stringify(body) }));

  it("creates then updates a guest", async () => {
    const { id } = await (await post({ name: "Ana" })).json();
    expect(db.guests).toEqual([{ id, name: "Ana" }]);
    const r2 = await (await post({ id, name: "Ana María" })).json();
    expect(r2.id).toBe(id);
    expect(db.guests[0].name).toBe("Ana María");
  });

  it("requires a name", async () => {
    expect((await post({ name: "  " })).status).toBe(400);
  });
});

describe("spotify connect", () => {
  it("login and callback are disabled once connected", async () => {
    expect((await login(new Request("https://x.test/api/spotify/login"))).status).toBe(404);
    expect((await callback(new Request("https://x.test/api/spotify/callback?code=c"))).status).toBe(404);
  });

  it("callback stores the refresh token in Supabase", async () => {
    db.settings.clear();
    const l = await login(new Request("https://x.test/api/spotify/login"));
    expect(l.headers.get("location")).toContain("redirect_uri=https%3A%2F%2Fx.test%2Fapi%2Fspotify%2Fcallback");
    const r = await callback(new Request("https://x.test/api/spotify/callback?code=c"));
    expect(r.status).toBe(200);
    expect(db.settings.get(TOKEN_KEY)).toBe("NEW");
  });
});
