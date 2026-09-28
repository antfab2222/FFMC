import { createClient } from "npm:@supabase/supabase-js@2.117.2";
const origin = "https://antfab2222.github.io";
const headers = {
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Headers":
    "authorization, apikey, x-client-info, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
  "Cache-Control": "no-store",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers });
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS")
    return new Response(null, { status: 204, headers });
  if (req.method !== "POST")
    return json({ error: "Méthode non autorisée." }, 405);
  if (req.headers.get("origin") && req.headers.get("origin") !== origin)
    return json({ error: "Origine non autorisée." }, 403);
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer "))
    return json({ error: "Connexion requise." }, 401);
  const db = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const {
    data: { user },
    error,
  } = await db.auth.getUser(auth.slice(7));
  if (error || !user) return json({ error: "Session expirée." }, 401);
  const member = await db
    .from("ca_members")
    .select("user_id")
    .eq("user_id", user.id)
    .eq("role", "coordinateur")
    .maybeSingle();
  if (member.error || !member.data)
    return json({ error: "Réservé au coordinateur." }, 403);
  const sources = [
    {
      source: "FFMC Nationale",
      url: "https://ffmc.asso.fr/spip.php?page=backend",
    },
    { source: "Motomag", url: "https://www.motomag.com/feed/" },
  ];
  const feeds = await Promise.all(
    sources.map(async (source) => {
      try {
        const response = await fetch(source.url, {
          signal: AbortSignal.timeout(12000),
          headers: { Accept: "application/rss+xml, application/xml, text/xml" },
        });
        if (!response.ok)
          throw new Error(`Source indisponible (${response.status}).`);
        if (Number(response.headers.get("content-length")) > 2_000_000)
          throw new Error("Flux trop volumineux.");
        const xml = await response.text();
        if (
          xml.length > 2_000_000 ||
          !/<rss[\s>]|<rdf:RDF[\s>]|<feed[\s>]/i.test(xml)
        )
          throw new Error("Le site ne renvoie pas de flux RSS exploitable.");
        return { ...source, xml };
      } catch (e) {
        return {
          ...source,
          error: e instanceof Error ? e.message : "Flux indisponible.",
        };
      }
    }),
  );
  return json({ feeds, checkedAt: new Date().toISOString() });
});
