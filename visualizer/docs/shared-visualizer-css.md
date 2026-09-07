# Shared visualizer CSS

`src/components/shared/VisualizerChrome.css` owns reusable problem shells, panels, headers, panel bodies, and example buttons. It is loaded once from `main.jsx`, before problem-specific styles. Two Sum, Container With Most Water, and LRU Cache are the first consumers.

Add the shared class alongside the existing problem class, for example `className="vis-panel twosum-panel"`. Keep the original class for local overrides and selectors. Move only matching declarations; preserve differences such as Container With Most Water's `flex: 1` in its local panel rule. Each shared selector has single-class specificity.

Optional custom properties: `--vis-shell-min-height`, `--vis-panel-radius`, `--vis-panel-head-padding`, and `--vis-panel-body-padding`. Defaults preserve the migrated designs. Existing theme variables are retained exactly; consolidating theme aliases is a separate change.

Keep algorithm-specific geometry, visual states, animations, and Lumino's dock CSS separate. Do not replace existing shared ControlsBar or algorithm primitives with another general-purpose system.

Run `npm run audit:css` to identify further repeated declaration blocks, or append `-- --json` for structured output. The audit preserves declaration order and separates enclosing media/container/layer contexts. It identifies candidates, not automatically removable rules; selector specificity, import order, inheritance, and dynamic states still need review.

For the first migration, Chrome computed-style comparisons of shell, panel, header, body, and button fixtures matched the original styles at 180, 360, 600, and 900 pixels in light and dark themes (24 comparisons). These fixtures do not replace exercising the full interactive visualizers, hover/focus states, or Lumino drag operations when migrating additional families.
