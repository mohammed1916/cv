# Adaptive tutorial scene planner

The adaptive workspace reuses the same registered visual components in Full view, Step-by-step, and Reason-first. Problems 1105 (DP) and 1971 (BFS) are the first integrations. Existing visualizers keep their current behavior until they are registered; this is not an automatic migration of the catalogue.

## Add a visual

Register a stable ID and a `select` function in the problem's `visuals` array, then pass the array to `AlgorithmWorkspace`. The selector returns a plain object keyed by stable item IDs. Values may be nested plain objects or arrays. The planner compares snapshots and selects changed keys automatically. For example, adding this tracker to the DP registration makes it available in all three modes without changing the tutorial adapter:

```jsx
{
  id: 'variables',
  title: 'Current variables',
  select: ({step}) => ({width: step.snapshot.width, tallest: step.snapshot.tallest}),
  reads: ({step}) => step.kind === 'fit' ? ['width'] : [],
}
```

The default renderer displays the keyed values, highlights changes, and retains their previous value for the focused transition. Full view shows only current values. For a custom visualization, provide `render(props)` and reuse the same component in every mode. It receives `data`, `previousData`, `changedKeys`, `reads`, `focusKeys`, `focused`, `run`, `step`, and `previousStep`. Keep stable item keys and use `focusKeys` to focus the existing component. Examples are in `src/problems/Problem1105/visuals.jsx` and `src/problems/Problem1971/visuals.jsx`.

Comparisons and conditions can read values without changing them. Declare `reads` using the real trace data; do not infer a comparison from a state difference. `active` can keep a visual relevant without an item change, and `dependsOn` names other registered visuals required to understand it. When the planner lacks focus information it shows the available visuals rather than inventing a mutation. The initial snapshot is a baseline: it is not treated as a write to every item.

For a real cross-visual insertion or removal, a registration can also declare `transfer({run, step, previousStep})` returning `{from, to, item, changedVisual, operation}`. `from` and `to` are visual IDs, `item` is the stable item ID, and `operation` is `insert` or `remove`. The planner only displays a connection when that item's membership actually changed in `changedVisual` and both endpoints are visible. Custom renderers expose their item anchor with `data-adaptive-item`. See the BFS queue/graph registration for an example. The overlay measures the same mounted objects; reduced motion keeps the connection without the moving token.

## Playback and reasons

Step-by-step follows solver frames with the responsible code and current effect together. Reason-first adds an explanation before the first occurrence of a semantic kind, then advances to its actual effect; the previous state remains displayed during that explanation. A problem can reuse its authored `tutorial({run, step, previousStep})` to supply `reason` and optionally `reasonKey`. Without an authored reason, Reason-first still follows the trace but does not invent an invariant or explanation. Switching modes preserves the current solver frame and the full dock layout.

## Limits

The planner derives what changed, not why the algorithm is correct. It cannot derive a read from an unchanged snapshot, reconstruct a missing intermediate state, or safely infer a value transfer between unrelated visuals. Register the necessary read/operation metadata and emit real intermediate frames first. Cross-visual transfers currently cover explicitly declared insertions and removals with visible item anchors; other operations need additional semantics and rendering. Do not promise automatic cinematic storytelling for unregistered or arbitrary visualizers.
