import { createTraceNarrative } from '../../components/shared/createTraceNarrative.js';

export const stock3Narrative = createTraceNarrative({
  "goal": "Find the largest profit using at most two completed stock transactions.",
  "strategy": "Keep four best balances: holding after the first buy, cash after the first sale, holding after the second buy, and cash after the second sale.",
  "chapters": [
    "Initialize balances",
    "Fund the first transaction",
    "Fund the second transaction"
  ],
  "blocks": [
    {
      "chapter": 0,
      "lines": [
        2,
        3,
        4
      ],
      "why": "Impossible holding states start at negative infinity; cash states start at zero so fewer than two trades remain allowed.",
      "next": "Evaluate the first transaction states for this price."
    },
    {
      "chapter": 1,
      "lines": [
        5,
        6
      ],
      "why": "The first buy spends cash; the first sale converts that holding into profit. Retain the better previous or new balance.",
      "next": "Use the first-sale balance to evaluate a second purchase."
    },
    {
      "chapter": 2,
      "lines": [
        7,
        8,
        9
      ],
      "why": "The second buy is paid from first-sale proceeds. The second sale tracks total profit across both transactions.",
      "next": "Continue through prices and return the best second-sale cash balance."
    }
  ],
  "edgeCases": [
    "Decreasing prices return zero because trading is optional.",
    "A single profitable rise needs only one transaction.",
    "Same-day state updates allow zero-gain transitions; they do not create extra profit."
  ]
});
