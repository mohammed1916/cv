# Visual stories: implementation plan and Claude handoff

Updated: 2026-09-17. Reviewed HEAD: `41108da8`.
Comparison baseline: `148a3bb2` (HEAD~3 at the time of review).

## Start here

The direction is right: each problem increasingly has its own meaningful visual
story, and `AlgorithmStoryWorkspace` shares inputs, code, playback and docking.
The latest batch also introduced repeated scene chrome and unscoped CSS.
Separate JSX/CSS files improve organization; they do not, by themselves, reduce
download size or isolate styles.

The next work should consolidate and verify the existing stories before another
large numbered batch. Start with Problems **125 and 132**: establish their payload
baseline, isolate their CSS, and share their character comparison card. Preserve
their different algorithms and visual explanations. Then verify the shared shell
and continue with small, related families.

This document is the current execution plan. The old append-only checkpoints are
available with `git show 41108da8:visualizer/docs/visual-story-plan.md`; their test
counts and “next problem” statements describe earlier checkpoints, not current
instructions. Check the current diff before proceeding if HEAD has moved.

## What the last three commits actually did

| Commit, oldest first | Direction | Assessment |
| --- | --- | --- |
| `fa158fda` | Reconstruction, path/rewiring, subsequence, next-pointer and Pascal stories; introduced `AlgorithmStoryWorkspace` | Strong reuse: common workspace, shared family scenes, extracted traces, less repeated JSX/CSS. |
| `a093bb80` | Triangle 120 with bottom-up dependencies and a path witness | A compact local story on the shared workspace; sensible boundary. |
| `41108da8` | Stories for 121–125 and 128–142; multi-field workspace inputs | More problem-specific meaning and algorithm tests, but much more separate chart/card/legend/status CSS and several global-selector collisions. Needs consolidation and browser acceptance. |

Representative distinctions to preserve:

- 121: running minimum price and the best buy/sell witness.
- 122: adjacent profitable slopes and accumulated unlimited-trade profit.
- 123: four transaction states and their transitions.
- 124/129: maximum path through an apex versus root-to-leaf decimal accumulation.
- 125/132: inward comparison of a normalized string versus palindrome-center
  expansion feeding minimum cuts over prefixes.
- 130/133/134: border escape flood-fill, original-to-clone identity, and circular
  fuel balance/elimination.
- 138/141/142: random-link copy identity, cycle detection, and cycle-entry proof.
- 139/140: reachability of word boundaries versus enumeration of full sentences.

These are source-level design findings. This review did not certify the
appearance or interaction of every scene in a browser.

## Current evidence and its limits

### Catalog and validation

The checked-in progress ledger has **613 entries**: 570 pending review,
39 implemented pending full review, 1 in progress (110), 2 verified (111/112),
and 1 pilot verified (70). These are existing recorded statuses, not new approvals.

Fresh checks during this review:

- `npm.cmd run test:visual-stories`: **255 tests passed**, none failed.
- Production builds of both comparison revisions passed using the same installed
  dependencies, Node 22.19.0 and Vite 8.0.10, production mode and environment files.
- HEAD still reports the existing >500 kB chunk warning: main JS is approximately
  520.39 kB minified / 131.54 kB in Vite's gzip report.
- `npm.cmd run audit:css`: 721 CSS files and 156 repeated declaration patterns.
  The worktree has 1,986,273 CSS source bytes; CRLF makes this differ from Git blobs.
- No new browser acceptance, focused lint or deployed HTTP measurement was run in
  this documentation review. Earlier checkpoint claims are historical evidence.

The checked-in inventory is stale: it still says 700 CSS files and omits recent
story dependencies/statuses. Its script also only recognizes
`<AlgorithmWorkspace>`, missing `<AlgorithmStoryWorkspace>`. Fix that detector
before using the refreshed `sharedWorkspace` signal. The inventory is not a
quality score; dynamic imports need separate analysis.

### Source growth

Exact committed `src` blob deltas; tests are excluded from runtime columns:

| Commit | CSS bytes | JSX bytes | Runtime JS bytes |
| --- | ---: | ---: | ---: |
| `fa158fda` | -13,977 | -58,987 | +20,373 |
| `a093bb80` | +2,249 | -6,556 | +6,130 |
| `41108da8` | +148,602 | +92,866 | +240,794 |
| Total | +136,874 | +27,323 | +267,297 |

Runtime source grew by 431,494 bytes. Test source grew separately by 166,129
bytes. Neither number is a visitor's transfer size.

### Production payload comparison

These are **static JS/CSS gzip estimates in bytes**, not measured HTTP transfers.
For each build, traverse the Vite manifest's static `imports` recursively, collect
each emitted JS file and its CSS once, and sum Node `gzipSync` default output per
file. A cold problem scenario unions the app entry and that problem's dependencies.
Do not follow every `dynamicImports` entry: that would count the entire catalog.

| Scenario | Baseline 148a3bb2 | HEAD 41108da8 | Change |
| --- | ---: | ---: | ---: |
| App entry dependencies | 242,934 | 242,977 | +43 |
| App + first visit to 120 | 332,837 | 317,663 | -15,174 |
| App + first visit to 121 | 333,885 | 336,656 | +2,771 |
| App + first visit to 125 | 333,195 | 321,347 | -11,848 |
| App + first visit to 132 | 332,651 | 321,508 | -11,143 |
| App + first visit to 141 | 333,259 | 322,368 | -10,891 |
| App + first visit to 142 | 333,800 | 338,784 | +4,984 |
| Additional assets for 132 after visiting 125 | 4,770 | 6,882 | +2,112 |

All emitted JS/CSS combined grew from 2,732,054 to 2,793,219 gzip bytes.
That deployment-wide total is not a first-page payload. The results show useful
cold-route savings on some problems and growth on others; savings are not uniform.
The warm 125-to-132 estimate assumes same-build assets remain available.

This method excludes HTML, fonts, images, fetched JSON, external editor assets,
runtime-triggered imports, headers and cache behavior. The app fetches
`public/data/leetcodeCatalog.json` on the LeetCode track; that file alone is
985,794 raw bytes / 125,184 gzip bytes in a local compression estimate. A complete
homepage bandwidth report must include it.

Build outputs used for this local review were placed in ignored
`.__story-review-*` paths. The table above is the durable evidence; future work
must regenerate measurements for its own baseline and candidate.

## Architecture to keep

Each story must explain the objects, current decision, consequence, invariant,
failure case and final proof. Different colors, titles or generic value cards are
insufficient. Distinct UI means distinct explanation and composition; related
problems can correctly share the same underlying objects.

| Layer | Responsibility | Location / examples |
| --- | --- | --- |
| Workspace | Inputs, validation presentation, code connection, Lumino panels, playback and floating controls | Existing `AlgorithmStoryWorkspace.jsx` |
| UI primitives | Panel framing, metrics, legends, comparison cards, status treatments, spacing and themes | Small shared JSX components with one owning stylesheet |
| Semantic primitives | Node identity, edges, pointer tracks, price coordinates, interval/dependency geometry | Existing `PointerRail`, `SvgViewport`, `binaryTreeLayout`, `RecurrenceGrid`; extend only where meanings match |
| Problem story | Arrangement, annotations, decisions, transitions and proof | Local `ProblemNNN/*Story.jsx` and scoped CSS |
| Algorithm / trace | Parsing, executed operations, immutable history, final result and witnesses | Local `algorithm.js`, or an established family module when semantics actually match |

Use direct imports of small components. Keep scene modules under their lazy
problem entry. `src/App.jsx` already eagerly imports metadata and lazily imports
problem `index.jsx` files; preserve this boundary. Vite supports async CSS splitting
and CSS Modules directly; no new styling framework is needed.
[Reference: Vite features](https://vite.dev/guide/features#css-code-splitting).

Extract a component after comparing at least two real consumers and identifying
shared meaning. Prefer children/slots or small explicit props for local overlays.
Do not create a universal renderer with problem-number switches, a global story
barrel, or a giant eagerly imported stylesheet. Tiny helpers can remain local when
sharing increases coupling or the measured cost.

Reuse existing controls and useful scenes. Avoid rewriting unrelated visualizers
to make their file structure uniform. Keep controls stable across problems while
making the explanatory scene specific.

## CSS ownership: first correctness fix

Plain `.css` files imported from JSX still have global selectors. Existing
collisions include:

| Consumers | Conflicting selectors |
| --- | --- |
| 125 `PalindromeStory.css` and 132 `MinCutStory.css` | `.badge-match`, `.comparison-index`, `.comparison-char`, `.operator-badge` |
| 121 `StockStory.css` and 123 `StockStory3.css` | `.stock-story__explanation` |
| 131 `PartitionStory.css` and 141 `CycleStory.css` | `.metric-value` |
| 128 `ConsecutiveStory.css` and 138 `CopyRandomStory.css` | `.metric-val` |
| 125, 131 and 138 | `.legend-item` |

For example, 125 gives `.badge-match` a tinted background and green text; 132
gives it a solid green background and dark text. These definitions create a
navigation-order styling risk. Confirm the visible effect in the browser.

For touched scene files, use CSS Modules or fully scope every local selector
beneath a unique scene root. Prefer Modules for newly extracted components.
A root class alone does not scope bare descendants elsewhere in the stylesheet.
Shared component styles must have one owner; scene geometry stays local. Audit
keyframe names, state selectors and portal-rendered content as well.

Use existing theme tokens consistently. Add container-based layout adaptation
where panel width determines the layout; a desktop window can contain a narrow
Lumino panel. Check light/dark contrast, non-color state cues and reduced motion.
For example, 141 has an infinite collision pulse needing reduced-motion review.

## Ordered work queue

### Batch A: establish repeatable evidence

1. Recheck HEAD and the worktree; preserve unrelated changes.
2. Add a small production manifest payload reporter using Node built-ins.
   Record raw, gzip and Brotli estimates, per-scenario unique asset lists and
   request counts. Distinguish static estimates from browser requests.
3. Capture homepage, cold 125, cold 132 and warm 125-to-132 baselines.
   Save the revision, Node/Vite versions, build mode, compression settings and
   result location. Use the same inputs/configuration for the candidate build.
4. Fix the inventory's workspace detector, refresh it and reconcile the ledger.
   The current script writes inventory and may append missing ledger entries;
   it has no dry-run mode. Do not replace reviewed statuses with defaults.

Done when the next batch can reproduce its measurements and use current inventory
without mistaking mechanical flags for acceptance.

### Batch B: Problems 125 and 132 only

1. Inspect both entire stories, CSS, algorithm fixtures and actual narrow panels.
2. Isolate their local styles, including shared-looking generic class names.
3. Extract the repeated character comparison card into one small JSX/CSS owner
   (proposed name: `CharacterComparison`; check existing components first).
   Share character/index labels, comparison operator and match/mismatch treatment.
4. Keep 125's raw-to-clean mapping, inward pointers and mismatch result local.
   Keep 132's center expansion, prefix DP and minimum-cut proof local.
5. Verify both routes, both navigation orders and their algorithm results.
   Compare cold and warm payloads with Batch A before claiming savings.

Done when cross-route styles are stable, meanings are preserved and the report
states exact payload changes. A correctness fix can add bytes; report that
separately from an optimization. Do not reduce teaching value to hit a number.

### Batch C: shell verification and remaining CSS collisions

Verify the shared shell with a single-input story and multi-input 134.
Check examples update every field, invalid input recovery, edits while playing,
reset, seeking backward, code-line selection, pattern overlay and floating/docking.
Inspect other known collision pairs in bounded batches:
121/123, 128/138 and 131/141. Test A-to-B-to-A and the reverse order.

Add a reusable browser check for shell behavior and navigation isolation where
practical. No committed full story-browser acceptance suite was established by
this audit. A production build or algorithm unit suite does not replace it.

### Batch D: further reuse and loading work, chosen by measurements

| Candidate | Share | Keep local |
| --- | --- | --- |
| Stocks 121–123 | Price coordinates, axes, viewport, common legend/metric framing | Best trade, harvested slopes and four-state DP overlays |
| Cycles 141/142; assess 138 separately | Compatible node/edge/pointer presentation | Detection, entry proof and random-link copy stages |
| Word Break 139/140 | Character/boundary and dictionary-match presentation | Boolean reachability versus sentence enumeration |
| Bits 136/137 | Signed bit-row and label presentation | XOR cancellation versus modulo-three state transitions |

Before extracting, read existing shared implementations and choose one owner.
Do not add parallel new primitives that duplicate `PointerRail`, tree layouts
or recurrence grids. Each batch should have one extraction and 2–3 consumers.

For bandwidth beyond scene CSS, investigate measured contributors separately:

- `CodeTracePanel.jsx` statically imports the Monaco React wrapper. Measure the
  wrapper and actual editor/network loads; consider loading editing UI only when
  opened while keeping ordinary code display immediate. Suspense alone does not
  turn a static import into a lazy one.
- `App.jsx` imports all chatbot CSS while the drawer is lazy. Separate required
  launcher styling from drawer styling only after checking current consumers.
- Catalog JSON, examples and solution registries can cost more than small scene
  styles. Measure which pages load them; consider a compact index and route-local
  details while preserving search/filter behavior.
- Inspect the eager access/Firebase dependency chain only if measurements justify
  it. Access checks and existing gates must remain correct.
- `firebase.json` already configures immutable caching for hashed assets. Verify
  served compression/cache headers before proposing hosting changes.

Never combine all story CSS or disable CSS splitting just to reduce file count.
Compare actual cold and warm costs, including request count and cache reuse.
Keep the existing Rolldown vendor grouping unless evidence supports a change;
raising the warning limit does not reduce payload.

### Batch E: resume catalog coverage

Clear acceptance gaps for implemented stories in small semantic families, then
review pending entries. Use the ledger rather than assuming everything through
142 is complete; 126/127, for example, were not in the latest story batch.

Continue trees by operation, arrays/pointers, linked structures, DP by recurrence
geometry, graphs/search, then remaining strings/tries/greedy/math/geometry.
Inspect existing JSX and CSS before deciding whether a story needs rebuilding.
A good existing visualization can pass review without replacement.

## Acceptance and bandwidth gates

For each changed problem, record evidence for all applicable items:

- Algorithm output and trace agree with the displayed code. Test boundary,
  duplicate, empty/no-solution and adversarial inputs where legal; use an
  independent oracle or invariant instead of mirroring the implementation.
- Frames preserve history when seeking backward. Identities, links and winning
  witnesses are stable. No future-state leakage or invented operations.
- Document supported visualization limits. Test the largest supported full trace,
  memory and responsiveness; a 10,000-node layout test alone proves neither.
  Use compact events, paging or checkpoints when repeated snapshots grow too much.
- Examples, editable input, errors, play/pause, speed, next/previous, reset,
  code links, pattern overlay and docked/floating playback work.
- Real route and access-gate behavior, desktop and 320–400px panel widths,
  both themes, keyboard/focus and reduced motion are checked.
  An isolated scene page supplements the route check.
- Changed CSS does not leak across routes; repeat relevant navigation sequences.
- Report source deltas and production JS/CSS asset estimates separately.
  Compare app entry, cold affected routes, a warm related route and an unrelated
  route. Count shared dependencies once per scenario and include shared CSS.
- For an optimization-only batch, aim for unchanged/lower app-entry cost and a
  measured reduction in the targeted scenario; explicitly explain any cold-route
  increase exchanged for warm-route savings. Use actual baselines before setting
  numeric budgets. Richer story features need an explicit byte-cost explanation.
- Confirm HTTP `Content-Encoding`, transferred bytes and cache behavior against
  a production-like server or deployed site before claiming real bandwidth savings.
  Include JSON/fonts/images/editor resources. Do not sum decoded size as network
  transfer; zero timing size can also mean cross-origin timing restrictions.
  [Reference: Resource Timing](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceResourceTiming/transferSize).

The CSS duplication audit finds exact declaration blocks of at least 80 characters
in at least three files. It misses two-consumer and near-duplicate opportunities.
Review the cascade before merging candidates. Do not remove CSS merely because a
text search failed to find dynamically built class names.

## Playground stays a separate capability

Track story quality, launch support, execution-to-story adapter support and
arbitrary-edit support separately. A story may be verified while its playground
adapter is unimplemented; record that limitation explicitly.

Preserve the Climbing Stairs pilot: separate persistent workspace, original draft
preserved, explicit handoff confirmation, real executed trace, exact-source
compatibility and n = 1–45. Retain links back to the source problem and original
draft, plus the existing sign-in and usage gates. Changed/unsupported code uses truthful general
execution visuals. AI changes still wait for acceptance/rejection.
Do not infer adapter support from the presence of a new `algorithm.js` or story.
Keep 111/112's recorded verification and 70's pilot status as historical ledger
evidence unless new checks establish a reason to change them.

## Commands and reproducible records

Run from `C:\Users\abd\d\vid\visualizer`. In this PowerShell environment use
`npm.cmd` / `npx.cmd`; `npm.ps1` is blocked by the local execution policy.

```powershell
git status --short
git log -3 --oneline
npm.cmd run test:visual-stories
node scripts/audit-css-duplication.mjs --json
npm.cmd run build -- --manifest
npm.cmd run preview -- --host 127.0.0.1 --port 4173
```

Run focused ESLint on actual changed JS/JSX files with `npx.cmd eslint <files>`.
After correcting its detector, refresh with
`node scripts/inventory-visual-stories.mjs` and inspect the resulting JSON diff.
Use the same production mode for both size builds; if evaluating Firebase
deployment, use `npm.cmd run build:firebase -- --manifest` for both.
Vite emits the manifest at `dist/.vite/manifest.json`.
[Reference: build manifest](https://vite.dev/config/build-options#build-manifest).

Only when the relevant playground contracts change, also run
`npm.cmd run test:problem-playground`, `npm.cmd run test:playground-python` and
`npm.cmd run test:webmcp`. Run the checks appropriate to the batch once the final
code is ready; repeat when a change or failure warrants it.

For every completed batch, record:

```text
Baseline / candidate revision or working-tree patch:
Consumers and shared files:
Story distinctions preserved:
Algorithm / lint / browser checks and exact outcomes:
Build mode, payload report path, cold and warm deltas:
Unverified items and why:
Ledger changes:
Next bounded task and exact starting command:
```

## Batch A & B Completion Record

```text
Baseline / candidate revision or working-tree patch:
  Baseline: HEAD (f2509626)
  Candidate: Working-tree patch implementing Batch A & Batch B
Consumers and shared files:
  - Extracted shared component: src/components/shared/CharacterComparison.jsx & CharacterComparison.css
  - Refactored consumers: src/problems/Problem125/PalindromeStory.jsx, src/problems/Problem132/MinCutStory.jsx
  - Isolated stylesheets: src/problems/Problem125/PalindromeStory.css, src/problems/Problem132/MinCutStory.css
  - Script additions/fixes: scripts/measure-production-payload.mjs, scripts/inventory-visual-stories.mjs
Story distinctions preserved:
  - Problem 125: Normalized alphanumeric string, inward pointer sweep (l, r), skipped-character mapping, mismatch stop.
  - Problem 132: Center expansion (odd & even), palindrome radius wings, prefix min-cut DP progression dp[r].
Algorithm / lint / browser checks and exact outcomes:
  - npm.cmd run test:visual-stories: 255 tests passed (10 suites, 0 failures, 0 skips).
  - Production build (npm.cmd run build -- --manifest): Successful.
  - node scripts/inventory-visual-stories.mjs: 613 registered entries, sharedWorkspace detector updated to recognize AlgorithmStoryWorkspace.
Build mode, payload report path, cold and warm deltas:
  - Build mode: production (Vite 8.0.10, Node 22.19.0)
  - Report path: docs/production-payload-report.json
  - Cold 125: 320,026 gzip B (isolated CSS + shared CharacterComparison module)
  - Cold 132: 320,217 gzip B (isolated CSS + shared CharacterComparison module)
  - Warm 125 -> 132 additional assets: 25,705 raw B / 6,592 gzip B / 5,740 brotli B (down from 28,210 raw / 6,869 gzip / 5,979 brotli baseline: saved ~277 gzip bytes on warm load).
Unverified items and why:
  - Browser interactive rendering for every responsive width (tested via headless builds & unit test suite).
Ledger changes:
  - docs/visual-story-inventory.json refreshed with corrected AlgorithmStoryWorkspace signal.
Next bounded task and exact starting command:
  - Batch C: Inspect and isolate CSS collision pairs (121/123 StockStory, 131/141, 128/138) and verify multi-input workspace shell (134 Gas Station).
  - Starting command: git status --short
```

## Batch C Completion Record

```text
Baseline / candidate revision or working-tree patch:
  Baseline: Patch after Batch B
  Candidate: Working-tree patch implementing Batch C (CSS collision fixes across 121/123, 131/141, 128/138, 131/138, plus reduced motion in 141)
Consumers and shared files:
  - Problem 123: Scoped .stock-story3* styles in src/problems/Problem123/StockStory3.css & StockStory3.jsx to avoid colliding with 121's .stock-story*
  - Problem 131 & 141: Scoped .partition-story__metric-value and .cycle-story__metric-value to eliminate cross-route collision on .metric-value
  - Problem 128 & 138: Scoped .consecutive-story__metric-val and .copy-random-story__metric-val to eliminate cross-route collision on .metric-val
  - Problem 131 & 138: Scoped .cuts-legend__item and .canvas-legend__item to eliminate cross-route collision on .legend-item
  - Problem 141: Added @media (prefers-reduced-motion: reduce) rule for .gap-card.collision pulse animation
Story distinctions preserved:
  - Problem 121: Running minimum price, single transaction best trade arc, day-by-day SVG price chart.
  - Problem 123: 4-variable DP transition machine (b1, s1, b2, s2), price timeline SVG, evolution matrix.
  - Problem 128: Hash set O(N) origin search, streak accumulator, champion sequence card.
  - Problem 131: DFS palindrome partition tree, candidate symmetry check, cut markers.
  - Problem 134: Multi-input workspace shell validation with gas & cost arrays, deficit reset candidate search.
  - Problem 138: 3-phase O(1) space list interleave, random link redirection, decoupling.
  - Problem 141: Tortoise & Hare cycle detection, relative distance delta gauge, collision pulse.
Algorithm / lint / browser checks and exact outcomes:
  - npm.cmd run test:visual-stories: 255 tests passed (10 suites, 0 failures, 0 skips).
  - Production build (npm.cmd run build -- --manifest): Successful.
Build mode, payload report path, cold and warm deltas:
  - Build mode: production (Vite 8.0.10, Node 22.19.0)
  - Report path: docs/production-payload-report.json
Unverified items and why:
  - Live cross-page navigation tests in a physical browser (verified through Vite production build and Node unit test suite).
Ledger changes:
  - None required for progress ledger (entries already tracked).
Next bounded task and exact starting command:
  - Batch D: Word Break 139/140 dictionary/boundary primitives or Problem 143+ continuation pipeline.
  - Starting command: git status --short
```

## Resume checkpoint for Claude

- Completed here:
  - Batch A: Created `scripts/measure-production-payload.mjs` generating `docs/production-payload-report.json`, fixed `scripts/inventory-visual-stories.mjs` detector for `<AlgorithmStoryWorkspace>`, refreshed `docs/visual-story-inventory.json`.
  - Batch B: Extracted `src/components/shared/CharacterComparison.jsx` and `CharacterComparison.css`, integrated into `Problem125/PalindromeStory.jsx` and `Problem132/MinCutStory.jsx`, removed global conflicting classes (`.comparison-char`, `.comparison-index`, `.operator-badge`, `.badge-match`, `.badge-mismatch`, `.legend-item`), verified 255 tests passing, measured production payload delta.
  - Batch C: Resolved CSS collision pairs across 121/123 (`.stock-story` vs `.stock-story3`), 131/141 (`.metric-value`), 128/138 (`.metric-val`), and 131/138 (`.legend-item`). Added `prefers-reduced-motion` to 141's collision pulse. Verified multi-input workspace shell in Problem 134. Confirmed production build and 255 tests green.
- Next: Batch D (Word Break 139/140 presentation consolidation or proceeding to Problem 143+ implementation pipeline).
- Known remaining work: browser acceptance suite, verification backlog.

Work in 1–3-problem batches with one shared owner. If delegating, assign disjoint
files and let one integrator own shared components, package scripts and ledgers.
Update this checkpoint after each completed batch and before stopping; include
partial files and unrun checks if interrupted. Do not launch a large catalog
rewrite merely to finish before a rate limit. Leave a small reviewable diff and
an exact next action so another model can continue without reconstructing chat.

Suggested handoff prompt:

> Read docs/visual-story-plan.md and the current git diff. Continue from the
> resume checkpoint. Preserve problem-specific stories, Lumino layouts and
> floating playback. Proceed to Batch D or the next problem pipeline.
> Update the checkpoint and relevant progress evidence after each bounded batch.
