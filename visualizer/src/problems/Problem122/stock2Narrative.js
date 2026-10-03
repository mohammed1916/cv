import { createTraceNarrative } from '../../components/shared/createTraceNarrative.js';

export const stock2Narrative = createTraceNarrative({
  "goal": "Maximize profit with any number of non-overlapping buy/sell transactions.",
  "strategy": "Collect each positive day-to-day rise; adjacent rises telescope into the same profit as holding through an increasing run.",
  "chapters": [
    "Start with no trades",
    "Identify profitable rises",
    "Accumulate gains"
  ],
  "blocks": [
    {
      "chapter": 0,
      "lines": [
        2
      ],
      "why": "Zero profit preserves the option of doing nothing.",
      "next": "Inspect neighboring prices."
    },
    {
      "chapter": 1,
      "lines": [
        3,
        4
      ],
      "why": "A falling or flat pair adds no profit; rising pairs can be included without holding multiple shares.",
      "next": "Add a positive difference, otherwise continue."
    },
    {
      "chapter": 2,
      "lines": [
        5,
        6
      ],
      "why": "Summing positive differences captures every upward run without paying for intervening drops.",
      "next": "Continue until every adjacent pair has been considered."
    }
  ],
  "edgeCases": [
    "One price gives no opportunity to sell later.",
    "Flat or decreasing prices yield zero.",
    "Multiple rises separated by drops require separate trades, unlike the one-transaction problem."
  ]
});
