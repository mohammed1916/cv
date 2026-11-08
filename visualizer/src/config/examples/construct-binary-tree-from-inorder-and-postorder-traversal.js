// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several recursive subtrees",
    "inorder": [
      3,
      7,
      12,
      18,
      24,
      29,
      35
    ],
    "postorder": [
      3,
      12,
      7,
      24,
      35,
      29,
      18
    ]
  },
  {
    "label": "Right-only chain",
    "inorder": [
      4,
      9,
      15,
      22
    ],
    "postorder": [
      22,
      15,
      9,
      4
    ]
  },
  {
    "label": "Left-only chain",
    "inorder": [
      4,
      9,
      15,
      22
    ],
    "postorder": [
      4,
      9,
      15,
      22
    ]
  },
  {
    "label": "Singleton",
    "inorder": [
      17
    ],
    "postorder": [
      17
    ]
  },
  {
    "label": "Smallest tree",
    "inorder": [
      7
    ],
    "postorder": [
      7
    ]
  },
  {
    "label": "Negative and large values",
    "inorder": [
      10000,
      -5,
      3
    ],
    "postorder": [
      10000,
      3,
      -5
    ]
  },
  {
    "label": "Long run: 20 nodes",
    "inorder": [
      5,
      2,
      10,
      12,
      17,
      1,
      8,
      4,
      9,
      16,
      11,
      19,
      3,
      20,
      18,
      7,
      14,
      6,
      15,
      13
    ],
    "postorder": [
      5,
      2,
      12,
      10,
      4,
      8,
      1,
      16,
      11,
      9,
      17,
      3,
      20,
      14,
      15,
      6,
      7,
      13,
      18,
      19
    ]
  }
];
