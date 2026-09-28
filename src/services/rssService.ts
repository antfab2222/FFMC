// Service de veille en direct pour les flux officiels FFMC & Moto Magazine

import { NewsItem, NewsSource, NewsCategory, NewsGeographicalScope } from '../types';

function decodeHtmlEntities(str: string): string {
  try {
    const doc = new DOMParser().parseFromString(str, 'text/html');
    return doc.documentElement.textContent || str;
  } catch {
    return str
      .replace(/&#251;/g, 'û')
      .replace(/&#233;/g, 'é')
      .replace(/&#224;/g, 'à')
      .replace(/&#232;/g, 'è')
      .replace(/&#234;/g, 'ê')
      .replace(/&#238;/g, 'î')
      .replace(/&#244;/g, 'ô')
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&');
  }
}

export async function fetchLiveRssNews(): Promise<NewsItem[]> {
  const liveItems: NewsItem[] = [];

  const feeds: Array<{
    source: NewsSource;
    category: NewsCategory;
    scope: NewsGeographicalScope;
    announcementType: 'Mobilisation & Manif' | 'Infrastructure & Sécurité' | 'Législation';
    url: string;
  }> = [
    {
      source: 'FFMC Nationale',
      category: 'manif',
      scope: 'France',
      announcementType: 'Mobilisation & Manif',
      url: 'https://ffmc.asso.fr/spip.php?page=backend',
    },
    {
      source: 'Motomag',
      category: 'reglementation',
      scope: 'France',
      announcementType: 'Infrastructure & Sécurité',
      url: 'https://motomag.com/feed/',
    },
  ];

  for (const feed of feeds) {
    try {
      let rawXml = '';

      // 1. Try local server proxy first (running on dev / fullstack server)
      try {
        const localRes = await fetch(`/api/news/rss-proxy?url=${encodeURIComponent(feed.url)}`);
        if (localRes.ok) {
          rawXml = await localRes.text();
        }
      } catch {
        // Fallback for static client
      }

      // 2. Try fast client-side CORS proxies
      if (!rawXml) {
        const proxyUrls = [
          `https://corsproxy.io/?url=${encodeURIComponent(feed.url)}`,
          `https://api.allorigins.win/raw?url=${encodeURIComponent(feed.url)}`,
        ];

        for (const proxyUrl of proxyUrls) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 4000);
            const proxyRes = await fetch(proxyUrl, { signal: controller.signal });
            clearTimeout(timeoutId);
            if (proxyRes.ok) {
              const text = await proxyRes.text();
              if (text && (text.includes('<rss') || text.includes('<channel'))) {
                rawXml = text;
                break;
              }
            }
          } catch {
            // Try next proxy
          }
        }
      }

      if (rawXml) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(rawXml, 'text/xml');
        const items = xmlDoc.querySelectorAll('item');

        items.forEach((itemNode, idx) => {
          if (idx >= 6) return;
          const rawTitle = itemNode.querySelector('title')?.textContent?.trim() || '';
          const title = decodeHtmlEntities(rawTitle);
          const link = itemNode.querySelector('link')?.textContent?.trim() || 'https://ffmc.asso.fr';
          const pubDate = itemNode.querySelector('pubDate')?.textContent?.trim() || new Date().toISOString();
          const descriptionRaw = itemNode.querySelector('description')?.textContent?.trim() || '';
          const cleanDesc = decodeHtmlEntities(descriptionRaw.replace(/<[^>]*>?/gm, '')).slice(0, 260);

          if (title) {
            liveItems.push({
              id: `rss-${feed.source.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}-${idx}`,
              title,
              summary: cleanDesc || 'Article d’actualité officiel publié en direct.',
              source: feed.source,
              sourceUrl: link,
              category: feed.category,
              geographicalScope: feed.scope,
              announcementType: feed.announcementType,
              impactLevel:
                title.toLowerCase().includes('loi') ||
                title.toLowerCase().includes('contrôle') ||
                title.toLowerCase().includes('manif') ||
                title.toLowerCase().includes('carburant') ||
                title.toLowerCase().includes('ministère')
                  ? 'fort'
                  : 'moyen',
              publishedAt: new Date(pubDate).toISOString(),
              searchDate: new Date().toISOString(),
              hash: `hash-${title.slice(0, 15).replace(/\s+/g, '')}`,
              keyPoints: [
                `Flux direct ${feed.source}`,
                cleanDesc.slice(0, 100) || 'Information vérifiée par la FFMC',
              ],
            });
          }
        });
      }
    } catch (err) {
      console.warn(`Impossible de relever le flux ${feed.source}:`, err);
    }
  }

  return liveItems;
}
