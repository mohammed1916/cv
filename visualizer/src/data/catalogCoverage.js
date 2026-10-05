const normalizedTitle = title => String(title).toLowerCase().replace(/[^a-z0-9]/g, '');

// Folder numbers are not reliable identities in older routes (for example,
// Employee Free Time lives in Problem577). Match semantic identity first.
export function matchCatalog(catalog, routes) {
  const slugs = new Map(routes.map(route => [route.slug, route]));
  const titles = new Map();
  for (const route of routes) {
    const key = normalizedTitle(route.title);
    titles.set(key, titles.has(key) ? null : route);
  }
  return catalog.map(problem => ({ problem, route: slugs.get(problem.slug) ?? titles.get(normalizedTitle(problem.title)) ?? null }));
}

export function mergeCatalog(catalog, routes) {
  return matchCatalog(catalog, routes).map(({problem,route}) => route ? {
    ...problem, ...route, number: String(problem.number), title: problem.title,
    catalogSlug: problem.slug, implemented: true,
  } : {
    ...problem, accent: '#64748b', description: 'Visualizer not yet implemented.',
    component: null, implemented: false,
  });
}
