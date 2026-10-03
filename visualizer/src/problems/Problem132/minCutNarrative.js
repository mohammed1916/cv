import { createTraceNarrative } from '../../components/shared/createTraceNarrative.js';

export const minCutNarrative = createTraceNarrative({
  "goal": "Find the fewest cuts that partition a string into palindromes.",
  "strategy": "Expand around odd and even centers; each palindrome can finish an optimal partition of a prefix.",
  "chapters": [
    "Seed worst-case cuts",
    "Expand palindrome centers",
    "Improve the cut count"
  ],
  "blocks": [
    {
      "chapter": 0,
      "lines": [
        2,
        3,
        4
      ],
      "why": "Cutting between every pair of characters always works. This provides an upper bound to improve.",
      "next": "Try both odd and even centers."
    },
    {
      "chapter": 1,
      "lines": [
        6,
        7,
        9,
        11,
        12,
        14
      ],
      "why": "A matching outer pair extends a known palindrome; a mismatch or boundary ends this expansion.",
      "next": "Use each discovered palindrome to improve a prefix cost."
    },
    {
      "chapter": 2,
      "lines": [
        8,
        13,
        15
      ],
      "why": "A palindrome starting at zero needs no cut. Otherwise add one cut after the best partition ending just before it.",
      "next": "Keep the minimum and return the cost for the whole string."
    }
  ],
  "edgeCases": [
    "One character needs zero cuts; this visualizer rejects empty input.",
    "A whole-string palindrome also needs zero cuts.",
    "Even palindromes such as abba require a center between characters."
  ]
});
