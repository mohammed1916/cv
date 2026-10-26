import { createTraceNarrative } from './createTraceNarrative.js';

export const perfectPointerNarrative = createTraceNarrative({
  "goal": "Connect each perfect-tree node to its neighbor on the same level.",
  "strategy": "Use the already connected parent row to wire sibling children and bridges between neighboring parents.",
  "chapters": [
    "Connect siblings",
    "Bridge parents",
    "Descend one row"
  ],
  "blocks": [
    {
      "chapter": 0,
      "lines": [
        2,
        5,
        7
      ],
      "why": "In a perfect tree every internal parent has both children, so its left child can point directly to its right child.",
      "next": "Bridge to the next parent when one exists."
    },
    {
      "chapter": 1,
      "lines": [
        9,
        10
      ],
      "why": "The right child connects to the next parent's left child. Following parent next links avoids allocating a queue.",
      "next": "Continue along the parent row."
    },
    {
      "chapter": 2,
      "lines": [
        11,
        12
      ],
      "why": "Once all parents are processed, their children form a complete horizontal chain.",
      "next": "Descend to the leftmost child until reaching leaves."
    }
  ],
  "edgeCases": [
    "An empty tree needs no links.",
    "A single root keeps next = null.",
    "Uneven or missing child structure is rejected for Problem 116; use Problem 117."
  ]
});

export const sparsePointerNarrative = createTraceNarrative({
  "goal": "Connect each node to the next real node at the same depth in a sparse tree.",
  "strategy": "Build the next row as a linked chain using a dummy head and tail, skipping missing children.",
  "chapters": [
    "Start the next-row chain",
    "Append and advance",
    "Enter the constructed row"
  ],
  "blocks": [
    {
      "chapter": 0,
      "lines": [
        2,
        4,
        7
      ],
      "why": "A fresh dummy head records the first real child even when the row has gaps. Missing children add nothing.",
      "next": "Append real children in left-to-right order."
    },
    {
      "chapter": 1,
      "lines": [
        8,
        9,
        10
      ],
      "why": "Tail always identifies the last appended child. Link it to the next real child, then follow the current parent row.",
      "next": "Continue across all parents."
    },
    {
      "chapter": 2,
      "lines": [
        11,
        12
      ],
      "why": "The dummy head identifies the next row without relying on a left child being present.",
      "next": "Repeat until the next row is empty."
    }
  ],
  "edgeCases": [
    "All missing children are skipped.",
    "Links can bridge parents with no children between them.",
    "Repeated node values do not change node identity; empty and single-node trees require no links."
  ]
});
