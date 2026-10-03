import { createTraceNarrative } from '../../components/shared/createTraceNarrative.js';

export const divideNarrative = createTraceNarrative({
  "goal": "Divide two signed 32-bit integers with a result truncated toward zero.",
  "strategy": "Subtract doubled divisor magnitudes to build quotient bits, then restore the sign and handle the overflow exception.",
  "chapters": [
    "Handle sign and overflow",
    "Grow a power-of-two chunk",
    "Consume and accumulate"
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
      "why": "The minimum integer divided by minus one exceeds the positive 32-bit range. Other inputs can be processed as nonnegative magnitudes.",
      "next": "Find a divisor chunk that fits the remaining magnitude."
    },
    {
      "chapter": 1,
      "lines": [
        7,
        8,
        9,
        10,
        11
      ],
      "why": "Doubling the chunk and its quotient contribution removes many divisor copies at once without multiplying or dividing.",
      "next": "Stop doubling before the chunk exceeds the remainder."
    },
    {
      "chapter": 2,
      "lines": [
        12,
        13,
        14
      ],
      "why": "Subtracting a fitting chunk reduces the remainder and adds its matching count to the quotient. The final sign gives truncation toward zero.",
      "next": "Repeat until the remainder is smaller than the divisor."
    }
  ],
  "edgeCases": [
    "Division by zero is rejected.",
    "Zero dividend returns zero.",
    "-2147483648 / -1 clamps to 2147483647; a negative fractional result truncates toward zero."
  ]
});
