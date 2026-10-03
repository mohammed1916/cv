import { createTraceNarrative } from '../../components/shared/createTraceNarrative.js';

export const singleNumber2Narrative = createTraceNarrative({
  "goal": "Recover the single value when all other values occur three times.",
  "strategy": "Two bit masks encode occurrence counts modulo three; each bit cycles through zero, one and two appearances.",
  "chapters": [
    "Initialize two masks",
    "Update once-seen bits",
    "Update twice-seen bits"
  ],
  "blocks": [
    {
      "chapter": 0,
      "lines": [
        2,
        3
      ],
      "why": "Both masks start clear because no bit has been observed. The masks count bits, not whole numbers.",
      "next": "Update the once-seen mask for the next number."
    },
    {
      "chapter": 1,
      "lines": [
        4
      ],
      "why": "XOR toggles incoming bits; excluding the old twos mask clears bits reaching their third occurrence.",
      "next": "Update twos using the newly computed ones mask."
    },
    {
      "chapter": 2,
      "lines": [
        5,
        6
      ],
      "why": "Twos must use the updated ones mask so each bit occupies at most one state; after triples cancel, ones holds the answer.",
      "next": "Process the next number or return ones."
    }
  ],
  "edgeCases": [
    "A single number survives unchanged.",
    "Negative answers use signed 32-bit representation, including the sign bit.",
    "The guarantee requires triples plus exactly one single; other frequencies need not yield a single element."
  ]
});
