import { createTraceNarrative } from '../../components/shared/createTraceNarrative.js';

export const hasCycleNarrative = createTraceNarrative({
  "goal": "Determine whether following next pointers eventually revisits a linked-list node.",
  "strategy": "Move slow by one link and fast by two; a cycle forces their positions to coincide, while a null link proves termination.",
  "chapters": [
    "Check safe advancement",
    "Create relative motion",
    "Conclude from the witness"
  ],
  "blocks": [
    {
      "chapter": 0,
      "lines": [
        2,
        3
      ],
      "why": "Fast and fast.next must exist before taking two steps; reaching null proves there is no cycle.",
      "next": "Advance the pointers only when both links are safe."
    },
    {
      "chapter": 1,
      "lines": [
        4,
        5,
        6
      ],
      "why": "Inside a cycle fast gains one position per iteration on slow, eventually closing their separation. Compare node identity, not values.",
      "next": "Check for a meeting after both moves."
    },
    {
      "chapter": 2,
      "lines": [
        7,
        8
      ],
      "why": "A meeting after movement proves a cycle; reaching the end proves an acyclic list.",
      "next": "Return the corresponding boolean."
    }
  ],
  "edgeCases": [
    "An empty list has no cycle.",
    "A single node can be acyclic or point to itself.",
    "Repeated values do not imply repeated node identity."
  ]
});
