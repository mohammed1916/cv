import { createTraceNarrative } from '../../components/shared/createTraceNarrative.js';

export const surroundedNarrative = createTraceNarrative({
  "goal": "Capture O regions that have no four-directional connection to the board boundary.",
  "strategy": "Prove which O cells can escape from boundary seeds, then flip only the unmarked O cells.",
  "chapters": [
    "Seed escape routes",
    "Mark reachable cells",
    "Capture enclosed regions"
  ],
  "blocks": [
    {
      "chapter": 0,
      "lines": [
        1,
        2,
        3,
        9,
        10,
        11,
        12
      ],
      "why": "Any boundary O is safe, including corners. Flooding from these seeds discovers all escape-connected cells.",
      "next": "Traverse each reachable O before the final sweep."
    },
    {
      "chapter": 1,
      "lines": [
        4,
        5,
        6,
        7,
        8
      ],
      "why": "Marking a cell before visiting neighbors prevents cycles and repeated visits. Only vertical and horizontal adjacency provides escape.",
      "next": "Visit its four neighbors; stop at walls, marked cells or out-of-bounds positions."
    },
    {
      "chapter": 2,
      "lines": [
        13,
        14,
        15,
        16
      ],
      "why": "After boundary searches finish, remaining O cells cannot escape. Restore safe marks to O while capturing the rest.",
      "next": "Finish the sweep to produce the final board."
    }
  ],
  "edgeCases": [
    "A single row or column consists entirely of boundary cells.",
    "Diagonal contact does not make an enclosed region safe.",
    "An all-X board has nothing to capture; an all-O board remains safe."
  ]
});
