# Codeforces visualization retrieval architecture

## Decision

Keep deterministic execution and rendering as the product core. AI is an optional
planner that produces the same validated visual-binding JSON a user can configure
manually. If AI, retrieval, or the network is unavailable, tracing and playback
continue to work unchanged.

Do not start by downloading "all Codeforces code." The official
[`problemset.problems`](https://codeforces.com/apiHelp/methods#problemset.problems)
method returns archive problem metadata and statistics, not statements or solution
source. Solution code should enter the corpus only when it is user-owned, explicitly
licensed, or intentionally contributed with provenance.

## Dataset layers

1. `problem_catalog`
   - Stable key: `codeforces:{contestId}:{index}`.
   - Official API fields: name, rating, tags, type, solved count, and contest/index.
   - Store source URL, fetch timestamp, response checksum, and API version assumptions.
2. `solution_examples`
   - Language, source, code hash, contributor/license, problem key, and validation status.
   - Prefer a small, diverse, verified set over many duplicate accepted solutions.
3. `trace_signatures`
   - Runtime variable types, loop relationships, mutations, call structure, and bounded
     sample shapes. Never store secrets or unrestricted user inputs.
4. `visual_recipes`
   - Validated binding JSON, renderer version, algorithm pattern, quality score, and
     the user edits that improved the recommendation.

Raw source and derived records should be immutable. New compiler/renderer versions
create new derived records rather than silently rewriting earlier evidence.

## Retrieval flow

```text
problem metadata + source + bounded trace
                    |
          deterministic feature extraction
                    |
       metadata and embedding retrieval
                    |
       optional visual-planning agents
                    |
          binding-schema validation
                    |
       deterministic compile and playback
```

Retrieve using a hybrid score:

- exact structure features: arrays, matrices, adjacency maps, recursion, two pointers;
- Codeforces tags and rating band;
- source/trace embeddings;
- renderer compatibility and historical user acceptance.

The prompt should contain only the top few recipes and bounded trace samples. It
should not contain the entire corpus.

## Optional agent roles

An AI-enabled backend may run these roles concurrently, but they communicate only
through versioned JSON artifacts:

- Retriever: selects relevant, provenance-safe examples.
- Trace analyst: identifies semantic variables and relationships from observed data.
- Visual planner: proposes bindings, views, labels, and highlighters.
- Verifier: rejects unknown variables, invalid targets, excessive containers, and
  recipes that fail deterministic replay.

Multiple agents are useful for proposal diversity and verification; they must not
mutate visualizer source files at runtime. The browser receives only the winning
validated recipe.

## Evolution loop

1. Run a submitted solution against bounded user-provided examples.
2. Generate deterministic defaults and, when requested, an AI suggestion.
3. Record explicit user changes as preference feedback—not automatic truth.
4. Replay the recipe across multiple traces and renderer versions.
5. Promote it into retrieval only after schema, playback, and visual-quality checks.

Track separate metrics for execution correctness, recipe validity, visual clarity,
latency, AI cost, and user acceptance. A high accepted-solution count does not prove
that a visualization recipe is useful.

## Delivery phases

- Phase 1: AI visual suggestions over the current local trace. Implemented in the
  playground; no dataset is required.
- Phase 2: scheduled Codeforces metadata sync with caching, backoff, and checksums.
- Phase 3: opt-in, provenance-safe solution and visual-recipe corpus plus hybrid
  retrieval.
- Phase 4: optional server-side multi-agent proposal and verification pipeline.

The later phases require a backend job store, vector/metadata index, dataset license
policy, evaluation suite, and production AI endpoint. They should not be placed in
the browser bundle or the existing problem visualizers.
