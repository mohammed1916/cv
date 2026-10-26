export const maxPathNarrative = {
  goal: "Find the maximum path sum of any non-empty path in a binary tree, evaluating turnaround paths at each node during a post-order DFS.",
  chapters: [
    "Explore subtree branch gains",
    "Compute turnaround path at apex",
    "Update global max sum",
    "Pass single branch gain upward",
  ],
  ready: {
    why: "At each node, the turnaround path connects the best left branch, the node itself, and the best right branch (clamping negative branch gains to 0). The function returns only a single branch (node.val + max(left, right)) upward to the parent.",
    achieved: "Tree traversal not started yet.",
    next: "Initialize max_sum = -∞ and start post-order traversal at root.",
  },
  phases: {
    init: {
      chapter: 0,
      why: "Set max_sum = -∞ so any valid node path can establish the initial best.",
      achieved: "max_sum initialized to -∞.",
      next: "Begin post-order DFS from root node.",
    },
    recurse: ({ step }) => ({
      chapter: 0,
      why: "Recursively compute maximum branch gain from child subtree (clamping negative gains to 0).",
      achieved: `At node ${step.nodeVal}: exploring child subtrees.`,
      next: "Retrieve child gain contributions.",
    }),
    compute: ({ step }) => ({
      chapter: 1,
      why: "Calculate turnaround path with current node as apex: path = node.val + left + right.",
      achieved: `Turnaround path at node ${step.nodeVal}: ${step.nodeVal} + ${step.leftGain} (left) + ${step.rightGain} (right) = ${step.pathThrough}.`,
      next: "Compare turnaround path against global max_sum.",
    }),
    update: ({ step }) => ({
      chapter: 2,
      why: "Update global max_sum = max(max_sum, path).",
      achieved: `Global max_sum is now ${step.maxSum}.`,
      next: "Calculate single-branch gain to return to parent.",
    }),
    return: ({ step }) => ({
      chapter: 3,
      why: "A path continuing upward to the parent can only choose ONE branch: return node.val + max(left, right).",
      achieved: `Node ${step.nodeVal} returns single-branch gain: ${step.singleBranchGain}.`,
      next: "Return to caller in DFS call stack.",
    }),
    done: ({ step }) => ({
      chapter: 3,
      why: "Post-order DFS complete; all possible turnaround paths evaluated.",
      achieved: `Maximum path sum in tree is ${step.maxSum} (path: [${step.bestPathValues?.join(" → ")}]).`,
      next: "Try another tree with negative numbers or different topologies.",
    }),
  },
  lines: {
    2: {
      chapter: 0,
      why: "max_sum = float('-inf'): initialize tracker.",
      achieved: "max_sum = -∞.",
      next: "Call gain(root).",
    },
    6: ({ step }) => ({
      chapter: 0,
      why: "left = max(gain(node.left), 0).",
      achieved: `Left gain for node ${step.nodeVal}: ${step.leftGain ?? "evaluating"}.`,
      next: "Evaluate right child.",
    }),
    7: ({ step }) => ({
      chapter: 0,
      why: "right = max(gain(node.right), 0).",
      achieved: `Right gain for node ${step.nodeVal}: ${step.rightGain ?? "evaluating"}.`,
      next: "Calculate turnaround path sum.",
    }),
    8: ({ step }) => ({
      chapter: 1,
      why: "path = node.val + left + right.",
      achieved: `Turnaround sum = ${step.pathThrough}.`,
      next: "Update max_sum.",
    }),
    9: ({ step }) => ({
      chapter: 2,
      why: "max_sum = max(max_sum, path).",
      achieved: `max_sum = ${step.maxSum}.`,
      next: "Return single-branch gain.",
    }),
    10: ({ step }) => ({
      chapter: 3,
      why: "return node.val + max(left, right).",
      achieved: `Single-branch gain: ${step.singleBranchGain}.`,
      next: "Ascend DFS call stack.",
    }),
    12: ({ step }) => ({
      chapter: 3,
      why: "return max_sum.",
      achieved: `Final max path sum: ${step.maxSum}.`,
      next: "Completed.",
    }),
  },
};
