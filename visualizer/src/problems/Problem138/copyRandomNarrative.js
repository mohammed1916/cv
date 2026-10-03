import { createTraceNarrative } from '../../components/shared/createTraceNarrative.js';

export const copyRandomNarrative = createTraceNarrative({
  "goal": "Deep-copy a linked list including next links and arbitrary random links, then restore the original list.",
  "strategy": "Insert each clone beside its original, use that adjacency to resolve random targets, then separate the two lists.",
  "chapters": [
    "Interleave clones",
    "Resolve random targets",
    "Separate and restore"
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
        8
      ],
      "why": "Placing a clone immediately after its original creates a direct original-to-clone lookup without a separate map.",
      "next": "Once every clone exists, copy random pointers."
    },
    {
      "chapter": 1,
      "lines": [
        9,
        10,
        11,
        12,
        13
      ],
      "why": "The clone of any random target is that target's next node, even if the target is earlier or points to itself.",
      "next": "Walk originals by skipping their inserted clones."
    },
    {
      "chapter": 2,
      "lines": [
        14,
        15,
        16,
        17,
        18,
        19,
        20,
        21,
        22
      ],
      "why": "Restore original next links while connecting clones together; the returned list must share no nodes with the original.",
      "next": "Return the saved clone head."
    }
  ],
  "edgeCases": [
    "An empty list returns null.",
    "Null random links stay null.",
    "Self-random links and backward random links must target clones, never originals."
  ]
});
