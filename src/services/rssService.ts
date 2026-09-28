import { database, invoke } from "./backendService";

function plain(html: string) {
  return (
    new DOMParser()
      .parseFromString(html, "text/html")
      .body.textContent?.trim() || ""
  );
}
export function parseFeed(xml: string, source: string, checkedAt: string) {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  if (doc.querySelector("parsererror"))
    throw new Error(`${source} : flux illisible.`);
  return Array.from(doc.querySelectorAll("item, entry"))
    .slice(0, 30)
    .flatMap((item) => {
      const title = plain(item.querySelector("title")?.textContent || "");
      const linkNode = item.querySelector("link");
      const rawUrl =
        linkNode?.getAttribute("href") || linkNode?.textContent?.trim() || "";
      let url: URL;
      try {
        url = new URL(rawUrl);
        if (!["https:", "http:"].includes(url.protocol)) return [];
      } catch {
        return [];
      }
      url.hash = "";
      ["utm_source", "utm_medium", "utm_campaign"].forEach((key) =>
        url.searchParams.delete(key),
      );
      const date =
        item.querySelector("pubDate, published, updated")?.textContent ||
        Array.from(item.children).find((n) => n.localName === "date")
          ?.textContent;
      // Unknown publication dates must not be represented as today's news.
      if (!title || !date || !Number.isFinite(Date.parse(date))) return [];
      const excerpt = plain(
        item.querySelector("description, summary, content")?.textContent || "",
      ).slice(0, 4000);
      const lower = `${title} ${excerpt}`.toLowerCase();
      const topic = /contrôle technique|controle technique|ct2rm/.test(lower)
        ? "CT moto"
        : /manifestation|mobilisation/.test(lower)
          ? "Manifestations"
          : /route|circulation|infrastructure/.test(lower)
            ? "Circulation et infrastructures"
            : /loi|décret|directive|règlement/.test(lower)
              ? "Politique et réglementation"
              : "Actualités générales";
      return [
        {
          dedupe_key: `rss:${url.href}`,
          kind: "veille",
          topic,
          title: title.slice(0, 250),
          body: excerpt || "Consultez l’article source.",
          status: "À suivre",
          source_refs: [
            {
              label: source,
              url: url.href,
              date: new Date(date).toISOString().slice(0, 10),
            },
          ],
          published_at: new Date(date).toISOString(),
          news_scope: /europé|union européenne|bruxelles/.test(lower)
            ? "Europe"
            : "France",
          news_type: "Information",
          importance: "À suivre",
          impact:
            "Extrait du flux source. Classement indicatif par mots-clés ; portée et conséquences à vérifier dans l’article.",
          verified_at: null,
        },
      ];
    });
}
export async function refreshNewsFeeds() {
  const result = await invoke("news-feed", {});
  let added = 0;
  const errors: string[] = [];
  for (const feed of result.feeds) {
    if (feed.error) {
      errors.push(`${feed.source} : ${feed.error}`);
      continue;
    }
    try {
      const rows = parseFeed(feed.xml, feed.source, result.checkedAt);
      if (!rows.length) {
        errors.push(`${feed.source} : aucun article daté exploitable.`);
        continue;
      }
      const unique = [
        ...new Map(rows.map((row) => [row.dedupe_key, row])).values(),
      ];
      const { data, error } = await database()
        .from("ca_news_items")
        .upsert(unique, { onConflict: "dedupe_key", ignoreDuplicates: true })
        .select("id");
      if (error) throw error;
      added += data.length;
    } catch (e: any) {
      errors.push(e.message);
    }
  }
  return { added, errors };
}
