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

Current coverage: all 617 implemented catalog routes (615 numbered problems,
Matrix Iteration Patterns, and Game on Growing Tree). The original 30 authored
workspace stories remain in place; 587 routes use the catalog adapter below.

For code-block stories, `createTraceNarrative` accepts a goal, strategy,
chapters, blocks and edgeCases. Each block supplies a zero-based chapter,
code `lines` or `phases`, `why`, and `next`. The current frame's `message`
supplies the concrete achievement, without reading a future result.
Blocks are matched in order. Put phase-specific exceptions first if one code
line represents both entering and returning from recursion. Alternatively use
the existing callback/phase API, as Partitioning does.

`edgeCases` is a list of problem-specific assumptions and behaviors, presented
in a collapsible section. It describes cases to consider, not an assertion that
the current input is that case. Respect each visualizer's actual accepted inputs.

## Catalog adapter

`withProblemStory(Visualizer, storyGuide)` wraps a route with the same narrative
renderer in a collapsible, independently scrolling panel. Each route imports
its own `storyGuide.json`, so its content remains in the lazy route bundle.
`CodeTracePanel` and `CodePanel` publish their actual frame through
`NarrativeTraceContext`. The playback hook publishes index and length so reset,
invalid input and early returns are represented without consulting future data.
The context value is a stable publisher; story updates do not remount the
visualizer or its dock hosts. React portals retain this context.

Guides combine existing problem-specific metadata, explicit source explanations,
solution decision boundaries, and authored strategy/edge-case notes in
`catalogStoryOverrides.js` and `catalogEdgeCases.js`. Boundary checks are shown
as conditional rules, not claims that the current input took that branch.
Achievements use only the current frame. Do not replace them with final results
from a precomputed run. Existing explanations take precedence over a strategy
fallback when the frame supplies a reason for its particular operation.

Run `npm run build:narratives` after editing those source explanations. For a new
catalog-adapter route, run `node scripts/wire-catalog-stories.mjs` after generating
the guide, or add the wrapper/imports directly. Existing custom narrative
workspaces should continue using their richer definitions.

`npm run audit:narratives` checks actual routes and reachable imports, including
named routes, metadata completeness, frame publishers and boundary evidence.
It no longer counts folders or the mere existence of an empty narrative file.

Run the contract checks with:
`npm run test:narratives`.
