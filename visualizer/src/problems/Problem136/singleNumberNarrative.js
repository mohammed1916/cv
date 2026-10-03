import { createTraceNarrative } from '../../components/shared/createTraceNarrative.js';

export const singleNumberNarrative = createTraceNarrative({
  "goal": "Find the lone value when every other value appears exactly twice.",
  "strategy": "XOR is associative and commutative: paired values cancel even when separated, leaving the unpaired value.",
  "chapters": [
    "Start at the XOR identity",
    "Accumulate parity",
    "Interpret the final XOR"
  ],
  "blocks": [
    {
      "chapter": 0,
      "lines": [
        2
      ],
      "why": "Zero changes no bits under XOR, so it is the correct empty-prefix accumulator.",
      "next": "Read the first value."
    },
    {
      "chapter": 1,
      "lines": [
        3,
        4
      ],
      "why": "Every occurrence toggles its bits. Two occurrences cancel as whole values, regardless of their positions.",
      "next": "Continue until every value has contributed."
    },
    {
      "chapter": 2,
      "lines": [
        5
      ],
      "why": "Under the one-single-and-pairs contract, all paired contributions cancel and only the single value remains.",
      "next": "Return that value."
    }
  ],
  "edgeCases": [
    "A one-element array returns that element.",
    "Zero and negative 32-bit integers work with XOR.",
    "If the input violates the frequency contract, the trace still computes XOR but that result need not be a unique element."
  ]
});
