import { createTraceNarrative } from '../../components/shared/createTraceNarrative.js';

export const detectCycle2Narrative = createTraceNarrative({
  "goal": "Return the entry node of a linked-list cycle, or null if no cycle exists.",
  "strategy": "First find a slow/fast meeting; then move one pointer from the head and one from the meeting at equal speed to find the entry.",
  "chapters": [
    "Find a meeting",
    "Align distances to entry",
    "Locate the entry"
  ],
  "blocks": [
    {
      "chapter": 0,
      "lines": [
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9
      ],
      "why": "The first meeting establishes a cycle but is not necessarily its entry. Null termination rules out a cycle.",
      "next": "After a meeting, place a pointer at the head."
    },
    {
      "chapter": 1,
      "lines": [
        10,
        11,
        12
      ],
      "why": "Cycle-distance arithmetic makes the head-to-entry distance match the meeting-to-entry distance modulo the cycle length.",
      "next": "Move both pointers one node at a time."
    },
    {
      "chapter": 2,
      "lines": [
        13,
        14,
        15
      ],
      "why": "Equal-speed pointers now meet at the cycle entry, including when the entry is already the head.",
      "next": "Return the meeting node by identity."
    }
  ],
  "edgeCases": [
    "A no-cycle list returns null.",
    "A self-loop has its only node as entry.",
    "The first slow/fast meeting can differ from the entry; duplicate values are irrelevant."
  ]
});
