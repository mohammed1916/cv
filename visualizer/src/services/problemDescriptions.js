const LOADING = Object.freeze({ status: 'loading', description: null });
const MISSING = Object.freeze({ status: 'missing', description: null });

// One store for all panels: cache completed requests and share in-flight work.
export function createProblemDescriptionStore(fetcher = (...args) => fetch(...args)) {
  const snapshots = new Map();
  const pending = new Map();
  const listeners = new Map();
  const valid = (slug) => typeof slug === 'string' && /^[a-z0-9-]+$/.test(slug);
  const publish = (slug, snapshot) => {
    snapshots.set(slug, snapshot);
    listeners.get(slug)?.forEach((listener) => listener());
  };

  return {
    getSnapshot(slug) {
      return valid(slug) ? snapshots.get(slug) || LOADING : MISSING;
    },
    subscribe(slug, listener) {
      if (!listeners.has(slug)) listeners.set(slug, new Set());
      const subscribers = listeners.get(slug);
      subscribers.add(listener);
      return () => {
        subscribers.delete(listener);
        if (!subscribers.size) listeners.delete(slug);
      };
    },
    load(slug) {
      if (!valid(slug)) return Promise.resolve(MISSING);
      if (pending.has(slug)) return pending.get(slug);
      const cached = snapshots.get(slug);
      if (cached && cached.status !== 'error') return Promise.resolve(cached);
      publish(slug, LOADING);
      const request = Promise.resolve().then(async () => {
        const response = await fetcher(`/data/descriptions/${slug}.json`);
        if (response.status === 404) return MISSING;
        if (!response.ok) throw new Error(`Description request failed: ${response.status}`);
        // Static SPA hosting rewrites unknown paths to index.html with HTTP 200.
        if (response.headers.get('content-type')?.includes('text/html')) return MISSING;
        const description = await response.json();
        if (!description || typeof description.content !== 'string') {
          throw new Error('Invalid problem description');
        }
        return description.content ? { status: 'ready', description } : MISSING;
      }).catch(() => ({ status: 'error', description: null })).then((snapshot) => {
        pending.delete(slug);
        publish(slug, snapshot);
        return snapshot;
      });
      pending.set(slug, request);
      return request;
    },
  };
}

export const problemDescriptionStore = createProblemDescriptionStore();

/** Strips HTML tags to plain text for copy/accessibility purposes */
function htmlToPlainText(html) {
    return html
        .replace(/<[^>]+>/g, " ")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&")
        .replace(/&nbsp;/g, " ")
        .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
        .replace(/\s{2,}/g, " ")
        .trim();
}

/** Returns the plain-text version of a problem's description for use in prompts */
export function getProblemDescriptionText(info) {
    if (!info?.content) return null;
    return htmlToPlainText(info.content);
}
