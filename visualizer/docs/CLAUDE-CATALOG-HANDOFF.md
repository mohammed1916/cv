# Claude handoff: complete the 4,073-problem catalog

Updated 2026-10-28. Read this first for catalog completion. This is an implementation handoff, not a claim that the catalog or the 17 partial repairs are finished.

## 1. User objective and instruction precedence

The user wants all four tasks completed:

1. Finish the 17 partial entries.
2. Convert the 1,451 legacy-unconverted entries using the same quality gates.
3. Source and implement the 1,189 missing entries, including paid-only problems only when their requirements are legitimately accessible.
4. Run browser playback acceptance on new and repaired visuals, including the previous repair batch.

Preserve the existing problem-specific visuals and useful authored examples where possible. A wrapper, route, copied shell, language export, or passing solver test alone is not completion. Provide genuine algorithm states, correct narration, complete Python, genuine pseudocode and verified playback.

**Superseded guidance:** `docs/catalog-work-plan.md` contains historical instructions to skip tests/builds and prioritize missing entries over repairs. Those are not the current instruction. The current request explicitly requires the same validation gates and browser checks. Use this handoff's priority order. The old work plan and old aggregate coverage documents are historical context, not current certification.

This handoff does not request deployment, publication, unrelated cleanup, or changes to other projects. Continue authorized implementation and local verification without repeatedly asking the user whether to proceed. Record an inaccessible source as blocked and work on other entries; do not invent the statement or bypass access controls.

## 2. Checkout and current state

- Working directory: `/Volumes/S/Development/a/competitive_programming_visualisations/visualizer`
- Branch observed: `host`.
- HEAD observed: `ec8513287` (`Mark 2919 verified in catalogue manifest`).
- **The Codex repair batch is present in the working tree and is uncommitted.** Do not reset, clean, overwrite, or redo it blindly. Inspect `git status --short` and `git diff` first; preserve any additional work made after this handoff.
- Read `CLAUDE.md`, this file, and `docs/reviews/2026-10-28-catalog-repairs.md`.
- Before shared-view changes, also read `docs/reviews/2026-10-27-recent-commits.md`. Its three original findings are recorded as resolved; do not assume they remain broken. Keep their regression checks.
- Git emits AppleDouble `._pack-*.idx` non-monotonic-index warnings. History and diffs were readable. No Git metadata was modified. Do not turn catalog work into destructive repository repair.

### Manifest snapshot

`docs/catalog-manifest.json` contains 4,073 entries:

| Status | Count | Meaning and limitation |
| --- | ---: | --- |
| verified | 1,416 | Historical classification, not a claim of full browser acceptance or literal template compliance |
| partial | 17 | Current repair batch has better evidence but still has open gates |
| legacy-unconverted | 1,451 | Existing implementations/layouts need migration and verification |
| missing | 1,189 | No matching implementation identified by the prior inventory |

The four counts sum to 4,073. Recalculate from `entries` rather than trusting the summary alone. A legacy entry can have `folder: null` and `route: missing`; these fields are not sufficient proof that no implementation exists. Search by number, title, slug, metadata and family definitions before creating duplicate routes.

The partial IDs are exactly:

`139, 140, 141, 142, 432, 3894, 3895, 3896, 3899, 3905, 3908, 3909, 3910, 3912, 3913, 3914, 3915`.

The user's earlier prose repeated 3912/3913; there are 17 distinct IDs, not 19.

## 3. What Codex already changed — preserve and review

| Area | Current change | Remaining work |
| --- | --- | --- |
| 139–142 algorithms | Added `parseInput`, `buildTrace`, `code`, `python`; kept existing story builders; explicitly authored pseudocode with the original line positions | Literal `AlgorithmWorkspace` migration, parser/domain review, bounded traces, normalized playground inputs and full browser acceptance |
| 139–142 visual definitions | Supply Python and pseudocode while preserving authored scenes | Do not discard scenes during shell migration |
| `AlgorithmStoryWorkspace.jsx` | Conditional language buttons, Python code display, pseudocode highlighting/connectivity and pattern overlays; no invented Python line mapping; disables executable handoff without normalized story input | Review behavior during language switches and input changes; preserve compatibility for other story definitions |
| 3894–3896, 3899, 3905, 3908–3910, 3912–3915 | Complete Python separated from explicitly authored pseudocode; exports wired into existing `AlgorithmWorkspace` definitions | Full line semantics, examples, edge cases and browser acceptance |
| 432 | Standard parser/trace exports, complete linked-count-bucket Python class, `AlgorithmWorkspace` route and count table; corrected `CODE` compatibility alias | Full acceptance, input adapter for class operations if playground supports it, consider richer bucket visualization |
| Tests | Added `algorithm.test.mjs` for 432, 3912, 3913, 3914 and `src/problems/catalogPartialRepairs.test.mjs` | Expand coverage where needed; representative cross-language comparisons are not exhaustive |
| Requirements | `docs/requirements/<id>.json` for all 17 | These are paraphrased sourced requirement notes, not verbatim full statements or proof of all constraints being tested |
| Manifest | Added source file references, passing test status, granular `repairEvidence`; left all 17 partial | Reconcile evidence and remaining gates before promotion |

For 139–142, existing tests that assert Python source strings now read the `python` export. Do not revert pseudocode back to Python to satisfy those assertions.

### Sourcing blockers resolved in this batch

Official LeetCode pages were accessible through the web tool, despite earlier direct-fetch failures. All 17 requirement notes link to their official source.

- **432:** average O(1) operations; any tied minimum/maximum key is valid; empty queries return an empty string. Decrement targets must exist.
- **3912:** larger than every element on the left **or** every element on the right, using strict comparisons. Endpoints qualify. Preserve order and duplicate endpoint values.
- **3913:** frequency descending, then **first occurrence in the original string**. Consonant positions stay fixed. This tie rule is now confirmed, not an open sourcing question.
- **3914:** minimize the sum of increment amounts `x` for subarray increments, not the number of operations.
- **3915:** maximize the sum of selected values under strict alternating comparisons and index gaps at least `k`; this is not the alternating plus/minus-sum problem.

### Known domain/UX gaps

- 139: visual parser caps string and dictionary size at 50; it also normalizes uppercase and accepts duplicate dictionary words. Distinguish friendly extensions and visualization limits from official constraints.
- 140: accepts string length through 25, beyond the official maximum 20. Exponential answer/frame growth needs an explicit safe bound and informative validation. Do not silently truncate answers or pretend partial traces are complete.
- 141: 500-node visual cap versus the official 10,000-node limit.
- 142: parser/domain limits and large-input performance need review.
- 432: new visual limit is 200 operations versus official 50,000 calls. Data-structure operations are average O(1); producing each visual snapshot costs O(current key count). Keep that distinction in complexity text.
- 3915: Fenwick cells are drawn only through 48 value coordinates; larger inputs retain solver traces without that detailed tree view. Explain this honestly.
- Python functions for 141/142 expect linked nodes, not an arbitrary JSON object. 432 uses an `AllOne` class. Do not enable a broken playground handoff just because Python is present.

## 4. Exact evidence already obtained

The following command passed **130 tests** after the final code changes:

```sh
node --test src/problems/catalogPartialRepairs.test.mjs src/problems/Problem{139,140,141,142,432,3894,3895,3896,3899,3905,3908,3909,3910,3912,3913,3914,3915}/algorithm.test.mjs src/problems/recentVisualizers.test.mjs src/components/shared/resolveNarrative.test.mjs
```

Coverage includes:

- All 17 standard export contracts, Python syntax and representative Python execution compared with JavaScript.
- Trace active/related line-number ranges on representative inputs. **In-range is not the same as semantically correct.**
- Independent direct-comparison oracle for 3912 across all ternary arrays through length seven.
- Vowel ordering and fixed-consonant checks for 3913 across short exhaustive inputs.
- Independent shortest-path search over unit subarray increments for small 3914 arrays.
- Count-map oracle and query tie acceptance for 432.
- Existing problem and narrative tests in the command above.

`npm run build` passed after the final shared-workspace change, in **17.80 seconds**. It reported large chunks and Pyodide browser-externalization warnings. Do not describe this as a warning-free build. `git diff --check` passed. A full repository test run was not performed.

Chrome browser smoke tests used a local Vite server on `http://127.0.0.1:3010/` with hash routes. Check whether that server is still running before starting another one.

| IDs | Actual browser evidence |
| --- | --- |
| 139–142 | Python/pseudocode controls, forward/back steps, active pseudocode line; 142 rechecked after the final shared-panel adjustment |
| 432 | Terminal state, previous query with correct count and highlight, language selection |
| 3894–3896, 3899, 3905, 3908–3910, 3912, 3914–3915 | Seek to last frame, end-of-playback controls, real pseudocode, active line, previous frame |
| 3913 | Complete phase, ranked vowel output, fixed consonants in the displayed example, pseudocode return highlight |

These do **not** establish autoplay/pause correctness, every example, every intermediate frame, maximum-input performance, responsive layout, screenshot acceptance, or full input-error recovery. First fast navigation checks raced lazy loading; their results were discarded. Wait for the target route's actual visual panel, not merely its page heading, before acting.

## 5. Previous repairs also need acceptance

The 38 problem IDs changed by commits `638dbf6` and `2464d41`, recovered from Git file paths, are:

`8, 11, 12, 13, 29, 47, 52, 100, 101, 102, 103, 104, 107, 108, 109, 110, 111, 112, 113, 114, 115, 120, 121, 122, 123, 124, 125, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138`.

Also include **2919** in the browser acceptance queue. Thus the specifically identified repaired/new queue is **56 distinct problems: 17 + 38 + 1**.

Caveats inherited from that batch:

- Four-file/export repairs retained old `index.jsx` wrappers; they were not all migrated to the literal shared template. Audit and preserve their visuals while closing that gate.
- 29 and 47 renamed old `code` to `legacyCode` and aliased visual imports; do not break those compatibility paths.
- Earlier source notes relied on search snippets/community mirrors. Strengthen provenance using official pages where available.
- Some correctness oracles reused solution logic; supplement with genuinely independent small-input checks.
- 2919's 1–20 entries and `k` 1–20 are visualization bounds, not official constraints. Re-source the official domain; do not copy the visual cap into the statement as an official rule.
- 108 and 109 may produce a valid balanced BST different from the sample tree. Assert inorder/node multiset and balance, not equality to one serialized example.

The previous 1,416 verified count must not be cited as 1,416 fully browser-tested/template-compliant problems. If auditing reveals failures, record them explicitly and reconcile statuses rather than preserving a misleading label.

## 6. Completion gates — apply per problem

Treat these as the acceptance contract for this work. If an existing schema cannot represent a gate, add explicit evidence fields or a linked report without silently redefining `verified`.

1. **Identity and requirements:** canonical number/title/slug, legitimate source, rules, official constraints, examples and tie semantics recorded. Clearly label visualization caps and supported input extensions.
2. **Actual route:** locate and test the canonical routed component. No duplicate slug, placeholder-only route or inactive implementation counted as complete.
3. **Layout:** `meta.js`, `index.jsx`, `algorithm.js`, `algorithm.test.mjs` exist; index uses the literal shared `AlgorithmWorkspace` pattern. Preserve problem-specific visual components. A thin adapter is acceptable only when it implements the full contract; do not substitute generic text for meaningful state.
4. **Algorithm contract:** `parseInput`, `buildTrace`, `code`, `python` exports; validated inputs; deterministic trace and correct result. Respect existing workspace return/frame conventions. Use bounded memory and explicit visual limits.
5. **Languages:** complete executable Python, actual language-neutral pseudocode, both wired into UI; no undefined helper placeholders. Appropriate SQL/concurrency-specific behavior must not be misrepresented as solved by unrelated Python. Keep semantics faithful to the problem.
6. **Teaching state:** correct initial/intermediate/final snapshots, no mutation of prior frames, narration agrees with the operation, active/related lines point to the action shown. Shared diagrams receive the actual necessary payload; output correctness alone is insufficient.
7. **Correctness checks:** official examples where available, independently authored edge cases, invalid inputs, independent brute-force/property oracle for manageable domains, representative cross-language execution. For multiple valid outputs use validity predicates. Check required complexity separately from tiny-input correctness.
8. **Browser acceptance:** run each authored example and representative manual/invalid input; inspect start, a meaningful transition, and result; verify next/previous, play/pause, reset/replay, timeline/phase seeking where offered, code-language switching/highlights, error recovery and usable visuals. Inspect mobile/narrow layout when the scene can overflow. Record exactly what ran and what did not.
9. **Integration:** relevant shared regressions and build pass; generated artifacts synchronized if their source changed; clean diff review with no unrelated edits.
10. **Checkpoint:** commit coherent, reviewed batches and record the actual commit/evidence; update manifest only after gates are satisfied. Source-blocked entries stay visibly blocked/unverified. Do not claim all-complete with unresolved inaccessible entries.

## 7. Ordered execution plan

### Phase A — close the current partial batch

1. Inspect the current dirty tree and preserve the Codex changes.
2. Run the 130-test command and production build as a baseline if code has changed since this evidence.
3. Review 139–142 input contracts and trace size, then migrate their wrappers while reusing the existing story scenes. Fix playground adapters or explicitly keep unsupported handoff unavailable.
4. Review all 17 pseudocode mappings semantically, including branches absent from default examples; test snapshots and explanations as well as results.
5. Run full acceptance for all 17. Resolve actual failures. Update the requirements/evidence and commit a coherent batch.

### Phase B — close the known historical acceptance queue

Audit the 38 IDs above plus 2919 against the same gates. Preserve the old visuals, repair wrappers and weak tests where needed, resolve source/constraint issues, run browser acceptance, and reconcile their historical verified classification. This prevents the existing repair backlog from being lost while authoring thousands of new entries.

### Phase C — convert every legacy entry

For each manifest legacy entry, locate the actual folder/family implementation. Classify it as real algorithm needing an adapter, algorithm needing correctness repair, or placeholder needing a full implementation. Group by algorithm family only to share infrastructure and review effort; each problem still needs its own requirements, solution, meaningful trace, examples and checks.

Finish small, reviewable batches through all gates before moving on. Retain already-written scenes and authored examples. Do not replace working algorithms with generated generic approximations. Keep a persistent queue/evidence record so interruptions do not restart work or lose blockers.

### Phase D — source and implement every missing entry

First verify that no alternate folder/family already implements the problem. Source requirements before choosing the algorithm. Implement the complete problem and pass all gates. For legitimate paid access use only available authorized sources; otherwise record exact missing requirements/source attempts and continue with accessible work. Never infer an unfamiliar paid problem from its title.

### Phase E — reconcile the whole catalog

Recompute counts from entries; verify identity uniqueness, real route coverage, all required files/exports, source evidence, per-problem acceptance evidence and commits. Run broader regressions after shared changes, review build/bundle effects, and report remaining source blockers separately. Historical verified entries may still need evidence reconciliation; do not turn old labels into new proof.

## 8. Repository tools and pitfalls

Useful entrypoints:

- `src/components/shared/AlgorithmWorkspace.jsx` — parse/build/examples/frame contract.
- `src/components/shared/AlgorithmCodePanel.jsx` — language selection and Python stage mapping.
- `src/components/shared/AlgorithmStoryWorkspace.jsx` — older story shell; compatibility matters during migration.
- `src/config/problemVisualizerRegistry.js`, `src/config/visualizationRegistry.js`, `src/config/examplesRegistry.js` — inspect actual routing/example integration.
- `src/problems/families/collectionStories/algorithms.js` and family definition groups — existing implementations may live here instead of obvious numbered folders.
- `npm run build:definition-groups` — regenerate after changing its family sources; inspect generated imports/diff.
- `scripts/register-authored-stories.mjs` — writes routes from explicit family definitions; read its overwrite guards before using it. It is not a blanket missing-problem generator.
- `npm run audit:visualizers`, `npm run audit:catalog`, `npm run check:bundles` — useful audits, not replacements for problem correctness/browser acceptance. Inspect script behavior before running mutating generators.
- `node --test src/components/shared/*Model.test.mjs` — shared visual-state regressions when those models/integrations change.
- `npm run dev -- --host 127.0.0.1 --port 3010` — development server; predev regenerates definition groups.

A quick read-only inventory:

```sh
node --input-type=module <<'JS'
import fs from 'node:fs';
const m = JSON.parse(fs.readFileSync('docs/catalog-manifest.json', 'utf8'));
const counts = {};
for (const e of m.entries) counts[e.status] = (counts[e.status] || 0) + 1;
console.log({ total: m.entries.length, counts });
for (const status of ['partial', 'legacy-unconverted', 'missing']) {
  console.log(status, m.entries.filter(e => e.status === status).map(e => e.number).join(', '));
}
JS
```

Do not use `--skip-example-validation` or an unverified-expansion recorder as evidence of a passed gate. Avoid mass edits that merely add export names or relabel Python as pseudocode. For shared educational state, test distant DP dependencies, real path-halving narration, and actual stack payloads in routed problems; the earlier review explains why these checks matter.

## 9. Required progress reporting

After each completed batch, record:

- IDs and actual changes; source references and access blockers.
- Tests run and counts, browser scenarios actually exercised, build result and warnings.
- Commits and manifest status transitions.
- Remaining counts, with partial/blocked/unverified work explicitly separated.
- Next concrete batch and unresolved reproducible defects.

Update this handoff or a clearly linked continuation log. Never report a plan as implementation, static checks as browser acceptance, or a representative smoke check as exhaustive verification. Claim completion only when the user's requested work has actually met the gates; if legitimate source access prevents completion, list the exact blocked entries and continue all independent work first.
