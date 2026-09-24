import {
  PROBLEM_SUMMARIES,
  getProblemSummary,
} from "../data/problemSummaries.js";

const LOADING = Object.freeze({ status: "loading", description: null });
const MISSING = Object.freeze({ status: "missing", description: null });

// One store for all panels: synchronous / cached access to original computational summaries
export function createProblemDescriptionStore(
  resolver = (slug) => getProblemSummary(slug, null),
) {
  const snapshots = new Map();
  const pending = new Map();
  const listeners = new Map();
  const valid = (slug) => typeof slug === "string" && /^[a-z0-9-]+$/.test(slug);
  const publish = (slug, snapshot) => {
    snapshots.set(slug, snapshot);
    listeners.get(slug)?.forEach((listener) => listener());
  };

  return {
    getSnapshot(slug) {
      if (!valid(slug)) return MISSING;
      const cached = snapshots.get(slug);
      if (cached) return cached;
      const direct = resolver(slug);
      if (typeof direct === "string") {
        const snapshot = { status: "ready", description: { content: direct } };
        snapshots.set(slug, snapshot);
        return snapshot;
      }
      return direct ? { status: "ready", description: direct } : MISSING;
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
      if (cached && cached.status !== "error") return Promise.resolve(cached);

      publish(slug, LOADING);
      const request = Promise.resolve()
        .then(async () => {
          const res = await resolver(slug);
          if (!res) return MISSING;
          if (typeof res === "string")
            return { status: "ready", description: { content: res } };
          if (typeof res === "object" && typeof res.content === "string")
            return { status: "ready", description: res };
          return MISSING;
        })
        .catch(() => ({ status: "error", description: null }))
        .then((snapshot) => {
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
function htmlToPlainText(text) {
  if (typeof text !== "string") return "";
  return text
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
  if (!info) return null;
  if (typeof info === "string") return htmlToPlainText(info);
  if (info.content) return htmlToPlainText(info.content);
  return null;
}
