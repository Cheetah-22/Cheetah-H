import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import search from "../api/search.js";
import add from "../api/add.js";
import { _resetCache } from "../api/_spotify.js";

process.env.SPOTIFY_CLIENT_ID = "id";
process.env.SPOTIFY_CLIENT_SECRET = "secret";
process.env.SPOTIFY_REFRESH_TOKEN = "refresh";
process.env.SPOTIFY_PLAYLIST_ID = "PLAYLIST";

function mockRes() {
  return {
    code: 0, body: null,
    status(c) { this.code = c; return this; },
    json(b) { this.body = b; return this; },
    send(b) { this.body = b; return this; },
  };
}

let calls;
beforeEach(() => {
  _resetCache();
  calls = [];
  globalThis.fetch = async (url, init = {}) => {
    calls.push({ url: String(url), init });
    const json = (o) => ({ ok: true, status: 200, json: async () => o, text: async () => "" });
    if (String(url).includes("/api/token")) return json({ access_token: "AT", expires_in: 3600 });
    if (String(url).includes("/search")) return json({ tracks: { items: [{
      uri: "spotify:track:4uLU6hMCjMI75M1A2tKUQC", name: "Song",
      artists: [{ name: "A" }, { name: "B" }], album: { images: [{ url: "big" }, { url: "small" }] },
    }] } });
    if (String(url).includes("/items")) return json({ snapshot_id: "x" });
    throw new Error("unexpected " + url);
  };
});

test("search returns simplified tracks", async () => {
  const res = mockRes();
  await search({ query: { q: "song" } }, res);
  assert.equal(res.code, 200);
  assert.deepEqual(res.body.tracks[0], { uri: "spotify:track:4uLU6hMCjMI75M1A2tKUQC", name: "Song", artists: "A, B", image: "small" });
  assert.match(calls[1].url, /\/v1\/search\?type=track&limit=10&q=song/);
  assert.equal(calls[1].init.headers.Authorization, "Bearer AT");
});

test("search requires q", async () => {
  const res = mockRes();
  await search({ query: {} }, res);
  assert.equal(res.code, 400);
});

test("add posts to /playlists/{id}/items", async () => {
  const res = mockRes();
  await add({ method: "POST", body: { uri: "spotify:track:4uLU6hMCjMI75M1A2tKUQC" } }, res);
  assert.equal(res.code, 200);
  const call = calls.find((c) => c.url.includes("/items"));
  assert.equal(call.url, "https://api.spotify.com/v1/playlists/PLAYLIST/items");
  assert.deepEqual(JSON.parse(call.init.body), { uris: ["spotify:track:4uLU6hMCjMI75M1A2tKUQC"] });
});

test("add rejects invalid uri and wrong method", async () => {
  let res = mockRes();
  await add({ method: "POST", body: { uri: "spotify:album:x" } }, res);
  assert.equal(res.code, 400);
  res = mockRes();
  await add({ method: "GET" }, res);
  assert.equal(res.code, 405);
});
