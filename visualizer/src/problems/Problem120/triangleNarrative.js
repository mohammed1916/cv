import { createTraceNarrative } from '../../components/shared/createTraceNarrative.js';

export const triangleNarrative = createTraceNarrative({
  "goal": "Find the minimum sum along a top-to-bottom path, moving only to adjacent entries in the next row.",
  "strategy": "Collapse the triangle from the bottom upward; each stored cost already includes the cheapest route below it.",
  "chapters": [
    "Seed the last row",
    "Choose a cheaper suffix",
    "Read the apex cost"
  ],
  "blocks": [
    {
      "chapter": 0,
      "lines": [
        2,
        3
      ],
      "why": "A bottom-row value is already the entire cost of a path starting there.",
      "next": "Move upward to a row whose two child costs are known."
    },
    {
      "chapter": 1,
      "lines": [
        4,
        5,
        6
      ],
      "why": "At each entry, choose the cheaper of its two adjacent child paths. Left-to-right updates preserve the child values still needed.",
      "next": "Continue across this row, then move to its parent row."
    },
    {
      "chapter": 2,
      "lines": [
        7
      ],
      "why": "After every lower row is absorbed, the first slot contains the cheapest complete path.",
      "next": "Return the apex cost."
    }
  ],
  "edgeCases": [
    "A one-row triangle returns its only value.",
    "Negative values are valid: choose minimum total cost, not the fewest steps.",
    "Rows must grow by exactly one entry; malformed triangles are rejected."
  ]
});
