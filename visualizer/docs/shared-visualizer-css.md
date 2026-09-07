# Shared visualizer CSS

`src/components/shared/VisualizerChrome.css` owns reusable problem shells, panels, headers, panel bodies, and example buttons. It is loaded once from `main.jsx`, before problem-specific styles. Two Sum, Container With Most Water, and LRU Cache are the first consumers.

Add the shared class alongside the existing problem class, for example `className="vis-panel twosum-panel"`. Keep the original class for local overrides and selectors. Move only matching declarations; preserve differences such as Container With Most Water's `flex: 1` in its local panel rule. Each shared selector has single-class specificity.

Optional custom properties: `--vis-shell-min-height`, `--vis-panel-radius`, `--vis-panel-head-padding`, and `--vis-panel-body-padding`. Defaults preserve the migrated designs. Existing theme variables are retained exactly; consolidating theme aliases is a separate change.

Keep algorithm-specific geometry, visual states, animations, and Lumino's dock CSS separate. Do not replace existing shared ControlsBar or algorithm primitives with another general-purpose system.

Run `npm run audit:css` to identify further repeated declaration blocks, or append `-- --json` for structured output. The audit preserves declaration order and separates enclosing media/container/layer contexts. It identifies candidates, not automatically removable rules; selector specificity, import order, inheritance, and dynamic states still need review.

Run `npm run check:css-migration` before committing a batch to compare Chrome computed styles against HEAD. To compare against an older pre-migration revision, use `npm run check:css-migration -- <revision>`. The checker requires Chrome (set `CHROME_PATH` if it is not installed at the default Windows path), tests normal/hover fixtures across both themes and four widths, and fails on any computed-property difference. It strips stylesheet encoding markers before embedding the CSS, matching external stylesheet loading. It is intended for additive shared-class migrations with unchanged local class names and unchanged shared styles; it is not a general full-app visual test.

For the first migration, Chrome computed-style comparisons of shell, panel, header, body, and button fixtures matched the original styles at 180, 360, 600, and 900 pixels in light and dark themes (24 comparisons). These fixtures do not replace exercising the full interactive visualizers, hover/focus states, or Lumino drag operations when migrating additional families.

## Second migration batch

Problems 156, 168, 169, 170, 172, 175–187, 192, and 193 now reuse the same chrome. This removes 65 exact duplicate rules (12,691 CSS bytes with line endings normalized), without adding another shared stylesheet. Only top-level, single-class rules with identical ordered declarations and statically identifiable JSX consumers were migrated. Local classes and nonmatching declarations remain intact.

Validation: 320 Chrome computed-style fixture comparisons (20 visualizers × 2 themes × 4 widths × normal/hover states) matched the previous revision. The widths were 180, 360, 600, and 900 pixels. Removing the added shared classes from each JSX file reproduces its original source exactly. The production build passed and lint comparison found no new findings; the migrated files have 166 pre-existing lint errors. Full interactive drag/playback testing was not part of this batch.

## Third migration batch

Problems 19, 20, 21, 194–197, 200, 201, 225, 226, 228, 229, 232, 233, 237, 240, 241, 243, and 244 now reuse the chrome. This removes another 90 exact duplicate rules and 16,587 CSS bytes with line endings and encoding markers normalized. There are now 43 migrated visualizers across the three batches.

The reusable Chrome checker passed all 320 fixture comparisons. Build validation passed. JSX comparison confirmed only shared-class additions, and lint comparison found no new findings against the 55 existing errors in this batch. Full application drag/playback interactions remain outside the fixture checks.
