import { createTraceNarrative } from '../../components/shared/createTraceNarrative.js';

export const wordBreakNarrative = createTraceNarrative({
  "goal": "Decide whether the whole string can be segmented into dictionary words.",
  "strategy": "Prove reachable prefixes: a valid split needs both a segmentable earlier prefix and a dictionary suffix.",
  "chapters": [
    "Seed the empty prefix",
    "Test a split",
    "Store prefix feasibility"
  ],
  "blocks": [
    {
      "chapter": 0,
      "lines": [
        2,
        3,
        4
      ],
      "why": "The empty prefix is reachable without any words, allowing the first dictionary word to start at index zero.",
      "next": "Consider successively longer prefixes."
    },
    {
      "chapter": 1,
      "lines": [
        5,
        6,
        7
      ],
      "why": "A dictionary match alone is insufficient if the prefix before it cannot be segmented. Both conditions must hold.",
      "next": "Mark the prefix reachable when a valid split is found."
    },
    {
      "chapter": 2,
      "lines": [
        8,
        9,
        10
      ],
      "why": "One successful split proves existence, so this boolean problem can stop checking that prefix.",
      "next": "Continue to the whole-string prefix and return its feasibility."
    }
  ],
  "edgeCases": [
    "Dictionary words may be reused.",
    "A dictionary suffix following an unreachable prefix does not prove success.",
    "An impossible final suffix can make the whole string fail even when earlier prefixes are reachable."
  ]
});
