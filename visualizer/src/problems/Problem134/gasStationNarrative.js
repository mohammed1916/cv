import { createTraceNarrative } from '../../components/shared/createTraceNarrative.js';

export const gasStationNarrative = createTraceNarrative({
  "goal": "Find a starting station that can complete one full circuit, or show that no start works.",
  "strategy": "Track global fuel feasibility separately from the fuel balance of the current candidate segment.",
  "chapters": [
    "Check total feasibility",
    "Accumulate the segment balance",
    "Eliminate failed starts"
  ],
  "blocks": [
    {
      "chapter": 0,
      "lines": [
        1,
        2,
        3
      ],
      "why": "If total gas is less than total cost, changing the start cannot fix the shortage.",
      "next": "For a feasible total, test a candidate start."
    },
    {
      "chapter": 1,
      "lines": [
        4,
        5,
        6,
        7
      ],
      "why": "The current tank measures whether this start can reach the next station; the total balance concerns the entire circuit.",
      "next": "If the segment balance becomes negative, abandon this candidate segment."
    },
    {
      "chapter": 2,
      "lines": [
        8,
        9,
        10
      ],
      "why": "When the tank first becomes negative, no station inside that candidate segment can rescue it; start after the failure and reset the local tank.",
      "next": "Continue scanning and return a feasible candidate if the total permits it."
    }
  ],
  "edgeCases": [
    "Total gas below total cost means no solution.",
    "One station works exactly when its gas covers its cost.",
    "A zero local balance is allowed; reset only when it is negative."
  ]
});
