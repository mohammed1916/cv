# Catalog storytelling coverage

All **617 implemented routes** have a connected shared narrative: 615 numbered
problems and the two named routes, Matrix Iteration Patterns and Game on Growing
Tree. This supersedes the partial-batch counts in `narrative-audit.md`.

- Preserved the 30 existing authored workspace narratives.
- Added 587 route-local guides and a reusable, collapsible story adapter.
- Guides contain problem-specific strategies, current-frame achievements,
  explicit boundary decisions and/or authored edge-case notes. They reuse source
  explanations where available; they are not 587 separate UI implementations.
- Repaired 43 code panels that previously omitted the full trace frame.
- Restored missing route metadata for Problems 358, 359 and 360, which the app
  previously excluded despite their implemented visualizers.
- Kept route content lazy-loaded. The main production chunk is approximately
  594 kB (153.5 kB gzip); the existing >500 kB warning remains.

Verification:

- Coverage audit: **617/617**, zero failures. It follows imports to the shared
  renderer and a frame publisher rather than treating a file as proof of wiring.
- Narrative tests: **625 passed**. These check guide identity, boundary content,
  current-frame selection, reset/backward behavior, conditional boundary wording,
  safe legacy interpolation and representative real edge-case traces.
- Existing visual-story tests: **255 passed**.
- Recent visualizer tests: **37 passed**.
- Early visualizer/Python handoff tests: **4 passed**, using the installed Python
  3.11 executable instead of the inaccessible WindowsApps alias.
- Production build passes. Existing Pyodide externalization warnings remain.
- ESLint comparison against HEAD: **zero introduced errors**; 282 pre-existing
  findings remain in older source files. These were not broadened into a cleanup.
- Browser layout and interactive docking verification remain unverified: the
  browser tool reported no connected browsers. Coverage and contract tests do
  not certify every visualizer's algorithm or every rendered edge-case layout.

Maintenance commands:

```text
npm run build:narratives
npm run audit:narratives
npm run test:narratives
```

See `narrative-coverage.json` for the complete route list, and
`algorithm-narrative.md` for the authoring and playback contracts.
