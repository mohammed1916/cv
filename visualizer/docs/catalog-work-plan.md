# Persistent catalog work plan

Resumed on 2026-10-06 at the user request. Finish missing catalog problems
first, then repair existing problems that provide only Python or only pseudocode.
The user requested continuous progress and explicitly waived tests and builds
for this expansion. Preserve original authored examples and actual algorithm
states; do not count catalog listings or empty shells as implementations.

## Current working mode

- Keep using the existing `host` branch and remote.
- Implement each algorithm, bounded input validation, problem-specific goal,
  explanation, teaching steps, and four original examples.
- Reuse workspace, input controls, playback, code panel, and scene primitives.
- Register routes without executing examples using
  `node scripts/register-authored-stories.mjs --skip-example-validation`.
- Record unverified additions with `node scripts/record-unverified-expansion.mjs`.
- Keep prior test reports as historical evidence; do not imply that new routes
  passed those reports. No tests, builds, or browser verification are running.
- Refresh the metadata-only catalog inventory as implementation progresses.
- Continue missing catalog batches and checkpoint them on `host`.
- Every new problem must include complete Python, pseudocode, authored examples,
  and meaningful step states; defer the old one-language backlog until coverage is complete.

## Code-language correction requested during expansion

The user subsequently requested the missing option immediately. The shared
workspace now exposes **Python** and **Pseudocode** buttons. Complete Python
solutions are wired for the original 50 collection problems and the 40
additions spanning 1401-1475, plus seven trie problems (97 total). The trie
batch includes explicit Python and pseudocode step mappings and shared node diagrams.
The subsequent 48 range/broad and 10 database additions bring complete Python
coverage to 155. Database problems also provide SQL queries and table playback.
Python is the default where supplied; missing
implementations are explicitly unavailable instead of relabeling pseudocode.
Pseudocode retains playback line highlighting. Python does not reuse those
line numbers. Copy and Code Playground use the selected complete source.
Continue adding complete Python implementations to the remaining definitions.
The range batch is now registered with both languages. Additional batches
continue through the same explicit-definition registration path.

Runtime validation, browser interactions, and final correctness review remain
outstanding. Skipping checks accelerates source authoring, not verification.

## Machine-readable progress

- `catalog-coverage.json`: every catalog entry and matched route.
- `unverified-expansion.json`: new unverified problem IDs and example counts.
- `catalog-story-inventory.json`: connected story metadata for implemented routes.

Remaining catalog entries are not restricted to the next numerical ID range.
Fill semantic families where appropriate, while tracking harder graph, tree,
design, concurrency, and database problems as separate implementation work.
