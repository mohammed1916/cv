# Persistent catalog work plan

Resumed on 2026-10-06 at the user request. Finish missing catalog problems
first, then repair existing problems that provide only Python or only pseudocode.
The user requested continuous progress and explicitly waived tests and builds
for this expansion. Preserve original authored examples and actual algorithm
states; do not count catalog listings or empty shells as implementations.

## Current requested milestone

The user clarified on 2026-10-06: finish every catalog problem numbered through #2500, including earlier gaps. This is not a request for 2,500 total routes. At this checkpoint, 1,481 of those 2,500 entries have matching routes and 1,019 are missing. Route presence remains unverified and does not certify old implementations. Track the full range in `catalog-through-2500.json`; after the #505-596 batch, prioritize unwritten problems only and defer improvements to existing visualizers, per the latest user steering.

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
Six graph/grid additions bring complete Python coverage to 161, with 24 more
original examples and step mappings. The next twelve sequence/string/math additions bring complete Python coverage
to 173 with 48 further examples. The next 24 additions bring complete Python coverage to 197 and add 96 examples.
Another 25 additions bring complete Python coverage to 222.
Twelve structural/database additions bring complete Python coverage to 234.
Eighteen subsequent additions bring complete Python coverage to 252.
Fifteen further additions bring complete Python coverage to 267.
Twenty further additions bring complete Python coverage to 287.
Fourteen subsequent additions bring complete Python coverage to 301.
Current catalog coverage is 1,438 of 4,073; 2,635 entries remain unmatched
across 1,449 local routes. New linked-list stories reuse LinkedListGraph and a
shared stable-ID snapshot helper. Detect Squares uses the shared PointStateDiagram. Shared record tables now render multi-table inputs. Subsequent batches use authoredBatches.js to combine
explicit per-problem implementations and validators.
Python is the default where supplied; missing
implementations are explicitly unavailable instead of relabeling pseudocode.
Pseudocode retains playback line highlighting. Python does not reuse those
line numbers. Copy and Code Playground use the selected complete source.
Continue adding complete Python implementations to the remaining definitions.
The range batch is now registered with both languages. Additional batches
continue through the same explicit-definition registration path.

Runtime validation, browser interactions, and final correctness review remain
outstanding. Skipping checks accelerates source authoring, not verification.

Twenty further palindrome, meeting, path, tree, and ranking problems add 80 original examples, bringing this resumed run to 148 additions and 592 examples. Complete collection Python coverage is now 321. Tree paths reuse TreeDiagram; bomb chains extend the shared Cartesian scene with radius geometry. All remain unverified.

Twenty window, ordering, dependency, recovery, and simulation stories add another 80 original examples. This resumed run now totals 168 additions and 672 examples, with 341 complete collection Python implementations. All new routes remain unverified.

Twenty stamp, scheduling, corridor, ranking, and consistency stories add 80 original examples. This resumed run now totals 188 additions and 752 examples, with 361 complete collection Python implementations. The cumulative unverified expansion is 610 problems and 2,440 examples.

Twenty hash, painting, heap, bitset, capacity, and frequency stories add 80 original examples. This resumed run now totals 208 additions and 832 examples, with 381 complete collection Python implementations. The cumulative unverified expansion is 610 problems and 2,440 examples.

Twenty ranking, construction, race, ancestry, and tree stories add 80 original examples. This resumed run now totals 228 additions and 912 examples, with 401 complete collection Python implementations. The cumulative unverified expansion is 630 problems and 2,520 examples.

Twenty path, coverage, segment-tree, exact-choice, and counting stories add 80 original examples. This resumed run now totals 248 additions and 992 examples, with 421 complete collection Python implementations. The cumulative unverified expansion is 650 problems and 2,600 examples.

Twenty prefix, encryption, garden, transaction, and corner-path stories add 80 original examples. This resumed run now totals 268 additions and 1,072 examples, with 441 complete collection Python implementations. The cumulative unverified expansion is 670 problems and 2,680 examples.

Ten early canonical stories close every catalog-identity gap through #500. Five replace older same-problem entrypoints and five add missing canonical routes. They supply forty original examples and complete Python/pseudocode. This run has authored 278 implementations (273 added routes and five replacements), with 1,112 examples; complete collection Python coverage is 451. The cumulative unverified expansion is 680 problems and 2,720 examples. The requested #1-2500 range has 1,424 matched entries and 1,076 remaining gaps.

## Machine-readable progress

- `catalog-coverage.json`: every catalog entry and matched route.
- `unverified-expansion.json`: new unverified problem IDs and example counts.
- `catalog-story-inventory.json`: connected story metadata for implemented routes.

Remaining catalog entries are not restricted to the next numerical ID range.
Fill semantic families where appropriate, while tracking harder graph, tree,
design, concurrency, and database problems as separate implementation work.

## Latest prioritization

Group unwritten problems by shared algorithm family (database, union-find, windows, DP, and others). The complete catalog is the broader goal, with every problem through #2500 an intermediate milestone. Do not spend subsequent batches improving already-written visualizers. Continue to include original examples, problem-specific narratives, and complete Python plus pseudocode step mappings. Skip tests and builds as requested.
