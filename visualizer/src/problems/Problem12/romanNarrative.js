import { createTraceNarrative } from '../../components/shared/createTraceNarrative.js';

export const romanNarrative = createTraceNarrative({
  "goal": "Convert an integer from 1 through 3999 into canonical Roman numerals.",
  "strategy": "Consume the largest fitting token, including subtractive pairs, then continue with the remaining value.",
  "chapters": [
    "Order the token choices",
    "Consume one token",
    "Complete the numeral"
  ],
  "blocks": [
    {
      "chapter": 0,
      "lines": [
        2,
        3,
        4,
        5,
        6
      ],
      "why": "Subtractive tokens such as CM and IV must appear before smaller additive tokens to produce canonical notation.",
      "next": "Choose the largest token that fits the remainder."
    },
    {
      "chapter": 1,
      "lines": [
        7,
        8
      ],
      "why": "Appending a symbol represents its value; subtract that value from the remainder before trying it again.",
      "next": "Repeat the token while it fits, otherwise advance."
    },
    {
      "chapter": 2,
      "lines": [
        9
      ],
      "why": "A zero remainder means the appended tokens represent the entire original value.",
      "next": "Return the completed numeral."
    }
  ],
  "edgeCases": [
    "1 becomes I.",
    "4 and 9 use subtractive pairs, not four repeated symbols.",
    "Zero, negative values and values above 3999 are outside this converter."
  ]
});
