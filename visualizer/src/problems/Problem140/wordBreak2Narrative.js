import { createTraceNarrative } from '../../components/shared/createTraceNarrative.js';

export const wordBreak2Narrative = createTraceNarrative({
  "goal": "Enumerate every sentence made by splitting the string into dictionary words.",
  "strategy": "Memoize all sentence suffixes for each start index and prepend each matching word to every returned suffix.",
  "chapters": [
    "Explore dictionary prefixes",
    "Reuse suffix solutions",
    "Assemble complete sentences"
  ],
  "blocks": [
    {
      "chapter": 0,
      "lines": [
        2,
        3,
        4,
        7,
        8,
        9,
        10,
        11
      ],
      "why": "Every matching prefix is a branch; choosing only one would lose valid sentences.",
      "next": "Solve the remaining suffix."
    },
    {
      "chapter": 1,
      "lines": [
        5,
        6,
        13,
        14
      ],
      "why": "An exhausted suffix has one empty continuation, while an impossible suffix has none. Memoization preserves that distinction.",
      "next": "Return cached or newly collected continuations."
    },
    {
      "chapter": 2,
      "lines": [
        12,
        15,
        16
      ],
      "why": "Combine a prefix with each returned continuation, preserving all valid segmentations rather than just a yes/no answer.",
      "next": "Join each complete word path into a sentence."
    }
  ],
  "edgeCases": [
    "No segmentation returns an empty result list.",
    "Words can be reused at different positions.",
    "A completed suffix returns one empty path so its caller can finish a sentence."
  ]
});
