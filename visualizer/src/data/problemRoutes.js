import React from 'react';

// Keep route discovery cacheable separately from the application shell.
const metaModules = import.meta.glob("../problems/*/meta.js", { eager: true });
const lazyModules = import.meta.glob("../problems/*/index.jsx");

// Some historical Problem<number> folders still carry the meta of another problem
// (for example Problem505 repeats "Distribute Candies to People", whose real folder is
// Problem1103). Their corrected implementations live in Problem<number>Canonical, and a
// few other stale folders are listed here. Their ids are suffixed when they collide so
// React keys and selection stay unique; the folders themselves are left untouched.
const STALE_FOLDERS = new Set(["Problem353", "Problem2756"]);
const folderName = path => path.replace(/^.*\/(Problem[^/]+)\/meta\.js$/, "$1");
const hasCanonicalTwin = path =>
  Object.prototype.hasOwnProperty.call(lazyModules, path.replace(/\/meta\.js$/, "Canonical/index.jsx"));
const isStaleFolder = path => STALE_FOLDERS.has(folderName(path)) || hasCanonicalTwin(path);

const baseIdCounts = new Map();
for (const [path, mod] of Object.entries(metaModules)) {
  const meta = mod?.meta;
  if (!meta?.number || !meta?.title) continue;
  const id = `prob-${meta.slug || meta.number}`;
  baseIdCounts.set(id, (baseIdCounts.get(id) || 0) + 1);
}

export const ALL_PROBLEMS = Object.entries(metaModules)
  .map(([path, mod]) => {
    const meta = mod?.meta;
    if (!meta?.number || !meta?.title) return null;
    const loader = lazyModules[path.replace(/\/meta\.js$/, "/index.jsx")];
    const baseId = `prob-${meta.slug || meta.number}`;
    const collides = baseIdCounts.get(baseId) > 1;
    return {
      id: collides && isStaleFolder(path) ? `${baseId}-${folderName(path)}` : baseId,
      number: meta.number,
      title: meta.title,
      slug: meta.slug || meta.title.toLowerCase().replace(/\s+/g, "-"),
      description: meta.description || "",
      difficulty: meta.difficulty || "Medium",
      tags: meta.tags || [],
      accent: meta.accent || "#64748b",
      component: loader ? React.lazy(() => loader()) : null,
      implemented: !!loader,
    };
  })
  .filter(Boolean);
