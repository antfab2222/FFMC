// Service de veille en direct pour les flux officiels FFMC & Moto Magazine

import { NewsItem, NewsSource, NewsCategory, NewsGeographicalScope } from '../types';

export async function fetchLiveRssNews(): Promise<NewsItem[]> {
  const liveItems: NewsItem[] = [];

  const feeds: Array<{
    source: NewsSource;
    category: NewsCategory;
    scope: NewsGeographicalScope;
    announcementType: 'Mobilisation & Manif' | 'Infrastructure & Sécurité';
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

      // 1. Try local server proxy first
      try {
        const localRes = await fetch(`/api/news/rss-proxy?url=${encodeURIComponent(feed.url)}`);
        if (localRes.ok) {
          rawXml = await localRes.text();
        }
      } catch {
        // Fallback for static client (e.g. GitHub Pages)
      }

      // 2. Fallback to CORS proxy if needed
      if (!rawXml) {
        try {
          const proxyRes = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(feed.url)}`);
          if (proxyRes.ok) {
            rawXml = await proxyRes.text();
          }
        } catch {
          // Ignore
        }
      }

      if (rawXml) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(rawXml, 'text/xml');
        const items = xmlDoc.querySelectorAll('item');

        items.forEach((itemNode, idx) => {
          if (idx >= 4) return;
          const title = itemNode.querySelector('title')?.textContent?.trim() || '';
          const link = itemNode.querySelector('link')?.textContent?.trim() || 'https://ffmc.asso.fr';
          const pubDate = itemNode.querySelector('pubDate')?.textContent?.trim() || new Date().toISOString();
          const descriptionRaw = itemNode.querySelector('description')?.textContent?.trim() || '';
          const cleanDesc = descriptionRaw.replace(/<[^>]*>?/gm, '').slice(0, 260);

          if (title) {
            liveItems.push({
              id: `rss-${feed.source.toLowerCase().replace(/\s+/g, '-')}-${idx}`,
              title,
              summary: cleanDesc || 'Article d’actualité publié sur le site officiel.',
              source: feed.source,
              sourceUrl: link,
              category: feed.category,
              geographicalScope: feed.scope,
              announcementType: feed.announcementType,
              impactLevel: title.toLowerCase().includes('loi') || title.toLowerCase().includes('contrôle') || title.toLowerCase().includes('manif') ? 'fort' : 'moyen',
              publishedAt: new Date(pubDate).toISOString(),
              searchDate: new Date().toISOString(),
              hash: `hash-${title.slice(0, 15).replace(/\s+/g, '')}`,
              keyPoints: [
                `Veille officielle ${feed.source}`,
                cleanDesc.slice(0, 100),
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
