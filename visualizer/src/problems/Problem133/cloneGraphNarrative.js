import { createTraceNarrative } from '../../components/shared/createTraceNarrative.js';

export const cloneGraphNarrative = createTraceNarrative({
  "goal": "Create a separate graph preserving the reachable nodes and their neighbor relationships.",
  "strategy": "Keep one clone per original node and explore originals with a queue; reuse clones when cycles lead back to known nodes.",
  "chapters": [
    "Create the first clone",
    "Discover unseen nodes",
    "Rebuild clone edges"
  ],
  "blocks": [
    {
      "chapter": 0,
      "lines": [
        1,
        2,
        3,
        4,
        5
      ],
      "why": "A null start has no graph to clone. Register the first clone before traversing edges.",
      "next": "Process the first original node from the queue."
    },
    {
      "chapter": 1,
      "lines": [
        6,
        7,
        8,
        9,
        10,
        11
      ],
      "why": "Register each new clone before enqueueing its original; cycles must reuse the existing clone rather than recurse forever.",
      "next": "Copy the current neighbor relationship."
    },
    {
      "chapter": 2,
      "lines": [
        12,
        13
      ],
      "why": "Both endpoints must be cloned objects. Repeated visits reuse nodes while preserving the graph connections.",
      "next": "Continue until no reachable original remains queued."
    }
  ],
  "edgeCases": [
    "An empty graph returns no node.",
    "An isolated node still needs a distinct clone.",
    "Cycles must reuse existing clones. This representation identifies nodes by their unique labels."
  ]
});
