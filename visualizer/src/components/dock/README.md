# Local docking workspace

`DockWorkspace.jsx` owns the React panel chrome, tabs, resize handles, drag/drop,
restore strip, and floating-panel integration. It uses no docking library.
`LuminoDockPanel.jsx` is a compatibility re-export so existing problem imports
and `onPanelReady(hosts, { applyCollapse })` callbacks continue to work.

`layout.js` stores a binary split tree with tab groups. Collapsed panel IDs are
filtered from a visible projection; the stored tree and split ratios survive.
Consequently a collapsed panel consumes no workspace area. Restore reuses its
previous position. Content lives in stable DOM portal hosts and is parked in a
hidden container while collapsed. Moving a panel never changes its portal host.

Panel descriptors support `id`, `title`, `dockMode` (`split-left/right/top/bottom`
or `tab-before/after`), optional target panel `ref`, and a new panel's `ratio`.
The `compact` size hint gives input areas a smaller initial vertical split.
Code opens alongside the visual area; status remains inline above code.
Ratios are adjustable with pointer dragging or arrow keys on a divider.

Tabs can be dragged onto a panel edge or center. The Move menu offers the same
placements by keyboard. FloatingPanel uses `cpviz-dock-panel` and receives an
undock callback. Its collapse action delegates to the workspace while docked.
The legacy CSS class names retained on the workspace/group are compatibility
hooks for page sizing, tours, and floating controls, not Lumino dependencies.

Validation: `npm run test:dock`; with Vite at port 5180,
`node scripts/check-local-dock.mjs` runs Chrome interaction checks.
