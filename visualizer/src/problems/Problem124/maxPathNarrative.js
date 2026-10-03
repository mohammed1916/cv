import { createTraceNarrative } from '../../components/shared/createTraceNarrative.js';

export const maxPathNarrative = createTraceNarrative({
  "goal": "Find the maximum sum of a nonempty path in a binary tree.",
  "strategy": "Each node evaluates a path joining both children, but returns only one branch so its parent can still form a simple path.",
  "chapters": [
    "Collect useful child gains",
    "Evaluate a turning point",
    "Return an extendable branch"
  ],
  "blocks": [
    {
      "chapter": 0,
      "lines": [
        2,
        5,
        6,
        7
      ],
      "why": "Negative child gains are discarded because they reduce the sum. The global best starts below every node value, not at zero.",
      "next": "Combine the nonnegative child gains at this node."
    },
    {
      "chapter": 1,
      "lines": [
        8,
        9
      ],
      "why": "A path may turn from the left subtree through this node to the right subtree; compare this full path against the global best.",
      "next": "Pass only one branch upward."
    },
    {
      "chapter": 2,
      "lines": [
        10,
        11,
        12
      ],
      "why": "Returning both branches would create a fork when attached to a parent. Only the better single branch can extend upward.",
      "next": "Continue postorder processing until the global best is final."
    }
  ],
  "edgeCases": [
    "For all-negative nodes, the answer is the least negative node, not zero.",
    "A single node is itself a valid path.",
    "The best path need not pass through the root."
  ]
});
