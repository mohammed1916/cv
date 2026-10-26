# Problem payloads and hosting

Firebase Hosting publishes only `dist/`, as configured in `firebase.json`. Root
documents, `docs/`, scripts, tests, and source files are not copied there by Vite.
Files under `public/` are copied into the build, so keep development reports out
of that directory. Moving documentation improves organization, not hosting size.

## Examples

Edit the individual suite in `src/config/examples/`. Each visualizer imports only
the suite it uses. Colons in the old registry key become `--` in filenames, for
example `collection:1405` becomes `collection--1405.js`.

`authoredExamples.js`, `examplesRegistry.js`, and the family example maps are
aggregates for tooling or the smaller family workspaces. Do not import the full
examples registry into browser code. Add new suites to the tooling aggregate so
the example audits cover them.

## Collection definitions

Continue editing the existing algorithm, specification, Python, and batch source
files. `createDefinitions.js` owns shared validation and frame construction.
`definitionSources.js` is a build-tool aggregate, never a browser dependency.

Run `npm run build:definition-groups` after changing teaching metadata or adding a
collection problem. This generates `definitionGroups/`, `definitionGroupIndex.json`,
and `baseAlgorithms.js`. The command also runs before `dev`, `build`, and
`build:firebase`. Restart development or rerun the generator after changing batch
metadata during an active development session. Commit generated files with their
source changes. Do not hand-edit generated modules.

Routes import a small definition group directly; the full `definitions.js` map is
only for tests and authoring tools. Shared JSX and playback logic stay shared.

## Verification

- `npm run test:examples`
- `npm run test:sequence-stories`
- `npm run audit:examples`
- `npm run build`
- `npm run check:bundles`

The bundle check enforces the 500 kB JavaScript limit, checks that tooling
aggregates do not enter browser output, and checks representative route closures.
Catalog metadata and Firebase chunks remain startup dependencies; splitting them
improves caching and chunk size, while route-local examples reduce route downloads.

The migration split 1,654 example suites and 894 collection definitions across 77
groups. All 3,576 collection preset traces were compared with the original full
frames and results before replacing the aggregate. Verification also passed 12
example tests, 176 algorithm/catalog tests, 4,100 workspace preset checks, and
server rendering of 35,085 frames. A null sequence encountered in that rendering
audit now displays an empty sequence instead of throwing.

The production app entry is approximately 216.9 kB (63.9 kB gzip); the largest
chunk is the route index at 458.9 kB (71.0 kB gzip). The full examples registry
and collection definition aggregate are absent from the browser build. A browser
interaction smoke test could not run because no browser was connected.
