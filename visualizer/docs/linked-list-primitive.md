# Shared linked-list rendering

`src/components/shared/LinkedListGraph.jsx` renders nodes `{ id, val }`.
IDs must be unique and stable across frames, including when values repeat.
Array order defines links; set `nextId` explicitly for rewiring, with `null`
for a terminated link. Alternatively, `cycleStart` identifies the tail's return
node by array index. Pointer entries `{ label, nodeId }` and `highlightedIds`
refer to IDs, not array positions. A null pointer is displayed explicitly.

Sort List (148) and Cycle II (142) use this primitive. Their algorithm traces,
split/merge stages, cycle proof, telemetry, and result explanations remain local.
Other linked-list scenes can adopt it incrementally; arbitrary extra random
edges and branching structures are outside this primitive's current API.

## Inputs

Use one editable control per logical input. Two lists, list plus cycle position,
and array plus target are separate inputs and must remain separate.
The shared workspace owns its input panel; story renderers should not repeat it.
Multi-field examples should provide `values: { fieldKey: value }`. Missing keys
fall back to initial values or field defaults. Arrays display as JSON.

This pass removed duplicate legacy input rows in 70 source files where the
shared panel already owns the same values. Controls involving additional
actions or different bindings were left for individual review. No full-catalog
input audit, build, runtime tests, or screenshots were performed in this pass.
