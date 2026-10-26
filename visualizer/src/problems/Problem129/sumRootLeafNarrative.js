import { createTraceNarrative } from '../../components/shared/createTraceNarrative.js';

export const sumRootLeafNarrative = createTraceNarrative({
  "goal": "Sum the numbers formed by digits on every root-to-leaf path.",
  "strategy": "Carry a decimal prefix down each branch; only leaves finish numbers, and sibling subtree totals are added.",
  "chapters": [
    "Extend the decimal prefix",
    "Finish a number",
    "Combine branch totals"
  ],
  "blocks": [
    {
      "chapter": 0,
      "lines": [
        2,
        4,
        8
      ],
      "why": "Multiplying by ten shifts previous digits left before appending this node digit. Each recursive branch receives its own prefix.",
      "next": "Check whether this node completes a root-to-leaf number."
    },
    {
      "chapter": 1,
      "lines": [
        3,
        5,
        6
      ],
      "why": "A leaf finishes one number. A missing child contributes zero rather than treating its parent as a completed path.",
      "next": "Return the completed number to the caller."
    },
    {
      "chapter": 2,
      "lines": [
        7
      ],
      "why": "Left and right subtrees represent different root-to-leaf paths, so their totals are added, not concatenated.",
      "next": "Return their sum upward."
    }
  ],
  "edgeCases": [
    "A single digit at the root forms one number.",
    "A zero digit still shifts the existing prefix: 1 → 0 forms 10.",
    "Only node values 0 through 9 represent digits."
  ]
});
