import { createTraceNarrative } from '../../components/shared/createTraceNarrative.js';

export const romanToIntNarrative = createTraceNarrative({
  "goal": "Convert a valid Roman numeral into its integer value.",
  "strategy": "Use one-symbol lookahead: subtract a smaller value before a larger value, and add otherwise.",
  "chapters": [
    "Read current and next values",
    "Choose the signed contribution",
    "Return the total"
  ],
  "blocks": [
    {
      "chapter": 0,
      "lines": [
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9
      ],
      "why": "One lookahead is enough to distinguish additive symbols from the leading symbol of a subtractive pair.",
      "next": "Compare the two values."
    },
    {
      "chapter": 1,
      "lines": [
        10,
        11,
        12,
        13
      ],
      "why": "Subtracting I before V and then adding V yields four; the larger symbol is still processed on the next iteration.",
      "next": "Advance one symbol, keeping the accumulated total."
    },
    {
      "chapter": 2,
      "lines": [
        14
      ],
      "why": "Every symbol now contributes exactly once with the sign determined by its successor.",
      "next": "Return the integer."
    }
  ],
  "edgeCases": [
    "The last symbol compares against zero and is added.",
    "Repeated additive symbols such as III all contribute positively.",
    "Only canonical numerals in the supported range are accepted; malformed subtraction is rejected."
  ]
});
