export const triangleNarrative = {
  goal: "Find the minimum path sum from top to bottom in a triangle by moving only to adjacent numbers in the row below, using bottom-up dynamic programming.",
  chapters: [
    "Initialize bottom-row base case",
    "Compare adjacent bottom options",
    "Relax parent cell cost",
    "Root minimum path sum",
  ],
  ready: {
    why: "Bottom-up DP computes subproblems without recursion or extra memoization: starting at the base row, each cell (i, j) chooses the minimum of its two adjacent children dp[j] and dp[j+1].",
    achieved: "DP table not initialized yet.",
    next: "Copy the bottom row into the 1D DP table.",
  },
  phases: {
    init: ({ step }) => ({
      chapter: 0,
      why: "Copy the bottom row of the triangle as the initial DP array: base cases need no further steps below them.",
      achieved: `DP table initialized with bottom row: [${step.dp?.join(", ")}].`,
      next: "Begin relaxing rows from bottom-1 up to the top.",
    }),
    compare: ({ step }) => ({
      chapter: 1,
      why: "From cell (i, j), look at the two accessible adjacent cells in row i+1 (indices j and j+1).",
      achieved: `Cell (${step.currentRow}, ${step.currentCol}): child below left is ${step.comparing?.left?.val}, child below right is ${step.comparing?.right?.val}.`,
      next: "Pick the smaller of the two adjacent values and add the current cell’s value.",
    }),
    update: ({ step }) => ({
      chapter: 2,
      why: "dp[j] = triangle[i][j] + min(dp[j], dp[j+1]): store the minimum total path sum starting from this cell.",
      achieved: `Updated dp[${step.currentCol}] = ${step.dp?.[step.currentCol]}.`,
      next: "Move to the next cell in this row or move up one row.",
    }),
    done: ({ step }) => ({
      chapter: 3,
      why: "All rows processed up to the apex; dp[0] contains the global minimum path sum from top to bottom.",
      achieved: `Minimum path sum is ${step.dp?.[0]}.`,
      next: "Try another triangle with different positive or negative values.",
    }),
  },
  lines: {
    3: {
      chapter: 0,
      why: "dp = triangle[-1][:]: initialize DP with the bottom row.",
      achieved: "Bottom row copied to DP table.",
      next: "Loop backwards from row len(triangle)-2 down to 0.",
    },
    5: ({ step }) => ({
      chapter: 1,
      why: "Compare dp[j] and dp[j+1].",
      achieved: `Evaluating cell (${step.currentRow}, ${step.currentCol}).`,
      next: "Compute min of children and add cell value.",
    }),
    6: ({ step }) => ({
      chapter: 2,
      why: "dp[j] = triangle[i][j] + min(dp[j], dp[j+1]).",
      achieved: `dp[${step.currentCol}] = ${step.dp?.[step.currentCol]}.`,
      next: "Continue loop.",
    }),
    7: ({ step }) => ({
      chapter: 3,
      why: "return dp[0].",
      achieved: `Final minimum path sum: ${step.dp?.[0]}.`,
      next: "Completed.",
    }),
  },
};
