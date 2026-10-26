import React from 'react';

// Keep route discovery cacheable separately from the application shell.
const metaModules = import.meta.glob("../problems/*/meta.js", { eager: true });
const lazyModules = import.meta.glob("../problems/*/index.jsx");

export const ALL_PROBLEMS = Object.entries(metaModules)
  .map(([path, mod]) => {
    const meta = mod?.meta;
    if (!meta?.number || !meta?.title) return null;
    const loader = lazyModules[path.replace(/\/meta\.js$/, "/index.jsx")];
    return {
      id: `prob-${meta.slug || meta.number}`,
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
