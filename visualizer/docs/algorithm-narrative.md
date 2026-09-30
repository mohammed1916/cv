# Shared algorithm narratives

`AlgorithmNarrative` owns the goal, strategy chapters, code-line reference,
purpose, achievement and next-step UI. Its CSS Module is shared across consumers.
Keep algorithm-specific explanations in a problem-owned narrative definition.

For visualizers using `AlgorithmStoryWorkspace`, add `narrative` to the existing
workspace definition. The workspace supplies the current playback frame (null
before playback and after reset), frame index, built story and input values.
Invalid inputs hide the narrative along with the visualization.

```js
const narrative = {
  goal: 'What answer are we trying to produce?',
  chapters: ['Find candidates', 'Evaluate candidates', 'Return the answer'],
  ready: {
    why: 'Explain the overall strategy.',
    achieved: 'Nothing has been processed yet.',
    next: 'Explain where the algorithm starts.',
  },
  phases: {
    evaluate: ({ step, story, input, stepIndex }) => ({
      chapter: 1, // zero-based active chapter; not a completion percentage
      why: 'Explain why evaluating this candidate is necessary.',
      achieved: `Current candidate: ${step.candidate}`,
      next: 'Describe the next decision.',
    }),
  },
  lines: {
    // Optional line-specific refinements when multiple blocks share a phase.
  },
};
```

Ready, phase and line entries can be objects or context callbacks. Resolution
order is base content, then ready/phase content, then line content. A whole
definition can also be a callback returning the same presentation fields, as in
`Problem1096/braceNarrative.js`. Optional fields are omitted from the UI.
Use `scope` for recursive context and `strategyLabel` for a custom accessible
chapter-list label. Do not imply that revisiting a chapter completes later ones.

Custom workspaces use the same component directly:

```jsx
<AlgorithmNarrative definition={narrative} step={step} input={expression} />
```

Workspace input is the field-values object (`{ arr: ... }` for single-field
definitions); custom workspaces may pass their own input shape. `story` contains
the parsed input and trace. Never reveal a future result from that trace while
describing what the current frame has achieved.

Current adopters: Brace Expansion II (custom workspace) and Best Time to Buy and
Sell Stock (shared workspace). Other workspace consumers opt in by supplying
content; absent definitions render nothing. This avoids inventing generic
explanations for algorithms that have not yet been authored.

Run the contract checks with:
`node --test src/components/shared/resolveNarrative.test.mjs`.
