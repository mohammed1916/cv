import { createTraceNarrative } from '../../components/shared/createTraceNarrative.js';

export const candyNarrative = createTraceNarrative({
  "goal": "Give every child at least one candy and higher-rated neighbors more, using the minimum total.",
  "strategy": "Satisfy left-neighbor constraints in a forward pass, then right-neighbor constraints in a backward pass without undoing the first pass.",
  "chapters": [
    "Give each child one",
    "Satisfy the left neighbor",
    "Satisfy both neighbors"
  ],
  "blocks": [
    {
      "chapter": 0,
      "lines": [
        2,
        3
      ],
      "why": "One candy is the lower bound for every child, regardless of rating.",
      "next": "Scan left to right for rising ratings."
    },
    {
      "chapter": 1,
      "lines": [
        4,
        5,
        6
      ],
      "why": "When a rating rises above its left neighbor, one extra candy over that neighbor is necessary.",
      "next": "Scan backward to handle descending runs."
    },
    {
      "chapter": 2,
      "lines": [
        7,
        8,
        9,
        10
      ],
      "why": "Take the maximum of the existing allocation and the right-neighbor requirement so the backward pass preserves earlier constraints.",
      "next": "Sum the allocation after both passes."
    }
  ],
  "edgeCases": [
    "Equal ratings impose no relative candy requirement.",
    "A single child needs one candy.",
    "At a peak, both neighbors matter; overwriting instead of taking max can violate the first pass."
  ]
});
