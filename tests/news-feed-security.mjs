import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import ts from "typescript";
let handler,
  member = false,
  authenticated = true,
  fetches = 0;
const db = {
  auth: {
    getUser: async () => ({
      data: { user: authenticated ? { id: "test" } : null },
      error: null,
    }),
  },
  from() {
    return {
      select() {
        return this;
      },
      eq() {
        return this;
      },
      async maybeSingle() {
        return { data: member ? { user_id: "test" } : null };
      },
    };
  },
};
const source = readFileSync(
  "supabase/functions/news-feed/index.ts",
  "utf8",
).replace(/^import[\s\S]*?from\s+[\x27\x22][^\x27\x22]+[\x27\x22];?\n/gm, "");
const js = ts.transpileModule(source, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.None,
  },
}).outputText;
new Function("Deno", "createClient", "fetch", js)(
  { env: { get: () => "test" }, serve: (fn) => (handler = fn) },
  () => db,
  async (url) => {
    fetches++;
    assert.ok(
      [
        "https://ffmc.asso.fr/spip.php?page=backend",
        "https://www.motomag.com/feed/",
      ].includes(url),
    );
    return new Response("<rss><channel/></rss>");
  },
);
const req = (headers) =>
  new Request("https://test/news-feed", {
    method: "POST",
    headers,
    body: "{}",
  });
assert.equal((await handler(req({}))).status, 401);
assert.equal(
  (await handler(req({ authorization: "Bearer test" }))).status,
  403,
);
member = true;
authenticated = false;
assert.equal(
  (await handler(req({ authorization: "Bearer test" }))).status,
  401,
);
authenticated = true;
assert.equal(
  (
    await handler(
      req({ authorization: "Bearer test", origin: "https://evil.example" }),
    )
  ).status,
  403,
);
assert.equal(fetches, 0);
const res = await handler(req({ authorization: "Bearer test" }));
assert.equal(res.status, 200);
assert.equal((await res.json()).feeds.length, 2);
assert.equal(fetches, 2);
console.log(
  "PASS: news feed requires coordinator authentication and only fetches fixed public URLs.",
);
