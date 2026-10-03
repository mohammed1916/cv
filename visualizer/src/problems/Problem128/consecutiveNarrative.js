import { createTraceNarrative } from '../../components/shared/createTraceNarrative.js';

export const consecutiveNarrative = createTraceNarrative({
  "goal": "Find the length of the longest run of consecutive integer values, regardless of input order.",
  "strategy": "Use a set for membership and begin a run only where no predecessor exists; duplicates cannot lengthen a run.",
  "chapters": [
    "Identify run starts",
    "Extend by membership",
    "Keep the longest run"
  ],
  "blocks": [
    {
      "chapter": 0,
      "lines": [
        2,
        3,
        4,
        5
      ],
      "why": "A value with a predecessor belongs to a run another start will count. Skipping it prevents repeatedly traversing the same run.",
      "next": "For a true start, initialize a run of length one."
    },
    {
      "chapter": 1,
      "lines": [
        6,
        7,
        8,
        9,
        10
      ],
      "why": "Only the next integer can extend a consecutive run; input positions and sorting are irrelevant.",
      "next": "Stop when the next integer is absent."
    },
    {
      "chapter": 2,
      "lines": [
        11,
        12
      ],
      "why": "The completed run competes with all previously counted runs.",
      "next": "Check remaining starts and return the greatest length."
    }
  ],
  "edgeCases": [
    "Duplicates count once.",
    "An empty array has longest length zero.",
    "Negative integers and zero can belong to the same run."
  ]
});
