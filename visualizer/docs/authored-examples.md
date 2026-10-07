# Authored catalog examples

Browser visualizers import individual presets from `src/config/examples/`.
`src/config/authoredExamples.js` and `examplesRegistry.js` aggregate suites for
tooling only. The audit covers 1,577 catalog routes, 1,654 suites, and 6,839 presets.
Those totals include reusable suites; they are not a count of distinct
mathematical inputs. See [payload boundaries](payload-boundaries.md) before adding
imports or changing collection batches.

The first preset generally provides a longer walkthrough. Remaining presets
exercise meaningful boundaries: minimal inputs, ties, repeated values, absent
answers, impossible configurations, carry propagation, disconnected components,
empty results, and other problem-specific branches. Small examples are retained
where their small size is the point. Exponential algorithms use bounded inputs
so their traces remain practical.

The examples are authored data, not a random renumbering of scraped fixtures.
Related renderers share data through explicit field adapters. Sortedness,
occurrence counts, matrix alphabets, graph endpoints, pointer indices, and query
bounds are preserved. Sudoku examples come from an independently constructed
valid grid with selected cells removed. Input presets are separate from invalid
syntax: malformed JSON is not presented as an ordinary algorithm example.

## Validation

- `npm run test:examples`: 12 data-contract and regression tests.
- `npm run audit:examples`: route coverage, unique labels/inputs, 942 legacy trace
  executions and 4,100 shared-workspace parser/build executions. The legacy
  extractor skips 405 cases requiring dependencies it cannot isolate.
- `npm run test:sequence-stories`: 176 algorithm/catalog tests and server rendering
  of 35,085 frames across 973 algorithms.
- Production build and `npm run check:bundles` pass with every JavaScript chunk
  under 500 kB. Existing Pyodide browser externalization warnings remain.
- Changed-source lint was compared with the previous commit; inherited warnings
  were kept separate from new findings.

The execution audit records 332 skipped adapter/helper checks in
`authored-example-validation.json`. It does not substitute synthetic algorithm
implementations to make those checks pass. The workspace audit exercises the
actual definitions through Vite. Some legacy pages still contain simplified or
placeholder algorithm traces; adding examples does not certify those algorithms.
Browser interaction and layout were not verified in this environment.

This is representative boundary coverage, not an exhaustive proof over every
possible input. When adding a problem or extending its supported domain, add a
longer walkthrough, name each distinct boundary, and extend the checks for the
new input constraints.

## Repairs exposed by the new inputs

The replacement also fixes the reverse-list terminal loop, zero-capacity LFU
writes, reservoir-sampling initialization, digit-reconstruction dependencies,
single-day stock traces, and several startup/adapter errors. Problem 432 now
traces the actual AllOne frequency-bucket operations instead of the unrelated
randomized-set implementation that was previously connected to that route.

Inline presets and unused literal fallback lists were replaced. Shared story
workspaces start with the first authored preset; 390 legacy input-state
initializers were aligned with their existing example adapters.
