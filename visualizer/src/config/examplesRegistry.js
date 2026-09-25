/**
 * Central registry for example inputs across all problems.
 * Each problem has its own examples array with label and problem-specific fields.
 *
 * Independently constructed preset examples that exercise the visualizations well.
 */

export const EXAMPLES_REGISTRY = {
  "01-matrix": [
    {
      label: "Example 1",
      mat: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
    {
      label: "Example 2",
      mat: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
  ],
  "132-pattern": [
    {
      label: "Example 1",
      nums: "learning algorithm structures",
    },
    {
      label: "Example 2",
      nums: "interactive computational stepping",
    },
    {
      label: "Example 3",
      nums: "efficient dynamic programming state",
    },
  ],
  "4sum-ii": [
    {
      label: "Example 1",
      nums: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
      target: 16,
    },
    {
      label: "Example 2",
      nums: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
      target: 20,
    },
  ],
  "add-binary": [
    {
      label: "Example 1",
      a: "1101",
      b: "101",
    },
    {
      label: "Example 2",
      a: "10110",
      b: "1101",
    },
    {
      label: "Example 3",
      a: "10110",
      b: "1101",
    },
    {
      label: "Example 4",
      a: "10110",
      b: "1101",
    },
    {
      label: "Example 5",
      a: "10110",
      b: "1101",
    },
  ],
  "add-two-numbers": [
    {
      label: "Example 1",
      l1: [3, 7, 3],
      l2: [3, 7, 3],
    },
    {
      label: "Example 2",
      l1: [6, 2, 6, 2, 6],
      l2: [6, 2, 6, 2, 6],
    },
    {
      label: "Example 3",
      l1: [1, 5, 1],
      l2: [1, 5, 1],
    },
    {
      label: "Example 4",
      l1: [4, 8, 4, 8],
      l2: [4, 8, 4, 8],
    },
  ],
  "add-two-numbers-ii": [
    {
      label: "Example 1",
      l1: [6, 2, 6, 2],
      l2: [6, 2, 6, 2],
    },
    {
      label: "Example 2",
      l1: [1, 5, 1],
      l2: [1, 5, 1],
    },
  ],
  "additive-number": [
    {
      label: "Example 1",
      num: "learning algorithm structures",
    },
    {
      label: "Example 2",
      num: "interactive computational stepping",
    },
  ],
  "all-o1-data-structure": [
    {
      label: "Example 1",
      operations: [
        ["C", "A", "T"],
        ["D", "O", "G"],
        ["B", "A", "T"],
      ],
    },
    {
      label: "Example 2",
      operations: [
        ["C", "A", "T"],
        ["D", "O", "G"],
        ["B", "A", "T"],
      ],
    },
  ],
  "arithmetic-slices-ii": [
    {
      label: "Example 1",
      nums: [11, 18, 25, 32],
      expected: 41,
    },
    {
      label: "Example 2",
      nums: [18, 25, 32, 6, 15, 24],
      expected: 43,
    },
    {
      label: "Example 3",
      nums: [25, 32, 4, 11, 18, 25],
      expected: 22,
    },
  ],
  "arithmetic-slices-ii-subsequence": [
    {
      label: "Example 1",
      nums: [11, 18, 25, 32],
      expected: 41,
    },
    {
      label: "Example 2",
      nums: [18, 25, 32, 6, 15, 24],
      expected: 43,
    },
    {
      label: "Example 3",
      nums: [25, 32, 4, 11, 18, 25],
      expected: 22,
    },
  ],
  "arranging-coins": [
    {
      label: "Example 1",
      n: 4,
    },
    {
      label: "Example 2",
      n: 5,
    },
  ],
  "assign-cookies": [
    {
      label: "Example 1",
      greed: [3, 10, 17],
      cookies: [3, 8],
    },
    {
      label: "Example 2",
      greed: [10, 17],
      cookies: [10, 17, 24],
    },
  ],
  "balanced-binary-tree": [
    {
      label: "Example 1",
      arr: [22, 4, 31, null, null, 1, 25],
    },
    {
      label: "Example 2",
      arr: [25, 32, 2, 9, 14, null, null, 31, 1],
    },
    {
      label: "Example 3",
      arr: [32],
    },
    {
      label: "Example 4",
      arr: [4, 11, 18, 25, 32, 4, 11],
    },
  ],
  "basic-calculator": [
    {
      label: "Example 1",
      s: "efficient dynamic programming state",
    },
    {
      label: "Example 2",
      s: "graph search traversal tree",
    },
    {
      label: "Example 3",
      s: "monotonic stack queue balance",
    },
  ],
  "basic-calculator-ii": [
    {
      label: "Example 1",
      expr: "two pointer sliding window",
    },
    {
      label: "Example 2",
      expr: "learning algorithm structures",
    },
    {
      label: "Example 3",
      expr: "interactive computational stepping",
    },
  ],
  "beautiful-arrangement": [
    {
      label: "Example 1",
      n: 4,
    },
    {
      label: "Example 2",
      n: 5,
    },
    {
      label: "Example 3",
      n: 6,
    },
  ],
  "best-time-buy-sell-stock": [
    {
      label: "Example 1",
      prices: [29, 22, 35, 1, 12, 13],
    },
    {
      label: "Example 2",
      prices: [1, 4, 5, 8, 9],
    },
    {
      label: "Example 3",
      prices: [31, 3, 10, 17, 24],
    },
    {
      label: "Example 4",
      prices: [7, 8, 19, 18, 31, 9, 35, 13],
    },
  ],
  "best-time-buy-sell-stock-iii": [
    {
      label: "Example 1",
      prices: [35, 5, 14, 9, 14, 25, 26, 2],
    },
    {
      label: "Example 2",
      prices: [3, 10, 17, 24, 31],
    },
    {
      label: "Example 3",
      prices: [22, 25, 26, 29, 30],
    },
  ],
  "best-time-buy-sell-stock-iv": [
    {
      label: "Example 1",
      k: 2,
      prices: [14, 17, 30, 33, 28, 4],
    },
    {
      label: "Example 2",
      k: 3,
      prices: [21, 26, 35, 30, 35, 11, 12, 23],
    },
    {
      label: "Example 3",
      k: 4,
      prices: [24, 31, 3, 10, 17],
    },
  ],
  "best-time-to-buy-and-sell-stock": [
    {
      label: "Example 1",
    },
    {
      label: "Example 2",
      input: "efficient dynamic programming state",
    },
    {
      label: "Example 3",
      input: "graph search traversal tree",
    },
  ],
  "best-time-to-buy-and-sell-stock-ii": [
    {
      label: "Example 1",
      input: "efficient dynamic programming state",
    },
    {
      label: "Example 2",
      input: "graph search traversal tree",
    },
    {
      label: "Example 3",
      input: "monotonic stack queue balance",
    },
    {
      label: "Example 4",
      input: "two pointer sliding window",
    },
    {
      label: "Example 5",
      input: "learning algorithm structures",
    },
    {
      label: "Example 6",
      input: "interactive computational stepping",
    },
  ],
  "best-time-to-buy-and-sell-stock-iii": [
    {
      label: "Example 1",
      input: "graph search traversal tree",
    },
    {
      label: "Example 2",
      input: "monotonic stack queue balance",
    },
    {
      label: "Example 3",
      input: "two pointer sliding window",
    },
  ],
  "binary-search": [
    {
      label: "Example 1",
      nums: [11, 18, 29, 3, 16, 27],
      target: 16,
    },
    {
      label: "Example 2",
      nums: [18, 25, 1, 10, 23, 34],
      target: 20,
    },
    {
      label: "Example 3",
      nums: [25, 32, 8, 17, 30, 6],
      target: 24,
    },
    {
      label: "Example 4",
      nums: [9],
      target: 28,
    },
  ],
  "binary-tree-level-order": [
    {
      label: "Example 1",
      arr: [35, 17, 9, null, null, 14, 3],
    },
    {
      label: "Example 2",
      arr: [3, 10, 17, 24, 31, 3, 10],
    },
    {
      label: "Example 3",
      arr: [10, 17, null, 29, null, 6],
    },
    {
      label: "Example 4",
      arr: [17],
    },
  ],
  "binary-tree-level-order-ii": [
    {
      label: "Example 1",
      root: [28, 10, 2, null, null, 7, 31],
    },
    {
      label: "Example 2",
      root: [31],
    },
  ],
  "binary-tree-longest-consecutive-sequence-ii": [
    {
      label: "Example 1",
      tree: "interactive computational stepping",
    },
    {
      label: "Example 2",
      tree: "efficient dynamic programming state",
    },
    {
      label: "Example 3",
      tree: "graph search traversal tree",
    },
  ],
  "binary-tree-max-path": [
    {
      label: "Example 1",
      input: "efficient dynamic programming state",
    },
    {
      label: "Example 2",
      input: "graph search traversal tree",
    },
    {
      label: "Example 3",
      input: "monotonic stack queue balance",
    },
  ],
  "binary-tree-maximum-path-sum": [
    {
      label: "Example 1",
      input: "monotonic stack queue balance",
    },
    {
      label: "Example 2",
      input: "two pointer sliding window",
    },
    {
      label: "Example 3",
      input: "learning algorithm structures",
    },
    {
      label: "Example 4",
      input: "interactive computational stepping",
    },
    {
      label: "Example 5",
      input: "efficient dynamic programming state",
    },
    {
      label: "Example 6",
      input: "graph search traversal tree",
    },
  ],
  "binary-tree-paths": [
    {
      label: "Example 1",
      arr: [4, 11, 18],
    },
    {
      label: "Example 2",
      arr: [11, 18, 25, null, 4],
    },
    {
      label: "Example 3",
      arr: [18],
    },
    {
      label: "Example 4",
      arr: [25, 32, null, 9, 16],
    },
  ],
  "binary-tree-postorder-traversal": [
    {
      label: "Example 1",
      arr: [18, null, 30, 2],
    },
    {
      label: "Example 2",
      arr: [25, 32, 4, 11, 18, 25, 32],
    },
    {
      label: "Example 3",
      arr: [32, 4, null, 16, null, null, null, 3],
    },
    {
      label: "Example 4",
      arr: [4],
    },
  ],
  "binary-tree-preorder-traversal": [
    {
      label: "Example 1",
      arr: [15, null, 27, 34],
    },
    {
      label: "Example 2",
      arr: [22, 29, 1, 8, 15, 22, 29],
    },
    {
      label: "Example 3",
      arr: [29, 1, null, 13, null, null, null, 35],
    },
    {
      label: "Example 4",
      arr: [1],
    },
  ],
  "binary-tree-tilt": [
    {
      label: "Example 1",
      arr: [24, 27, 34],
    },
    {
      label: "Example 2",
      arr: [2, 3, 22, 15, 24, null, 3],
    },
  ],
  "binary-tree-vertical-order": [
    {
      label: "Example 1",
      tree: [4, 21, 13, null, null, 18, 7],
    },
  ],
  "binary-tree-zigzag-level-order-traversal": [
    {
      label: "Example 1",
      root: [1, 18, 10, null, null, 15, 4],
    },
    {
      label: "Example 2",
      root: [4],
    },
    {
      label: "Example 3",
      root: [],
    },
  ],
  "binary-watch": [
    {
      label: "Example 1",
      n: 4,
    },
    {
      label: "Example 2",
      n: 5,
    },
  ],
  "boundary-of-binary-tree": [
    {
      label: "Example 1",
      text: "two pointer sliding window",
    },
    {
      label: "Example 2",
      text: "learning algorithm structures",
    },
    {
      label: "Example 3",
      text: "interactive computational stepping",
    },
  ],
  "bst-to-doubly-linked-list": [
    {
      label: "Example 1",
      root: [27, 28, 6, 1, 10, 19, 28],
    },
    {
      label: "Example 2",
      root: [30, 33, 7],
    },
  ],
  "bulls-and-cows": [
    {
      label: "Example 1",
      secret: "two pointer sliding window",
      guess: "two pointer sliding window",
    },
    {
      label: "Example 2",
      secret: "learning algorithm structures",
      guess: "learning algorithm structures",
    },
    {
      label: "Example 3",
      secret: "interactive computational stepping",
      guess: "interactive computational stepping",
    },
  ],
  "burst-balloons": [
    {
      label: "Example 1",
      nums: [33, 34, 12, 23],
    },
    {
      label: "Example 2",
      nums: [1, 14],
    },
    {
      label: "Example 3",
      nums: [10, 19, 22],
    },
  ],
  "can-i-win": [
    {
      label: "Example 1",
      maxChoosableInteger: 29,
      desiredTotal: 19,
    },
    {
      label: "Example 2",
      maxChoosableInteger: 22,
      desiredTotal: 28,
    },
  ],
  candy: [
    {
      label: "Example 1",
      ratings: [23, 26, 35],
    },
    {
      label: "Example 2",
      ratings: [30, 2, 7],
    },
    {
      label: "Example 3",
      ratings: [2, 11, 14, 19, 22],
    },
    {
      label: "Example 4",
      ratings: [9, 16, 23, 30, 2],
    },
  ],
  "circular-array-loop": [
    {
      label: "Example 1",
      nums: [11, 10, 19, 26, 31],
    },
    {
      label: "Example 2",
      nums: [12, 23],
    },
  ],
  "climbing-stairs": [
    {
      label: "Example 1",
      n: 4,
    },
    {
      label: "Example 2",
      n: 5,
    },
    {
      label: "Example 3",
      n: 6,
    },
    {
      label: "Example 4",
      n: 4,
    },
  ],
  "clone-graph": [
    {
      label: "Example 1",
      input: "interactive computational stepping",
    },
    {
      label: "Example 2",
      input: "efficient dynamic programming state",
    },
    {
      label: "Example 3",
      input: "graph search traversal tree",
    },
    {
      label: "Example 4",
      input: "monotonic stack queue balance",
    },
    {
      label: "Example 5",
      input: "two pointer sliding window",
    },
    {
      label: "Example 6",
      input: "learning algorithm structures",
    },
    {
      label: "Example 7",
      input: "interactive computational stepping",
    },
  ],
  "coin-change": [
    {
      label: "Example 1",
      coins: [24, 2, 17, 17],
      amount: 45,
    },
    {
      label: "Example 2",
      coins: [31, 9, 16, 27],
      amount: 49,
    },
    {
      label: "Example 3",
      coins: [5],
      amount: 36,
    },
    {
      label: "Example 4",
      coins: [10, 17, 28],
      amount: 38,
    },
    {
      label: "Example 5",
      coins: [2, 18, 16, 6],
      amount: 46,
    },
  ],
  "coin-change-2": [
    {
      label: "Example 1",
      amount: 3,
      coins: [31, 3, 14],
    },
    {
      label: "Example 2",
      amount: 8,
      coins: [21],
    },
  ],
  "combination-sum": [
    {
      label: "Example 1",
      candidates: [17, 24, 35, 7],
      target: 21,
    },
    {
      label: "Example 2",
      candidates: [24, 31, 5],
      target: 25,
    },
    {
      label: "Example 3",
      candidates: [35, 7],
      target: 29,
    },
    {
      label: "Example 4",
      candidates: [3],
      target: 33,
    },
  ],
  "combination-sum-ii": [
    {
      label: "Example 1",
      candidates: [1, 23, 30, 10, 13, 8, 21],
      target: 12,
    },
    {
      label: "Example 2",
      candidates: [27, 3, 2, 5, 12],
      target: 16,
    },
  ],
  combinations: [
    {
      label: "Example 1",
      n: 4,
      k: 2,
    },
    {
      label: "Example 2",
      n: 5,
      k: 3,
    },
  ],
  "compare-version-numbers": [
    {
      label: "Example 1",
      version1: "graph search traversal tree",
      version2: "graph search traversal tree",
    },
    {
      label: "Example 2",
      version1: "monotonic stack queue balance",
      version2: "monotonic stack queue balance",
    },
  ],
  "complex-number-multiplication": [
    {
      label: "Example 1",
      num1: "graph search traversal tree",
      num2: "graph search traversal tree",
    },
    {
      label: "Example 2",
      num1: "monotonic stack queue balance",
      num2: "monotonic stack queue balance",
    },
  ],
  "concatenated-words": [
    {
      label: "Example 1",
      words: ["node", "edge", "tree", "path", "cycle"],
    },
    {
      label: "Example 2",
      words: ["node", "edge", "tree", "path", "cycle"],
    },
  ],
  "connected-components-undirected": [
    {
      label: "Example 1",
      n: 4,
      edges: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
    {
      label: "Example 2",
      n: 5,
      edges: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
    {
      label: "Example 3",
      n: 6,
      edges: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
  ],
  "construct-binary-tree": [
    {
      label: "Example 1",
      pre: [28, 10, 2, 32, 21],
      ino: [5, 33, 27, 7, 21],
    },
    {
      label: "Example 2",
      pre: [27],
      ino: [27],
    },
    {
      label: "Example 3",
      pre: [3, 10, 19, 26, 27, 3],
      ino: [9, 10, 21, 18, 33, 32],
    },
  ],
  "construct-binary-tree-from-string": [
    {
      label: "Example 1",
      s: "efficient dynamic programming state",
    },
    {
      label: "Example 2",
      s: "graph search traversal tree",
    },
    {
      label: "Example 3",
      s: "monotonic stack queue balance",
    },
  ],
  "construct-the-rectangle": [
    {
      label: "Example 1",
      area: 19,
    },
    {
      label: "Example 2",
      area: 22,
    },
  ],
  "container-with-most-water": [
    {
      label: "Example 1",
      height: [1, 20, 21, 18, 29, 32, 10, 5, 18],
    },
    {
      label: "Example 2",
      height: [8, 13],
    },
    {
      label: "Example 3",
      height: [17, 24, 31, 3, 34, 2, 20],
    },
    {
      label: "Example 4",
      height: [5, 29, 32, 6, 23],
    },
  ],
  "contains-duplicate": [
    {
      label: "Example 1",
      nums: [24, 31, 3, 4],
    },
    {
      label: "Example 2",
      nums: [31, 3, 10, 17],
    },
    {
      label: "Example 3",
      nums: [3, 8, 13, 22, 27, 34, 2, 5, 14, 15],
    },
  ],
  "contiguous-array": [
    {
      label: "Example 1",
      nums: [1, 8],
    },
    {
      label: "Example 2",
      nums: [8, 15, 18],
    },
    {
      label: "Example 3",
      nums: [15, 20, 27, 30, 35, 5, 12, 17],
    },
  ],
  "continuous-subarray-sum": [
    {
      label: "Example 1",
      nums: [6, 4, 13, 22, 6],
      k: 2,
    },
    {
      label: "Example 2",
      nums: [13, 11, 24, 25, 1],
      k: 3,
    },
  ],
  "convert-bst-to-greater-tree": [
    {
      label: "Example 1",
      root: [15, 14, 6],
    },
    {
      label: "Example 2",
      root: [18, 21, 30, 29],
    },
  ],
  "convert-sorted-array-to-binary-search-tree": [
    {
      label: "Example 1",
      arr: [25, 9, 20, 35, 13],
    },
    {
      label: "Example 2",
      arr: [17, 24, 31, 3],
    },
    {
      label: "Example 3",
      arr: [26, 33, 5, 12, 19],
    },
    {
      label: "Example 4",
      arr: [6, 6, 6, 6, 6],
    },
  ],
  "convert-sorted-list-to-binary-search-tree": [
    {
      label: "Example 1",
      list: [15, 22, 29, 1, 8, 15],
    },
    {
      label: "Example 2",
      list: [35, 19, 30, 10, 23],
    },
    {
      label: "Example 3",
      list: [],
    },
  ],
  "convex-polygon": [
    {
      label: "Example 1",
      points: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
    {
      label: "Example 2",
      points: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
  ],
  "copy-list-random": [
    {
      label: "Example 1",
      nodes: [
        {
          val: 7,
          random: null,
        },
        {
          val: 13,
          random: 0,
        },
        {
          val: 11,
          random: 4,
        },
        {
          val: 10,
          random: 2,
        },
        {
          val: 1,
          random: 0,
        },
      ],
    },
    {
      label: "Example 2",
      nodes: [
        {
          val: 1,
          random: 1,
        },
        {
          val: 2,
          random: 1,
        },
      ],
    },
    {
      label: "Example 3",
      nodes: [
        {
          val: 3,
          random: null,
        },
        {
          val: 3,
          random: 0,
        },
        {
          val: 3,
          random: null,
        },
      ],
    },
  ],
  "copy-list-with-random-pointer": [
    {
      label: "Example 1",
    },
    {
      label: "Example 2",
      input: "interactive computational stepping",
    },
    {
      label: "Example 3",
      input: "efficient dynamic programming state",
    },
  ],
  "count-complete-tree-nodes": [
    {
      label: "Example 1",
      n: "learning algorithm structures",
    },
    {
      label: "Example 2",
      n: "interactive computational stepping",
    },
    {
      label: "Example 3",
      n: "efficient dynamic programming state",
    },
  ],
  "count-of-range-sum": [
    {
      label: "Example 1",
      nums: [33, 17, 10],
      lower: 34,
      upper: 46,
    },
  ],
  "count-of-smaller-after-self": [
    {
      label: "Example 1",
      nums: [11, 10, 23, 18],
    },
  ],
  "count-of-smaller-numbers-after-self": [
    {
      label: "Example 1",
      nums: [11, 10, 23, 18],
    },
  ],
  "count-students": [
    {
      label: "Example 1",
      students: [
        {
          student_id: 1,
          student_name: "Alice",
          department_id: 1,
        },
        {
          student_id: 2,
          student_name: "Bob",
          department_id: 1,
        },
        {
          student_id: 3,
          student_name: "Charlie",
          department_id: 2,
        },
        {
          student_id: 4,
          student_name: "Diana",
          department_id: 2,
        },
        {
          student_id: 5,
          student_name: "Eve",
          department_id: 3,
        },
      ],
    },
    {
      label: "Example 2",
      students: [
        {
          student_id: 1,
          student_name: "John",
          department_id: 1,
        },
        {
          student_id: 2,
          student_name: "Jane",
          department_id: 1,
        },
        {
          student_id: 3,
          student_name: "Jack",
          department_id: 1,
        },
      ],
    },
    {
      label: "Example 3",
      students: [
        {
          student_id: 1,
          student_name: "Alan",
          department_id: 1,
        },
        {
          student_id: 2,
          student_name: "Beth",
          department_id: 2,
        },
        {
          student_id: 3,
          student_name: "Carl",
          department_id: 2,
        },
        {
          student_id: 4,
          student_name: "Dana",
          department_id: 2,
        },
        {
          student_id: 5,
          student_name: "Eve",
          department_id: 3,
        },
        {
          student_id: 6,
          student_name: "Frank",
          department_id: 3,
        },
        {
          student_id: 7,
          student_name: "Grace",
          department_id: 3,
        },
        {
          student_id: 8,
          student_name: "Henry",
          department_id: 3,
        },
      ],
    },
  ],
  "count-the-repetitions": [
    {
      label: "Example 1",
      s1: "monotonic stack queue balance",
      n1: 25,
      s2: "monotonic stack queue balance",
      n2: 19,
    },
    {
      label: "Example 2",
      s1: "two pointer sliding window",
      n1: 27,
      s2: "two pointer sliding window",
      n2: 27,
    },
  ],
  "counting-bits": [
    {
      label: "Example 1",
      n: 4,
    },
    {
      label: "Example 2",
      n: 5,
    },
    {
      label: "Example 3",
      n: 6,
    },
    {
      label: "Example 4",
      n: 4,
    },
  ],
  "course-schedule": [
    {
      label: "Example 1",
      numCourses: 4,
      prerequisites: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
    {
      label: "Example 2",
      numCourses: 5,
      prerequisites: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
    {
      label: "Example 3",
      numCourses: 6,
      prerequisites: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
    {
      label: "Example 4",
      numCourses: 4,
      prerequisites: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
  ],
  "course-schedule-ii": [
    {
      label: "Example 1",
      n: 4,
      p: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
    {
      label: "Example 2",
      n: 5,
      p: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
    {
      label: "Example 3",
      n: 6,
      p: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
    {
      label: "Example 4",
      n: 4,
      p: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
  ],
  "create-maximum-number": [
    {
      label: "Example 1",
      nums1: [25, 32, 6, 9],
      nums2: [2, 26, 33, 9, 20, 15],
      k: 2,
    },
    {
      label: "Example 2",
      nums1: [3, 10],
      nums2: [3, 31, 9],
      k: 3,
    },
    {
      label: "Example 3",
      nums1: [4, 21],
      nums2: [14, 21],
      k: 4,
    },
  ],
  "cumulative-salary": [
    {
      label: "Example 1",
      employees: [
        {
          id: 1,
          month: 1,
          salary: 5000,
        },
        {
          id: 1,
          month: 2,
          salary: 5000,
        },
        {
          id: 1,
          month: 3,
          salary: 5000,
        },
        {
          id: 2,
          month: 1,
          salary: 3500,
        },
        {
          id: 2,
          month: 2,
          salary: 3500,
        },
      ],
    },
    {
      label: "Example 2",
      employees: [
        {
          id: 1,
          month: 1,
          salary: 4000,
        },
        {
          id: 1,
          month: 2,
          salary: 4000,
        },
        {
          id: 2,
          month: 1,
          salary: 6000,
        },
      ],
    },
  ],
  "daily-temperatures": [
    {
      label: "Example 1",
      temps: [19, 26, 33, 30, 31, 7, 20, 19],
    },
    {
      label: "Example 2",
      temps: [10, 35, 25, 15],
    },
    {
      label: "Example 3",
      temps: [32, 17, 2, 22],
    },
  ],
  "decode-string": [
    {
      label: "Example 1",
      s: "monotonic stack queue balance",
    },
    {
      label: "Example 2",
      s: "two pointer sliding window",
    },
    {
      label: "Example 3",
      s: "learning algorithm structures",
    },
  ],
  "decode-ways": [
    {
      label: "Example 1",
      s: "interactive computational stepping",
    },
    {
      label: "Example 2",
      s: "efficient dynamic programming state",
    },
    {
      label: "Example 3",
      s: "graph search traversal tree",
    },
    {
      label: "Example 4",
      s: "monotonic stack queue balance",
    },
    {
      label: "Example 5",
      s: "two pointer sliding window",
    },
  ],
  "delete-node-in-a-bst": [
    {
      label: "Example 1",
      root: [31, 32, 8, 5, 14, null, 30],
      key: 10,
    },
    {
      label: "Example 2",
      root: [3, 4, 15],
      key: 27,
    },
  ],
  "design-log-storage-system": [
    {
      label: "Example 1",
      operations: ["node", "edge", "tree", "path", "cycle"],
      values: [
        [],
        [13, "2017:01:01:23:59:59"],
        [16, "2017:01:02:23:59:59"],
        [17, "2017:01:01:23:59:59", "2017:01:02:23:59:59", "Second"],
      ],
    },
  ],
  "design-snake-game": [
    {
      label: "Example 1",
      width: 24,
      height: 21,
      food: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
      commands: ["node", "edge", "tree", "path", "cycle"],
    },
    {
      label: "Example 2",
      width: 6,
      height: 6,
      food: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
      commands: ["node", "edge", "tree", "path", "cycle"],
    },
  ],
  "design-tic-tac-toe": [
    {
      label: "Example 1",
      n: 4,
      moves: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
  ],
  "detect-capital": [
    {
      label: "Example 1",
      word: "monotonic stack queue balance",
    },
    {
      label: "Example 2",
      word: "two pointer sliding window",
    },
  ],
  "diagonal-traverse": [
    {
      label: "Example 1",
      matrix: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
    {
      label: "Example 2",
      matrix: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
  ],
  "diameter-binary-tree": [
    {
      label: "Example 1",
      arr: [3, 10, 17, 24, 31],
    },
    {
      label: "Example 2",
      arr: [10, 17, 24, 31, 3, 10, 17],
    },
    {
      label: "Example 3",
      arr: [17, 24, null, 1, null, 13],
    },
    {
      label: "Example 4",
      arr: [24],
    },
  ],
  "diameter-of-binary-tree": [
    {
      label: "Example 1",
      root: [22, 29, 1, 8, 15],
    },
    {
      label: "Example 2",
      root: [29, 1],
    },
  ],
  "distinct-subsequences": [
    {
      label: "Example 1",
      s: "interactive computational stepping",
      t: "interactive computational stepping",
    },
    {
      label: "Example 2",
      s: "efficient dynamic programming state",
      t: "efficient dynamic programming state",
    },
    {
      label: "Example 3",
      s: "graph search traversal tree",
      t: "graph search traversal tree",
    },
  ],
  "dungeon-game": [
    {
      label: "Example 1",
      dungeon: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
    {
      label: "Example 2",
      dungeon: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
    {
      label: "Example 3",
      dungeon: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
  ],
  "edit-distance": [
    {
      label: "Example 1",
      w1: "learning algorithm structures",
      w2: "learning algorithm structures",
    },
    {
      label: "Example 2",
      w1: "interactive computational stepping",
      w2: "interactive computational stepping",
    },
    {
      label: "Example 3",
      w1: "efficient dynamic programming state",
      w2: "efficient dynamic programming state",
    },
    {
      label: "Example 4",
      w1: "graph search traversal tree",
      w2: "graph search traversal tree",
    },
  ],
  "employee-free-time": [
    {
      label: "Example 1",
      schedules: [
        [
          [1, 2],
          [5, 6],
        ],
        [[1, 3]],
        [[4, 6]],
      ],
    },
    {
      label: "Example 2",
      schedules: [
        [
          [1, 3],
          [4, 6],
        ],
        [[2, 5]],
        [[7, 9]],
      ],
    },
    {
      label: "Example 3",
      schedules: [
        [
          [1, 2],
          [3, 4],
          [6, 7],
        ],
        [[2, 4]],
        [
          [2, 5],
          [9, 12],
        ],
      ],
    },
    {
      label: "Example 4",
      schedules: [
        [
          [1, 3],
          [6, 7],
        ],
        [[2, 4]],
        [
          [2, 5],
          [9, 12],
        ],
        [
          [4, 6],
          [8, 9],
        ],
        [[5, 9]],
        [[10, 15]],
      ],
    },
  ],
  "encode-and-decode-tinyurl": [
    {
      label: "Example 1",
      url: "https://example.org/articles/binary-tree",
    },
    {
      label: "Example 2",
      url: "https://visualizer.dev/docs/algorithm-steps",
    },
  ],
  "encode-decode-strings": [
    {
      label: "Example 1",
      strs: ["node", "edge", "tree", "path", "cycle"],
    },
    {
      label: "Example 2",
      strs: ["node", "edge", "tree", "path", "cycle"],
    },
    {
      label: "Example 3",
      strs: ["node", "edge", "tree", "path", "cycle"],
    },
    {
      label: "Example 4",
      strs: ["node", "edge", "tree", "path", "cycle"],
    },
  ],
  "encode-nary-to-binary-tree": [
    {
      label: "Example 1",
      naryStructure: "two pointer sliding window",
    },
  ],
  "eval-rpn": [
    {
      label: "Example 1",
      tokens: ["node", "edge", "tree", "path", "cycle"],
    },
    {
      label: "Example 2",
      tokens: ["node", "edge", "tree", "path", "cycle"],
    },
    {
      label: "Example 3",
      tokens: ["node", "edge", "tree", "path", "cycle"],
    },
  ],
  "evaluate-division": [
    {
      label: "Example 1",
      equations: [
        ["C", "A", "T"],
        ["D", "O", "G"],
        ["B", "A", "T"],
      ],
      values: [12, 19],
      queries: [
        ["C", "A", "T"],
        ["D", "O", "G"],
        ["B", "A", "T"],
      ],
    },
    {
      label: "Example 2",
      equations: [
        ["C", "A", "T"],
        ["D", "O", "G"],
        ["B", "A", "T"],
      ],
      values: [18, 25, 35],
      queries: [
        ["C", "A", "T"],
        ["D", "O", "G"],
        ["B", "A", "T"],
      ],
    },
  ],
  "expression-tree-from-tokens": [
    {
      label: "Example 1",
      tokens: ["node", "edge", "tree", "path", "cycle"],
    },
  ],
  "fibonacci-number": [
    {
      label: "Example 1",
      n: 4,
    },
    {
      label: "Example 2",
      n: 5,
    },
  ],
  "find-all-anagrams": [
    {
      label: "Example 1",
      s: "two pointer sliding window",
      p: "two pointer sliding window",
    },
    {
      label: "Example 2",
      s: "learning algorithm structures",
      p: "learning algorithm structures",
    },
    {
      label: "Example 3",
      s: "interactive computational stepping",
      p: "interactive computational stepping",
    },
  ],
  "find-all-anagrams-in-a-string": [
    {
      label: "Example 1",
      s: "learning algorithm structures",
      p: "learning algorithm structures",
    },
  ],
  "find-all-anagrams-in-string": [
    {
      label: "Example 1",
      s: "learning algorithm structures",
      p: "learning algorithm structures",
    },
  ],
  "find-all-duplicates-in-array": [
    {
      label: "Example 1",
      nums: [2, 5, 8, 23, 30, 23, 30, 31],
    },
    {
      label: "Example 2",
      nums: [3, 8, 15],
    },
  ],
  "find-all-numbers-disappeared-in-an-array": [
    {
      label: "Example 1",
      nums: [23, 26, 29, 9, 16, 9, 16, 17],
      expected: [25, 32],
    },
    {
      label: "Example 2",
      nums: [24, 29],
      expected: [26],
    },
    {
      label: "Example 3",
      nums: [31, 3, 10],
      expected: [],
    },
  ],
  "find-all-numbers-disappeared-in-array": [
    {
      label: "Example 1",
      nums: [23, 26, 29, 9, 16, 9, 16, 17],
      expected: [25, 32],
    },
    {
      label: "Example 2",
      nums: [24, 29],
      expected: [26],
    },
    {
      label: "Example 3",
      nums: [31, 3, 10],
      expected: [],
    },
  ],
  "find-customer-referee": [
    {
      label: "Example 1",
      customers: [
        {
          id: 1,
          name: "Will",
          referee_id: null,
        },
        {
          id: 2,
          name: "Jane",
          referee_id: null,
        },
        {
          id: 3,
          name: "Alex",
          referee_id: 2,
        },
        {
          id: 4,
          name: "Bill",
          referee_id: null,
        },
        {
          id: 5,
          name: "Zack",
          referee_id: 1,
        },
      ],
      refereeId: 36,
    },
    {
      label: "Example 2",
      customers: [
        {
          id: 1,
          name: "Alice",
          referee_id: null,
        },
        {
          id: 2,
          name: "Bob",
          referee_id: 1,
        },
      ],
      refereeId: 44,
    },
    {
      label: "Example 3",
      customers: [
        {
          id: 1,
          name: "Ann",
          referee_id: 2,
        },
        {
          id: 2,
          name: "Ben",
          referee_id: 2,
        },
      ],
      refereeId: 8,
    },
  ],
  "find-disappeared-numbers": [
    {
      label: "Example 1",
      input: [23, 26, 29, 9, 16, 9, 16, 17],
    },
    {
      label: "Example 2",
      input: [24, 29],
    },
  ],
  "find-duplicate": [
    {
      label: "Example 1",
      nums: [17, 26, 33, 34, 4],
    },
    {
      label: "Example 2",
      nums: [28, 29, 3, 10, 11],
    },
    {
      label: "Example 3",
      nums: [31, 1],
    },
    {
      label: "Example 4",
      nums: [5, 16, 29, 28, 4, 32, 12, 19, 20, 13],
    },
  ],
  "find-first-last-position": [
    {
      label: "Example 1",
      nums: [25, 34, 4, 11, 16, 25],
      target: 20,
    },
    {
      label: "Example 2",
      nums: [32, 6, 11, 18, 23, 32],
      target: 24,
    },
  ],
  "find-first-occurrence": [
    {
      label: "Example 1",
      haystack: "graph search traversal tree",
      needle: "graph search traversal tree",
    },
    {
      label: "Example 2",
      haystack: "monotonic stack queue balance",
      needle: "monotonic stack queue balance",
    },
  ],
  "find-k-pairs-with-smallest-sums": [
    {
      label: "Example 1",
      nums1: "interactive computational stepping",
      nums2: "interactive computational stepping",
      k: "interactive computational stepping",
    },
    {
      label: "Example 2",
      nums1: "efficient dynamic programming state",
      nums2: "efficient dynamic programming state",
      k: "efficient dynamic programming state",
    },
    {
      label: "Example 3",
      nums1: "graph search traversal tree",
      nums2: "graph search traversal tree",
      k: "graph search traversal tree",
    },
  ],
  "find-leaves-of-binary-tree": [
    {
      label: "Example 1",
      arr: [16, 23, 30],
    },
    {
      label: "Example 2",
      arr: [23, 30, null, 7, null, 19],
    },
    {
      label: "Example 3",
      arr: [30],
    },
  ],
  "find-median-data-stream": [
    {
      label: "Example 1",
      nums: [31, 3, 10],
    },
    {
      label: "Example 2",
      nums: [13, 16, 19, 22, 25, 28],
    },
    {
      label: "Example 3",
      nums: [12, 19, 26, 2, 9],
    },
  ],
  "find-min-rotated-sorted-array": [
    {
      label: "Example 1",
      nums: [21, 28, 35, 32, 4],
    },
    {
      label: "Example 2",
      nums: [30, 2, 9, 16, 7, 14, 21],
    },
    {
      label: "Example 3",
      nums: [31, 3, 10, 17, 24],
    },
    {
      label: "Example 4",
      nums: [5, 8],
    },
    {
      label: "Example 5",
      nums: [22, 29, 1, 8, 15, 35, 7, 14, 21, 28, 35],
    },
  ],
  "find-minimum-in-rotated-sorted-array-ii": [
    {
      label: "Example 1",
      nums: [10, 19, 28],
    },
    {
      label: "Example 2",
      nums: [19, 24, 29, 30, 2],
    },
  ],
  "find-peak-element": [
    {
      label: "Example 1",
      nums: [34, 6, 13, 14],
    },
    {
      label: "Example 2",
      nums: [6, 13, 16, 25, 34, 6, 7],
    },
    {
      label: "Example 3",
      nums: [17, 18, 25],
    },
  ],
  "first-bad-version": [
    {
      label: "Example 1",
      n: 4,
      bad: 9,
    },
    {
      label: "Example 2",
      n: 5,
      bad: 29,
    },
    {
      label: "Example 3",
      n: 6,
      bad: 22,
    },
    {
      label: "Example 4",
      n: 4,
      bad: 36,
    },
  ],
  "first-missing-positive": [
    {
      label: "Example 1",
      nums: [21, 28, 29],
    },
    {
      label: "Example 2",
      nums: [32, 4, 34, 8],
    },
    {
      label: "Example 3",
      nums: [12, 19, 26, 35, 7],
    },
    {
      label: "Example 4",
      nums: [9, 12],
    },
  ],
  "flatten-a-multilevel-doubly-linked-list": [
    {
      label: "Example 1",
      structure: "monotonic stack queue balance",
    },
  ],
  "flatten-binary-tree-to-linked-list": [
    {
      label: "Example 1",
      arr: [30, 2, 13, 14, 21, null, 35],
    },
    {
      label: "Example 2",
      arr: [2, null, 14, 21],
    },
    {
      label: "Example 3",
      arr: [],
    },
  ],
  "flatten-multilevel-dll": [
    {
      label: "Example 1",
      structure: "monotonic stack queue balance",
    },
  ],
  "four-sum": [
    {
      label: "Example 1",
      nums: [34, 4, 9, 14],
      target: 18,
    },
    {
      label: "Example 2",
      nums: [3, 6, 9, 16, 17, 30],
      target: 22,
    },
    {
      label: "Example 3",
      nums: [8, 13, 18, 23],
      target: 26,
    },
    {
      label: "Example 4",
      nums: [9, 16, 23, 30, 2, 9, 16],
      target: 30,
    },
  ],
  "fraction-to-recurring-decimal": [
    {
      label: "Example 1",
      numerator: 16,
      denominator: 19,
    },
    {
      label: "Example 2",
      numerator: 27,
      denominator: 42,
    },
  ],
  "freedom-trail": [
    {
      label: "Example 1",
      ring: "monotonic stack queue balance",
      key: "monotonic stack queue balance",
    },
    {
      label: "Example 2",
      ring: "two pointer sliding window",
      key: "two pointer sliding window",
    },
  ],
  "game-on-growing-tree": [
    {
      label: "Example 1",
      q: "efficient dynamic programming state",
      parents: "efficient dynamic programming state",
    },
    {
      label: "Example 2",
      q: "graph search traversal tree",
      parents: "graph search traversal tree",
    },
    {
      label: "Example 3",
      q: "monotonic stack queue balance",
      parents: "monotonic stack queue balance",
    },
  ],
  "game-play-analysis-i": [
    {
      label: "Example 1",
      activity: [
        {
          player_id: 1,
          device_id: 2,
          event_date: "2016-03-01",
          games_played: 5,
        },
        {
          player_id: 1,
          device_id: 2,
          event_date: "2016-05-02",
          games_played: 6,
        },
      ],
    },
    {
      label: "Example 2",
      activity: [
        {
          player_id: 1,
          device_id: 3,
          event_date: "2016-03-02",
          games_played: 8,
        },
      ],
    },
  ],
  "game-play-analysis-ii": [
    {
      label: "Example 1",
      activity: [
        {
          player_id: 1,
          device_id: 2,
          event_date: "2016-03-01",
          games_played: 5,
        },
        {
          player_id: 1,
          device_id: 2,
          event_date: "2016-03-02",
          games_played: 6,
        },
        {
          player_id: 2,
          device_id: 3,
          event_date: "2017-06-25",
          games_played: 1,
        },
      ],
    },
    {
      label: "Example 2",
      activity: [
        {
          player_id: 1,
          device_id: 2,
          event_date: "2016-03-01",
          games_played: 5,
        },
      ],
    },
  ],
  "gas-station": [
    {
      label: "Example 1",
      gas: [20, 27, 34, 6, 13],
      cost: [24, 31, 3, 35, 7],
    },
    {
      label: "Example 2",
      gas: [29, 1, 8],
      cost: [31, 3, 6],
    },
    {
      label: "Example 3",
      gas: [7, 4, 11, 18, 25],
      cost: [5, 10, 9, 22, 19],
    },
  ],
  "generate-parentheses": [
    {
      label: "Example 1",
      n: 4,
    },
    {
      label: "Example 2",
      n: 5,
    },
    {
      label: "Example 3",
      n: 6,
    },
    {
      label: "Example 4",
      n: 4,
    },
  ],
  "generate-random-point-in-a-circle": [
    {
      label: "Example 1",
      radius: 50,
    },
    {
      label: "Example 2",
      radius: 15.5,
    },
  ],
  "gray-code": [
    {
      label: "Example 1",
      n: 4,
    },
    {
      label: "Example 2",
      n: 5,
    },
    {
      label: "Example 3",
      n: 6,
    },
    {
      label: "Example 4",
      n: 4,
    },
  ],
  "group-anagrams": [
    {
      label: "Example 1",
      strs: ["node", "edge", "tree", "path", "cycle"],
    },
    {
      label: "Example 2",
      strs: ["node", "edge", "tree", "path", "cycle"],
    },
    {
      label: "Example 3",
      strs: ["node", "edge", "tree", "path", "cycle"],
    },
    {
      label: "Example 4",
      strs: ["node", "edge", "tree", "path", "cycle"],
    },
  ],
  "guess-number": [
    {
      label: "Example 1",
      n: 4,
      pick: 7,
    },
    {
      label: "Example 2",
      n: 5,
      pick: 3,
    },
    {
      label: "Example 3",
      n: 6,
      pick: 21,
    },
    {
      label: "Example 4",
      n: 4,
      pick: 41,
    },
  ],
  "guess-number-higher-or-lower": [
    {
      label: "Example 1",
      n: 4,
      pick: 37,
    },
    {
      label: "Example 2",
      n: 5,
      pick: 33,
    },
    {
      label: "Example 3",
      n: 6,
      pick: 44,
    },
  ],
  "guess-number-higher-or-lower-ii": [
    {
      label: "Example 1",
      n: "graph search traversal tree",
    },
    {
      label: "Example 2",
      n: "monotonic stack queue balance",
    },
    {
      label: "Example 3",
      n: "two pointer sliding window",
    },
  ],
  "hamming-distance": [
    {
      label: "Example 1",
      x: 31,
      y: 40,
    },
    {
      label: "Example 2",
      x: 48,
      y: 42,
    },
  ],
  "happy-number": [
    {
      label: "Example 1",
      n: 4,
    },
    {
      label: "Example 2",
      n: 5,
    },
    {
      label: "Example 3",
      n: 6,
    },
    {
      label: "Example 4",
      n: 4,
    },
  ],
  "house-robber": [
    {
      label: "Example 1",
      nums: [2, 9, 16, 17],
    },
    {
      label: "Example 2",
      nums: [11, 26, 35, 28, 29],
    },
    {
      label: "Example 3",
      nums: [26, 21, 1, 31, 11],
    },
    {
      label: "Example 4",
      nums: [25, 28, 33, 19, 8, 13, 32],
    },
  ],
  "house-robber-ii": [
    {
      label: "Example 1",
      nums: [14, 21, 24],
    },
    {
      label: "Example 2",
      nums: [19, 26, 33, 34],
    },
    {
      label: "Example 3",
      nums: [34, 4, 9, 14, 19],
    },
    {
      label: "Example 4",
      nums: [33, 5, 12, 19, 26, 33, 5],
    },
  ],
  "implement-trie": [
    {
      label: "Example 1",
      ops: [
        ["C", "A", "T"],
        ["D", "O", "G"],
        ["B", "A", "T"],
      ],
    },
    {
      label: "Example 2",
      ops: [
        ["C", "A", "T"],
        ["D", "O", "G"],
        ["B", "A", "T"],
      ],
    },
  ],
  "increasing-subsequences": [
    {
      label: "Example 1",
      nums: [12, 21, 28, 33],
    },
    {
      label: "Example 2",
      nums: [19, 24, 27, 30, 33],
    },
  ],
  "inorder-successor-bst": [
    {
      label: "Example 1",
      tree: [30, 33, 7],
      p: 24,
    },
    {
      label: "Example 2",
      tree: [8, 9, 20, 17, 26, null, null, 35],
      p: 50,
    },
  ],
  "insert-interval": [
    {
      label: "Example 1",
      intervals: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
      newInterval: [1, 12],
    },
    {
      label: "Example 2",
      intervals: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
      newInterval: [12, 25],
    },
    {
      label: "Example 3",
      intervals: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
      newInterval: [15, 22],
    },
    {
      label: "Example 4",
      intervals: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
      newInterval: [30, 4],
    },
  ],
  "insertion-sort-list": [
    {
      label: "Example 1",
      head: [30, 31, 34, 8],
    },
    {
      label: "Example 2",
      head: [27, 9, 10, 17, 14],
    },
  ],
  "integer-to-roman": [
    {
      label: "Example 1",
      num: 44,
      note: "learning algorithm structures",
    },
    {
      label: "Example 2",
      num: 20,
      note: "interactive computational stepping",
    },
    {
      label: "Example 3",
      num: 39,
      note: "efficient dynamic programming state",
    },
    {
      label: "Example 4",
      num: 15,
      note: "graph search traversal tree",
    },
  ],
  "interleaving-string": [
    {
      label: "Example 1",
      s1: "interactive computational stepping",
      s2: "interactive computational stepping",
      s3: "interactive computational stepping",
    },
    {
      label: "Example 2",
      s1: "efficient dynamic programming state",
      s2: "efficient dynamic programming state",
      s3: "efficient dynamic programming state",
    },
    {
      label: "Example 3",
      s1: "graph search traversal tree",
      s2: "graph search traversal tree",
      s3: "graph search traversal tree",
    },
  ],
  "intersection-of-two-arrays": [
    {
      label: "Example 1",
      nums1: [35, 7, 12, 15],
      nums2: [2, 7],
    },
    {
      label: "Example 2",
      nums1: [13, 28, 25],
      nums2: [23, 18, 33, 1, 33],
    },
  ],
  "intersection-of-two-arrays-ii": [
    {
      label: "Example 1",
      nums1: [3, 10, 15, 18],
      nums2: [5, 10],
    },
    {
      label: "Example 2",
      nums1: [16, 31, 28],
      nums2: [26, 21, 1, 4, 1],
    },
    {
      label: "Example 3",
      nums1: [17, 24, 29, 32, 4, 9],
      nums2: [19],
    },
  ],
  "intersection-two-linked-lists": [
    {
      label: "Example 1",
      listA: [23, 22],
      listB: [25, 32, 27],
      shared: [31, 28, 35],
      intersectVal: 46,
    },
    {
      label: "Example 2",
      listA: [24, 10, 34],
      listB: [28],
      shared: [26, 35],
      intersectVal: 39,
    },
    {
      label: "Example 3",
      listA: [33, 11, 12],
      listB: [31, 9],
      shared: [],
      intersectVal: null,
    },
  ],
  "invert-binary-tree": [
    {
      label: "Example 1",
      arr: [22, 23, 3, 31, 5, 16, 27],
    },
    {
      label: "Example 2",
      arr: [25, 28, 2],
    },
    {
      label: "Example 3",
      arr: [30],
    },
    {
      label: "Example 4",
      arr: [2, 9, null, 21, 28],
    },
  ],
  "investments-2016": [
    {
      label: "Example 1",
      data: [
        {
          pid: 1,
          tiv_2015: 100,
          tiv_2016: 200,
          lat: 0,
          lon: 0,
        },
        {
          pid: 2,
          tiv_2015: 100,
          tiv_2016: 150,
          lat: 1,
          lon: 1,
        },
        {
          pid: 3,
          tiv_2015: 100,
          tiv_2016: 300,
          lat: 0,
          lon: 0,
        },
      ],
    },
    {
      label: "Example 2",
      data: [
        {
          pid: 1,
          tiv_2015: 100,
          tiv_2016: 200,
          lat: 0,
          lon: 0,
        },
        {
          pid: 2,
          tiv_2015: 150,
          tiv_2016: 300,
          lat: 1,
          lon: 1,
        },
        {
          pid: 3,
          tiv_2015: 100,
          tiv_2016: 250,
          lat: 2,
          lon: 2,
        },
        {
          pid: 4,
          tiv_2015: 150,
          tiv_2016: 350,
          lat: 1,
          lon: 1,
        },
        {
          pid: 5,
          tiv_2015: 200,
          tiv_2016: 400,
          lat: 3,
          lon: 3,
        },
      ],
    },
    {
      label: "Example 3",
      data: [
        {
          pid: 1,
          tiv_2015: 100,
          tiv_2016: 100,
          lat: 0,
          lon: 0,
        },
        {
          pid: 2,
          tiv_2015: 200,
          tiv_2016: 200,
          lat: 1,
          lon: 1,
        },
        {
          pid: 3,
          tiv_2015: 300,
          tiv_2016: 300,
          lat: 2,
          lon: 2,
        },
      ],
    },
  ],
  ipo: [
    {
      label: "Example 1",
      k: 2,
      w: 15,
      profits: [4, 11, 18],
      capital: [2, 9, 14],
    },
    {
      label: "Example 2",
      k: 3,
      w: 26,
      profits: [11, 18, 25],
      capital: [9, 16, 23],
    },
    {
      label: "Example 3",
      k: 4,
      w: 40,
      profits: [26, 27, 34, 35],
      capital: [16, 25, 28, 2],
    },
  ],
  "is-subsequence": [
    {
      label: "Example 1",
      s: "efficient dynamic programming state",
      t: "efficient dynamic programming state",
    },
    {
      label: "Example 2",
      s: "graph search traversal tree",
      t: "graph search traversal tree",
    },
  ],
  "island-perimeter": [
    {
      label: "Example 1",
      grid: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
    {
      label: "Example 2",
      grid: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
  ],
  "jump-game": [
    {
      label: "Example 1",
      nums: [30, 2, 3, 8, 19],
    },
    {
      label: "Example 2",
      nums: [4, 7, 10, 13, 26],
    },
    {
      label: "Example 3",
      nums: [5],
    },
    {
      label: "Example 4",
      nums: [22, 17, 22, 27, 32, 4],
    },
    {
      label: "Example 5",
      nums: [21, 26, 31, 1, 4],
    },
  ],
  "jump-game-ii": [
    {
      label: "Example 1",
      nums: [35, 7, 8, 13, 24],
    },
    {
      label: "Example 2",
      nums: [7, 14, 13, 20, 31],
    },
    {
      label: "Example 3",
      nums: [12, 17, 22, 27],
    },
    {
      label: "Example 4",
      nums: [23, 26, 29, 32, 10],
    },
  ],
  "k-diff-pairs-in-array": [
    {
      label: "Example 1",
      nums: [28, 29, 5, 4, 17],
      k: 2,
    },
    {
      label: "Example 2",
      nums: [31, 3, 10, 11, 16, 25],
      k: 3,
    },
    {
      label: "Example 3",
      nums: [3, 8, 13, 20, 25],
      k: 4,
    },
  ],
  "kill-process": [
    {
      label: "Example 1",
      pid: [10, 19, 24, 29, 3, 10],
      ppid: [14, 15, 24, 29, 30, 8],
      kill: 4,
    },
    {
      label: "Example 2",
      pid: [17],
      ppid: [13],
      kill: 3,
    },
  ],
  "kth-largest-element": [
    {
      label: "Example 1",
      nums: [21, 24, 27, 5, 12, 13],
      k: 2,
    },
    {
      label: "Example 2",
      nums: [28, 31, 3, 4, 11, 20, 27, 32, 4],
      k: 3,
    },
    {
      label: "Example 3",
      nums: [8, 19, 12, 15, 19, 14],
      k: 4,
    },
  ],
  "kth-smallest": [
    {
      label: "Example 1",
      arr: [14, 15, 26, null, 32],
      k: 2,
    },
    {
      label: "Example 2",
      arr: [25, 26, 2, 34, 8, null, null, 17],
      k: 3,
    },
    {
      label: "Example 3",
      arr: [32, 33, 11, 4, 15, 24, 33],
      k: 4,
    },
    {
      label: "Example 4",
      arr: [33, 1, 10],
      k: 2,
    },
  ],
  "largest-orders": [
    {
      label: "Example 1",
      orders: [
        {
          orderId: 1,
          customerId: 1,
          amount: 150,
        },
        {
          orderId: 2,
          customerId: 1,
          amount: 200,
        },
        {
          orderId: 3,
          customerId: 2,
          amount: 100,
        },
        {
          orderId: 4,
          customerId: 3,
          amount: 300,
        },
        {
          orderId: 5,
          customerId: 3,
          amount: 150,
        },
      ],
      customers: {
        1: "efficient dynamic programming state",
        2: "efficient dynamic programming state",
        3: "efficient dynamic programming state",
      },
    },
    {
      label: "Example 2",
      orders: [
        {
          orderId: 101,
          customerId: 10,
          amount: 500,
        },
        {
          orderId: 102,
          customerId: 10,
          amount: 450,
        },
        {
          orderId: 103,
          customerId: 20,
          amount: 200,
        },
        {
          orderId: 104,
          customerId: 30,
          amount: 300,
        },
        {
          orderId: 105,
          customerId: 30,
          amount: 250,
        },
        {
          orderId: 106,
          customerId: 40,
          amount: 180,
        },
      ],
      customers: {
        10: "graph search traversal tree",
        20: "graph search traversal tree",
        30: "graph search traversal tree",
        40: "graph search traversal tree",
      },
    },
    {
      label: "Example 3",
      orders: [
        {
          orderId: 1,
          customerId: 1,
          amount: 100,
        },
        {
          orderId: 2,
          customerId: 1,
          amount: 150,
        },
        {
          orderId: 3,
          customerId: 1,
          amount: 200,
        },
        {
          orderId: 4,
          customerId: 2,
          amount: 300,
        },
        {
          orderId: 5,
          customerId: 2,
          amount: 250,
        },
        {
          orderId: 6,
          customerId: 3,
          amount: 120,
        },
        {
          orderId: 7,
          customerId: 4,
          amount: 180,
        },
        {
          orderId: 8,
          customerId: 4,
          amount: 220,
        },
      ],
      customers: {
        1: "monotonic stack queue balance",
        2: "monotonic stack queue balance",
        3: "monotonic stack queue balance",
        4: "monotonic stack queue balance",
      },
    },
  ],
  "largest-palindrome-product": [
    {
      label: "Example 1",
      n: 4,
    },
  ],
  "largest-rectangle-in-histogram": [
    {
      label: "Example 1",
      heights: [12, 15, 28, 35, 32, 4],
    },
    {
      label: "Example 2",
      heights: [19, 28],
    },
    {
      label: "Example 3",
      heights: [26, 31, 1, 6],
    },
  ],
  "lcabinary-tree": [
    {
      label: "Example 1",
      arr: [21, 30, 27, 7, 4, 5, 26, null, null, 4, 3],
      p: 2,
      q: 40,
    },
    {
      label: "Example 2",
      arr: [28, 2, 34, 14, 11, 12, 33, null, null, 11, 10],
      p: 13,
      q: 10,
    },
    {
      label: "Example 3",
      arr: [31, 3, 10],
      p: 15,
      q: 18,
    },
    {
      label: "Example 4",
      arr: [13, 10, 27, 16, 29, 5, 14, null, null, 17, 26],
      p: 20,
      q: 35,
    },
  ],
  lcabst: [
    {
      label: "Example 1",
      arrInput: "learning algorithm structures",
      p: 1,
      q: 19,
    },
    {
      label: "Example 2",
      arrInput: "interactive computational stepping",
      p: 12,
      q: 18,
    },
    {
      label: "Example 3",
      arrInput: "efficient dynamic programming state",
      p: 20,
      q: 26,
    },
    {
      label: "Example 4",
      arrInput: "graph search traversal tree",
      p: 31,
      q: 49,
    },
  ],
  lcs: [
    {
      label: "Example 1",
      t1: "graph search traversal tree",
      t2: "graph search traversal tree",
    },
    {
      label: "Example 2",
      t1: "monotonic stack queue balance",
      t2: "monotonic stack queue balance",
    },
    {
      label: "Example 3",
      t1: "two pointer sliding window",
      t2: "two pointer sliding window",
    },
    {
      label: "Example 4",
      t1: "learning algorithm structures",
      t2: "learning algorithm structures",
    },
  ],
  "length-of-last-word": [
    {
      label: "Example 1",
      s: "monotonic stack queue balance",
    },
    {
      label: "Example 2",
      s: "two pointer sliding window",
    },
    {
      label: "Example 3",
      s: "learning algorithm structures",
    },
  ],
  "letter-combinations": [
    {
      label: "Example 1",
      digits: "interactive computational stepping",
    },
    {
      label: "Example 2",
      digits: "efficient dynamic programming state",
    },
    {
      label: "Example 3",
      digits: "graph search traversal tree",
    },
    {
      label: "Example 4",
      digits: "monotonic stack queue balance",
    },
  ],
  lfucache: [
    {
      label: "Example 1",
      capacity: 49,
      ops: [
        {
          type: "put",
          key: 1,
          val: 1,
        },
        {
          type: "put",
          key: 2,
          val: 2,
        },
        {
          type: "get",
          key: 1,
        },
        {
          type: "put",
          key: 3,
          val: 3,
        },
        {
          type: "get",
          key: 2,
        },
        {
          type: "get",
          key: 3,
        },
        {
          type: "put",
          key: 4,
          val: 4,
        },
        {
          type: "get",
          key: 1,
        },
        {
          type: "get",
          key: 3,
        },
        {
          type: "get",
          key: 4,
        },
      ],
    },
    {
      label: "Example 2",
      capacity: 13,
      ops: [
        {
          type: "put",
          key: 1,
          val: 1,
        },
        {
          type: "put",
          key: 2,
          val: 2,
        },
        {
          type: "put",
          key: 3,
          val: 3,
        },
        {
          type: "get",
          key: 1,
        },
        {
          type: "get",
          key: 2,
        },
        {
          type: "put",
          key: 4,
          val: 4,
        },
        {
          type: "get",
          key: 3,
        },
        {
          type: "get",
          key: 4,
        },
      ],
    },
  ],
  "license-key-formatting": [
    {
      label: "Example 1",
      s: "efficient dynamic programming state",
      k: 2,
    },
    {
      label: "Example 2",
      s: "graph search traversal tree",
      k: 3,
    },
  ],
  "linked-list-cycle": [
    {
      label: "Example 1",
      nodeCount: 3,
      tail: 38,
      desc: "graph search traversal tree",
    },
    {
      label: "Example 2",
      nodeCount: 8,
      tail: 2,
      desc: "monotonic stack queue balance",
    },
    {
      label: "Example 3",
      nodeCount: 22,
      tail: 7,
      desc: "two pointer sliding window",
    },
    {
      label: "Example 4",
      nodeCount: 24,
      tail: 18,
      desc: "learning algorithm structures",
    },
    {
      label: "Example 5",
      nodeCount: 35,
      tail: 32,
      desc: "interactive computational stepping",
    },
  ],
  "logger-rate-limiter": [
    {
      label: "Example 1",
      requests: [
        {
          timestamp: 1,
          message: "foo",
        },
        {
          timestamp: 1,
          message: "bar",
        },
        {
          timestamp: 3,
          message: "foo",
        },
        {
          timestamp: 8,
          message: "bar",
        },
        {
          timestamp: 10,
          message: "foo",
        },
        {
          timestamp: 11,
          message: "foo",
        },
      ],
      threshold: 47,
    },
    {
      label: "Example 2",
      requests: [
        {
          timestamp: 0,
          message: "a",
        },
        {
          timestamp: 0,
          message: "b",
        },
        {
          timestamp: 0,
          message: "c",
        },
        {
          timestamp: 2,
          message: "a",
        },
        {
          timestamp: 5,
          message: "a",
        },
      ],
      threshold: 49,
    },
    {
      label: "Example 3",
      requests: [
        {
          timestamp: 0,
          message: "msg",
        },
        {
          timestamp: 5,
          message: "msg",
        },
        {
          timestamp: 10,
          message: "msg",
        },
        {
          timestamp: 15,
          message: "msg",
        },
      ],
      threshold: 34,
    },
  ],
  "lonely-pixel-i": [
    {
      label: "Example 1",
      picture: [
        ["C", "A", "T"],
        ["D", "O", "G"],
        ["B", "A", "T"],
      ],
    },
    {
      label: "Example 2",
      picture: [
        ["C", "A", "T"],
        ["D", "O", "G"],
        ["B", "A", "T"],
      ],
    },
  ],
  "lonely-pixel-ii": [
    {
      label: "Example 1",
      picture: [
        ["C", "A", "T"],
        ["D", "O", "G"],
        ["B", "A", "T"],
      ],
      N: 38,
    },
    {
      label: "Example 2",
      picture: [
        ["C", "A", "T"],
        ["D", "O", "G"],
        ["B", "A", "T"],
      ],
      N: 46,
    },
  ],
  "longest-common-prefix": [
    {
      label: "Example 1",
      strs: ["node", "edge", "tree", "path", "cycle"],
    },
    {
      label: "Example 2",
      strs: ["node", "edge", "tree", "path", "cycle"],
    },
    {
      label: "Example 3",
      strs: ["node", "edge", "tree", "path", "cycle"],
    },
    {
      label: "Example 4",
      strs: ["node", "edge", "tree", "path", "cycle"],
    },
    {
      label: "Example 5",
      strs: ["node", "edge", "tree", "path", "cycle"],
    },
  ],
  "longest-consecutive-sequence": [
    {
      label: "Example 1",
      nums: [25, 13, 25, 17, 26, 29],
    },
    {
      label: "Example 2",
      nums: [7, 18, 31, 26, 2, 13, 10, 19, 12, 19],
    },
    {
      label: "Example 3",
      nums: [6, 17, 20, 29, 1, 8],
    },
    {
      label: "Example 4",
      nums: [31, 28, 14, 7],
    },
  ],
  "longest-increasing-path": [
    {
      label: "Example 1",
      matrix: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
    {
      label: "Example 2",
      matrix: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
    {
      label: "Example 3",
      matrix: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
  ],
  "longest-increasing-subsequence": [
    {
      label: "Example 1",
      nums: [11, 14, 5, 16, 17, 30, 13, 27],
    },
    {
      label: "Example 2",
      nums: [35, 5, 10, 15],
    },
    {
      label: "Example 3",
      nums: [7, 14, 21, 28, 35],
    },
    {
      label: "Example 4",
      nums: [22, 25, 28, 31, 34],
    },
    {
      label: "Example 5",
      nums: [19, 26, 29, 5, 8, 15],
    },
  ],
  "longest-line": [
    {
      label: "Example 1",
      matrix: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
    {
      label: "Example 2",
      matrix: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
    {
      label: "Example 3",
      matrix: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
  ],
  "longest-palindrome": [
    {
      label: "Example 1",
      s: "interactive computational stepping",
    },
    {
      label: "Example 2",
      s: "efficient dynamic programming state",
    },
    {
      label: "Example 3",
      s: "graph search traversal tree",
    },
    {
      label: "Example 4",
      s: "monotonic stack queue balance",
    },
  ],
  "longest-palindromic-subsequence": [
    {
      label: "Example 1",
      s: "learning algorithm structures",
    },
    {
      label: "Example 2",
      s: "interactive computational stepping",
    },
  ],
  "longest-repeating-char-replace": [
    {
      label: "Example 1",
      s: "learning algorithm structures",
      k: 2,
    },
    {
      label: "Example 2",
      s: "interactive computational stepping",
      k: 3,
    },
    {
      label: "Example 3",
      s: "efficient dynamic programming state",
      k: 4,
    },
  ],
  "longest-substring-k-repeating": [
    {
      label: "Example 1",
      s: "two pointer sliding window",
      k: 2,
    },
    {
      label: "Example 2",
      s: "learning algorithm structures",
      k: 3,
    },
    {
      label: "Example 3",
      s: "interactive computational stepping",
      k: 4,
    },
  ],
  "longest-substring-with-at-least-k-repeating-characters": [
    {
      label: "Example 1",
      s: "two pointer sliding window",
      k: 2,
    },
    {
      label: "Example 2",
      s: "learning algorithm structures",
      k: 3,
    },
    {
      label: "Example 3",
      s: "interactive computational stepping",
      k: 4,
    },
  ],
  "longest-substring-with-at-most-two-distinct-characters": [
    {
      label: "Example 1",
      s: "graph search traversal tree",
    },
    {
      label: "Example 2",
      s: "monotonic stack queue balance",
    },
  ],
  "longest-substring-without-repeating": [
    {
      label: "Example 1",
      s: "two pointer sliding window",
    },
    {
      label: "Example 2",
      s: "learning algorithm structures",
    },
    {
      label: "Example 3",
      s: "interactive computational stepping",
    },
    {
      label: "Example 4",
      s: "efficient dynamic programming state",
    },
    {
      label: "Example 5",
      s: "graph search traversal tree",
    },
  ],
  "longest-valid-parentheses": [
    {
      label: "Example 1",
      s: "efficient dynamic programming state",
    },
    {
      label: "Example 2",
      s: "graph search traversal tree",
    },
    {
      label: "Example 3",
      s: "monotonic stack queue balance",
    },
    {
      label: "Example 4",
      s: "two pointer sliding window",
    },
    {
      label: "Example 5",
      s: "learning algorithm structures",
    },
  ],
  "longest-word-dictionary": [
    {
      label: "Example 1",
      words: ["node", "edge", "tree", "path", "cycle"],
    },
    {
      label: "Example 2",
      words: ["node", "edge", "tree", "path", "cycle"],
    },
  ],
  lrucache: [
    {
      label: "Example 1",
      commands: ["node", "edge", "tree", "path", "cycle"],
      argsList: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
    {
      label: "Example 2",
      commands: ["node", "edge", "tree", "path", "cycle"],
      argsList: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
    {
      label: "Example 3",
      commands: ["node", "edge", "tree", "path", "cycle"],
      argsList: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
  ],
  "magical-string": [
    {
      label: "Example 1",
      n: 4,
    },
    {
      label: "Example 2",
      n: 5,
    },
  ],
  "majority-element": [
    {
      label: "Example 1",
      nums: [24, 27, 34],
    },
    {
      label: "Example 2",
      nums: [29, 34, 2, 7, 12, 19, 24],
    },
    {
      label: "Example 3",
      nums: [7, 12, 17, 22],
    },
    {
      label: "Example 4",
      nums: [6, 15, 16, 25, 26, 35, 1],
    },
  ],
  "managers-with-at-least-5-direct-reports": [
    {
      label: "Example 1",
    },
    {
      label: "Example 2",
    },
    {
      label: "Example 3",
      table: "two pointer sliding window",
    },
  ],
  "matrix-iteration-basics": [
    {
      label: "Example 1",
    },
    {
      label: "Example 2",
    },
    {
      label: "Example 3",
    },
    {
      label: "Example 4",
    },
  ],
  "max-area-of-island": [
    {
      label: "Example 1",
      grid: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
    {
      label: "Example 2",
      grid: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
  ],
  "max-consecutive-ones": [
    {
      label: "Example 1",
      nums: [23, 28, 31, 3, 8, 13],
    },
    {
      label: "Example 2",
      nums: [30, 33, 5, 10, 13, 20],
    },
    {
      label: "Example 3",
      nums: [2, 7, 12, 17],
    },
    {
      label: "Example 4",
      nums: [7, 12, 17],
    },
  ],
  "max-consecutive-ones-iii": [
    {
      label: "Example 1",
      nums: [29, 32, 4, 9, 12],
      k: 2,
    },
    {
      label: "Example 2",
      nums: [
        34, 4, 11, 16, 19, 24, 31, 1, 6, 9, 16, 21, 24, 29, 34, 6, 11, 16, 21,
        24,
      ],
      k: 3,
    },
  ],
  "max-depth-binary-tree": [
    {
      label: "Example 1",
      arr: [28, 10, 2, null, null, 7, 31],
    },
    {
      label: "Example 2",
      arr: [31, 3, null, 15, null, 27],
    },
    {
      label: "Example 3",
      arr: [3],
    },
    {
      label: "Example 4",
      arr: [10, 17, 24, 31, 3, 10, 17],
    },
  ],
  "max-points-on-aline": [
    {
      label: "Example 1",
      points: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
    {
      label: "Example 2",
      points: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
    {
      label: "Example 3",
      points: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
  ],
  "max-product-subarray": [
    {
      label: "Example 1",
      nums: [5, 12, 7, 24],
    },
    {
      label: "Example 2",
      nums: [4, 13, 16],
    },
    {
      label: "Example 3",
      nums: [19, 10, 21, 22, 6],
    },
    {
      label: "Example 4",
      nums: [16, 25, 30],
    },
  ],
  "max-product-word-lengths": [
    {
      label: "Example 1",
      words: ["node", "edge", "tree", "path", "cycle"],
    },
    {
      label: "Example 2",
      words: ["node", "edge", "tree", "path", "cycle"],
    },
    {
      label: "Example 3",
      words: ["node", "edge", "tree", "path", "cycle"],
    },
  ],
  "max-size-subarray-sum-k": [
    {
      label: "Example 1",
      nums: [33, 34, 16, 7, 22],
      k: 2,
    },
  ],
  "maximum-gap": [
    {
      label: "Example 1",
      nums: [9, 20, 31, 20],
    },
    {
      label: "Example 2",
      nums: [30],
    },
    {
      label: "Example 3",
      nums: [19, 7],
    },
    {
      label: "Example 4",
      nums: [26, 35, 11, 8, 25, 3],
    },
  ],
  "maximum-product-of-word-lengths": [
    {
      label: "Example 1",
      words: ["node", "edge", "tree", "path", "cycle"],
    },
    {
      label: "Example 2",
      words: ["node", "edge", "tree", "path", "cycle"],
    },
    {
      label: "Example 3",
      words: ["node", "edge", "tree", "path", "cycle"],
    },
  ],
  "maximum-subarray": [
    {
      label: "Example 1",
      nums: [16, 27, 24, 8, 3, 14, 17, 10, 33],
    },
    {
      label: "Example 2",
      nums: [17, 28, 19, 5],
    },
    {
      label: "Example 3",
      nums: [1, 8, 15, 22, 29],
    },
    {
      label: "Example 4",
      nums: [8],
    },
  ],
  "median-employee-salary": [
    {
      label: "Example 1",
    },
    {
      label: "Example 2",
      table: "two pointer sliding window",
    },
    {
      label: "Example 3",
      table: "learning algorithm structures",
    },
  ],
  "median-of-two-sorted-arrays": [
    {
      label: "Example 1",
      nums1: [15, 24],
      nums2: [17],
    },
    {
      label: "Example 2",
      nums1: [22, 29],
      nums2: [26, 33],
    },
    {
      label: "Example 3",
      nums1: [29, 1, 12, 25],
      nums2: [33, 5, 14, 21, 28],
    },
    {
      label: "Example 4",
      nums1: [],
      nums2: [1],
    },
    {
      label: "Example 5",
      nums1: [6, 11],
      nums2: [6, 11],
    },
    {
      label: "Example 6",
      nums1: [29, 1, 8, 15],
      nums2: [15, 22, 29],
    },
    {
      label: "Example 7",
      nums1: [22, 31, 5, 14, 23, 32, 6, 15, 24, 33],
      nums2: [22, 27, 32, 2, 7, 12, 19, 28, 2, 11, 20, 29, 3, 12, 21, 30],
    },
  ],
  "merge-intervals": [
    {
      label: "Example 1",
      intervals: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
    {
      label: "Example 2",
      intervals: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
    {
      label: "Example 3",
      intervals: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
    {
      label: "Example 4",
      intervals: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
    {
      label: "Example 5",
      intervals: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
  ],
  "merge-ksorted-lists": [
    {
      label: "Example 1",
      lists: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
    {
      label: "Example 2",
      lists: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
  ],
  "merge-sorted-array": [
    {
      label: "Example 1",
      nums1: [22, 29, 1, 35, 5, 10],
      m: 26,
      nums2: [24, 35, 7],
      n: 4,
    },
    {
      label: "Example 2",
      nums1: [29, 32],
      m: 31,
      nums2: [31],
      n: 5,
    },
    {
      label: "Example 3",
      nums1: [7, 14, 21, 14, 19, 24],
      m: 48,
      nums2: [1, 8, 15],
      n: 6,
    },
  ],
  "merge-two-sorted-lists": [
    {
      label: "Example 1",
      list1: [6, 2, 6, 2],
      list2: [6, 2, 6, 2],
    },
    {
      label: "Example 2",
      list1: [1, 5, 1],
      list2: [1, 5, 1],
    },
    {
      label: "Example 3",
      list1: [],
      list2: [4, 8, 4, 8, 4],
    },
    {
      label: "Example 4",
      list1: [],
      list2: [],
    },
    {
      label: "Example 5",
      list1: [2, 6, 2, 6],
      list2: [2, 6, 2, 6],
    },
  ],
  "min-cost-climbing-stairs": [
    {
      label: "Example 1",
      input: [19, 34, 14],
    },
    {
      label: "Example 2",
      input: [8, 1, 18, 23, 28, 21, 3, 8, 1, 18],
    },
  ],
  "min-size-subarray-sum": [
    {
      label: "Example 1",
      target: 19,
      nums: [26, 33, 34, 6, 15, 18],
    },
    {
      label: "Example 2",
      target: 23,
      nums: [31, 7, 12],
    },
    {
      label: "Example 3",
      target: 27,
      nums: [3, 8, 13, 18, 23, 28, 33, 3],
    },
  ],
  "min-stack": [
    {
      label: "Example 1",
      ops: [
        {
          type: "push",
          val: -2,
        },
        {
          type: "push",
          val: 0,
        },
        {
          type: "push",
          val: -3,
        },
        {
          type: "getMin",
        },
        {
          type: "pop",
        },
        {
          type: "top",
        },
        {
          type: "getMin",
        },
      ],
    },
    {
      label: "Example 2",
      ops: [
        {
          type: "push",
          val: 5,
        },
        {
          type: "push",
          val: 3,
        },
        {
          type: "push",
          val: 7,
        },
        {
          type: "getMin",
        },
        {
          type: "pop",
        },
        {
          type: "getMin",
        },
      ],
    },
    {
      label: "Example 3",
      ops: [
        {
          type: "push",
          val: 10,
        },
        {
          type: "push",
          val: 6,
        },
        {
          type: "push",
          val: 3,
        },
        {
          type: "push",
          val: 1,
        },
        {
          type: "getMin",
        },
        {
          type: "pop",
        },
        {
          type: "getMin",
        },
      ],
    },
  ],
  minesweeper: [
    {
      label: "Example 1",
      board: [
        ["C", "A", "T"],
        ["D", "O", "G"],
        ["B", "A", "T"],
      ],
      click: [13, 18],
    },
    {
      label: "Example 2",
      board: [
        ["C", "A", "T"],
        ["D", "O", "G"],
        ["B", "A", "T"],
      ],
      click: [28, 29],
    },
  ],
  "minimum-absolute-difference-in-bst": [
    {
      label: "Example 1",
      root: [24, 25, 3, 33, 7],
    },
    {
      label: "Example 2",
      root: [25, 28, 24, null, null, 2, 11],
    },
  ],
  "minimum-depth-of-binary-tree": [
    {
      label: "Example 1",
      arr: [25, 7, 34, null, null, 4, 28],
    },
    {
      label: "Example 2",
      arr: [],
    },
  ],
  "minimum-genetic-mutation": [
    {
      label: "Example 1",
      start: "interactive computational stepping",
      end: "interactive computational stepping",
      bank: ["node", "edge", "tree", "path", "cycle"],
    },
  ],
  "minimum-height-trees": [
    {
      label: "Example 1",
      n: 4,
      edges: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
    {
      label: "Example 2",
      n: 5,
      edges: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
  ],
  "minimum-moves-to-equal-array-elements": [
    {
      label: "Example 1",
      nums: [32, 35, 5, 26, 27],
      expected: 14,
    },
    {
      label: "Example 2",
      nums: [4, 11, 18],
      expected: 42,
    },
    {
      label: "Example 3",
      nums: [19, 24, 29],
      expected: 44,
    },
  ],
  "minimum-moves-to-equal-array-elements-ii": [
    {
      label: "Example 1",
      nums: [24, 27, 32, 18, 19],
      expected: 27,
    },
    {
      label: "Example 2",
      nums: [31, 3, 10],
      expected: 2,
    },
    {
      label: "Example 3",
      nums: [3, 8, 13, 18],
      expected: 7,
    },
  ],
  "minimum-number-of-arrows-to-burst-balloons": [
    {
      label: "Example 1",
      points: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
      expected: 21,
    },
    {
      label: "Example 2",
      points: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
      expected: 38,
    },
    {
      label: "Example 3",
      points: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
      expected: 40,
    },
  ],
  "minimum-path-sum": [
    {
      label: "Example 1",
      grid: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
    {
      label: "Example 2",
      grid: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
  ],
  "minimum-size-subarray-sum": [
    {
      label: "Example 1",
      target: "two pointer sliding window",
      nums: "two pointer sliding window",
    },
    {
      label: "Example 2",
      target: "learning algorithm structures",
      nums: "learning algorithm structures",
    },
    {
      label: "Example 3",
      target: "interactive computational stepping",
      nums: "interactive computational stepping",
    },
  ],
  "minimum-time-difference": [
    {
      label: "Example 1",
      timePoints: ["node", "edge", "tree", "path", "cycle"],
    },
    {
      label: "Example 2",
      timePoints: ["node", "edge", "tree", "path", "cycle"],
    },
  ],
  "minimum-window-substring": [
    {
      label: "Example 1",
      s: "monotonic stack queue balance",
      t: "monotonic stack queue balance",
    },
    {
      label: "Example 2",
      s: "two pointer sliding window",
      t: "two pointer sliding window",
    },
    {
      label: "Example 3",
      s: "learning algorithm structures",
      t: "learning algorithm structures",
    },
    {
      label: "Example 4",
      s: "interactive computational stepping",
      t: "interactive computational stepping",
    },
  ],
  "missing-number": [
    {
      label: "Example 1",
      nums: [6, 5, 12],
    },
    {
      label: "Example 2",
      nums: [7, 14],
    },
    {
      label: "Example 3",
      nums: [32, 31, 32, 33, 5, 14, 23, 14, 21],
    },
  ],
  "missing-ranges": [
    {
      label: "Example 1",
      nums: [35, 7, 16, 10, 30],
      lower: 42,
      upper: 39,
    },
    {
      label: "Example 2",
      nums: [],
      lower: 6,
      upper: 6,
    },
  ],
  "most-frequent-subtree-sum": [
    {
      label: "Example 1",
      tree: [30, 29, 24],
    },
    {
      label: "Example 2",
      tree: [2, 1, 27],
    },
  ],
  "move-zeroes": [
    {
      label: "Example 1",
      nums: [10, 17, 20, 31, 19],
    },
    {
      label: "Example 2",
      nums: [17, 22, 29],
    },
    {
      label: "Example 3",
      nums: [26, 29, 3, 4, 9, 22, 29],
    },
  ],
  "moving-average-data-stream": [
    {
      label: "Example 1",
      size: 32,
      stream: [26, 14, 5, 14],
    },
    {
      label: "Example 2",
      size: 40,
      stream: [4, 5, 22, 23],
    },
  ],
  "multiply-strings": [
    {
      label: "Example 1",
      num1: "interactive computational stepping",
      num2: "interactive computational stepping",
    },
    {
      label: "Example 2",
      num1: "efficient dynamic programming state",
      num2: "efficient dynamic programming state",
    },
    {
      label: "Example 3",
      num1: "graph search traversal tree",
      num2: "graph search traversal tree",
    },
    {
      label: "Example 4",
      num1: "monotonic stack queue balance",
      num2: "monotonic stack queue balance",
    },
  ],
  "n-ary-tree-level-order-traversal": [
    {
      label: "Example 1",
      root: [30, null, 9, 12, 21, null, 33, 5],
    },
  ],
  "nary-tree-level-order": [
    {
      label: "Example 1",
      root: [30, null, 9, 12, 21, null, 33, 5],
    },
  ],
  "next-greater-element-i": [
    {
      label: "Example 1",
      nums1: [27, 26, 33],
      nums2: [21, 30, 2, 3],
    },
    {
      label: "Example 2",
      nums1: [30, 4],
      nums2: [28, 35, 7, 14],
    },
  ],
  "next-greater-element-ii": [
    {
      label: "Example 1",
      text: "two pointer sliding window",
    },
    {
      label: "Example 2",
      text: "learning algorithm structures",
    },
    {
      label: "Example 3",
      text: "interactive computational stepping",
    },
  ],
  "next-permutation": [
    {
      label: "Example 1",
      nums: [26, 33, 5],
    },
    {
      label: "Example 2",
      nums: [2, 5, 8],
    },
    {
      label: "Example 3",
      nums: [5, 10, 23],
    },
    {
      label: "Example 4",
      nums: [12, 21, 24, 33, 1],
    },
  ],
  "non-overlapping-intervals": [
    {
      label: "Example 1",
      val: "graph search traversal tree",
    },
    {
      label: "Example 2",
      val: "monotonic stack queue balance",
    },
    {
      label: "Example 3",
      val: "two pointer sliding window",
    },
    {
      label: "Example 4",
      val: "learning algorithm structures",
    },
  ],
  nqueens: [
    {
      label: "Example 1",
      n: 4,
    },
    {
      label: "Example 2",
      n: 5,
    },
    {
      label: "Example 3",
      n: 6,
    },
  ],
  nqueensii: [
    {
      label: "Example 1",
      n: 4,
    },
    {
      label: "Example 2",
      n: 5,
    },
  ],
  "nth-digit": [
    {
      label: "Example 1",
      n: 4,
    },
    {
      label: "Example 2",
      n: 5,
    },
  ],
  "number-complement": [
    {
      label: "Example 1",
      num: 48,
    },
    {
      label: "Example 2",
      num: 47,
    },
  ],
  "number-of-boomerangs": [
    {
      label: "Example 1",
      points: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
    {
      label: "Example 2",
      points: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
  ],
  "number-of-islands": [
    {
      label: "Example 1",
      gridStr: "efficient dynamic programming state",
    },
    {
      label: "Example 2",
      gridStr: "graph search traversal tree",
    },
    {
      label: "Example 3",
      gridStr: "monotonic stack queue balance",
    },
  ],
  "number-of-islands-ii": [
    {
      label: "Example 1",
      m: 45,
      n: 4,
      positions: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
    {
      label: "Example 2",
      m: 9,
      n: 5,
      positions: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
    {
      label: "Example 3",
      m: 14,
      n: 6,
      positions: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
  ],
  "number-of-segments-in-a-string": [
    {
      label: "Example 1",
      s: "efficient dynamic programming state",
    },
    {
      label: "Example 2",
      s: "graph search traversal tree",
    },
    {
      label: "Example 3",
      s: "monotonic stack queue balance",
    },
    {
      label: "Example 4",
      s: "two pointer sliding window",
    },
  ],
  "number-of1-bits": [
    {
      label: "Example 1",
      n: 4,
      desc: "graph search traversal tree",
    },
    {
      label: "Example 2",
      n: 5,
      desc: "monotonic stack queue balance",
    },
    {
      label: "Example 3",
      n: 6,
      desc: "two pointer sliding window",
    },
  ],
  "odd-even-linked-list": [
    {
      label: "Example 1",
      values: [7, 14, 21, 28, 35],
    },
    {
      label: "Example 2",
      values: [16, 19, 28, 2, 9, 10, 21],
    },
  ],
  "one-edit-distance": [
    {
      label: "Example 1",
      s1: "two pointer sliding window",
      s2: "two pointer sliding window",
    },
    {
      label: "Example 2",
      s1: "learning algorithm structures",
      s2: "learning algorithm structures",
    },
  ],
  "ones-and-zeroes": [
    {
      label: "Example 1",
      strs: ["node", "edge", "tree", "path", "cycle"],
      m: 34,
      n: 4,
    },
    {
      label: "Example 2",
      strs: ["node", "edge", "tree", "path", "cycle"],
      m: 33,
      n: 5,
    },
  ],
  "optimal-account-balancing": [
    {
      label: "Example 1",
      text: "graph search traversal tree",
    },
    {
      label: "Example 2",
      text: "monotonic stack queue balance",
    },
    {
      label: "Example 3",
      text: "two pointer sliding window",
    },
  ],
  "output-contest-matches": [
    {
      label: "Example 1",
      n: 4,
    },
    {
      label: "Example 2",
      n: 5,
    },
    {
      label: "Example 3",
      n: 6,
    },
  ],
  "palindrome-linked-list": [
    {
      label: "Example 1",
      nums: [5, 12, 17, 20],
    },
    {
      label: "Example 2",
      nums: [12, 19, 22],
    },
    {
      label: "Example 3",
      nums: [19, 26],
    },
    {
      label: "Example 4",
      nums: [26, 33, 5, 8, 11],
    },
  ],
  "palindrome-number": [
    {
      label: "Example 1",
      value: "graph search traversal tree",
    },
    {
      label: "Example 2",
      value: "monotonic stack queue balance",
    },
    {
      label: "Example 3",
      value: "two pointer sliding window",
    },
    {
      label: "Example 4",
      value: "learning algorithm structures",
    },
    {
      label: "Example 5",
      value: "interactive computational stepping",
    },
    {
      label: "Example 6",
      value: "efficient dynamic programming state",
    },
    {
      label: "Example 7",
      value: "graph search traversal tree",
    },
  ],
  "palindrome-partitioning": [
    {
      label: "Example 1",
      s: "two pointer sliding window",
    },
    {
      label: "Example 2",
      s: "learning algorithm structures",
    },
    {
      label: "Example 3",
      s: "interactive computational stepping",
    },
    {
      label: "Example 4",
      s: "efficient dynamic programming state",
    },
  ],
  "palindrome-partitioning-ii": [
    {
      label: "Example 1",
      s: "learning algorithm structures",
    },
    {
      label: "Example 2",
      s: "interactive computational stepping",
    },
    {
      label: "Example 3",
      s: "efficient dynamic programming state",
    },
  ],
  "palindrome-subsequence": [
    {
      label: "Example 1",
      s: "monotonic stack queue balance",
    },
    {
      label: "Example 2",
      s: "two pointer sliding window",
    },
    {
      label: "Example 3",
      s: "learning algorithm structures",
    },
    {
      label: "Example 4",
      s: "interactive computational stepping",
    },
    {
      label: "Example 5",
      s: "efficient dynamic programming state",
    },
  ],
  "palindromic-substrings": [
    {
      label: "Example 1",
      s: "two pointer sliding window",
    },
    {
      label: "Example 2",
      s: "learning algorithm structures",
    },
    {
      label: "Example 3",
      s: "interactive computational stepping",
    },
    {
      label: "Example 4",
      s: "efficient dynamic programming state",
    },
  ],
  "partition-equal-subset": [
    {
      label: "Example 1",
      nums: [10, 23, 5, 33],
    },
    {
      label: "Example 2",
      nums: [17, 24, 31, 5],
    },
    {
      label: "Example 3",
      nums: [28, 33, 3, 10, 17],
    },
    {
      label: "Example 4",
      nums: [31, 1],
    },
  ],
  "pascals-triangle": [
    {
      label: "Example 1",
      numRows: 4,
    },
    {
      label: "Example 2",
      numRows: 5,
    },
    {
      label: "Example 3",
      numRows: 6,
    },
  ],
  "patching-array": [
    {
      label: "Example 1",
      nums: [13, 22],
      n: 4,
    },
    {
      label: "Example 2",
      nums: [20, 33, 13],
      n: 5,
    },
  ],
  "path-sum": [
    {
      label: "Example 1",
      root: [32, 35, 13, 24, null, 3, 25, 1, 31, null, 4],
      targetSum: 14,
    },
    {
      label: "Example 2",
      root: [31, 3, 10],
      targetSum: 18,
    },
  ],
  "path-sum-ii": [
    {
      label: "Example 1",
      root: [35, 3, 16, 27, null, 6, 28, 4, 34, null, null, 20, 17],
      targetSum: 15,
    },
    {
      label: "Example 2",
      root: [34, 6, 13],
      targetSum: 19,
    },
  ],
  "path-sum-iii": [
    {
      label: "Example 1",
      root: [2, 32, 21, 3, 6, null, 34, 23, 18, null, 34],
      targetSum: 19,
    },
    {
      label: "Example 2",
      root: [34, 2, 15, 26, null, 5, 27, 3, 33, null, null, 19, 16],
      targetSum: 23,
    },
  ],
  "perfect-rectangle": [
    {
      label: "Example 1",
      rectangles: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
    {
      label: "Example 2",
      rectangles: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
    {
      label: "Example 3",
      rectangles: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
  ],
  "perfect-rectangles": [
    {
      label: "Example 1",
      rectangles: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
    {
      label: "Example 2",
      rectangles: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
    {
      label: "Example 3",
      rectangles: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
  ],
  "perfect-squares": [
    {
      label: "Example 1",
      n: 4,
    },
    {
      label: "Example 2",
      n: 5,
    },
    {
      label: "Example 3",
      n: 6,
    },
    {
      label: "Example 4",
      n: 4,
    },
  ],
  "permutation-in-string": [
    {
      label: "Example 1",
      s1: "graph search traversal tree",
      s2: "graph search traversal tree",
    },
    {
      label: "Example 2",
      s1: "monotonic stack queue balance",
      s2: "monotonic stack queue balance",
    },
    {
      label: "Example 3",
      s1: "two pointer sliding window",
      s2: "two pointer sliding window",
    },
  ],
  "permutation-sequence": [
    {
      label: "Example 1",
      n: 4,
      k: 2,
    },
    {
      label: "Example 2",
      n: 5,
      k: 3,
    },
  ],
  permutations: [
    {
      label: "Example 1",
      nums: [1, 8, 15],
    },
    {
      label: "Example 2",
      nums: [6, 13],
    },
    {
      label: "Example 3",
      nums: [15, 22, 29, 1],
    },
  ],
  "permutations-ii": [
    {
      label: "Example 1",
      nums: [4, 9, 16],
    },
    {
      label: "Example 2",
      nums: [9, 16],
    },
    {
      label: "Example 3",
      nums: [18, 25, 30],
    },
    {
      label: "Example 4",
      nums: [25, 30, 35],
    },
  ],
  "plus-one": [
    {
      label: "Example 1",
      digits: [26, 33, 5],
      desc: "learning algorithm structures",
    },
    {
      label: "Example 2",
      digits: [4, 7, 10, 13],
      desc: "interactive computational stepping",
    },
    {
      label: "Example 3",
      digits: [21],
      desc: "efficient dynamic programming state",
    },
    {
      label: "Example 4",
      digits: [28, 33, 3],
      desc: "graph search traversal tree",
    },
  ],
  "plus-one-linked-list": [
    {
      label: "Example 1",
      values: [6, 11, 16],
    },
    {
      label: "Example 2",
      values: [32, 4, 11],
    },
  ],
  "poor-pigs": [
    {
      label: "Example 1",
      buckets: 7,
      minutesToDie: 2,
      minutesToTest: 37,
    },
    {
      label: "Example 2",
      buckets: 42,
      minutesToDie: 21,
      minutesToTest: 21,
    },
  ],
  "power-of-three": [
    {
      label: "Example 1",
      n: 4,
    },
    {
      label: "Example 2",
      n: 5,
    },
    {
      label: "Example 3",
      n: 6,
    },
  ],
  "power-of-two": [
    {
      label: "Example 1",
      n: 4,
      desc: "graph search traversal tree",
    },
    {
      label: "Example 2",
      n: 5,
      desc: "monotonic stack queue balance",
    },
    {
      label: "Example 3",
      n: 6,
      desc: "two pointer sliding window",
    },
    {
      label: "Example 4",
      n: 4,
      desc: "learning algorithm structures",
    },
  ],
  "powx-n": [
    {
      label: "Example 1",
      x: 7,
      n: 4,
    },
    {
      label: "Example 2",
      x: 18.30000000000001,
      n: 5,
    },
    {
      label: "Example 3",
      x: 29,
      n: 6,
    },
  ],
  "predict-the-winner": [
    {
      label: "Example 1",
      nums: [26, 4, 10, 18],
    },
    {
      label: "Example 2",
      nums: [33, 11, 10],
    },
  ],
  problem359: [
    {
      label: "Example 1",
      requests: [
        {
          timestamp: 1,
          message: "foo",
        },
        {
          timestamp: 1,
          message: "bar",
        },
        {
          timestamp: 3,
          message: "foo",
        },
        {
          timestamp: 8,
          message: "bar",
        },
        {
          timestamp: 10,
          message: "foo",
        },
        {
          timestamp: 11,
          message: "foo",
        },
      ],
      threshold: 6,
    },
    {
      label: "Example 2",
      requests: [
        {
          timestamp: 0,
          message: "a",
        },
        {
          timestamp: 0,
          message: "b",
        },
        {
          timestamp: 0,
          message: "c",
        },
        {
          timestamp: 2,
          message: "a",
        },
        {
          timestamp: 5,
          message: "a",
        },
      ],
      threshold: 8,
    },
    {
      label: "Example 3",
      requests: [
        {
          timestamp: 0,
          message: "msg",
        },
        {
          timestamp: 5,
          message: "msg",
        },
        {
          timestamp: 10,
          message: "msg",
        },
        {
          timestamp: 15,
          message: "msg",
        },
      ],
      threshold: 43,
    },
  ],
  "product-of-array-except-self": [
    {
      label: "Example 1",
      nums: [17, 24, 31, 3],
    },
    {
      label: "Example 2",
      nums: [24, 27, 3, 10],
    },
    {
      label: "Example 3",
      nums: [29, 34, 6, 13],
    },
    {
      label: "Example 4",
      nums: [34, 10, 5, 24],
    },
  ],
  "random-flip-matrix": [
    {
      label: "Example 1",
      m: 43,
      n: 4,
    },
    {
      label: "Example 2",
      m: 48,
      n: 5,
    },
  ],
  "random-pick-index": [
    {
      label: "Example 1",
      nums: [7, 16, 21, 26, 35],
    },
    {
      label: "Example 2",
      nums: [14, 19, 24, 29],
    },
  ],
  "random-pick-with-weight": [
    {
      label: "Example 1",
      w: [12],
    },
    {
      label: "Example 2",
      w: [19, 28],
    },
    {
      label: "Example 3",
      w: [26, 35, 7],
    },
  ],
  "random-point-in-non-overlapping-rectangles": [
    {
      label: "Example 1",
      rects: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
    {
      label: "Example 2",
      rects: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
  ],
  "randomized-collection": [
    {
      label: "Example 1",
      ops: [
        {
          type: "insert",
          val: 1,
        },
        {
          type: "insert",
          val: 1,
        },
        {
          type: "insert",
          val: 2,
        },
        {
          type: "getRandom",
        },
        {
          type: "remove",
          val: 1,
        },
        {
          type: "getRandom",
        },
        {
          type: "insert",
          val: 2,
        },
        {
          type: "getRandom",
        },
        {
          type: "remove",
          val: 2,
        },
        {
          type: "getRandom",
        },
      ],
    },
    {
      label: "Example 2",
      ops: [
        {
          type: "insert",
          val: 0,
        },
        {
          type: "insert",
          val: 1,
        },
        {
          type: "remove",
          val: 0,
        },
        {
          type: "insert",
          val: 2,
        },
        {
          type: "remove",
          val: 1,
        },
        {
          type: "getRandom",
        },
      ],
    },
  ],
  "range-sum-query-2d-immutable": [
    {
      label: "Example 1",
      matrix: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
      row1: 35,
      col1: 32,
      row2: 41,
      col2: 38,
    },
  ],
  "range-sum-query-2d-mutable": [
    {
      label: "Example 1",
      matrix: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
      operations: [
        {
          type: "sumRegion",
          row1: 0,
          col1: 0,
          row2: 1,
          col2: 1,
        },
        {
          type: "update",
          row: 1,
          col: 1,
          value: 2,
        },
        {
          type: "sumRegion",
          row1: 0,
          col1: 0,
          row2: 1,
          col2: 1,
        },
      ],
    },
  ],
  "range-sum-query-immutable": [
    {
      label: "Example 1",
      nums: [31, 5, 16, 5, 24, 23],
      left: 22,
      right: 28,
    },
    {
      label: "Example 2",
      nums: [3, 12, 23, 12, 31, 30],
      left: 39,
      right: 48,
    },
  ],
  "range-sum-query-mutable": [
    {
      label: "Example 1",
      nums: [14, 23, 32],
      operations: [
        {
          type: "sumRange",
          left: 0,
          right: 2,
        },
        {
          type: "update",
          index: 1,
          value: 2,
        },
        {
          type: "sumRange",
          left: 0,
          right: 2,
        },
      ],
    },
  ],
  "read-n-characters-given-read4": [
    {
      label: "Example 1",
      file: "interactive computational stepping",
      n: 4,
    },
    {
      label: "Example 2",
      file: "efficient dynamic programming state",
      n: 5,
    },
  ],
  "read-n-characters-given-read4-ii": [
    {
      label: "Example 1",
      file: "efficient dynamic programming state",
      calls: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
    {
      label: "Example 2",
      file: "graph search traversal tree",
      calls: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
  ],
  "rearrange-string-k-distance-apart": [
    {
      label: "Example 1",
      s: "monotonic stack queue balance",
      k: 2,
    },
    {
      label: "Example 2",
      s: "two pointer sliding window",
      k: 3,
    },
  ],
  "reconstruct-original-digits": [
    {
      label: "Example 1",
      s: "graph search traversal tree",
    },
  ],
  "reconstruct-original-digits-from-english": [
    {
      label: "Example 1",
      s: "graph search traversal tree",
    },
  ],
  "rectangle-area": [
    {
      label: "Example 1",
      vals: {
        ax1: "interactive computational stepping",
        ay1: "interactive computational stepping",
        ax2: "interactive computational stepping",
        ay2: "interactive computational stepping",
        bx1: "interactive computational stepping",
        by1: "interactive computational stepping",
        bx2: "interactive computational stepping",
        by2: "interactive computational stepping",
      },
    },
    {
      label: "Example 2",
      vals: {
        ax1: "efficient dynamic programming state",
        ay1: "efficient dynamic programming state",
        ax2: "efficient dynamic programming state",
        ay2: "efficient dynamic programming state",
        bx1: "efficient dynamic programming state",
        by1: "efficient dynamic programming state",
        bx2: "efficient dynamic programming state",
        by2: "efficient dynamic programming state",
      },
    },
    {
      label: "Example 3",
      vals: {
        ax1: "graph search traversal tree",
        ay1: "graph search traversal tree",
        ax2: "graph search traversal tree",
        ay2: "graph search traversal tree",
        bx1: "graph search traversal tree",
        by1: "graph search traversal tree",
        bx2: "graph search traversal tree",
        by2: "graph search traversal tree",
      },
    },
  ],
  "redundant-connection": [
    {
      label: "Example 1",
      edges: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
    {
      label: "Example 2",
      edges: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
  ],
  "regular-expression-matching": [
    {
      label: "Example 1",
      s: "monotonic stack queue balance",
      p: "monotonic stack queue balance",
    },
    {
      label: "Example 2",
      s: "two pointer sliding window",
      p: "two pointer sliding window",
    },
  ],
  "remove-boxes": [
    {
      label: "Example 1",
      text: "learning algorithm structures",
    },
    {
      label: "Example 2",
      text: "interactive computational stepping",
    },
    {
      label: "Example 3",
      text: "efficient dynamic programming state",
    },
  ],
  "remove-duplicate-letters": [
    {
      label: "Example 1",
      s: "monotonic stack queue balance",
    },
    {
      label: "Example 2",
      s: "two pointer sliding window",
    },
  ],
  "remove-duplicates": [
    {
      label: "Example 1",
      nums: [10, 15, 22],
    },
    {
      label: "Example 2",
      nums: [15, 20, 27, 32, 2, 9, 14, 21, 26, 33],
    },
    {
      label: "Example 3",
      nums: [24, 31, 1, 8, 15, 20, 27],
    },
  ],
  "remove-invalid-parentheses": [
    {
      label: "Example 1",
      s: "interactive computational stepping",
    },
  ],
  "remove-k-digits": [
    {
      label: "Example 1",
      num: "learning algorithm structures",
      k: 2,
    },
    {
      label: "Example 2",
      num: "interactive computational stepping",
      k: 3,
    },
  ],
  "remove-nth-node": [
    {
      label: "Example 1",
      input: "graph search traversal tree",
    },
    {
      label: "Example 2",
      input: "monotonic stack queue balance",
    },
    {
      label: "Example 3",
      input: "two pointer sliding window",
    },
    {
      label: "Example 4",
      input: "learning algorithm structures",
    },
  ],
  "reorder-list": [
    {
      label: "Example 1",
      arr: [12, 19, 26, 33],
    },
    {
      label: "Example 2",
      arr: [19, 26, 33, 5, 12],
    },
    {
      label: "Example 3",
      arr: [26, 33, 5, 12, 19, 26],
    },
  ],
  "repeated-substring-pattern": [
    {
      label: "Example 1",
      s: "graph search traversal tree",
    },
    {
      label: "Example 2",
      s: "monotonic stack queue balance",
    },
  ],
  "reshape-matrix": [
    {
      label: "Example 1",
      mat: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
      r: 43,
      c: 43,
    },
    {
      label: "Example 2",
      mat: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
      r: 1,
      c: 10,
    },
    {
      label: "Example 3",
      mat: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
      r: 15,
      c: 18,
    },
  ],
  "restore-ip-addresses": [
    {
      label: "Example 1",
      s: "graph search traversal tree",
    },
    {
      label: "Example 2",
      s: "monotonic stack queue balance",
    },
  ],
  "reverse-bits": [
    {
      label: "Example 1",
      n: 4,
      desc: "monotonic stack queue balance",
    },
    {
      label: "Example 2",
      n: 5,
      desc: "two pointer sliding window",
    },
    {
      label: "Example 3",
      n: 6,
      desc: "learning algorithm structures",
    },
  ],
  "reverse-integer": [
    {
      label: "Example 1",
      x: 19,
    },
    {
      label: "Example 2",
      x: -8,
    },
    {
      label: "Example 3",
      x: 32,
    },
    {
      label: "Example 4",
      x: 40,
    },
  ],
  "reverse-kgroup": [
    {
      label: "Example 1",
      list: [17, 24, 31, 3, 10],
      k: 2,
    },
    {
      label: "Example 2",
      list: [24, 31, 3, 10, 17],
      k: 3,
    },
    {
      label: "Example 3",
      list: [31, 3, 10, 17, 24, 31],
      k: 4,
    },
  ],
  "reverse-linked-list": [
    {
      label: "Example 1",
      values: [26, 33, 5, 12, 19],
    },
    {
      label: "Example 2",
      values: [33, 5],
    },
    {
      label: "Example 3",
      values: [17],
    },
    {
      label: "Example 4",
      values: [16, 17, 28, 27, 5],
    },
  ],
  "reverse-pairs": [
    {
      label: "Example 1",
      nums: [12, 21, 24, 31, 32],
    },
    {
      label: "Example 2",
      nums: [21, 30, 33, 7, 4],
    },
  ],
  "reverse-string": [
    {
      label: "Example 1",
      s: ["node", "edge", "tree", "path", "cycle"],
    },
    {
      label: "Example 2",
      s: ["node", "edge", "tree", "path", "cycle"],
    },
    {
      label: "Example 3",
      s: ["node", "edge", "tree", "path", "cycle"],
    },
  ],
  "reverse-string-ii": [
    {
      label: "Example 1",
      s: "interactive computational stepping",
      k: 2,
    },
    {
      label: "Example 2",
      s: "efficient dynamic programming state",
      k: 3,
    },
    {
      label: "Example 3",
      s: "graph search traversal tree",
      k: 4,
    },
  ],
  "reverse-vowels": [
    {
      label: "Example 1",
      input: "efficient dynamic programming state",
    },
    {
      label: "Example 2",
      input: "graph search traversal tree",
    },
    {
      label: "Example 3",
      input: "monotonic stack queue balance",
    },
  ],
  "reverse-words-in-a-string": [
    {
      label: "Example 1",
      s: "interactive computational stepping",
    },
    {
      label: "Example 2",
      s: "efficient dynamic programming state",
    },
  ],
  "right-side-view": [
    {
      label: "Example 1",
      arr: [3, 10, 17, null, 31, null, 4],
    },
    {
      label: "Example 2",
      arr: [10, 17, null, 29],
    },
    {
      label: "Example 3",
      arr: [17],
    },
    {
      label: "Example 4",
      arr: [24, 31, 3, 10, 17, 24, 31],
    },
  ],
  "robot-room-cleaner": [
    {
      label: "Example 1",
      room: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
    {
      label: "Example 2",
      room: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
  ],
  "roman-to-integer": [
    {
      label: "Example 1",
      s: "interactive computational stepping",
    },
    {
      label: "Example 2",
      s: "efficient dynamic programming state",
    },
    {
      label: "Example 3",
      s: "graph search traversal tree",
    },
    {
      label: "Example 4",
      s: "monotonic stack queue balance",
    },
    {
      label: "Example 5",
      s: "two pointer sliding window",
    },
  ],
  "rotate-array": [
    {
      label: "Example 1",
      nums: [10, 17, 24, 31, 3, 10, 17],
      k: 2,
    },
    {
      label: "Example 2",
      nums: [13, 30, 31, 18],
      k: 3,
    },
    {
      label: "Example 3",
      nums: [24, 31, 3, 10, 17],
      k: 4,
    },
  ],
  "rotate-function": [
    {
      label: "Example 1",
      nums: [1, 8, 15, 22],
    },
    {
      label: "Example 2",
      nums: [10, 19, 28, 2],
    },
  ],
  "rotate-image": [
    {
      label: "Example 1",
      matrix: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
    {
      label: "Example 2",
      matrix: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
  ],
  "rotate-list": [
    {
      label: "Example 1",
      list: [11, 18, 25, 32, 4],
      k: 2,
    },
    {
      label: "Example 2",
      list: [16, 23, 30],
      k: 3,
    },
    {
      label: "Example 3",
      list: [25, 32, 4],
      k: 4,
    },
    {
      label: "Example 4",
      list: [9],
      k: 2,
    },
  ],
  "rotting-oranges": [
    {
      label: "Example 1",
      grid: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
    {
      label: "Example 2",
      grid: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
    {
      label: "Example 3",
      grid: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
    {
      label: "Example 4",
      grid: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
  ],
  "brace-expansion-ii": [
    {
      label: "Union + Product",
      expression: "{a,b{c,d},e}{x,{y,z}}",
    },
    {
      label: "Deep Nesting",
      expression: "p{a,{b,{c,d}}}{x,y}q",
    },
    {
      label: "Nested Groups",
      expression: "{{a,b},{c,{d,e}}}{x,y}",
    },
    {
      label: "Three Products",
      expression: "{a,b}{x,{y,z}}{m,n}",
    },
    {
      label: "Deduplication",
      expression: "{{a,b},{b,c},a{d,e},{ad,f}}",
    },
  ],
  "russian-doll-envelopes": [
    {
      label: "Example 1",
      envelopes: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
    {
      label: "Example 2",
      envelopes: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
    {
      label: "Example 3",
      envelopes: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
  ],
  "same-tree": [
    {
      label: "Example 1",
      p: [23, 30, 2],
      q: [23, 30, 2],
    },
    {
      label: "Example 2",
      p: [30, 2],
      q: [30, null, 7],
    },
    {
      label: "Example 3",
      p: [2, 9, 12],
      q: [2, 7, 14],
    },
    {
      label: "Example 4",
      p: [15, 16, 31, 24, 33, 9, 20],
      q: [15, 16, 31, 24, 33, 9, 20],
    },
  ],
  "scramble-string": [
    {
      label: "Example 1",
      s1: "graph search traversal tree",
      s2: "graph search traversal tree",
    },
    {
      label: "Example 2",
      s1: "monotonic stack queue balance",
      s2: "monotonic stack queue balance",
    },
  ],
  "search-a-2d-matrix": [
    {
      label: "Example 1",
      matrix: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
      target: 16,
    },
    {
      label: "Example 2",
      matrix: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
      target: 20,
    },
    {
      label: "Example 3",
      matrix: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
      target: 24,
    },
  ],
  "search-a-2d-matrix-ii": [
    {
      label: "Example 1",
      matrix: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
      target: 12,
    },
    {
      label: "Example 2",
      matrix: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
      target: 16,
    },
    {
      label: "Example 3",
      matrix: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
      target: 20,
    },
  ],
  "search-in-rotated-sorted-array": [
    {
      label: "Example 1",
      nums: [3, 10, 17, 24, 15, 22, 29],
      target: 15,
    },
    {
      label: "Example 2",
      nums: [10, 17, 24, 31, 22, 29, 1],
      target: 19,
    },
    {
      label: "Example 3",
      nums: [11, 20],
      target: 23,
    },
    {
      label: "Example 4",
      nums: [18, 25, 32, 4, 11, 18],
      target: 27,
    },
    {
      label: "Example 5",
      nums: [25],
      target: 31,
    },
  ],
  "search-in-rotated-sorted-array-ii": [
    {
      label: "Example 1",
      nums: [1, 4, 11, 16, 21],
      target: 13,
    },
    {
      label: "Example 2",
      nums: [
        8, 13, 18, 23, 28, 33, 3, 8, 13, 18, 23, 28, 33, 5, 8, 13, 18, 23, 28,
      ],
      target: 17,
    },
  ],
  "search-insert-position": [
    {
      label: "Example 1",
      nums: [3, 12, 21, 28],
      target: 17,
    },
    {
      label: "Example 2",
      nums: [10, 19, 28, 35],
      target: 21,
    },
  ],
  "search2-dmatrix": [
    {
      label: "Example 1",
      matrix: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
      target: 17,
    },
    {
      label: "Example 2",
      matrix: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
      target: 21,
    },
    {
      label: "Example 3",
      matrix: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
      target: 25,
    },
  ],
  "sequence-reconstruction": [
    {
      label: "Example 1",
      org: [5, 12, 19],
      seqs: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
    {
      label: "Example 2",
      org: [12, 19, 26],
      seqs: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
  ],
  "serialize-and-deserialize-bst": [
    {
      label: "Example 1",
      tree: {
        val: 32,
        left: {
          val: 32,
        },
        right: {
          val: 32,
        },
      },
    },
    {
      label: "Example 2",
      tree: {
        val: 7,
        left: {
          val: 7,
          left: {
            val: 7,
          },
          right: {
            val: 7,
          },
        },
        right: {
          val: 7,
        },
      },
    },
  ],
  "serialize-deserialize": [
    {
      label: "Example 1",
      tree: [24, 31, 3, null, null, 20, 27],
    },
    {
      label: "Example 2",
      tree: [31, 3, null, 15, null, null, null, 2],
    },
    {
      label: "Example 3",
      tree: [3, null, 15, null, null, null, 2],
    },
  ],
  "serialize-deserialize-nary-tree": [
    {
      label: "Example 1",
      tree: {
        val: 11,
        children: [
          {
            val: 3,
            children: [
              {
                val: 5,
              },
              {
                val: 6,
              },
            ],
          },
          {
            val: 2,
          },
          {
            val: 4,
          },
        ],
      },
    },
    {
      label: "Example 2",
      tree: {
        val: 16,
        children: [
          {
            val: 2,
          },
          {
            val: 3,
            children: [
              {
                val: 6,
              },
            ],
          },
          {
            val: 4,
            children: [
              {
                val: 7,
              },
              {
                val: 8,
              },
            ],
          },
        ],
      },
    },
  ],
  "set-matrix-zeroes": [
    {
      label: "Example 1",
      matrix: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
    {
      label: "Example 2",
      matrix: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
    {
      label: "Example 3",
      matrix: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
  ],
  "shortest-distance-buildings": [
    {
      label: "Example 1",
      grid: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
  ],
  "shortest-distance-from-all-buildings": [
    {
      label: "Example 1",
      grid: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
  ],
  "shortest-palindrome": [
    {
      label: "Example 1",
      s: "monotonic stack queue balance",
    },
    {
      label: "Example 2",
      s: "two pointer sliding window",
    },
    {
      label: "Example 3",
      s: "learning algorithm structures",
    },
  ],
  "simplify-path": [
    {
      label: "Example 1",
      path: "two pointer sliding window",
    },
    {
      label: "Example 2",
      path: "learning algorithm structures",
    },
    {
      label: "Example 3",
      path: "interactive computational stepping",
    },
  ],
  "single-element-in-sorted-array": [
    {
      label: "Example 1",
      nums: [3, 8, 15, 22, 27, 34, 4, 17, 22],
    },
    {
      label: "Example 2",
      nums: [14, 19, 32, 2, 13, 20, 25],
    },
  ],
  "single-number": [
    {
      label: "Example 1",
      nums: [28, 33, 1],
    },
    {
      label: "Example 2",
      nums: [4, 3, 10, 13, 20],
    },
    {
      label: "Example 3",
      nums: [9, 14, 27, 32, 33],
    },
  ],
  "single-number-ii": [
    {
      label: "Example 1",
      input: "two pointer sliding window",
    },
    {
      label: "Example 2",
      input: "learning algorithm structures",
    },
    {
      label: "Example 3",
      input: "interactive computational stepping",
    },
    {
      label: "Example 4",
      input: "efficient dynamic programming state",
    },
    {
      label: "Example 5",
      input: "graph search traversal tree",
    },
  ],
  "skyline-problem": [
    {
      label: "Example 1",
      buildings: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
    {
      label: "Example 2",
      buildings: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
    {
      label: "Example 3",
      buildings: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
  ],
  "sliding-window-maximum": [
    {
      label: "Example 1",
      nums: [20, 29, 26, 27, 13, 14, 25, 32],
      k: 2,
    },
    {
      label: "Example 2",
      nums: [27],
      k: 3,
    },
    {
      label: "Example 3",
      nums: [1, 4, 17, 18, 29, 30, 8, 15, 6],
      k: 4,
    },
  ],
  "sliding-window-median": [
    {
      label: "Example 1",
      nums: [8, 17, 14, 15, 1, 2, 13, 20],
      k: 2,
    },
    {
      label: "Example 2",
      nums: [15, 22, 29, 1, 8],
      k: 3,
    },
  ],
  "smallest-good-base": [
    {
      label: "Example 1",
      n: "graph search traversal tree",
    },
    {
      label: "Example 2",
      n: "monotonic stack queue balance",
    },
  ],
  "smallest-rectangle-black-pixels": [
    {
      label: "Example 1",
      image: ["node", "edge", "tree", "path", "cycle"],
      x: 15,
      y: 21,
    },
  ],
  "sort-characters-by-frequency": [
    {
      label: "Example 1",
      s: "interactive computational stepping",
    },
    {
      label: "Example 2",
      s: "efficient dynamic programming state",
    },
  ],
  "sort-colors": [
    {
      label: "Example 1",
      nums: [20, 21, 30, 33, 3, 6],
    },
    {
      label: "Example 2",
      nums: [27, 28, 35],
    },
    {
      label: "Example 3",
      nums: [32, 4, 5, 12, 19, 20, 27],
    },
  ],
  "sort-list": [
    {
      label: "Example 1",
      arr: [33, 34, 2, 11],
    },
    {
      label: "Example 2",
      arr: [30, 12, 13, 20, 17],
    },
    {
      label: "Example 3",
      arr: [14, 17, 20, 23, 26],
    },
  ],
  "sort-transformed-array": [
    {
      label: "Example 1",
      nums: [23, 32, 10, 19],
      a: 24,
      b: 9,
      c: 30,
      description: "learning algorithm structures",
    },
    {
      label: "Example 2",
      nums: [30, 4, 17, 26],
      a: 29,
      b: 44,
      c: 23,
      description: "interactive computational stepping",
    },
    {
      label: "Example 3",
      nums: [6, 13, 20, 27, 34],
      a: 43,
      b: 49,
      c: 43,
      description: "efficient dynamic programming state",
    },
  ],
  "sparse-matrix-multiplication": [
    {
      label: "Example 1",
      mat1: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
      mat2: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
  ],
  "spiral-matrix": [
    {
      label: "Example 1",
      matrix: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
    {
      label: "Example 2",
      matrix: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
    {
      label: "Example 3",
      matrix: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
    {
      label: "Example 4",
      matrix: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
    {
      label: "Example 5",
      matrix: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
  ],
  "spiral-matrix-ii": [
    {
      label: "Example 1",
      n: 4,
    },
    {
      label: "Example 2",
      n: 5,
    },
  ],
  "split-array-with-equal-sum": [
    {
      label: "Example 1",
      nums: "efficient dynamic programming state",
    },
    {
      label: "Example 2",
      nums: "graph search traversal tree",
    },
    {
      label: "Example 3",
      nums: "monotonic stack queue balance",
    },
  ],
  "split-strings": [
    {
      label: "Example 1",
      strs: ["node", "edge", "tree", "path", "cycle"],
    },
    {
      label: "Example 2",
      strs: ["node", "edge", "tree", "path", "cycle"],
    },
    {
      label: "Example 3",
      strs: ["node", "edge", "tree", "path", "cycle"],
    },
  ],
  sqrtx: [
    {
      label: "Example 1",
      x: 46,
      desc: "graph search traversal tree",
    },
    {
      label: "Example 2",
      x: 19,
      desc: "monotonic stack queue balance",
    },
    {
      label: "Example 3",
      x: 9,
      desc: "two pointer sliding window",
    },
    {
      label: "Example 4",
      x: 15,
      desc: "learning algorithm structures",
    },
    {
      label: "Example 5",
      x: 28,
      desc: "interactive computational stepping",
    },
    {
      label: "Example 6",
      x: 45,
      desc: "efficient dynamic programming state",
    },
  ],
  "string-compression": [
    {
      label: "Example 1",
      chars: ["node", "edge", "tree", "path", "cycle"],
    },
    {
      label: "Example 2",
      chars: ["node", "edge", "tree", "path", "cycle"],
    },
  ],
  "string-to-integer-atoi": [
    {
      label: "Example 1",
      value: "efficient dynamic programming state",
      note: "efficient dynamic programming state",
    },
    {
      label: "Example 2",
      value: "graph search traversal tree",
      note: "graph search traversal tree",
    },
    {
      label: "Example 3",
      value: "monotonic stack queue balance",
      note: "monotonic stack queue balance",
    },
    {
      label: "Example 4",
      value: "two pointer sliding window",
      note: "two pointer sliding window",
    },
    {
      label: "Example 5",
      value: "learning algorithm structures",
      note: "learning algorithm structures",
    },
    {
      label: "Example 6",
      value: "interactive computational stepping",
      note: "interactive computational stepping",
    },
    {
      label: "Example 7",
      value: "efficient dynamic programming state",
      note: "efficient dynamic programming state",
    },
  ],
  "student-attendance-record-ii": [
    {
      label: "Example 1",
      n: "monotonic stack queue balance",
    },
    {
      label: "Example 2",
      n: "two pointer sliding window",
    },
    {
      label: "Example 3",
      n: "learning algorithm structures",
    },
  ],
  "subarray-sum-equals-k": [
    {
      label: "Example 1",
      nums: [3, 8, 13],
      k: 2,
    },
    {
      label: "Example 2",
      nums: [10, 17, 24],
      k: 3,
    },
    {
      label: "Example 3",
      nums: [21, 28, 4, 34, 29, 7, 18, 19],
      k: 4,
    },
  ],
  subsets: [
    {
      label: "Example 1",
      nums: [27, 34, 6],
    },
    {
      label: "Example 2",
      nums: [32],
    },
    {
      label: "Example 3",
      nums: [6, 13],
    },
    {
      label: "Example 4",
      nums: [13, 20, 27, 34],
    },
  ],
  "substring-concatenation": [
    {
      label: "Example 1",
      s: "two pointer sliding window",
      words: ["node", "edge", "tree", "path", "cycle"],
    },
    {
      label: "Example 2",
      s: "learning algorithm structures",
      words: ["node", "edge", "tree", "path", "cycle"],
    },
    {
      label: "Example 3",
      s: "interactive computational stepping",
      words: ["node", "edge", "tree", "path", "cycle"],
    },
  ],
  "subtree-of-another-tree": [
    {
      label: "Example 1",
      root: [8, 15, 22, 19, 26],
      sub: [10, 9, 16],
    },
    {
      label: "Example 2",
      root: [15, 22, 29, 26, 33, null, null, null, null, 19],
      sub: [17, 16, 23],
    },
    {
      label: "Example 3",
      root: [18, 25, 32],
      sub: [18, 25, 32],
    },
  ],
  "sudoku-solver": [
    {
      label: "Example 1",
      board: [
        ["C", "A", "T"],
        ["D", "O", "G"],
        ["B", "A", "T"],
      ],
    },
  ],
  "sum-of-two-integers": [
    {
      label: "Example 1",
      a: 1,
      b: 1,
    },
    {
      label: "Example 2",
      a: 24,
      b: 18,
    },
    {
      label: "Example 3",
      a: 26,
      b: 26,
    },
    {
      label: "Example 4",
      a: 26,
      b: 2,
    },
  ],
  "sum-root-to-leaf-numbers": [
    {
      label: "Example 1",
      input: "graph search traversal tree",
    },
    {
      label: "Example 2",
      input: "monotonic stack queue balance",
    },
    {
      label: "Example 3",
      input: "two pointer sliding window",
    },
    {
      label: "Example 4",
      input: "learning algorithm structures",
    },
    {
      label: "Example 5",
      input: "interactive computational stepping",
    },
    {
      label: "Example 6",
      input: "efficient dynamic programming state",
    },
  ],
  "super-power": [
    {
      label: "Example 1",
      base: 46,
      exponents: [28],
    },
    {
      label: "Example 2",
      base: 7,
      exponents: [31, 34],
    },
    {
      label: "Example 3",
      base: 15,
      exponents: [5, 8, 19, 30, 29, 7, 2, 13, 14, 25],
    },
  ],
  "super-ugly-number": [
    {
      label: "Example 1",
      n: 4,
      primes: [34, 14, 31, 13],
    },
    {
      label: "Example 2",
      n: 5,
      primes: [6, 13, 22],
    },
    {
      label: "Example 3",
      n: 6,
      primes: [13, 20, 29],
    },
  ],
  "super-washing-machines": [
    {
      label: "Example 1",
      machines: [14, 17, 32],
    },
    {
      label: "Example 2",
      machines: [19, 30, 29],
    },
  ],
  "surrounded-regions": [
    {
      label: "Example 1",
    },
    {
      label: "Example 2",
    },
    {
      label: "Example 3",
    },
    {
      label: "Example 4",
    },
    {
      label: "Example 5",
    },
    {
      label: "Example 6",
    },
  ],
  "swap-nodes-in-pairs": [
    {
      label: "Example 1",
      values: [5, 12, 19, 26],
    },
    {
      label: "Example 2",
      values: [12],
    },
    {
      label: "Example 3",
      values: [19, 26, 33, 5, 12, 19],
    },
    {
      label: "Example 4",
      values: [26, 33, 5, 12, 19],
    },
  ],
  "symmetric-tree": [
    {
      label: "Example 1",
      tree: [26, 33, 3, 10, 17, 22, 25],
    },
    {
      label: "Example 2",
      tree: [33, 5, 10, null, 22, null, 32],
    },
    {
      label: "Example 3",
      tree: [5, 12, 17, null, 29, 34, null],
    },
    {
      label: "Example 4",
      tree: [12],
    },
  ],
  "target-sum": [
    {
      label: "Example 1",
      nums: [15, 20, 25, 30, 35],
      target: 16,
    },
    {
      label: "Example 2",
      nums: [22, 25],
      target: 20,
    },
  ],
  "task-scheduler": [
    {
      label: "Example 1",
      tasks: ["node", "edge", "tree", "path", "cycle"],
      n: 4,
    },
    {
      label: "Example 2",
      tasks: ["node", "edge", "tree", "path", "cycle"],
      n: 5,
    },
  ],
  "teemo-attacking": [
    {
      label: "Example 1",
      attackTime: [18, 29],
      duration: 22,
    },
    {
      label: "Example 2",
      attackTime: [25, 32],
      duration: 33,
    },
  ],
  "ternary-expression-parser": [
    {
      label: "Example 1",
      expression: "interactive computational stepping",
    },
    {
      label: "Example 2",
      expression: "efficient dynamic programming state",
    },
  ],
  "text-justification": [
    {
      label: "Example 1",
      words: ["node", "edge", "tree", "path", "cycle"],
      maxWidth: 25,
    },
    {
      label: "Example 2",
      words: ["node", "edge", "tree", "path", "cycle"],
      maxWidth: 36,
    },
    {
      label: "Example 3",
      words: ["node", "edge", "tree", "path", "cycle"],
      maxWidth: 35,
    },
  ],
  "the-maze": [
    {
      label: "Example 1",
      maze: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
      start: [1, 6],
      destination: [9, 14],
    },
    {
      label: "Example 2",
      maze: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
      start: [8, 13],
      destination: [14, 17],
    },
  ],
  "the-maze-iii": [
    {
      label: "Example 1",
      maze: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
      ball: [1, 4],
      hole: [28, 35],
    },
    {
      label: "Example 2",
      maze: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
      ball: [8, 11],
      hole: [6, 5],
    },
  ],
  "three-sum": [
    {
      label: "Example 1",
      nums: [13, 20, 27, 34, 33, 32],
    },
    {
      label: "Example 2",
      nums: [22, 27, 32, 2],
    },
    {
      label: "Example 3",
      nums: [31, 3, 10, 17],
    },
    {
      label: "Example 4",
      nums: [32, 6, 11, 20, 25],
    },
  ],
  "three-sum-closest": [
    {
      label: "Example 1",
      nums: [6, 17, 20, 15],
      target: 21,
    },
    {
      label: "Example 2",
      nums: [15, 20, 25],
      target: 25,
    },
    {
      label: "Example 3",
      nums: [14, 25, 30, 2, 9, 16],
      target: 29,
    },
    {
      label: "Example 4",
      nums: [-11, 34, 6, 13, 12, 11],
      target: 33,
    },
  ],
  "top-kfrequent": [
    {
      label: "Example 1",
      nums: [31, 1, 6, 13, 18, 25],
      k: 2,
    },
    {
      label: "Example 2",
      nums: [3],
      k: 3,
    },
    {
      label: "Example 3",
      nums: [16, 15, 20, 27, 32, 4, 9, 14],
      k: 4,
    },
  ],
  "total-hamming-distance": [
    {
      label: "Example 1",
      nums: [5, 30, 11],
    },
    {
      label: "Example 2",
      nums: [6, 2, 18],
    },
  ],
  "trapping-rain-water": [
    {
      label: "Example 1",
      height: [22, 29, 32, 6, 9, 12, 19, 28, 31, 34, 6, 9],
    },
    {
      label: "Example 2",
      height: [2, 3, 4, 15, 18, 29],
    },
    {
      label: "Example 3",
      height: [3, 10, 17, 24, 27, 30, 33],
    },
    {
      label: "Example 4",
      height: [18, 15, 20, 25, 3],
    },
    {
      label: "Example 5",
      height: [25, 28, 31, 34, 2, 9, 16],
    },
  ],
  "trapping-rain-water-ii": [
    {
      label: "Example 1",
      heightMap: [
        [3, 6, 8],
        [2, 5, 7],
        [1, 4, 9],
      ],
    },
  ],
  triangle: [
    {
      label: "Example 1",
      input: "learning algorithm structures",
    },
    {
      label: "Example 2",
      input: "interactive computational stepping",
    },
    {
      label: "Example 3",
      input: "efficient dynamic programming state",
    },
  ],
  "two-sum": [
    {
      label: "Example 1",
      nums: [8, 23, 1, 14],
      target: 13,
    },
    {
      label: "Example 2",
      nums: [17, 20, 29],
      target: 17,
    },
    {
      label: "Example 3",
      nums: [24, 29],
      target: 21,
    },
    {
      label: "Example 4",
      nums: [19, 3, 6, 10],
      target: 25,
    },
  ],
  "two-sum-ii": [
    {
      label: "Example 1",
      numbers: [5, 20, 33, 11],
      target: 12,
    },
    {
      label: "Example 2",
      numbers: [12, 19, 26],
      target: 16,
    },
    {
      label: "Example 3",
      numbers: [17, 24, 31, 3, 10, 17, 24, 31, 3],
      target: 20,
    },
    {
      label: "Example 4",
      numbers: [16, 25, 32, 6, 15, 24],
      target: 24,
    },
  ],
  "ugly-number-ii": [
    {
      label: "Example 1",
      n: 4,
    },
    {
      label: "Example 2",
      n: 5,
    },
  ],
  "unique-paths": [
    {
      label: "Example 1",
      m: 44,
      n: 4,
    },
    {
      label: "Example 2",
      m: 5,
      n: 5,
    },
    {
      label: "Example 3",
      m: 13,
      n: 6,
    },
    {
      label: "Example 4",
      m: 30,
      n: 4,
    },
    {
      label: "Example 5",
      m: 44,
      n: 5,
    },
  ],
  "unique-substrings-in-wraparound-string": [
    {
      label: "Example 1",
      s: "two pointer sliding window",
    },
    {
      label: "Example 2",
      s: "learning algorithm structures",
    },
  ],
  "utf-8-validation": [
    {
      label: "Example 1",
      data: [34, 10, 2],
    },
    {
      label: "Example 2",
      data: [12, 2, 15],
    },
  ],
  "valid-anagram": [
    {
      label: "Example 1",
      s: "efficient dynamic programming state",
      t: "efficient dynamic programming state",
    },
    {
      label: "Example 2",
      s: "graph search traversal tree",
      t: "graph search traversal tree",
    },
    {
      label: "Example 3",
      s: "monotonic stack queue balance",
      t: "monotonic stack queue balance",
    },
    {
      label: "Example 4",
      s: "two pointer sliding window",
      t: "two pointer sliding window",
    },
  ],
  "valid-palindrome": [
    {
      label: "Example 1",
      s: "two pointer sliding window",
    },
    {
      label: "Example 2",
      s: "learning algorithm structures",
    },
    {
      label: "Example 3",
      s: "interactive computational stepping",
    },
    {
      label: "Example 4",
      s: "efficient dynamic programming state",
    },
  ],
  "valid-parentheses": [
    {
      label: "Example 1",
      s: "efficient dynamic programming state",
    },
    {
      label: "Example 2",
      s: "graph search traversal tree",
    },
    {
      label: "Example 3",
      s: "monotonic stack queue balance",
    },
    {
      label: "Example 4",
      s: "two pointer sliding window",
    },
    {
      label: "Example 5",
      s: "learning algorithm structures",
    },
  ],
  "validate-bst": [
    {
      label: "Example 1",
      arr: [18, 19, 32, 25, 1, 10, 19],
    },
    {
      label: "Example 2",
      arr: [25, 22, 33, null, null, 11, 22],
    },
    {
      label: "Example 3",
      arr: [26, 29, 3],
    },
    {
      label: "Example 4",
      arr: [14, 9, 34, null, null, 31, 29],
    },
  ],
  "validate-ip-address": [
    {
      label: "Example 1",
      queryIP: "learning algorithm structures",
    },
    {
      label: "Example 2",
      queryIP: "interactive computational stepping",
    },
  ],
  "verbal-arithmetic-puzzle": [
    {
      label: "Example 1",
      equation: "two pointer sliding window",
    },
    {
      label: "Example 2",
      equation: "learning algorithm structures",
    },
  ],
  "wiggle-sort-ii": [
    {
      label: "Example 1",
      nums: [3, 12, 11, 14, 15],
    },
    {
      label: "Example 2",
      nums: [2, 7, 14, 19, 26, 31],
    },
    {
      label: "Example 3",
      nums: [17, 22, 27, 32, 2],
    },
    {
      label: "Example 4",
      nums: [20, 21],
    },
    {
      label: "Example 5",
      nums: [4, 30, 10, 9, 16, 13, 32, 33],
    },
  ],
  "wildcard-matching": [
    {
      label: "Example 1",
      s: "efficient dynamic programming state",
      p: "efficient dynamic programming state",
    },
    {
      label: "Example 2",
      s: "graph search traversal tree",
      p: "graph search traversal tree",
    },
    {
      label: "Example 3",
      s: "monotonic stack queue balance",
      p: "monotonic stack queue balance",
    },
    {
      label: "Example 4",
      s: "two pointer sliding window",
      p: "two pointer sliding window",
    },
  ],
  "word-abbreviation": [
    {
      label: "Example 1",
      dict: ["node", "edge", "tree", "path", "cycle"],
    },
    {
      label: "Example 2",
      dict: ["node", "edge", "tree", "path", "cycle"],
    },
    {
      label: "Example 3",
      dict: ["node", "edge", "tree", "path", "cycle"],
    },
  ],
  "word-break": [
    {
      label: "Example 1",
      s: "interactive computational stepping",
      dict: ["node", "edge", "tree", "path", "cycle"],
    },
    {
      label: "Example 2",
      s: "efficient dynamic programming state",
      dict: ["node", "edge", "tree", "path", "cycle"],
    },
    {
      label: "Example 3",
      s: "graph search traversal tree",
      dict: ["node", "edge", "tree", "path", "cycle"],
    },
    {
      label: "Example 4",
      s: "monotonic stack queue balance",
      dict: ["node", "edge", "tree", "path", "cycle"],
    },
  ],
  "word-break-ii": [
    {
      label: "Example 1",
      values: {
        s: "efficient dynamic programming state",
        wordDict: "efficient dynamic programming state",
      },
    },
    {
      label: "Example 2",
      values: {
        s: "graph search traversal tree",
        wordDict: "graph search traversal tree",
      },
    },
    {
      label: "Example 3",
      values: {
        s: "monotonic stack queue balance",
        wordDict: "monotonic stack queue balance",
      },
    },
    {
      label: "Example 4",
      values: {
        s: "two pointer sliding window",
        wordDict: "two pointer sliding window",
      },
    },
  ],
  "word-ladder": [
    {
      label: "Example 1",
      beginWord: "two pointer sliding window",
      endWord: "two pointer sliding window",
      wordList: ["node", "edge", "tree", "path", "cycle"],
    },
    {
      label: "Example 2",
      beginWord: "learning algorithm structures",
      endWord: "learning algorithm structures",
      wordList: ["node", "edge", "tree", "path", "cycle"],
    },
  ],
  "word-ladder-ii": [
    {
      label: "Example 1",
      beginWord: "learning algorithm structures",
      endWord: "learning algorithm structures",
      wordList: ["node", "edge", "tree", "path", "cycle"],
    },
    {
      label: "Example 2",
      beginWord: "interactive computational stepping",
      endWord: "interactive computational stepping",
      wordList: ["node", "edge", "tree", "path", "cycle"],
    },
  ],
  "word-search": [
    {
      label: "Example 1",
      board: [
        ["C", "A", "T"],
        ["D", "O", "G"],
        ["B", "A", "T"],
      ],
      word: "interactive computational stepping",
    },
    {
      label: "Example 2",
      board: [
        ["C", "A", "T"],
        ["D", "O", "G"],
        ["B", "A", "T"],
      ],
      word: "efficient dynamic programming state",
    },
    {
      label: "Example 3",
      board: [
        ["C", "A", "T"],
        ["D", "O", "G"],
        ["B", "A", "T"],
      ],
      word: "graph search traversal tree",
    },
  ],
  "word-search-ii": [
    {
      label: "Example 1",
      board: [
        ["C", "A", "T"],
        ["D", "O", "G"],
        ["B", "A", "T"],
      ],
      words: ["node", "edge", "tree", "path", "cycle"],
    },
    {
      label: "Example 2",
      board: [
        ["C", "A", "T"],
        ["D", "O", "G"],
        ["B", "A", "T"],
      ],
      words: ["node", "edge", "tree", "path", "cycle"],
    },
  ],
  "word-squares": [
    {
      label: "Example 1",
      words: ["node", "edge", "tree", "path", "cycle"],
    },
    {
      label: "Example 2",
      words: ["node", "edge", "tree", "path", "cycle"],
    },
  ],
  "zuma-game": [
    {
      label: "Example 1",
      board: "efficient dynamic programming state",
      hand: "efficient dynamic programming state",
    },
    {
      label: "Example 2",
      board: "graph search traversal tree",
      hand: "graph search traversal tree",
    },
  ],
  "brace-expansion-ii": [
    {
      label: "Union + Product",
      expression: "{a,b{c,d},e}{x,{y,z}}",
    },
    {
      label: "Deep Nesting",
      expression: "p{a,{b,{c,d}}}{x,y}q",
    },
    {
      label: "Nested Groups",
      expression: "{{a,b},{c,{d,e}}}{x,y}",
    },
    {
      label: "Three Products",
      expression: "{a,b}{x,{y,z}}{m,n}",
    },
    {
      label: "Deduplication",
      expression: "{{a,b},{b,c},a{d,e},{ad,f}}",
    },
  ],
};

/**
 * Get examples for a problem by slug
 * @param {string} problemSlug - The problem slug in kebab-case
 * @returns {Array} Array of example objects, or empty array if problem not found
 */
export function getExamples(problemSlug) {
  return EXAMPLES_REGISTRY[problemSlug] || [];
}

/**
 * Get examples for a problem, falling back to a local list when the registry
 * has no entry.
 *
 * @param {string} problemSlug - The problem slug in kebab-case
 * @param {Array} fallback - Examples to use when the registry has none
 * @returns {Array} Registry examples if any, otherwise fallback
 */
export function getExamplesOr(problemSlug, fallback) {
  const examples = EXAMPLES_REGISTRY[problemSlug];
  return examples && examples.length ? examples : fallback;
}

/**
 * Get all available problem slugs
 * @returns {Array<string>} Array of all problem slugs
 */
export function getAllProblems() {
  return Object.keys(EXAMPLES_REGISTRY);
}

/**
 * Get the count of examples for a problem
 * @param {string} problemSlug - The problem slug
 * @returns {number} Count of examples
 */
export function getExamplesCount(problemSlug) {
  const examples = getExamples(problemSlug);
  return examples.length;
}
