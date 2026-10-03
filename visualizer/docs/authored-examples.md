# Authored catalog examples

All 617 catalog routes now obtain their example presets from
`src/config/authoredExamples.js`, through `examplesRegistry.js`. The library
contains 681 suites and 2,944 presets, including aliases and adapters for the
different renderers. Those totals include reusable suites; they are not a count
of distinct mathematical inputs.

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

- `npm run test:examples`: 11 data-contract and regression tests.
- `npm run audit:examples`: route coverage, unique labels/inputs, 1,726 real legacy
  trace executions, and 205 shared-workspace parser/build executions.
- Existing narrative, visual-story, recent-visualizer, and early-visualizer
  suites: 921 passing checks. The early suite requires a working Python binary.
- Production build passes with existing large-chunk/Pyodide warnings.
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
