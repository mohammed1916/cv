import { createTraceNarrative } from '../../components/shared/createTraceNarrative.js';

export const palindromeNarrative = createTraceNarrative({
  "goal": "Decide whether a string reads the same forward and backward after ignoring non-alphanumeric characters and case.",
  "strategy": "Normalize once, then compare symmetric positions while shrinking the unchecked middle.",
  "chapters": [
    "Normalize and set bounds",
    "Test symmetry",
    "Shrink the unchecked middle"
  ],
  "blocks": [
    {
      "chapter": 0,
      "lines": [
        2,
        3
      ],
      "why": "Punctuation and case do not affect the required comparison. Pointers delimit the remaining unchecked characters.",
      "next": "Compare the outermost unchecked pair."
    },
    {
      "chapter": 1,
      "lines": [
        4,
        5
      ],
      "why": "One mismatched pair is sufficient to disprove a palindrome; all matching outer pairs can be excluded from further work.",
      "next": "Return false on mismatch; otherwise move inward."
    },
    {
      "chapter": 2,
      "lines": [
        6,
        7
      ],
      "why": "When pointers meet or cross, every required pair has matched.",
      "next": "Return true when no unchecked pair remains."
    }
  ],
  "edgeCases": [
    "An empty normalized string is a palindrome.",
    "A single alphanumeric character needs no pair comparison.",
    "Matching is case-insensitive; punctuation alone cannot cause failure."
  ]
});
